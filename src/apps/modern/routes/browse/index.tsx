import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import type { PersonKind } from '@jellyfin/sdk/lib/generated-client/models/person-kind';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { SvgIconComponent } from '@mui/icons-material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Shuffle from '@mui/icons-material/Shuffle';
import ViewModule from '@mui/icons-material/ViewModule';
import ViewStream from '@mui/icons-material/ViewStream';
import React, { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getBrowseMode, getBrowseModes } from 'apps/modern/features/libraries/constants/browseModes';
import { getDecadeStyle, getGenreStyle, getRatingLevel, RATING_LEVEL_LABEL, RATING_LEVEL_ORDER, RATING_LEVELS, toTitleCase, type RatingLevel } from 'apps/modern/features/libraries/constants/pickTiles';
import LibraryBackdrop from 'apps/modern/features/libraries/components/LibraryBackdrop';
import TagRibbonsSection from 'apps/modern/features/libraries/components/TagRibbonsSection';
import { LibraryRoutes } from 'apps/modern/features/libraries/constants/libraryRoutes';
import { appendPeopleCards, buildPeopleCards } from 'components/cardbuilder/peoplecardbuilder';
import { CardShape } from 'components/cardbuilder/utils/shape';
import Loading from 'components/loading/LoadingComponent';
import Page from 'components/Page';
import { useGetPersonItemCounts, useGetPersons, useGetQueryFiltersLegacy, useGetStudios } from 'hooks/useFetchItems';
import { useApi } from 'hooks/useApi';
import { isPersonIndexMissing, type PersonIndexItem, type PersonIndexSort, useGetPersonIndex } from 'hooks/usePersonIndex';
import { useItem } from 'hooks/useItem';
import globalize from 'lib/globalize';
import { BrowseMode, type BrowseModeDefinition } from 'types/browseMode';

const DECADE_LENGTH = 10;

/**
 * Shared theme-aware glass surface. Uses the paper channel so the tint follows the active theme
 * (dark/light) instead of a fixed dark rgba, matching the existing `.detailRibbon` convention.
 */
const glassSurface = (opts: { opacity: number; blur: number; radius: string }) => ({
    backgroundColor: `rgba(var(--jf-palette-background-paperChannel, 32 32 32) / ${opts.opacity})`,
    backdropFilter: `blur(${opts.blur}px)`,
    border: '1px solid var(--jf-palette-divider, rgba(255, 255, 255, 0.12))',
    borderRadius: opts.radius,
    boxShadow: 'none'
});

/** Quiet centred group label (Categories / Mood & Themes / People / Discover) — plain text, no pill. */
const GROUP_LABEL_SX = {
    fontSize: 'max(0.75rem, calc(var(--tile-unit, 12px) * 1.25))',
    fontWeight: 600,
    color: 'text.secondary',
    letterSpacing: '0.03em',
    textAlign: 'center'
} as const;

/** Smaller label for the least-prominent (compact) groups. */
const COMPACT_GROUP_LABEL_SX = {
    ...GROUP_LABEL_SX,
    fontSize: 'max(0.6875rem, calc(var(--tile-unit, 12px) * 1))'
} as const;

/** Maps a picker's filter kind to the server's /Discover/Counts type. */
const COUNT_TYPE_BY_FILTER: Record<string, string> = {
    Years: 'decade',
    OfficialRatings: 'rating',
    Genres: 'genre',
    Studios: 'studio',
    Tags: 'tag'
};

/** In-memory cache of picker counts, keyed by (libraryId, type). */
const pickerCountsCache = new Map<string, Record<string, number>>();

/** Builds picker tiles from label → value pairs, sharing the active picker's icon. */
const buildNamedOptions = (
    activePicker: BrowseModeDefinition,
    entries: { label: string; value: string }[]
) => entries.map(entry => ({
    ...entry,
    iconSrc: activePicker.iconSrc
}));

/** Builds genre tiles from a plain list of names, each drawn with its own genre icon. */
const buildGenreOptions = (genres: string[] | null | undefined) =>
    (genres ?? [])
        .slice()
        .sort((a, b) => a.localeCompare(b))
        .map(genre => ({ label: genre, value: genre, ...getGenreStyle(genre) }));

/** Builds studio tiles from studio entities, narrowing by id. */
const buildStudioOptions = (
    studios: { Name?: string | null; Id?: string | null }[] | undefined,
    activePicker: BrowseModeDefinition
) => {
    const entries = (studios ?? [])
        .slice()
        .sort((a, b) => (a.Name ?? '').localeCompare(b.Name ?? ''))
        .map(studio => ({ label: studio.Name ?? '', value: studio.Id ?? '' }));
    return buildNamedOptions(activePicker, entries);
};

/** Sort pills offered on every picker: alphabetical or by item count. 'random' is the shuffle button only. */
const SORT_PILLS: ReadonlyArray<{ value: 'az' | 'za' | 'most' | 'fewest'; label: string }> = [
    { value: 'az', label: 'A — Z' },
    { value: 'za', label: 'Z — A' },
    { value: 'most', label: 'Most items' },
    { value: 'fewest', label: 'Fewest items' }
];

