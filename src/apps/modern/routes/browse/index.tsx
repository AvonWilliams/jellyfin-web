import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { type FC, useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getBrowseModes } from 'apps/modern/features/libraries/constants/browseModes';
import { getDecadeStyle, getRatingStyle } from 'apps/modern/features/libraries/constants/pickTiles';
import { LibraryRoutes } from 'apps/modern/features/libraries/constants/libraryRoutes';
import Page from 'components/Page';
import { useGetQueryFiltersLegacy } from 'hooks/useFetchItems';
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

        return [];
    }, [activePicker, filters?.Years, filters?.OfficialRatings]);

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
                            <Typography variant='h2'>
                                {globalize.translate(activePicker.label)}
                            </Typography>
                            <TileGrid>
                                {pickOptions.map(option => (
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
