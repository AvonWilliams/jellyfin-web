import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import { ItemFilter } from '@jellyfin/sdk/lib/generated-client/models/item-filter';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import AccessTime from '@mui/icons-material/AccessTime';
import Apps from '@mui/icons-material/Apps';
import Business from '@mui/icons-material/Business';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import Category from '@mui/icons-material/Category';
import FiberNew from '@mui/icons-material/FiberNew';
import Favorite from '@mui/icons-material/Favorite';
import FamilyRestroom from '@mui/icons-material/FamilyRestroom';
import History from '@mui/icons-material/History';
import NewReleases from '@mui/icons-material/NewReleases';
import Shuffle from '@mui/icons-material/Shuffle';
import MilitaryTech from '@mui/icons-material/MilitaryTech';
import Star from '@mui/icons-material/Star';
import Reviews from '@mui/icons-material/Reviews';
import Recommend from '@mui/icons-material/Recommend';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import TrendingUp from '@mui/icons-material/TrendingUp';

import { BrowseMode, type BrowseModeDefinition } from 'types/browseMode';
import { LibraryTab } from 'types/libraryTab';

const allMode: BrowseModeDefinition = {
    mode: BrowseMode.All,
    label: 'BrowseModeAll',
    Icon: Apps,
    iconColor: '#B0BEC5'
};

const genresMode: BrowseModeDefinition = {
    mode: BrowseMode.Genres,
    label: 'Genres',
    Icon: Category,
    iconColor: '#C07CD6',
    view: LibraryTab.Genres
};

const justAddedMode: BrowseModeDefinition = {
    mode: BrowseMode.JustAdded,
    label: 'BrowseModeJustAdded',
    Icon: FiberNew,
    iconColor: '#4DD0C4',
    settings: {
        SortBy: ItemSortBy.DateCreated,
        SortOrder: SortOrder.Descending
    }
};

const monthsAgo = (n: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - n);
    return d.toISOString();
};

const newReleasesMode: BrowseModeDefinition = {
    mode: BrowseMode.NewReleases,
    label: 'BrowseModeNewReleases',
    Icon: NewReleases,
    iconColor: '#6FB3E0',
    settings: {
        SortBy: ItemSortBy.PremiereDate,
        SortOrder: SortOrder.Descending,
        MinPremiereDate: monthsAgo(9)
    }
};

const randomMode: BrowseModeDefinition = {
    mode: BrowseMode.Random,
    label: 'OptionRandom',
    Icon: Shuffle,
    iconColor: '#F08A5D',
    settings: {
        SortBy: ItemSortBy.Random,
        SortOrder: SortOrder.Ascending
    }
};

const highestRatedMode: BrowseModeDefinition = {
    mode: BrowseMode.HighestRated,
    label: 'BrowseModeHighestRated',
    Icon: Star,
    iconColor: '#EECE55',
    settings: {
        SortBy: ItemSortBy.CommunityRating,
        SortOrder: SortOrder.Descending
    }
};

const decadesMode: BrowseModeDefinition = {
    mode: BrowseMode.Decades,
    label: 'BrowseModeDecades',
    Icon: CalendarMonth,
    iconColor: '#7E9CD8',
    picker: { filter: 'Years' }
};

const trendingMode: BrowseModeDefinition = {
    mode: BrowseMode.Trending,
    label: 'BrowseModeTrending',
    Icon: TrendingUp,
    iconColor: '#5CD672',
    view: LibraryTab.Trending
};

const studiosMode: BrowseModeDefinition = {
    mode: BrowseMode.Studios,
    label: 'Studios',
    Icon: Business,
    iconColor: '#8D9EC6',
    view: LibraryTab.Studios
};

const networksMode: BrowseModeDefinition = {
    ...studiosMode,
    label: 'TabNetworks',
    iconColor: '#5AC8E0'
};