/** Applies the picker sort to a list of tiles; 'default' keeps each picker's natural order. */
const sortPickerOptions = <T extends { label: string; value: string; count?: number }>(
    options: T[],
    sort: string,
    counts: Record<string, number>
): T[] => {
    if (sort === 'az') {
        return [...options].sort((a, b) => a.label.localeCompare(b.label));
    }
    if (sort === 'za') {
        return [...options].sort((a, b) => b.label.localeCompare(a.label));
    }
    if (sort === 'most') {
        return [...options].sort((a, b) => (b.count ?? counts[b.value] ?? counts[b.label] ?? 0) - (a.count ?? counts[a.value] ?? counts[a.label] ?? 0));
    }
    if (sort === 'fewest') {
        return [...options].sort((a, b) => (a.count ?? counts[a.value] ?? counts[a.label] ?? 0) - (b.count ?? counts[b.value] ?? counts[b.label] ?? 0));
    }
    if (sort === 'random') {
        const shuffled = [...options];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    return options;
};

/** Tint of the procedural glyphs on the individual-year picker tiles. */
const YEAR_NUMBER_COLOR = '#E8A33D';

/** Procedural glyph for individual-year tiles: the four-digit year drawn large, no calendar. */
const yearNumberIcon = (year: number): SvgIconComponent => {
    const Icon = (props: SvgIconProps) => (
        <SvgIcon viewBox='0 0 100 100' {...props}>
            <text
                x='50'
                y='50'
                textAnchor='middle'
                dominantBaseline='central'
                fontSize='34'
                fontWeight='600'
                fill='currentColor'
                fontFamily='sans-serif'
            >
                {year}
            </text>
        </SvgIcon>
    );
    return Icon as unknown as SvgIconComponent;
};

/** The query-filters fields the child-tile counts read from. */
type BrowseFilters = {
    Genres?: string[] | null;
    Years?: number[] | null;
    OfficialRatings?: string[] | null;
    Tags?: string[] | null;
};

/** Number of entries under a meta child (people, genres, studios, decades, years, ratings, tags). */
const childEntryCount = (
    definition: BrowseModeDefinition,
    filters: BrowseFilters | undefined,
    studios: Array<{ Name?: string | null }> | undefined,
    personCounts: Record<string, number> | undefined
): number => {
    switch (definition.mode) {
        case BrowseMode.Actors:
            return personCounts?.Actor ?? 0;
        case BrowseMode.Directors:
            return personCounts?.Director ?? 0;
        case BrowseMode.Writers:
            return personCounts?.Writer ?? 0;
        case BrowseMode.Genres:
            return filters?.Genres?.length ?? 0;
        case BrowseMode.Studios:
            return studios?.length ?? 0;
        case BrowseMode.Decades:
            return new Set((filters?.Years ?? []).map(year => Math.floor(year / DECADE_LENGTH) * DECADE_LENGTH)).size;
        case BrowseMode.Year:
            return new Set(filters?.Years ?? []).size;
        case BrowseMode.AgeRating:
            return filters?.OfficialRatings?.length ?? 0;
        case BrowseMode.Mood:
        case BrowseMode.StoryThemes:
        case BrowseMode.PlotElements:
        case BrowseMode.Worlds:
        case BrowseMode.Styles: {
            const curated = new Set((definition.picker?.tagList ?? []).map(tag => tag.toLowerCase()));
            return (filters?.Tags ?? []).filter(tag => curated.has(tag.toLowerCase())).length;
        }
        default:
            return 0;
    }
};

/** Item kinds whose production years decide which decades are worth offering. */
const ITEM_KIND_BY_COLLECTION_TYPE: Partial<Record<CollectionType, BaseItemKind>> = {
    [CollectionType.Movies]: BaseItemKind.Movie,
    [CollectionType.Tvshows]: BaseItemKind.Series
};

/** Tile tier on the Browse home: the primary row is the focus, then section rows, then compact groups. */
type TileVariant = 'primary' | 'section' | 'compact';

interface TileProps {
    label: string;
    iconSrc?: string;
    /** Procedural glyph tinted with `iconColor`, for tiles without an illustration (individual years). */
    Icon?: SvgIconComponent;
    iconColor?: string;
    iconSize?: string;
    labelSize?: string;
    count?: number;
    variant?: TileVariant;
    onClick: () => void;
}

const DEFAULT_TILE_SX = {
    flexDirection: 'column',
    gap: '10px',
    justifyContent: 'center',
    flexShrink: 0,
    aspectRatio: '1 / 1',
    padding: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(var(--jf-palette-background-paperChannel, 32 32 32) / 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid var(--jf-palette-divider, rgba(255, 255, 255, 0.12))',
    transition: 'background-color 120ms ease, transform 120ms ease',
    '&:hover, &:focus-visible': {
        backgroundColor: 'rgba(var(--jf-palette-background-paperChannel, 32 32 32) / 0.85)',
        transform: 'scale(1.03)'
    }
} as const;

/**
 * Every home-page size is a multiple of one fluid unit (`--tile-unit`, set on the home root and
 * scaled with the viewport), so the three tiers keep the same ratio at any screen size.
 */
const unit = (n: number) => `calc(var(--tile-unit, 12px) * ${n})`;

/** Tile widths (in units) per tier: primary 15.5 : section 13 : compact 10. */
const HOME_TILE_WIDTH: Record<TileVariant, number> = { primary: 15.5, section: 13, compact: 10 };

/**
 * From `lg` the lower tiers get wider (1.7 : 1) at the same height, so they use more of the free
 * width. Heights are unchanged (13 / 1.5 ~ 14.7 / 1.7, 10 / 1.5 ~ 11.3 / 1.7), so the one-screen fit holds.
 */
const HOME_TILE_WIDTH_LG: Record<TileVariant, number> = { primary: 15.5, section: 14.7, compact: 11.3 };

const HOME_TILE_BASE_SX = {
    flexDirection: 'column',
    justifyContent: 'center',
    flexShrink: 0,
    ...glassSurface({ opacity: 0.65, blur: 14, radius: '12px' }),
    transition: 'background-color 150ms ease, border-color 150ms ease',
    '&:hover, &:focus-visible': {
        backgroundColor: 'rgba(var(--jf-palette-background-paperChannel, 32 32 32) / 0.8)',
        borderColor: 'var(--jf-palette-text-secondary, rgba(255, 255, 255, 0.7))'
    }
} as const;

const HOME_TILE_SX: Record<TileVariant, object> = {
    primary: {
        ...HOME_TILE_BASE_SX,
        width: unit(HOME_TILE_WIDTH.primary),
        aspectRatio: '1 / 1',
        gap: unit(1.2),
        padding: unit(0.8),
        borderRadius: unit(1.2)
    },
    section: {
        ...HOME_TILE_BASE_SX,
        width: { xs: unit(HOME_TILE_WIDTH.section), lg: unit(HOME_TILE_WIDTH_LG.section) },
        aspectRatio: { xs: '1.5 / 1', lg: '1.7 / 1' },
        gap: unit(0.6),
        padding: unit(0.7),
        borderRadius: unit(1)
    },
    compact: {
        ...HOME_TILE_BASE_SX,
        width: { xs: unit(HOME_TILE_WIDTH.compact), lg: unit(HOME_TILE_WIDTH_LG.compact) },
        aspectRatio: { xs: '1.5 / 1', lg: '1.7 / 1' },
        gap: unit(0.45),
        padding: unit(0.4),
        borderRadius: unit(0.8)
    }
};

const HOME_TILE_ICON_SIZE: Record<TileVariant, string> = {
    primary: unit(7.2),
    section: unit(3.5),
    compact: unit(2.6)
};

const HOME_TILE_LABEL_SIZE: Record<TileVariant, string> = {
    primary: unit(1.5),
    section: `max(11px, ${unit(1.15)})`,
    compact: `max(10px, ${unit(1)})`
};

const HOME_TILE_COUNT_SIZE: Record<TileVariant, string> = {
    primary: unit(1.1),
    section: `max(10px, ${unit(0.95)})`,
    compact: `max(9px, ${unit(0.85)})`
};

const Tile: FC<TileProps> = ({ label, iconSrc, Icon, iconColor, iconSize, labelSize, count, variant, onClick }) => (
    <ButtonBase
        onClick={onClick}
        focusRipple
        sx={variant ? HOME_TILE_SX[variant] : DEFAULT_TILE_SX}
    >
        {iconSrc ? <Box component='img' src={iconSrc} alt='' draggable={false} sx={{ width: iconSize ?? (variant ? HOME_TILE_ICON_SIZE[variant] : '3.75rem'), height: iconSize ?? (variant ? HOME_TILE_ICON_SIZE[variant] : '3.75rem'), flexShrink: 0 }} /> : null}
        {Icon ? <Icon sx={{ fontSize: iconSize ?? (variant ? HOME_TILE_ICON_SIZE[variant] : '3.75rem'), color: iconColor }} /> : null}
        <Typography variant='subtitle1' sx={{ textAlign: 'center', lineHeight: 1.2, fontSize: labelSize ?? (variant ? HOME_TILE_LABEL_SIZE[variant] : '0.95rem'), fontWeight: variant === 'primary' ? 400 : undefined, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
            {label}
        </Typography>
        {count !== undefined ? (
            <Typography variant='body2' sx={{ color: 'text.secondary', textAlign: 'center', lineHeight: 1, fontSize: variant ? HOME_TILE_COUNT_SIZE[variant] : undefined }}>
                {count}
            </Typography>
        ) : null}
    </ButtonBase>
);

const BrowseModeTile: FC<{
    definition: BrowseModeDefinition;
    onSelect: (definition: BrowseModeDefinition) => void;
    iconSize?: string;
    labelSize?: string;
    variant?: TileVariant;
    count?: number;
}> = ({ definition, onSelect, iconSize, labelSize, variant, count }) => {
    const onClick = useCallback(() => onSelect(definition), [onSelect, definition]);

    return (
        <Tile
            label={globalize.translate(definition.label)}
            iconSrc={definition.iconSrc}
            iconSize={iconSize}
            labelSize={labelSize}
            variant={variant}
            count={count}
            onClick={onClick}
        />
    );
};

const PickTile: FC<{
    label: string;
    value: string;
    iconSrc?: string;
    Icon?: SvgIconComponent;
    iconColor?: string;
    count?: number;
    onSelect: (value: string) => void;
}> = ({ label, value, iconSrc, Icon, iconColor, count, onSelect }) => {
    const onClick = useCallback(() => onSelect(value), [onSelect, value]);

    return <Tile label={label} iconSrc={iconSrc} Icon={Icon} iconColor={iconColor} count={count} onClick={onClick} />;
};

/** Gap between picker tiles, in px, shared by the tile width maths below. */
const PICKER_GAP = 16;

/** Tiles per line of the tile-only pages (pickers and groups) at each breakpoint. */
const PICKER_COLUMNS = { xs: 3, sm: 4, md: 6, lg: 8, xl: 10 };

/** Width of one picker tile so exactly `columns` of them (and their gaps) fill a line. */
const pickerTileWidth = (columns: number) => `calc((100% - ${PICKER_GAP * (columns - 1)}px) / ${columns} - 0.5px)`;

/**
 * Tile-only pages (pickers, groups): fluid tiles on a fixed number of columns per breakpoint, in
 * a centred wrapping row, so a partial last line is centred under the full lines on the same
 * tile pitch and the line and column gaps stay equal.
 */
const TileGrid: FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box
        sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: `${PICKER_GAP}px`,
            '& > *': {
                width: Object.fromEntries(Object.entries(PICKER_COLUMNS).map(([breakpoint, columns]) => [breakpoint, pickerTileWidth(columns)]))
            }
        }}
    >
        {children}
    </Box>
);

/** How many tiles of a tier sit on one line at each breakpoint; `lg` always spans the full width. */
type TilesPerLine = { xs: number; sm?: number; lg: number };

/**
 * A centred, wrapping row of fixed-size tiles. Lines are packed from the centre outwards, so a
 * shorter line is centred under a fuller one, every line shares one tile pitch and the line gap
 * (`gap`, in units) is constant. The row is only as wide as `perLine` tiles, so it wraps at the
 * intended count (6 -> 3+3, 5 -> 3+2) rather than leaving an orphan. At `lg` a single line instead
 * spans the whole width: the leftover width becomes an even column gap, never less than `gap`.
 */
const homeRowSx = (variant: TileVariant, perLine: TilesPerLine, gap: number, insetLg?: string) => {
    const tile = HOME_TILE_WIDTH[variant];
    const tileLg = HOME_TILE_WIDTH_LG[variant];
    const fixedWidth = (count: number) => `calc(${unit(tile * count + gap * (count - 1))} + 1px)`;
    const { xs, sm = xs, lg } = perLine;

    return {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '100%',
        boxSizing: 'border-box',
        rowGap: unit(gap),
        ...(insetLg ? { paddingInline: { lg: insetLg } } : null),
        width: { xs: fixedWidth(xs), sm: fixedWidth(sm), lg: '100%' },
        columnGap: {
            xs: unit(gap),
            lg: `max(${unit(gap)}, calc((100% - ${unit(tileLg * lg)}) / ${lg - 1}))`
        }
    };
};

/**
 * Reverse pyramid from `lg`: the five-tile section rows are the six-tile primary row minus one
 * tile, so each outer edge is inset by half a section pitch (tile + gap), and the People /
 * Discover row sits a further quarter pitch in. Every inset is a percentage of the page width.
 */
const SECTION_GAP_LG = `max(${unit(1.2)}, calc((100% - ${unit(HOME_TILE_WIDTH_LG.section * 6)}) / 5))`;
const SECTION_PITCH_LG = `calc(${unit(HOME_TILE_WIDTH_LG.section)} + ${SECTION_GAP_LG})`;
const SECTION_INSET_LG = `calc(${SECTION_PITCH_LG} / 2)`;
const COMPACT_INSET_LG = `calc(${SECTION_PITCH_LG} * 0.75)`;

const PRIMARY_ROW_SX = homeRowSx('primary', { xs: 2, sm: 3, lg: 6 }, 1.6);
const SECTION_ROW_SX = homeRowSx('section', { xs: 3, lg: 5 }, 1.2, SECTION_INSET_LG);
const COMPACT_ROW_TILES_SX = homeRowSx('compact', { xs: 3, lg: 3 }, 1);

/** Vertical space the home page cannot use: the app header plus the page's top and bottom padding. */
const HOME_CHROME_PX = 178;

/**
 * Home root: defines the fluid unit every home tile size is a multiple of. Narrow screens use a
 * larger share of the width; from `lg` the unit is limited by the viewport height as well.
 */
const HOME_ROOT_SX = {
    width: '100%',
    '--tile-unit': 'clamp(5px, 2.1vw, 15px)',
    '@media (min-width: 600px)': {
        '--tile-unit': 'clamp(6px, 1.8vw, 15px)'
    },
    '@media (min-width: 1200px)': {
        // The page height is ~58 units (title + four rows + headings + gaps), so the unit is also
        // limited by the height left under the app header: nothing falls below the fold.
        '--tile-unit': `clamp(6px, min(0.88vw, calc((100dvh - ${HOME_CHROME_PX}px) / 58)), 17px)`
    }
} as const;

/** Side margin of the home page, as a share of the viewport (ATV uses roughly 4.5%). */
const HOME_PADDING_X = '4.5vw';

/**
 * Two groups (People | Discover) sharing one row: each fills half the (inset) row, minus a central
 * gutter, so the pair is mirror-balanced about the centre. Stacks on narrow screens.
 */
const COMPACT_ROW_SX = {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
    columnGap: '6vw',
    rowGap: unit(2.4),
    width: '100%',
    boxSizing: 'border-box',
    paddingInline: { lg: COMPACT_INSET_LG }
} as const;

/** The six primary modes: the largest tiles, 6 across, dropping to 3 then 2 on narrow widths. */
const PrimaryTileGrid: FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box sx={PRIMARY_ROW_SX}>
        {children}
    </Box>
);

