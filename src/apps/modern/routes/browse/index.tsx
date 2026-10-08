import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import type { PersonKind } from '@jellyfin/sdk/lib/generated-client/models/person-kind';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Shuffle from '@mui/icons-material/Shuffle';
import ViewModule from '@mui/icons-material/ViewModule';
import ViewStream from '@mui/icons-material/ViewStream';
import React, { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { applyBrowseModeOrder, getBrowseMode, getBrowseModes } from 'apps/modern/features/libraries/constants/browseModes';
import { getDecadeStyle, getRatingStyle, toTitleCase } from 'apps/modern/features/libraries/constants/pickTiles';
import TagRibbonsSection from 'apps/modern/features/libraries/components/TagRibbonsSection';
import { LibraryRoutes } from 'apps/modern/features/libraries/constants/libraryRoutes';
import { buildPeopleCards } from 'components/cardbuilder/peoplecardbuilder';
import { CardShape } from 'components/cardbuilder/utils/shape';
import Loading from 'components/loading/LoadingComponent';
import Page from 'components/Page';
import { useGetPersons, useGetQueryFiltersLegacy, useGetStudios } from 'hooks/useFetchItems';
import { useApi } from 'hooks/useApi';
import { useItem } from 'hooks/useItem';
import globalize from 'lib/globalize';
import type { BrowseModeDefinition } from 'types/browseMode';

const DECADE_LENGTH = 10;

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
    Icon: activePicker.Icon,
    iconColor: activePicker.iconColor
}));

/** Builds genre tiles from a plain list of names. */
const buildGenreOptions = (genres: string[] | null | undefined, activePicker: BrowseModeDefinition) => {
    const entries = (genres ?? [])
        .slice()
        .sort((a, b) => a.localeCompare(b))
        .map(genre => ({ label: genre, value: genre }));
    return buildNamedOptions(activePicker, entries);
};

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

/** Item kinds whose production years decide which decades are worth offering. */
const ITEM_KIND_BY_COLLECTION_TYPE: Partial<Record<CollectionType, BaseItemKind>> = {
    [CollectionType.Movies]: BaseItemKind.Movie,
    [CollectionType.Tvshows]: BaseItemKind.Series
};

interface TileProps {
    label: string;
    Icon?: BrowseModeDefinition['Icon'];
    iconColor?: string;
    count?: number;
    onClick: () => void;
}

const Tile: FC<TileProps> = ({ label, Icon, iconColor, count, onClick }) => (
    <ButtonBase
        onClick={onClick}
        focusRipple
        className='card'
        sx={{
            flexDirection: 'column',
            gap: 1,
            justifyContent: 'center',
            width: '100%',
            aspectRatio: '16 / 9',
            padding: 2,
            borderRadius: 1,
            backgroundColor: 'action.hover',
            transition: 'background-color 120ms ease, transform 120ms ease',
            '&:hover, &:focus-visible': {
                backgroundColor: 'action.selected',
                transform: 'scale(1.03)'
            }
        }}
    >
        {Icon ? <Icon sx={{ fontSize: '2.5rem', color: iconColor }} /> : null}
        <Typography variant='subtitle1' sx={{ textAlign: 'center', lineHeight: 1.2 }}>
            {label}
        </Typography>
        {count !== undefined ? (
            <Typography variant='body2' sx={{ color: 'text.secondary', textAlign: 'center', lineHeight: 1 }}>
                {count}
            </Typography>
        ) : null}
    </ButtonBase>
);

const BrowseModeTile: FC<{
    definition: BrowseModeDefinition;
    onSelect: (definition: BrowseModeDefinition) => void;
}> = ({ definition, onSelect }) => {
    const onClick = useCallback(() => onSelect(definition), [onSelect, definition]);

    return (
        <Tile
            label={globalize.translate(definition.label)}
            Icon={definition.Icon}
            iconColor={definition.iconColor}
            onClick={onClick}
        />
    );
};

const PickTile: FC<{
    label: string;
    value: string;
    Icon?: BrowseModeDefinition['Icon'];
    iconColor?: string;
    count?: number;
    onSelect: (value: string) => void;
}> = ({ label, value, Icon, iconColor, count, onSelect }) => {
    const onClick = useCallback(() => onSelect(value), [onSelect, value]);

    return <Tile label={label} Icon={Icon} iconColor={iconColor} count={count} onClick={onClick} />;
};

const TileGrid: FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box
        sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 2
        }}
    >
        {children}
    </Box>
);