const unwatchedMode: BrowseModeDefinition = {
    mode: BrowseMode.Unwatched,
    label: 'BrowseModeUnwatched',
    Icon: VisibilityOff,
    iconColor: '#A98BD6',
    settings: {
        Filters: { Status: [ItemFilter.IsUnplayed] }
    }
};

const favoritesMode: BrowseModeDefinition = {
    mode: BrowseMode.Favorites,
    label: 'Favorites',
    Icon: Favorite,
    iconColor: '#E5687A',
    view: LibraryTab.Favorites
};

const criticsPicksMode: BrowseModeDefinition = {
    mode: BrowseMode.CriticsPicks,
    label: 'BrowseModeCriticsPicks',
    Icon: Reviews,
    iconColor: '#E0533D',
    settings: {
        SortBy: ItemSortBy.CriticRating,
        SortOrder: SortOrder.Descending
    }
};

const recentlyPlayedMode: BrowseModeDefinition = {
    mode: BrowseMode.RecentlyPlayed,
    label: 'BrowseModeRecentlyPlayed',
    Icon: History,
    iconColor: '#86C98B',
    settings: {
        Filters: { Status: [ItemFilter.IsPlayed] },
        SortBy: ItemSortBy.DatePlayed,
        SortOrder: SortOrder.Descending
    }
};

const longestMode: BrowseModeDefinition = {
    mode: BrowseMode.Longest,
    label: 'BrowseModeLongest',
    Icon: AccessTime,
    iconColor: '#B5895E',
    settings: {
        SortBy: ItemSortBy.Runtime,
        SortOrder: SortOrder.Descending
    }
};

const ageRatingMode: BrowseModeDefinition = {
    mode: BrowseMode.AgeRating,
    label: 'BrowseModeAgeRating',
    Icon: FamilyRestroom,
    iconColor: '#9CCC65',
    picker: { filter: 'OfficialRatings' }
};

const topRatedMode: BrowseModeDefinition = {
    mode: BrowseMode.TopRated,
    label: 'BrowseModeTopRated',
    Icon: MilitaryTech,
    iconColor: '#EECE55',
    view: LibraryTab.TopRated
};

const bestUnseenMode: BrowseModeDefinition = {
    mode: BrowseMode.BestUnseen,
    label: 'BrowseModeBestUnseen',
    Icon: Recommend,
    iconColor: '#F2C14E',
    settings: {
        Filters: { Status: [ItemFilter.IsUnplayed] },
        SortBy: ItemSortBy.CommunityRating,
        SortOrder: SortOrder.Descending
    }
};

const movieBrowseModes: BrowseModeDefinition[] = [
    allMode,
    unwatchedMode,
    justAddedMode,
    bestUnseenMode,
    randomMode,
    favoritesMode,
    genresMode,
    highestRatedMode,
    topRatedMode,
    trendingMode,
    newReleasesMode,
    decadesMode,
    studiosMode,
    recentlyPlayedMode,
    ageRatingMode,
    criticsPicksMode,
    longestMode
];

const tvBrowseModes: BrowseModeDefinition[] = [
    allMode,
    unwatchedMode,
    justAddedMode,
    bestUnseenMode,
    randomMode,
    favoritesMode,
    genresMode,
    highestRatedMode,
    topRatedMode,
    trendingMode,
    newReleasesMode,
    decadesMode,
    networksMode,
    recentlyPlayedMode,
    ageRatingMode,
    longestMode
];

export const BrowseModesByCollectionType: Partial<Record<CollectionType, BrowseModeDefinition[]>> = {
    [CollectionType.Movies]: movieBrowseModes,
    [CollectionType.Tvshows]: tvBrowseModes
};

export const getBrowseModes = (collectionType?: CollectionType | null) => (
    collectionType ? BrowseModesByCollectionType[collectionType] : undefined
);

export const getBrowseMode = (collectionType: CollectionType | null | undefined, mode: string | null) => (
    mode ? getBrowseModes(collectionType)?.find(definition => definition.mode === mode) : undefined
);