/** An inline category on the home page: a centred heading over a centred row of tiles. */
const InlineModeLinks: FC<{
    definition: BrowseModeDefinition;
    children: BrowseModeDefinition[];
    onSelect: (definition: BrowseModeDefinition) => void;
    getCount?: (definition: BrowseModeDefinition) => number;
}> = ({ definition, children, onSelect, getCount }) => {
    const variant = definition.compact ? 'compact' : 'section';

    return (
        <Stack spacing={definition.compact ? unit(0.9) : unit(1.2)} alignItems='center' sx={{ minWidth: 0, width: '100%' }}>
            <Typography variant='h3' sx={definition.compact ? COMPACT_GROUP_LABEL_SX : GROUP_LABEL_SX}>
                {globalize.translate(definition.label)}
            </Typography>
            <Box sx={definition.compact ? COMPACT_ROW_TILES_SX : SECTION_ROW_SX}>
                {children.map(child => (
                    <BrowseModeTile
                        key={child.mode}
                        definition={child}
                        onSelect={onSelect}
                        variant={variant}
                        count={getCount ? getCount(child) || undefined : undefined}
                    />
                ))}
            </Box>
        </Stack>
    );
};

/** The four sort pills of a People page. */
const PersonSortPills: FC<{ value: PersonIndexSort; onChange: (sort: PersonIndexSort) => void }> = ({ value, onChange }) => {
    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLElement>) => onChange(event.currentTarget.dataset.sort as PersonIndexSort),
        [onChange]
    );

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            {SORT_PILLS.map(pill => (
                <ButtonBase
                    key={pill.value}
                    data-sort={pill.value}
                    onClick={handleClick}
                    aria-pressed={value === pill.value}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 14px',
                        borderRadius: '999px',
                        border: `1px solid ${value === pill.value ? 'var(--jf-palette-text-primary, rgba(255, 255, 255, 0.9))' : 'var(--jf-palette-divider, rgba(255, 255, 255, 0.12))'}`,
                        backgroundColor: value === pill.value ? 'rgba(var(--jf-palette-background-paperChannel, 32 32 32) / 0.5)' : 'transparent',
                        transition: 'background-color 120ms ease, border-color 120ms ease'
                    }}
                >
                    <Typography
                        variant='caption'
                        sx={{ color: value === pill.value ? 'text.primary' : 'text.secondary', fontWeight: value === pill.value ? 600 : 400, lineHeight: 1, fontSize: '0.875rem' }}
                    >
                        {pill.label}
                    </Typography>
                </ButtonBase>
            ))}
        </Box>
    );
};