/** Lists the library's people of one kind (Actor/Director/Writer) as clickable person cards. */
const PeopleCards: FC<{ parentId?: string; personType?: PersonKind }> = ({ parentId, personType }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { data: people, isPending } = useGetPersons(parentId, personType);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || isPending || !people?.length) {
            return;
        }

        buildPeopleCards(people, {
            itemsContainer: container,
            coverImage: true,
            shape: CardShape.PortraitOverflow
        });
    }, [people, isPending]);

    if (isPending) {
        return <Loading />;
    }

    if (!people?.length) {
        return (
            <Typography sx={{ color: 'text.secondary' }}>
                {globalize.translate('MessageNothingHere')}
            </Typography>
        );
    }

    return <div ref={containerRef} className='itemsContainer vertical-wrap' />;
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

    // Tag sort order for tag-based pickers.
    type TagSort = 'random' | 'az' | 'za' | 'most' | 'fewest';
    const [tagSort, setTagSort] = useState<TagSort>(
        () => (localStorage.getItem('browseTagSort') as TagSort) ?? 'random'
    );

    // Per-tag item counts (fetched lazily when sorting by count).
    const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
    const { __legacyApiClient__, api } = useApi();

    // Picker value counts from the plugin's /Discover/Counts endpoint, shown as tile badges.
    const [pickerCounts, setPickerCounts] = useState<Record<string, number>>({});

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

    // The administrator's tile order and visibility, fetched from the plugin. An empty or
    // missing layout falls back to the built-in order with every mode shown.
    const [tileLayout, setTileLayout] = useState<string[]>();
    useEffect(() => {
        if (!api) return;
        api.axiosInstance
            .get<string[]>(`${api.basePath}/Discover/TileLayout`, {
                headers: { Authorization: api.authorizationHeader }
            })
            .then(({ data }) => setTileLayout(data))
            .catch(() => setTileLayout(undefined));
    }, [api]);

    const browseModes = useMemo(
        () => applyBrowseModeOrder(getBrowseModes(collectionType) ?? [], tileLayout),
        [collectionType, tileLayout]
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

    // Fetch per-tag item counts when sorting by count.
    useEffect(() => {
        if ((tagSort !== 'most' && tagSort !== 'fewest') || activePicker?.picker?.filter !== 'Tags' || !libraryId) {
            return;
        }

        const curated = new Set(activePicker?.picker?.tagList?.map(t => t.toLowerCase()) ?? []);
        const available = (filters?.Tags ?? []).filter(tag => curated.has(tag.toLowerCase()));
        if (!available.length) return;

        const BATCH = 8;
        let cancelled = false;
        const counts: Record<string, number> = {};

        const fetchBatch = async (start: number) => {
            const batch = available.slice(start, start + BATCH);
            const results = await Promise.allSettled(
                batch.map(tag => {
                    const url = __legacyApiClient__?.getUrl('Items', {
                        Tags: tag,
                        Limit: 0,
                        Recursive: true,
                        ParentId: libraryId,
                        IncludeItemTypes: itemKind ?? undefined
                    });
                    return url ? __legacyApiClient__?.getJSON(url) : Promise.resolve(null);
                })
            );
            results.forEach((r, i) => {
                if (r.status === 'fulfilled' && r.value?.TotalRecordCount !== undefined) {
                    counts[batch[i]] = r.value.TotalRecordCount;
                }
            });
            if (!cancelled && start + BATCH < available.length) {
                await fetchBatch(start + BATCH);
            }
        };

        fetchBatch(0).then(() => {
            if (!cancelled) setTagCounts(counts);
        });

        return () => { cancelled = true; };
    }, [tagSort, activePicker?.picker?.filter, activePicker?.picker?.tagList, filters?.Tags, libraryId, itemKind, __legacyApiClient__]);

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

    // Incrementing counter forces a fresh random shuffle each click.
    const [shuffleKey, setShuffleKey] = useState(0);
    const handleShuffle = useCallback(() => {
        if (tagSort !== 'random') {
            setTagSort('random');
            localStorage.setItem('browseTagSort', 'random');
        }
        setShuffleKey(k => k + 1);
    }, [tagSort]);

    // Only offer values the library actually has something under. A decade is expanded into the
    // ten years it covers, since that is what the items are actually tagged with.
    const pickOptions = useMemo(() => {
        if (activePicker?.picker?.filter === 'Years') {
            const years = filters?.Years;
            if (!years?.length) {
                return [];
            }

            const startYears = [...new Set(years.map(year => Math.floor(year / DECADE_LENGTH) * DECADE_LENGTH))];
            startYears.sort((a, b) => b - a);

            return startYears.map(startYear => ({
                label: `${startYear}s`,
                value: Array.from({ length: DECADE_LENGTH }, (_, offset) => startYear + offset).join(','),
                ...getDecadeStyle(startYear)
            }));
        }

        if (activePicker?.picker?.filter === 'OfficialRatings') {
            return (filters?.OfficialRatings ?? [])
                .slice()
                .sort((a, b) => a.localeCompare(b))
                .map(rating => ({ label: rating, value: rating, ...getRatingStyle(rating) }));
        }

        if (activePicker?.picker?.filter === 'Genres') {
            return buildGenreOptions(filters?.Genres, activePicker);
        }

        if (activePicker?.picker?.filter === 'Studios') {
            return buildStudioOptions(studios, activePicker);
        }

        if (activePicker?.picker?.filter === 'Tags' && activePicker.picker.tagList) {
            const curated = new Set(activePicker.picker.tagList.map(t => t.toLowerCase()));
            const available = (filters?.Tags ?? [])
                .filter(tag => curated.has(tag.toLowerCase()));

            let sorted = available;

            if (tagSort === 'az') {
                sorted = [...available].sort((a, b) => a.localeCompare(b));
            } else if (tagSort === 'za') {
                sorted = [...available].sort((a, b) => b.localeCompare(a));
            } else if (tagSort === 'most') {
                sorted = [...available].sort((a, b) => (tagCounts[b] ?? 0) - (tagCounts[a] ?? 0));
            } else if (tagSort === 'fewest') {
                sorted = [...available].sort((a, b) => (tagCounts[a] ?? 0) - (tagCounts[b] ?? 0));
            } else {
                // 'random' — stable shuffle within this picker session.
                const shuffled = [...available];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                sorted = shuffled;
            }

            return sorted.map(tag => ({
                label: toTitleCase(tag),
                value: tag,
                Icon: activePicker.Icon,
                iconColor: activePicker.iconColor
            }));
        }

        return [];
    }, [activePicker, filters?.Years, filters?.OfficialRatings, filters?.Genres, studios, filters?.Tags, tagSort, tagCounts, shuffleKey]);

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

    const handleSortChange = useCallback((e: SelectChangeEvent<string>) => {
        const value = e.target.value as TagSort;
        setTagSort(value);
        localStorage.setItem('browseTagSort', value);
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
                        <Typography variant='h2' sx={{ flexGrow: 1 }}>
                            {globalize.translate(activePicker.label)}
                        </Typography>
                        {isTagPicker && (
                            <>
                                <Tooltip title='Shuffle tags'>
                                    <IconButton onClick={handleShuffle} size='small'>
                                        <Shuffle fontSize='small' />
                                    </IconButton>
                                </Tooltip>
                                <FormControl size='small' sx={{ minWidth: 130 }}>
                                    <Select
                                        value={tagSort}
                                        onChange={handleSortChange}
                                        inputProps={{ 'aria-label': 'Sort order' }}
                                    >
                                        <MenuItem value='random'>Random</MenuItem>
                                        <MenuItem value='az'>A — Z</MenuItem>
                                        <MenuItem value='za'>Z — A</MenuItem>
                                        <MenuItem value='most'>Most items</MenuItem>
                                        <MenuItem value='fewest'>Fewest items</MenuItem>
                                    </Select>
                                </FormControl>
                                <Tooltip title={pickerView === 'ribbons' ? 'Switch to grid' : 'Switch to shelves'}>
                                    <IconButton onClick={togglePickerView} size='small'>
                                        {pickerView === 'ribbons' ? <ViewModule fontSize='small' /> : <ViewStream fontSize='small' />}
                                    </IconButton>
                                </Tooltip>
                            </>
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
                                        Icon={option.Icon}
                                        iconColor={option.iconColor}
                                        count={pickerCounts[option.value] ?? pickerCounts[option.label]}
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
                            />
                        ))}
                    </TileGrid>
                </>
            );
        }

        return (
            <>
                <Typography variant='h2'>
                    {globalize.translate('BrowseModeSectionQuickAccess')}
                </Typography>
                <TileGrid>
                    {primaryModes.map(definition => (
                        <BrowseModeTile
                            key={definition.mode}
                            definition={definition}
                            onSelect={onModeClick}
                        />
                    ))}
                </TileGrid>

                <Divider />

                <Typography variant='h2'>
                    {globalize.translate('BrowseModeSectionBrowseBy')}
                </Typography>
                <TileGrid>
                    {metaModes.map(definition => (
                        <BrowseModeTile
                            key={definition.mode}
                            definition={definition}
                            onSelect={onModeClick}
                        />
                    ))}
                </TileGrid>
            </>
        );
    };

    return (
        <Page
            id='browseModesPage'
            className='mainAnimatedPage libraryPage'
            title={library?.Name ?? undefined}
        >
            <Box className='padded-left padded-right padded-top padded-bottom-page'>
                <Stack spacing={3}>
                    <Typography variant='h1'>
                        {library?.Name ?? globalize.translate('HeaderBrowseBy')}
                    </Typography>

                    {renderBrowseContent()}
                </Stack>
            </Box>
        </Page>
    );
};

export default Browse;
