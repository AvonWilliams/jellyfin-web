import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import { ItemFilter } from '@jellyfin/sdk/lib/generated-client/models/item-filter';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import Apps from '@mui/icons-material/Apps';
import Business from '@mui/icons-material/Business';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import Category from '@mui/icons-material/Category';
import FiberNew from '@mui/icons-material/FiberNew';
import FamilyRestroom from '@mui/icons-material/FamilyRestroom';
import History from '@mui/icons-material/History';
import NewReleases from '@mui/icons-material/NewReleases';
import Shuffle from '@mui/icons-material/Shuffle';
import MilitaryTech from '@mui/icons-material/MilitaryTech';
import Reviews from '@mui/icons-material/Reviews';
import Recommend from '@mui/icons-material/Recommend';
import AutoStories from '@mui/icons-material/AutoStories';
import Mood from '@mui/icons-material/Mood';
import Palette from '@mui/icons-material/Palette';
import Public from '@mui/icons-material/Public';
import Timeline from '@mui/icons-material/Timeline';
import TrendingUp from '@mui/icons-material/TrendingUp';

import { BrowseMode, type BrowseModeDefinition } from 'types/browseMode';
import { LibraryTab } from 'types/libraryTab';

import { MOOD_TAGS, PLOT_ELEMENT_TAGS, STORY_THEME_TAGS, STYLE_TAGS, WORLD_TAGS } from './browseTags';

const monthsAgo = (n: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - n);
    return d.toISOString();
};

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
        SortOrder: SortOrder.Descending,
        MinDateLastSaved: monthsAgo(9)
    }
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

const watchAgainMode: BrowseModeDefinition = {
    mode: BrowseMode.WatchAgain,
    label: 'BrowseModeWatchAgain',
    Icon: History,
    iconColor: '#86C98B',
    settings: {
        SortBy: ItemSortBy.DatePlayed,
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

const moodMode: BrowseModeDefinition = {
    mode: BrowseMode.Mood,
    label: 'BrowseModeMood',
    Icon: Mood,
    iconColor: '#EC407A',
    picker: { filter: 'Tags', tagList: MOOD_TAGS }
};

const storyThemesMode: BrowseModeDefinition = {
    mode: BrowseMode.StoryThemes,
    label: 'BrowseModeStoryThemes',
    Icon: AutoStories,
    iconColor: '#FF7043',
    picker: { filter: 'Tags', tagList: STORY_THEME_TAGS }
};

const plotElementsMode: BrowseModeDefinition = {
    mode: BrowseMode.PlotElements,
    label: 'BrowseModePlotElements',
    Icon: Timeline,
    iconColor: '#26A69A',
    picker: { filter: 'Tags', tagList: PLOT_ELEMENT_TAGS }
};

const worldsMode: BrowseModeDefinition = {
    mode: BrowseMode.Worlds,
    label: 'BrowseModeWorlds',
    Icon: Public,
    iconColor: '#5C6BC0',
    picker: { filter: 'Tags', tagList: WORLD_TAGS }
};

const stylesMode: BrowseModeDefinition = {
    mode: BrowseMode.Styles,
    label: 'BrowseModeStyles',
    Icon: Palette,
    iconColor: '#7E57C2',
    picker: { filter: 'Tags', tagList: STYLE_TAGS }
};

// The best thing you own but have not got to yet.
const hiddenGemsMode: BrowseModeDefinition = {
    mode: BrowseMode.HiddenGems,
    label: 'BrowseModeHiddenGems',
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
    trendingMode,
    topRatedMode,
    genresMode,
    moodMode,
    storyThemesMode,
    plotElementsMode,
    worldsMode,
    stylesMode,
    hiddenGemsMode,
    justAddedMode,
    newReleasesMode,
    randomMode,
    criticsPicksMode,
    watchAgainMode,
    decadesMode,
    studiosMode,
    ageRatingMode
];

const tvBrowseModes: BrowseModeDefinition[] = [
    allMode,
    trendingMode,
    topRatedMode,
    genresMode,
    moodMode,
    storyThemesMode,
    plotElementsMode,
    worldsMode,
    stylesMode,
    hiddenGemsMode,
    justAddedMode,
    newReleasesMode,
    randomMode,
    watchAgainMode,
    decadesMode,
    networksMode,
    ageRatingMode
];

/**
 * The browse modes offered for each library type. A library type absent from this map keeps
 * the stock behaviour of opening straight into its default view.
 */
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