/** The jump bar's buttons: "#" (names not starting A-Z) and A-Z. */
const JUMP_LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

/**
 * A compact, centred row of first-letter buttons. Selecting a letter shows only the names that
 * start with it; selecting it again shows everyone. A letter nobody starts with is disabled.
 */
const PersonJumpBar: FC<{
    letters?: Record<string, number>;
    value: string | null;
    onChange: (letter: string | null) => void;
}> = ({ letters, value, onChange }) => {
    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            const letter = event.currentTarget.dataset.letter ?? null;
            onChange(letter === value ? null : letter);
        },
        [onChange, value]
    );

    return (
        <Box
            component='nav'
            aria-label='Jump to a letter'
            sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px' }}
        >
            {JUMP_LETTERS.map(letter => {
                const count = letters?.[letter] ?? 0;
                const active = value === letter;
                return (
                    <ButtonBase
                        key={letter}
                        disabled={!count && !active}
                        data-letter={letter}
                        onClick={handleClick}
                        aria-pressed={active}
                        aria-label={`${letter === '#' ? 'Other characters' : letter}, ${count} ${count === 1 ? 'person' : 'people'}`}
                        sx={{
                            minWidth: 28,
                            height: 28,
                            padding: '0 4px',
                            borderRadius: '6px',
                            border: `1px solid ${active ? 'var(--jf-palette-text-primary, rgba(255, 255, 255, 0.9))' : 'transparent'}`,
                            backgroundColor: active ? 'rgba(var(--jf-palette-background-paperChannel, 32 32 32) / 0.5)' : 'transparent',
                            transition: 'background-color 120ms ease, border-color 120ms ease',
                            '&.Mui-disabled': { opacity: 0.3 },
                            '&:hover': { backgroundColor: 'rgba(var(--jf-palette-background-paperChannel, 32 32 32) / 0.5)' }
                        }}
                    >
                        <Typography
                            variant='caption'
                            sx={{ color: active ? 'text.primary' : 'text.secondary', fontWeight: active ? 600 : 400, lineHeight: 1, fontSize: '0.8125rem' }}
                        >
                            {letter}
                        </Typography>
                    </ButtonBase>
                );
            })}
        </Box>
    );
};

/** Set once the server has said it has no /Discover/People, so the session does not ask again. */
let personIndexMissing = false;

/** Turns an index entry into the item shape the person card builder reads. */
const toPersonCardItem = (person: PersonIndexItem, serverId?: string) => ({
    Id: person.Id,
    Name: person.Name,
    Type: 'Person',
    ServerId: serverId,
    RecursiveItemCount: person.Count,
    ImageTags: person.ImageTag ? { Primary: person.ImageTag } : undefined
});

/**
 * People of one kind, paged from the plugin's people index: the server sorts, counts and filters by
 * first letter, and cards are appended as the list is scrolled rather than all built up front.
 */
