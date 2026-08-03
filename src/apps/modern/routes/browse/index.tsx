import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Shuffle from '@mui/icons-material/Shuffle';
import ViewModule from '@mui/icons-material/ViewModule';
import ViewStream from '@mui/icons-material/ViewStream';
import React, { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getBrowseModes } from 'apps/modern/features/libraries/constants/browseModes';
import { getDecadeStyle, getRatingStyle, toTitleCase } from 'apps/modern/features/libraries/constants/pickTiles';
import TagRibbonsSection from 'apps/modern/features/libraries/components/TagRibbonsSection';
import { LibraryRoutes } from 'apps/modern/features/libraries/constants/libraryRoutes';
import Page from 'components/Page';
import { useGetQueryFiltersLegacy } from 'hooks/useFetchItems';
import { useApi } from 'hooks/useApi';
import { useItem } from 'hooks/useItem';
import globalize from 'lib/globalize';
import type { BrowseModeDefinition } from 'types/browseMode';

const DECADE_LENGTH = 10;

/** Item kinds whose production years decide which decades are worth offering. */
const ITEM_KIND_BY_COLLECTION_TYPE: Partial<Record<CollectionType, BaseItemKind>> = {
    [CollectionType.Movies]: BaseItemKind.Movie,
    [CollectionType.Tvshows]: BaseItemKind.Series
};

interface TileProps {
    label: string;
    Icon?: BrowseModeDefinition['Icon'];
    iconColor?: string;
    onClick: () => void;
}

const Tile: FC<TileProps> = ({ label, Icon, iconColor, onClick }) => (
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
    onSelect: (value: string) => void;
}> = ({ label, value, Icon, iconColor, onSelect }) => {
    const onClick = useCallback(() => onSelect(value), [onSelect, value]);

    return <Tile label={label} Icon={Icon} iconColor={iconColor} onClick={onClick} />;
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

const Browse: FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activePicker, setActivePicker] = useState<BrowseModeDefinition | null>(null);

    // Grid vs. ribbon view toggle, persisted across visits.
    const [pickerView, setPickerView] = useState<'grid' | 'ribbons'>(
        () => (localStorage.getItem('browsePickerView') as 'grid' | 'ribbons') ?? 'ribbons'
    );

    // Tag sort order for tag-based pickers.
    type TagSort = 'random' | 'az' | 'za' | 'most' | 'fewest';
    const [tagSort, setTagSort] = useState<TagSort>(
        () => (localStorage.getItem('browseTagSort') as TagSort) ?? 'random'
    );

    // Per-tag item counts (fetched lazily when sorting by count).
    const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
    const { __legacyApiClient__ } = useApi();

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
    const browseModes = getBrowseModes(collectionType);

    const libraryPath = useMemo(
        () => LibraryRoutes.find(route => route.type === collectionType)?.path,
        [collectionType]
    );

    const itemKind = collectionType ? ITEM_KIND_BY_COLLECTION_TYPE[collectionType] : undefined;
    const { data: filters } = useGetQueryFiltersLegacy(libraryId, itemKind ? [itemKind] : []);

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
    }, [activePicker, filters?.Years, filters?.OfficialRatings, filters?.Tags, tagSort, tagCounts, shuffleKey]);

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

    const onModeClick = useCallback((definition: BrowseModeDefinition) => {
        if (definition.picker) {
            setActivePicker(definition);
            return;
        }

        // Modes backed by an existing view open that view's tab; the rest seed the sort and
        // filters of the library's default view.
        if (definition.view) {
            const views = LibraryRoutes.find(route => route.type === collectionType)?.views ?? [];
            const index = views.find(view => view.view === definition.view)?.index;
            goToLibrary(index === undefined ? '' : `tab=${index}`);
            return;
        }

        goToLibrary(definition.settings ? `browseMode=${definition.mode}` : '');
    }, [collectionType, goToLibrary]);

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

                    {activePicker ? (
                        <>
                            <Stack direction='row' alignItems='center' gap={1}>
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
                    ) : (
                        <TileGrid>
                            {browseModes?.map(definition => (
                                <BrowseModeTile
                                    key={definition.mode}
                                    definition={definition}
                                    onSelect={onModeClick}
                                />
                            ))}
                        </TileGrid>
                    )}
                </Stack>
            </Box>
        </Page>
    );
};

export default Browse;
