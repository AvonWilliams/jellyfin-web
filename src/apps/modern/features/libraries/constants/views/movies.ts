import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';

import { LibraryTab } from 'types/libraryTab';
import type { LibraryTabContent } from 'types/libraryTabContent';
import { SectionType } from 'types/sections';

const moviesTabContent: LibraryTabContent = {
    viewType: LibraryTab.Movies,
    collectionType: CollectionType.Movies,
    isBtnPlayAllEnabled: true,
    isBtnShuffleEnabled: true,
    itemType: [BaseItemKind.Movie]
};

const collectionsTabContent: LibraryTabContent = {
    viewType: LibraryTab.Collections,
    collectionType: CollectionType.Movies,
    isBtnNewCollectionEnabled: true,
    itemType: [BaseItemKind.BoxSet],
    noItemsMessage: 'MessageNoCollectionsAvailable'
};

const favoritesTabContent: LibraryTabContent = {
    viewType: LibraryTab.Favorites,
    collectionType: CollectionType.Movies,
    itemType: [BaseItemKind.Movie]
};

const suggestionsTabContent: LibraryTabContent = {
    viewType: LibraryTab.Suggestions,
    collectionType: CollectionType.Movies,
    sectionsView: {
        suggestionSections: [
            SectionType.ContinueWatchingMovies,
            SectionType.LatestMovies
        ],
        isMovieRecommendations: true
    }
};

const genresTabContent: LibraryTabContent = {
    viewType: LibraryTab.Genres,
    collectionType: CollectionType.Movies,
    itemType: [BaseItemKind.Movie]
};

const playlistsTabContent: LibraryTabContent = {
    viewType: LibraryTab.Playlists,
    isBtnFilterEnabled: false,
    isBtnGridListEnabled: false,
    isBtnNewPlaylistEnabled: true,
    isAlphabetPickerEnabled: false,
    itemType: [BaseItemKind.Playlist]
};

const studiosTabContent: LibraryTabContent = {
    viewType: LibraryTab.Studios,
    itemType: [BaseItemKind.Movie],
    isBtnGridListEnabled: false,
    isBtnSortEnabled: false
};

const topRatedTabContent: LibraryTabContent = {
    viewType: LibraryTab.TopRated,
    collectionType: CollectionType.Movies,
    itemType: [BaseItemKind.Movie],
    // Ordering comes from TMDb, and the result set is whatever the library happens to own.
    isBtnSortEnabled: false,
    isBtnFilterEnabled: false,
    isAlphabetPickerEnabled: false,
    isPaginationEnabled: false,
    noItemsMessage: 'MessageNoTopRatedItems'
};

const trendingTabContent: LibraryTabContent = {
    viewType: LibraryTab.Trending,
    collectionType: CollectionType.Movies,
    itemType: [BaseItemKind.Movie],
    // Ordering comes from TMDb, and the result set is whatever the library happens to own.
    isBtnSortEnabled: false,
    isBtnFilterEnabled: false,
    isAlphabetPickerEnabled: false,
    isPaginationEnabled: false,
    noItemsMessage: 'MessageNoTrendingItems'
};

const moviesViews: Record<number, LibraryTabContent> = {
    0: moviesTabContent,
    1: suggestionsTabContent,
    2: favoritesTabContent,
    3: collectionsTabContent,
    4: genresTabContent,
    5: studiosTabContent,
    6: playlistsTabContent,
    7: trendingTabContent,
    8: topRatedTabContent
};

export default moviesViews;