const IndexedPeopleCards: FC<{ parentId?: string; personType?: PersonKind; onUnavailable: () => void }> = ({ parentId, personType, onUnavailable }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const rendered = useRef({ key: '', count: 0 });
    const { __legacyApiClient__: legacyApiClient } = useApi();
    const [personSort, setPersonSort] = useState<PersonIndexSort>('az');
    const [letter, setLetter] = useState<string | null>(null);
    const [letters, setLetters] = useState<Record<string, number>>();

    const { data, error, isPending, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useGetPersonIndex(parentId, personType, personSort, letter);

    // Without a first page to show, hand over to the older per-person requests.
    useEffect(() => {
        if (isError && !data) {
            personIndexMissing = personIndexMissing || isPersonIndexMissing(error);
            onUnavailable();
        }
    }, [isError, data, error, onUnavailable]);

    const people = useMemo(() => data?.pages.flatMap(page => page.Items) ?? [], [data]);
    const total = data?.pages[0]?.Total ?? 0;

    useEffect(() => {
        const firstLetters = data?.pages[0]?.Letters;
        if (firstLetters) {
            setLetters(firstLetters);
        }
    }, [data]);

    // Build cards for the people not shown yet and leave the existing ones alone; a new library,
    // kind, sort or letter starts the list again.
    const resultKey = `${parentId}|${personType}|${personSort}|${letter}`;
    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        if (rendered.current.key !== resultKey) {
            container.innerHTML = '';
            rendered.current = { key: resultKey, count: 0 };
        }

        const fresh = people.slice(rendered.current.count);
        if (!fresh.length) {
            return;
        }

        appendPeopleCards(fresh.map(person => toPersonCardItem(person, legacyApiClient?.serverId())), {
            itemsContainer: container,
            coverImage: true,
            shape: CardShape.PortraitOverflow
        });
        rendered.current.count = people.length;
    }, [people, resultKey, legacyApiClient]);

    // Ask for the next page when the end of the list scrolls near the screen.
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !hasNextPage || isFetchingNextPage) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    void fetchNextPage();
                }
            },
            { rootMargin: '600px' }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, people.length]);

    if (isError && !data) {
        return null;
    }

    return (
        <Stack spacing={2}>
            {isPending && <Loading />}
            <PersonSortPills value={personSort} onChange={setPersonSort} />
            {letters && <PersonJumpBar letters={letters} value={letter} onChange={setLetter} />}
            {!isPending && total === 0 && (
                <Typography sx={{ color: 'text.secondary' }}>
                    {globalize.translate('MessageNothingHere')}
                </Typography>
            )}
            <div ref={containerRef} className='itemsContainer vertical-wrap' />
            <div ref={sentinelRef} aria-hidden='true' style={{ height: 1 }} />
        </Stack>
    );
};

/** Lists the library's people of one kind (Actor/Director/Writer) as clickable person cards. */
const PeopleCards: FC<{ parentId?: string; personType?: PersonKind; itemKind?: BaseItemKind }> = ({ parentId, personType, itemKind }) => {
    const [useLegacy, setUseLegacy] = useState(personIndexMissing);
    const handleUnavailable = useCallback(() => setUseLegacy(true), []);

    if (useLegacy) {
        return <LegacyPeopleCards parentId={parentId} personType={personType} itemKind={itemKind} />;
    }

    return <IndexedPeopleCards parentId={parentId} personType={personType} onUnavailable={handleUnavailable} />;
};

/**
 * The original People list: fetches up to 500 persons and their counts and sorts them in the browser.
 * Used only when the server has no /Discover/People (an older plugin) or the request fails.
 */
const LegacyPeopleCards: FC<{ parentId?: string; personType?: PersonKind; itemKind?: BaseItemKind }> = ({ parentId, personType, itemKind }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { data: people, isPending } = useGetPersons(parentId, personType);
    const { data: personCounts } = useGetPersonItemCounts(parentId, personType, itemKind);
    const [personSort, setPersonSort] = useState<'az' | 'za' | 'most' | 'fewest'>('az');

    // Overlay the plugin's per-person item counts onto the person items, falling back to the
    // server's (usually absent) RecursiveItemCount when the endpoint is unavailable.
    const peopleWithCounts = useMemo(
        () => (people ?? []).map(person => ({
            ...person,
            RecursiveItemCount: personCounts?.[person.Name ?? ''] ?? person.RecursiveItemCount ?? 0
        })),
        [people, personCounts]
    );

    const sortedPeople = useMemo(
        () => [...peopleWithCounts].sort((a, b) => {
            if (personSort === 'most' || personSort === 'fewest') {
                const diff = (b.RecursiveItemCount ?? 0) - (a.RecursiveItemCount ?? 0);
                return personSort === 'most' ? diff : -diff;
            }
            const aName = a.Name ?? '';
            const bName = b.Name ?? '';
            return personSort === 'az' ? aName.localeCompare(bName) : bName.localeCompare(aName);
        }),
        [peopleWithCounts, personSort]
    );

    useEffect(() => {
        const container = containerRef.current;
        if (!container || isPending || !sortedPeople.length) {
            return;
        }

        buildPeopleCards(sortedPeople, {
            itemsContainer: container,
            coverImage: true,
            shape: CardShape.PortraitOverflow
        });
    }, [sortedPeople, isPending]);

    if (isPending) {
        return <Loading />;
    }

    if (!sortedPeople.length) {
        return (
            <Typography sx={{ color: 'text.secondary' }}>
                {globalize.translate('MessageNothingHere')}
            </Typography>
        );
    }

    return (
        <Stack spacing={2}>
            <PersonSortPills value={personSort} onChange={setPersonSort} />
            <div ref={containerRef} className='itemsContainer vertical-wrap' />
        </Stack>
    );
};

