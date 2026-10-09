import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import classNames from 'classnames';
import React, { type FC, SetStateAction, useCallback, useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';

import { useLibrary } from 'apps/modern/features/libraries/hooks/useLibrary';
import { getDefaultLibraryViewSettings } from 'apps/modern/features/libraries/utils/settings';
import BrowseSourceBar from 'apps/modern/features/libraries/components/BrowseSourceBar';
import ComingSoonCard from 'apps/modern/features/libraries/components/ComingSoonCard';
import { DEFAULT_BROWSE_SOURCE, getEnabledSources } from 'apps/modern/features/libraries/constants/browseSources';
import Card from 'components/cardbuilder/Card/Card';
import Cards from 'components/cardbuilder/Card/Cards';
import { setCardData } from 'components/cardbuilder/cardBuilder';
import { CardShape } from 'components/cardbuilder/utils/shape';
import NoItemsMessage from 'components/common/NoItemsMessage';
import Lists from 'components/listview/List/Lists';
import Loading from 'components/loading/LoadingComponent';
import { ItemAction } from 'constants/itemAction';
import ItemsContainer from 'elements/emby-itemscontainer/ItemsContainer';
import { useApi } from 'hooks/useApi';
import globalize from 'lib/globalize';
import type { CardOptions } from 'types/cardOptions';
import type { DiscoverRankedResult } from 'types/discover';
import { type LibraryViewSettings, ViewMode } from 'types/library';
import { LibraryTab } from 'types/libraryTab';
import type { ListOptions } from 'types/listOptions';

import AlphabetPicker from './AlphabetPicker';
import useMediaQuery from '@mui/material/useMediaQuery';

const ItemsView: FC = () => {
    const {
        id: parentId,
        collectionType,
        content,
        itemsResult,
        viewSettings,
        setViewSettings,
        source,
        setSource
    } = useLibrary();
    const viewType = content?.viewType ?? LibraryTab.Movies;
    const isRankedView = viewType === LibraryTab.Trending || viewType === LibraryTab.TopRated;
    // Snapshot movie sources (IMDb, Letterboxd, RT) don't apply to shows; Netflix and TMDb do.
    const isShows = collectionType === CollectionType.Tvshows;
    const browseSources = getEnabledSources(viewType, isShows);
    const libraryViewSettings = viewSettings ?? getDefaultLibraryViewSettings(viewType);
    const setLibraryViewSettings = useMemo(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        () => setViewSettings ?? ((action: SetStateAction<LibraryViewSettings>) => { /* no-op */ }),
        [setViewSettings]
    );
    const { isAlphabetPickerEnabled, noItemsMessage } = content ?? {};
    // Check if the alphabet picker will fit in the current viewport
    const isAlphabetPickerSupported = useMediaQuery(t => [
        // Extra small screens have no padding around letters but larger AppBar
        `${t.breakpoints.down('sm')} and (min-height: 575px)`,
        // Small screens have padding around letters but smaller AppBar
        // NOTE: Helper methods down/up add "@media" to the query string so use the value directly
        `(min-width: ${t.breakpoints.values.sm}px) and (min-height: 610px)`
    ].join(', '));

    const { __legacyApiClient__, user } = useApi();

    // Per-user client toggle for missing titles; hiding them never changes the server default.
    const [showMissing, setShowMissing] = useLocalStorage<boolean>(
        `browseShowMissing-${user?.Id ?? 'default'}`,
        true
    );

    // The ranked discover response carries external "missing" stubs alongside in-library items.
    const discover = isRankedView ? (itemsResult?.data as DiscoverRankedResult | undefined) : undefined;
    const visibleMissing = isRankedView && showMissing ? (discover?.Missing ?? []) : [];
    const hasItems = Boolean(itemsResult?.data?.Items?.length);

    // The query key for all items for the current user.
    // This should be used to invalidate queries that affect multiple parents, such as collections and playlists.
    const allItemsQueryKey = useMemo(() => ['User', user?.Id, 'Items'], [user?.Id]);
    // The query key for all views for the current parent item.
    const allViewsQueryKey = useMemo(() => [...allItemsQueryKey, parentId, 'ViewByType'], [allItemsQueryKey, parentId]);

    const getListOptions = useCallback(() => {
        const listOptions: ListOptions = {
            items: itemsResult?.data?.Items ?? [],
            context: collectionType
        };

        if (viewType === LibraryTab.Songs) {
            listOptions.showParentTitle = true;
            listOptions.action = ItemAction.PlayAllFromHere;
            listOptions.smallIcon = true;
            listOptions.showArtist = true;
            listOptions.addToListButton = true;
        } else if (viewType === LibraryTab.Albums) {
            listOptions.sortBy = libraryViewSettings.SortBy[0];
            listOptions.addToListButton = true;
        } else if (viewType === LibraryTab.Episodes) {
            listOptions.showParentTitle = true;
        }

        return listOptions;
    }, [itemsResult?.data?.Items, collectionType, viewType, libraryViewSettings.SortBy]);

    const getCardOptions = useCallback(() => {
        let shape;
        let preferThumb;
        let preferDisc;
        let preferLogo;

        if (libraryViewSettings.ImageType === ImageType.Banner) {
            shape = CardShape.Banner;
        } else if (libraryViewSettings.ImageType === ImageType.Disc) {
            shape = CardShape.Square;
            preferDisc = true;
        } else if (libraryViewSettings.ImageType === ImageType.Logo) {
            shape = CardShape.Backdrop;
            preferLogo = true;
        } else if (libraryViewSettings.ImageType === ImageType.Thumb) {
            shape = CardShape.Backdrop;
            preferThumb = true;
        } else {
            shape = CardShape.Auto;
        }

        const cardOptions: CardOptions = {
            shape,
            showTitle: libraryViewSettings.ShowTitle,
            showYear: libraryViewSettings.ShowYear,
            cardLayout: libraryViewSettings.CardLayout,
            centerText: true,
            context: collectionType,
            coverImage: true,
            preferThumb,
            preferDisc,
            preferLogo,
            overlayText: !libraryViewSettings.ShowTitle,
            imageType: libraryViewSettings.ImageType,
            queryKey: allViewsQueryKey,
            serverId: __legacyApiClient__?.serverId()
        };

        if (
            viewType === LibraryTab.Songs
            || viewType === LibraryTab.Albums
            || viewType === LibraryTab.Episodes
        ) {
            cardOptions.showParentTitle = libraryViewSettings.ShowTitle;
            cardOptions.overlayPlayButton = true;
        } else if (viewType === LibraryTab.Artists || viewType === LibraryTab.Authors) {
            cardOptions.lines = 1;
            cardOptions.showYear = false;
            cardOptions.overlayPlayButton = true;
        } else if (viewType === LibraryTab.Channels) {
            cardOptions.shape = CardShape.Square;
            cardOptions.showDetailsMenu = true;
            cardOptions.showCurrentProgram = true;
            cardOptions.showCurrentProgramTime = true;
        } else if (viewType === LibraryTab.SeriesTimers) {
            cardOptions.shape = CardShape.Backdrop;
            cardOptions.showSeriesTimerTime = true;
            cardOptions.showSeriesTimerChannel = true;
            cardOptions.overlayMoreButton = true;
            cardOptions.lines = 3;
        } else if (viewType === LibraryTab.Trending || viewType === LibraryTab.TopRated) {
            cardOptions.overlayPlayButton = true;
            cardOptions.showRank = true;
        } else if (viewType === LibraryTab.Movies) {
            cardOptions.overlayPlayButton = true;
        } else if (viewType === LibraryTab.Series || viewType === LibraryTab.Studios) {
            cardOptions.overlayMoreButton = true;
        }

        return cardOptions;
    }, [
        __legacyApiClient__,
        libraryViewSettings.ShowTitle,
        libraryViewSettings.ImageType,
        libraryViewSettings.ShowYear,
        libraryViewSettings.CardLayout,
        collectionType,
        allViewsQueryKey,
        viewType
    ]);

    const getItems = useCallback(() => {
        if (!hasItems && visibleMissing.length === 0) {
            return <NoItemsMessage message={noItemsMessage ?? 'MessageNoItemsAvailable'} />;
        }

        if (libraryViewSettings.ViewMode === ViewMode.ListView) {
            return (
                <>
                    <Lists
                        items={itemsResult?.data?.Items ?? []}
                        listOptions={getListOptions()}
                    />
                    {visibleMissing.map(title => (
                        <ComingSoonCard
                            key={`${title.Source ?? 'missing'}-${title.Rank ?? title.Title}`}
                            title={title}
                        />
                    ))}
                </>
            );
        }

        if (isRankedView) {
            const items = itemsResult?.data?.Items ?? [];
            const cardOptions = getCardOptions();
            setCardData(items, cardOptions);

            const entries = [
                ...items.map(item => ({
                    rank: item.IndexNumber ?? Number.MAX_SAFE_INTEGER,
                    node: <Card key={item.Id} item={item} cardOptions={cardOptions} />
                })),
                ...visibleMissing.map(title => ({
                    rank: title.Rank ?? Number.MAX_SAFE_INTEGER,
                    node: (
                        <ComingSoonCard
                            key={`${title.Source ?? 'missing'}-${title.Rank ?? title.Title}`}
                            title={title}
                        />
                    )
                }))
            ];

            entries.sort((a, b) => a.rank - b.rank);

            return entries.map(entry => entry.node);
        }

        return (
            <Cards
                items={itemsResult?.data?.Items ?? []}
                cardOptions={getCardOptions()}
            />
        );
    }, [
        hasItems,
        visibleMissing,
        libraryViewSettings.ViewMode,
        itemsResult?.data?.Items,
        getListOptions,
        getCardOptions,
        noItemsMessage,
        isRankedView
    ]);

    const handleAlphabetChange = useCallback((newValue: string | null | undefined) => {
        setLibraryViewSettings((prevState) => ({
            ...prevState,
            StartIndex: 0,
            Alphabet: newValue
        }));
    }, [setLibraryViewSettings]);

    const hasSortName = !libraryViewSettings.SortBy.includes(ItemSortBy.Random);

    const itemsContainerClass = classNames(
        'padded-left padded-right',
        libraryViewSettings.ViewMode === ViewMode.ListView ?
            'vertical-list' :
            'vertical-wrap'
    );

    return (
        <Box className='padded-bottom-page'>
            {isAlphabetPickerSupported && isAlphabetPickerEnabled && hasSortName && (
                <AlphabetPicker
                    value={libraryViewSettings.Alphabet}
                    onChange={handleAlphabetChange}
                />
            )}

            {isRankedView && setSource && (
                <Box
                    sx={{
                        marginBottom: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1
                    }}
                >
                    <BrowseSourceBar
                        sources={browseSources}
                        activeSource={source ?? DEFAULT_BROWSE_SOURCE}
                        onChange={setSource}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showMissing}
                                onChange={(_event, checked) => setShowMissing(checked)}
                            />
                        }
                        label={globalize.translate('ShowMissingTitles')}
                    />
                </Box>
            )}

            {(!itemsResult || itemsResult.isPending) ? (
                <Loading />
            ) : (
                <ItemsContainer
                    className={itemsContainerClass}
                    parentId={parentId}
                    reloadItems={itemsResult?.refetch}
                    queryKey={allItemsQueryKey}
                >
                    {getItems()}
                </ItemsContainer>
            )}
        </Box>
    );
};

export default ItemsView;