const Browse: FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activePicker, setActivePicker] = useState<BrowseModeDefinition | null>(null);
    // A "Browse by…" meta tile with several children, rendered as a secondary grid.
    const [activeGroup, setActiveGroup] = useState<BrowseModeDefinition | null>(null);
    // A People leaf (Actors/Directors/Writers), rendered as a grid of person cards.
    const [activePersonType, setActivePersonType] = useState<BrowseModeDefinition | null>(null);

    // Grid vs. ribbon view toggle, persisted across visits.
    const [pickerView, setPickerView] = useState<'grid' | 'ribbons'>(
        () => (localStorage.getItem('browsePickerView') as 'grid' | 'ribbons') ?? 'grid'
    );

    // Sort order for picker tiles (genres, studios, decades, ratings, tags). 'random' is set only
    // by the shuffle button, not offered as a pill.
    type PickerSort = 'default' | 'random' | 'az' | 'za' | 'most' | 'fewest';
    const [pickerSort, setPickerSort] = useState<PickerSort>(
        () => (localStorage.getItem('browsePickerSort') as PickerSort) ?? 'default'
    );
    const { api } = useApi();

    // Picker value counts from the plugin's /Discover/Counts endpoint, shown as tile badges.
    const [pickerCounts, setPickerCounts] = useState<Record<string, number>>({});

    // Person and per-year counts from the same endpoint. People counts back the People meta tile's
    // child badges; year counts back the individual-year tiles. Both are fetched up front because
    // the People counts are needed on the home grid regardless of the active picker.
    const [personCounts, setPersonCounts] = useState<Record<string, number>>({});
    const [yearCounts, setYearCounts] = useState<Record<string, number>>({});

    // Infinite scroll — grow the visible slice as the sentinel scrolls into view.
    // Ribbons are heavier (each loads 25 items) so use a smaller batch.
    const DISPLAY_BATCH = pickerView === 'ribbons' ? 5 : 24;
    const [displayCount, setDisplayCount] = useState(DISPLAY_BATCH);
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Reset the visible slice whenever the active picker or view mode changes.
    useEffect(() => {
        setDisplayCount(DISPLAY_BATCH);
    }, [activePicker, DISPLAY_BATCH]);

    const libraryId = searchParams.get('topParentId');
    const collectionType = searchParams.get('collectionType') as CollectionType | null;

    const { data: library } = useItem(libraryId ?? undefined);

    // Every mode is always shown, in the fixed order the definitions are declared in.
    const browseModes = useMemo(
        () => getBrowseModes(collectionType) ?? [],
        [collectionType]
    );

    const primaryModes = useMemo(
        () => browseModes.filter(definition => definition.tier === 'primary'),
        [browseModes]
    );
    const metaModes = useMemo(
        () => browseModes.filter(definition => definition.tier === 'meta'),
        [browseModes]
    );

    // The underlying modes a secondary meta tile offers, resolved through the registry.
    const activeGroupChildren = useMemo(
        () => (activeGroup?.children ?? [])
            .map(child => getBrowseMode(collectionType, child))
            .filter((definition): definition is BrowseModeDefinition => Boolean(definition)),
        [activeGroup, collectionType]
    );

    const libraryPath = useMemo(
        () => LibraryRoutes.find(route => route.type === collectionType)?.path,
        [collectionType]
    );

    const itemKind = collectionType ? ITEM_KIND_BY_COLLECTION_TYPE[collectionType] : undefined;
    const { data: filters } = useGetQueryFiltersLegacy(libraryId, itemKind ? [itemKind] : []);
    const { data: studios } = useGetStudios(libraryId, itemKind ? [itemKind] : []);

    // Fetch picker value counts from the plugin (cached in memory), shown as tile badges.
    useEffect(() => {
        const type = activePicker?.picker?.filter ? COUNT_TYPE_BY_FILTER[activePicker.picker.filter] : undefined;
        if (!type || !api || !libraryId) {
            setPickerCounts({});
            return;
        }

        const cacheKey = `${libraryId}:${type}`;
        const cached = pickerCountsCache.get(cacheKey);
        if (cached) {
            setPickerCounts(cached);
            return;
        }

        let cancelled = false;
        api.axiosInstance
            .get<Record<string, number>>(`${api.basePath}/Discover/Counts`, {
                params: { type, parentId: libraryId, itemTypes: itemKind },
                headers: { Authorization: api.authorizationHeader }
            })
            .then(({ data }) => {
                pickerCountsCache.set(cacheKey, data);
                if (!cancelled) setPickerCounts(data);
            })
            .catch(() => {
                if (!cancelled) setPickerCounts({});
            });

        return () => {
            cancelled = true;
        };
    }, [api, libraryId, itemKind, activePicker?.picker?.filter]);

    // Fetch person counts (Actor/Director/Writer) backing the People meta tile's child badges.
    useEffect(() => {
        if (!api || !libraryId) {
            setPersonCounts({});
            return;
        }

        const cacheKey = `${libraryId}:person`;
        const cached = pickerCountsCache.get(cacheKey);
        if (cached) {
            setPersonCounts(cached);
            return;
        }

        let cancelled = false;
        api.axiosInstance
            .get<Record<string, number>>(`${api.basePath}/Discover/Counts`, {
                params: { type: 'person', parentId: libraryId, itemTypes: itemKind },
                headers: { Authorization: api.authorizationHeader }
            })
            .then(({ data }) => {
                pickerCountsCache.set(cacheKey, data);
                if (!cancelled) setPersonCounts(data);
            })
            .catch(() => {
                if (!cancelled) setPersonCounts({});
            });

        return () => {
            cancelled = true;
        };
    }, [api, libraryId, itemKind]);

    // Fetch per-year item counts backing the individual-year tiles.
    useEffect(() => {
        if (!api || !libraryId) {
            setYearCounts({});
            return;
        }

        const cacheKey = `${libraryId}:year`;
        const cached = pickerCountsCache.get(cacheKey);
        if (cached) {
            setYearCounts(cached);
            return;
        }

        let cancelled = false;
        api.axiosInstance
            .get<Record<string, number>>(`${api.basePath}/Discover/Counts`, {
                params: { type: 'year', parentId: libraryId, itemTypes: itemKind },
                headers: { Authorization: api.authorizationHeader }
            })
            .then(({ data }) => {
                pickerCountsCache.set(cacheKey, data);
                if (!cancelled) setYearCounts(data);
            })
            .catch(() => {
                if (!cancelled) setYearCounts({});
            });

        return () => {
            cancelled = true;
        };
    }, [api, libraryId, itemKind]);

    // Incrementing counter forces a fresh random shuffle each click.
    const [shuffleKey, setShuffleKey] = useState(0);
    const handleShuffle = useCallback(() => {
        if (pickerSort !== 'random') {
            setPickerSort('random');
            localStorage.setItem('browsePickerSort', 'random');
        }
        setShuffleKey(k => k + 1);
    }, [pickerSort]);

    // Only offer values the library actually has something under. A decade is expanded into the
    // ten years it covers, since that is what the items are actually tagged with. The active sort
    // pill reorders the result ('default' = each picker's natural order).
    const pickOptions = useMemo(() => {
        if (!activePicker) {
            return [];
        }

        let options: Array<{ label: string; value: string; iconSrc?: string; Icon?: SvgIconComponent; iconColor?: string; count?: number }> = [];

        if (activePicker.picker?.filter === 'Years') {
            if (activePicker.picker.individualYears) {
                // Only the years that actually have items, newest first, each drawn as its four-digit year.
                options = [...new Set(filters?.Years ?? [])]
                    .sort((a, b) => b - a)
                    .map(year => ({
                        label: String(year),
                        value: String(year),
                        Icon: yearNumberIcon(year),
                        iconColor: YEAR_NUMBER_COLOR,
                        count: yearCounts[String(year)]
                    }));
            } else {
                const years = filters?.Years;
                if (years?.length) {
                    const startYears = [...new Set(years.map(year => Math.floor(year / DECADE_LENGTH) * DECADE_LENGTH))];
                    startYears.sort((a, b) => b - a);
                    options = startYears.map(startYear => ({
                        label: `${startYear}s`,
                        value: Array.from({ length: DECADE_LENGTH }, (_, offset) => startYear + offset).join(','),
                        ...getDecadeStyle(startYear)
                    }));
                }
            }
        } else if (activePicker.picker?.filter === 'OfficialRatings') {
            // Collapse similar codes (R / R18+ / NC-17 …) into one tile per level, summing counts.
            const buckets = new Map<RatingLevel, string[]>();
            for (const rating of filters?.OfficialRatings ?? []) {
                const level = getRatingLevel(rating);
                const list = buckets.get(level);
                if (list) {
                    list.push(rating);
                } else {
                    buckets.set(level, [rating]);
                }
            }
            options = RATING_LEVEL_ORDER
                .filter(level => buckets.has(level))
                .map(level => {
                    const codes = buckets.get(level)!;
                    return {
                        label: RATING_LEVEL_LABEL[level],
                        value: codes.join(','),
                        count: codes.reduce((sum, code) => sum + (pickerCounts[code] ?? 0), 0),
                        ...RATING_LEVELS[level]
                    };
                });
        } else if (activePicker.picker?.filter === 'Genres') {
            options = buildGenreOptions(filters?.Genres);
        } else if (activePicker.picker?.filter === 'Studios') {
            options = buildStudioOptions(studios, activePicker);
        } else if (activePicker.picker?.filter === 'Tags' && activePicker.picker.tagList) {
            const curated = new Set(activePicker.picker.tagList.map(t => t.toLowerCase()));
            options = (filters?.Tags ?? [])
                .filter(tag => curated.has(tag.toLowerCase()))
                .map(tag => ({
                    label: toTitleCase(tag),
                    value: tag,
                    iconSrc: activePicker.iconSrc
                }));
        }

        return sortPickerOptions(options, pickerSort, pickerCounts);
    }, [activePicker, filters?.Years, filters?.OfficialRatings, filters?.Genres, studios, filters?.Tags, pickerSort, pickerCounts, yearCounts, shuffleKey]);

    // Grow the visible slice when the sentinel scrolls into view.
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !activePicker) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setDisplayCount(prev => prev + DISPLAY_BATCH);
                }
            },
            { rootMargin: '400px' }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [activePicker, displayCount]);

    const goToLibrary = useCallback((search: string) => {
        if (!libraryPath || !libraryId) {
            return;
        }

        const params = new URLSearchParams(search);
        params.set('topParentId', libraryId);
        if (collectionType) {
            params.set('collectionType', collectionType);
        }

        navigate(`${libraryPath}?${params.toString()}`);
    }, [navigate, libraryPath, libraryId, collectionType]);

    // Opens a leaf mode: a picker opens in place, a view-backed mode opens its tab, a people leaf
    // opens a grid of persons, and the rest seed the sort and filters of the library's default view.
    const openLeaf = useCallback((definition: BrowseModeDefinition) => {
        if (definition.picker) {
            setActivePicker(definition);
            return;
        }

        if (definition.personType) {
            setActivePersonType(definition);
            return;
        }

        if (definition.view) {
            const views = LibraryRoutes.find(route => route.type === collectionType)?.views ?? [];
            const index = views.find(view => view.view === definition.view)?.index;
            goToLibrary(index === undefined ? '' : `tab=${index}`);
            return;
        }

        goToLibrary(definition.settings ? `browseMode=${definition.mode}` : '');
    }, [collectionType, goToLibrary]);

    const onModeClick = useCallback((definition: BrowseModeDefinition) => {
        // A meta tile with exactly one child opens that child directly (Mood & Tone -> Mood,
        // Time -> Decades).
        if (definition.children?.length === 1) {
            const child = getBrowseMode(collectionType, definition.children[0]);
            if (child) {
                openLeaf(child);
                return;
            }
        }

        // A meta tile with several children opens a secondary grid of them.
        if (definition.children?.length) {
            setActiveGroup(definition);
            return;
        }

        openLeaf(definition);
    }, [collectionType, openLeaf]);

    const onPickClick = useCallback((value: string) => {
        if (!activePicker) {
            return;
        }

        goToLibrary(`browseMode=${activePicker.mode}&pick=${encodeURIComponent(value)}`);
    }, [goToLibrary, activePicker]);

    const isTagPicker = activePicker?.picker?.filter === 'Tags';
    const togglePickerView = useCallback(() => {
        setPickerView(prev => {
            const next = prev === 'ribbons' ? 'grid' : 'ribbons';
            localStorage.setItem('browsePickerView', next);
            return next;
        });
    }, []);

    const handleSortChange = useCallback((value: PickerSort) => {
        setPickerSort(value);
        localStorage.setItem('browsePickerSort', value);
    }, []);

    const handleBackFromPicker = useCallback(() => setActivePicker(null), []);
    const handleBackFromGroup = useCallback(() => setActiveGroup(null), []);
    const handleBackFromPerson = useCallback(() => setActivePersonType(null), []);

    // Three views share the page — a picker, a meta secondary grid, and the home grid. A single
    // render function keeps the JSX free of nested ternaries.
    const renderBrowseContent = () => {
        if (activePersonType) {
            return (
                <>
                    <Stack direction='row' alignItems='center' gap={1}>
                        <IconButton onClick={handleBackFromPerson} size='small' aria-label={globalize.translate('ButtonBack')}>
                            <ArrowBack fontSize='small' />
                        </IconButton>
                        <Typography variant='h2' sx={{ flexGrow: 1 }}>
                            {globalize.translate(activePersonType.label)}
                        </Typography>
                    </Stack>

                    <PeopleCards
                        parentId={libraryId ?? undefined}
                        personType={activePersonType.personType}
                        itemKind={itemKind}
                    />
                </>
            );
        }

        if (activePicker) {
            return (
                <>
                    <Stack direction='row' alignItems='center' gap={1}>
                        <IconButton onClick={handleBackFromPicker} size='small' aria-label={globalize.translate('ButtonBack')}>
                            <ArrowBack fontSize='small' />
                        </IconButton>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            {isTagPicker && (
                                <Tooltip title='Shuffle tags'>
                                    <IconButton onClick={handleShuffle} size='small'>
                                        <Shuffle fontSize='small' />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {SORT_PILLS.map(pill => (
                                <ButtonBase
                                    key={pill.value}
                                    onClick={() => handleSortChange(pill.value)}
                                    aria-pressed={pickerSort === pill.value}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '4px 14px',
                                        borderRadius: '999px',
                                        border: `1px solid ${pickerSort === pill.value ? 'var(--jf-palette-text-primary, rgba(255, 255, 255, 0.9))' : 'var(--jf-palette-divider, rgba(255, 255, 255, 0.12))'}`,
                                        backgroundColor: pickerSort === pill.value ? 'rgba(var(--jf-palette-background-paperChannel, 32 32 32) / 0.5)' : 'transparent',
                                        transition: 'background-color 120ms ease, border-color 120ms ease'
                                    }}
                                >
                                    <Typography
                                        variant='caption'
                                        sx={{ color: pickerSort === pill.value ? 'text.primary' : 'text.secondary', fontWeight: pickerSort === pill.value ? 600 : 400, lineHeight: 1, fontSize: '0.875rem' }}
                                    >
                                        {pill.label}
                                    </Typography>
                                </ButtonBase>
                            ))}
                        </Box>
                        <Typography variant='h2' sx={{ flexGrow: 1, textAlign: 'right' }}>
                            {globalize.translate(activePicker.label)}
                        </Typography>
                        {isTagPicker && (
                            <Tooltip title={pickerView === 'ribbons' ? 'Switch to grid' : 'Switch to shelves'}>
                                <IconButton onClick={togglePickerView} size='small'>
                                    {pickerView === 'ribbons' ? <ViewModule fontSize='small' /> : <ViewStream fontSize='small' />}
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>

                    {isTagPicker && pickerView === 'ribbons' ? (
                        <Stack spacing={2}>
                            {pickOptions.slice(0, displayCount).map(option => (
                                <TagRibbonsSection
                                    key={option.value}
                                    tagName={option.value}
                                    parentId={libraryId ?? ''}
                                    collectionType={collectionType ?? undefined}
                                    itemType={itemKind ? [itemKind] : []}
                                />
                            ))}
                            {displayCount < pickOptions.length && (
                                <Box ref={sentinelRef} sx={{ height: 1 }} />
                            )}
                        </Stack>
                    ) : (
                        <>
                            <TileGrid>
                                {pickOptions.slice(0, displayCount).map(option => (
                                    <PickTile
                                        key={option.value}
                                        label={option.label}
                                        value={option.value}
                                        iconSrc={option.iconSrc}
                                        Icon={option.Icon}
                                        iconColor={option.iconColor}
                                        count={option.count ?? pickerCounts[option.value] ?? pickerCounts[option.label]}
                                        onSelect={onPickClick}
                                    />
                                ))}
                            </TileGrid>
                            {displayCount < pickOptions.length && (
                                <Box ref={sentinelRef} sx={{ height: 1 }} />
                            )}
                        </>
                    )}
                </>
            );
        }

        if (activeGroup) {
            return (
                <>
                    <Stack direction='row' alignItems='center' gap={1}>
                        <IconButton onClick={handleBackFromGroup} size='small' aria-label={globalize.translate('ButtonBack')}>
                            <ArrowBack fontSize='small' />
                        </IconButton>
                        <Typography variant='h2' sx={{ flexGrow: 1 }}>
                            {globalize.translate(activeGroup.label)}
                        </Typography>
                    </Stack>

                    <TileGrid>
                        {activeGroupChildren.map(definition => (
                            <BrowseModeTile
                                key={definition.mode}
                                definition={definition}
                                onSelect={onModeClick}
                                count={childEntryCount(definition, filters, studios, personCounts) || undefined}
                            />
                        ))}
                    </TileGrid>
                </>
            );
        }

        return null;
    };

    const isHomeView = !activePicker && !activeGroup && !activePersonType;

    // Render meta modes in array order: consecutive non-inline pickers are batched into shared
    // grids, inline groups render as labeled sections, and consecutive compact groups share one
    // centred, mirror-balanced row. Preserves usefulness order while each row stays centred.
    const renderMetaSections = () => {
        const sections: React.ReactNode[] = [];
        let pickerBatch: BrowseModeDefinition[] = [];
        let compactBatch: React.ReactNode[] = [];

        const flushPickers = () => {
            if (pickerBatch.length) {
                sections.push(
                    <TileGrid key={`pickers-${sections.length}`}>
                        {pickerBatch.map(definition => (
                            <BrowseModeTile
                                key={definition.mode}
                                definition={definition}
                                onSelect={onModeClick}
                            />
                        ))}
                    </TileGrid>
                );
                pickerBatch = [];
            }
        };

        const flushCompact = () => {
            if (compactBatch.length) {
                sections.push(
                    <Box key={`compact-${sections.length}`} sx={COMPACT_ROW_SX}>
                        {compactBatch}
                    </Box>
                );
                compactBatch = [];
            }
        };

        for (const definition of metaModes) {
            if (definition.inline) {
                flushPickers();
                const section = (
                    <InlineModeLinks
                        key={definition.mode}
                        definition={definition}
                        children={(definition.children ?? [])
                            .map(child => getBrowseMode(collectionType, child))
                            .filter((child): child is BrowseModeDefinition => Boolean(child))}
                        onSelect={openLeaf}
                        getCount={child => childEntryCount(child, filters, studios, personCounts)}
                    />
                );
                if (definition.compact) {
                    compactBatch.push(section);
                } else {
                    flushCompact();
                    sections.push(section);
                }
            } else {
                flushCompact();
                pickerBatch.push(definition);
            }
        }
        flushPickers();
        flushCompact();

        return sections;
    };

    const renderHome = () => (
        <Stack spacing={unit(2.4)} alignItems='center' sx={HOME_ROOT_SX}>
            {library?.Name ? (
                <Typography variant='h1' sx={{ width: '100%', textAlign: 'center', fontSize: `max(1.125rem, ${unit(2.6)})`, fontWeight: 500, lineHeight: 1.15 }}>
                    {library.Name}
                </Typography>
            ) : null}

            <PrimaryTileGrid>
                {primaryModes.map(definition => (
                    <BrowseModeTile
                        key={definition.mode}
                        definition={definition}
                        onSelect={onModeClick}
                        variant='primary'
                    />
                ))}
            </PrimaryTileGrid>

            <Stack spacing={unit(2.4)} alignItems='center' sx={{ width: '100%' }}>
                {renderMetaSections()}
            </Stack>
        </Stack>
    );

    return (
        <Page
            id='browseModesPage'
            className='mainAnimatedPage libraryPage'
            title={library?.Name ?? undefined}
        >
            <LibraryBackdrop libraryId={libraryId} />

            <Box
                className={isHomeView ? 'padded-top padded-bottom-page' : 'padded-left padded-right padded-top padded-bottom-page'}
                sx={{ position: 'relative', zIndex: 1, ...(isHomeView ? { paddingX: HOME_PADDING_X } : null) }}
            >
                {isHomeView ? (
                    renderHome()
                ) : (
                    <Stack spacing={3}>
                        {renderBrowseContent()}
                    </Stack>
                )}
            </Box>
        </Page>
    );
};

export default Browse;
