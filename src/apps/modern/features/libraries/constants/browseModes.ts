import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import { ItemFilter } from '@jellyfin/sdk/lib/generated-client/models/item-filter';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { PersonKind } from '@jellyfin/sdk/lib/generated-client/models/person-kind';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import Apps from '@mui/icons-material/Apps';
import Business from '@mui/icons-material/Business';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import Category from '@mui/icons-material/Category';
import Edit from '@mui/icons-material/Edit';
import FiberNew from '@mui/icons-material/FiberNew';
import FamilyRestroom from '@mui/icons-material/FamilyRestroom';
import Group from '@mui/icons-material/Group';
import History from '@mui/icons-material/History';
import Movie from '@mui/icons-material/Movie';
import NewReleases from '@mui/icons-material/NewReleases';
import Person from '@mui/icons-material/Person';
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
    iconColor: '#B0BEC5',
    tier: 'primary'
};

const genresMode: BrowseModeDefinition = {
    mode: BrowseMode.Genres,
    label: 'Genres',
    Icon: Category,
    iconColor: '#C07CD6',
    tier: 'meta',
    picker: { filter: 'Genres' }
};

const justAddedMode: BrowseModeDefinition = {
    mode: BrowseMode.JustAdded,
    label: 'BrowseModeJustAdded',
    Icon: FiberNew,
    iconColor: '#4DD0C4',
    tier: 'primary',
    settings: {
        SortBy: [ItemSortBy.DateCreated],
        SortOrder: SortOrder.Descending,
        MinDateLastSaved: monthsAgo(9)
    }
};

const newReleasesMode: BrowseModeDefinition = {
    mode: BrowseMode.NewReleases,
    label: 'BrowseModeNewReleases',
    Icon: NewReleases,
    iconColor: '#6FB3E0',
    tier: 'primary',
    settings: {
        SortBy: [ItemSortBy.PremiereDate],
        SortOrder: SortOrder.Descending,
        MinPremiereDate: monthsAgo(9)
    }
};

const randomMode: BrowseModeDefinition = {
    mode: BrowseMode.Random,
    label: 'OptionRandom',
    Icon: Shuffle,
    iconColor: '#F08A5D',
    tier: 'primary',
    settings: {
        SortBy: [ItemSortBy.Random],
        SortOrder: SortOrder.Ascending
    }
};

const decadesMode: BrowseModeDefinition = {
    mode: BrowseMode.Decades,
    label: 'BrowseModeDecades',
    Icon: CalendarMonth,
    iconColor: '#7E9CD8',
    tier: 'meta',
    picker: { filter: 'Years' }
};

const yearMode: BrowseModeDefinition = {
    mode: BrowseMode.Year,
    label: 'BrowseModeYear',
    Icon: CalendarMonth,
    iconColor: '#7E9CD8',
    tier: 'meta',
    picker: { filter: 'Years', individualYears: true }
};

const trendingMode: BrowseModeDefinition = {
    mode: BrowseMode.Trending,
    label: 'BrowseModeTrending',
    Icon: TrendingUp,
    iconColor: '#5CD672',
    tier: 'primary',
    view: LibraryTab.Trending,
    source: 'tmdb'
};

const studiosMode: BrowseModeDefinition = {
    mode: BrowseMode.Studios,
    label: 'Studios',
    Icon: Business,
    iconColor: '#8D9EC6',
    tier: 'meta',
    picker: { filter: 'Studios' }
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
    tier: 'meta',
    settings: {
        SortBy: [ItemSortBy.CriticRating],
        SortOrder: SortOrder.Descending
    }
};

const watchAgainMode: BrowseModeDefinition = {
    mode: BrowseMode.WatchAgain,
    label: 'BrowseModeWatchAgain',
    Icon: History,
    iconColor: '#86C98B',
    tier: 'meta',
    settings: {
        SortBy: [ItemSortBy.DatePlayed],
        SortOrder: SortOrder.Descending
    }
};

const ageRatingMode: BrowseModeDefinition = {
    mode: BrowseMode.AgeRating,
    label: 'BrowseModeAgeRating',
    Icon: FamilyRestroom,
    iconColor: '#9CCC65',
    tier: 'meta',
    picker: { filter: 'OfficialRatings' }
};

const topRatedMode: BrowseModeDefinition = {
    mode: BrowseMode.TopRated,
    label: 'BrowseModeTopRated',
    Icon: MilitaryTech,
    iconColor: '#EECE55',
    tier: 'primary',
    view: LibraryTab.TopRated,
    source: 'tmdb'
};

const moodMode: BrowseModeDefinition = {
    mode: BrowseMode.Mood,
    label: 'BrowseModeMood',
    Icon: Mood,
    iconColor: '#EC407A',
    tier: 'meta',
    picker: { filter: 'Tags', tagList: MOOD_TAGS }
};

const storyThemesMode: BrowseModeDefinition = {
    mode: BrowseMode.StoryThemes,
    label: 'BrowseModeStoryThemes',
    Icon: AutoStories,
    iconColor: '#FF7043',
    tier: 'meta',
    picker: { filter: 'Tags', tagList: STORY_THEME_TAGS }
};

const plotElementsMode: BrowseModeDefinition = {
    mode: BrowseMode.PlotElements,
    label: 'BrowseModePlotElements',
    Icon: Timeline,
    iconColor: '#26A69A',
    tier: 'meta',
    picker: { filter: 'Tags', tagList: PLOT_ELEMENT_TAGS }
};

const worldsMode: BrowseModeDefinition = {
    mode: BrowseMode.Worlds,
    label: 'BrowseModeWorlds',
    Icon: Public,
    iconColor: '#5C6BC0',
    tier: 'meta',
    picker: { filter: 'Tags', tagList: WORLD_TAGS }
};

const stylesMode: BrowseModeDefinition = {
    mode: BrowseMode.Styles,
    label: 'BrowseModeStyles',
    Icon: Palette,
    iconColor: '#7E57C2',
    tier: 'meta',
    picker: { filter: 'Tags', tagList: STYLE_TAGS }
};

// The best thing you own but have not got to yet.
const hiddenGemsMode: BrowseModeDefinition = {
    mode: BrowseMode.HiddenGems,
    label: 'BrowseModeHiddenGems',
    Icon: Recommend,
    iconColor: '#F2C14E',
    tier: 'meta',
    settings: {
        Filters: { Status: [ItemFilter.IsUnplayed] },
        SortBy: [ItemSortBy.CommunityRating],
        SortOrder: SortOrder.Descending
    }
};

// Meta entry points ("Browse by…" tiles). Each opens the existing underlying mode(s) listed in
// `children`; the underlying modes' enum values and definitions stay intact for deep links and
// settings keys. Icon colours reuse the existing palette.

export const byMoodToneMode: BrowseModeDefinition = {
    mode: BrowseMode.ByMoodTone,
    label: 'BrowseModeMoodTone',
    Icon: Mood,
    iconColor: '#EC407A',
    tier: 'meta',
    children: [BrowseMode.Mood]
};

export const byStoryMode: BrowseModeDefinition = {
    mode: BrowseMode.ByStory,
    label: 'BrowseModeStory',
    Icon: AutoStories,
    iconColor: '#FF7043',
    tier: 'meta',
    children: [BrowseMode.StoryThemes, BrowseMode.PlotElements]
};

export const byWorldStyleMode: BrowseModeDefinition = {
    mode: BrowseMode.ByWorldStyle,
    label: 'BrowseModeWorldStyle',
    Icon: Public,
    iconColor: '#5C6BC0',
    tier: 'meta',
    children: [BrowseMode.Worlds, BrowseMode.Styles]
};

export const byPeopleMode: BrowseModeDefinition = {
    mode: BrowseMode.ByPeople,
    label: 'BrowseModePeople',
    Icon: Group,
    iconColor: '#9CCC65',
    tier: 'meta',
    children: [BrowseMode.Actors, BrowseMode.Directors, BrowseMode.Writers],
    inline: true
};

// People leaves, offered through the People meta tile. Each lists the library's persons of that
// kind (via the /Persons endpoint) and links to the person's detail page.
const actorsMode: BrowseModeDefinition = {
    mode: BrowseMode.Actors,
    label: 'BrowseModeActors',
    Icon: Person,
    iconColor: '#9CCC65',
    tier: 'meta',
    personType: PersonKind.Actor
};

const directorsMode: BrowseModeDefinition = {
    mode: BrowseMode.Directors,
    label: 'BrowseModeDirectors',
    Icon: Movie,
    iconColor: '#4DD0C4',
    tier: 'meta',
    personType: PersonKind.Director
};

const writersMode: BrowseModeDefinition = {
    mode: BrowseMode.Writers,
    label: 'BrowseModeWriters',
    Icon: Edit,
    iconColor: '#F2C14E',
    tier: 'meta',
    personType: PersonKind.Writer
};

export const byTimeMode: BrowseModeDefinition = {
    mode: BrowseMode.ByTime,
    label: 'BrowseModeTime',
    Icon: CalendarMonth,
    iconColor: '#7E9CD8',
    tier: 'meta',
    children: [BrowseMode.Decades, BrowseMode.Year],
    inline: true
};

export const byQualityMode: BrowseModeDefinition = {
    mode: BrowseMode.ByQuality,
    label: 'BrowseModeQuality',
    Icon: Reviews,
    iconColor: '#E0533D',
    tier: 'meta',
    children: [BrowseMode.CriticsPicks, BrowseMode.HiddenGems, BrowseMode.AgeRating, BrowseMode.WatchAgain],
    inline: true
};

// TV libraries have no Critics' Picks (series rarely carry critic ratings), so the Quality
// secondary drops that child.
const byQualityTvMode: BrowseModeDefinition = {
    ...byQualityMode,
    children: [BrowseMode.HiddenGems, BrowseMode.AgeRating, BrowseMode.WatchAgain]
};

// The home grid, in display order: six primary quick-access tiles first, then the "Browse by…"
// meta tiles. Underlying modes (Mood, Story Themes, etc.) are reached through their meta tile,
// not shown here.
const movieBrowseModes: BrowseModeDefinition[] = [
    allMode,
    trendingMode,
    topRatedMode,
    newReleasesMode,
    justAddedMode,
    randomMode,
    genresMode,
    byMoodToneMode,
    byStoryMode,
    byWorldStyleMode,
    byPeopleMode,
    byTimeMode,
    byQualityMode,
    studiosMode
];

const tvBrowseModes: BrowseModeDefinition[] = [
    allMode,
    trendingMode,
    topRatedMode,
    newReleasesMode,
    justAddedMode,
    randomMode,
    genresMode,
    byMoodToneMode,
    byStoryMode,
    byWorldStyleMode,
    byPeopleMode,
    byTimeMode,
    byQualityTvMode,
    networksMode
];

/**
 * Modes still reachable through a meta tile (or a `browseMode` deep link) but no longer shown as
 * top-level tiles. Shared by movies and TV; Critics' Picks is movie-only because series rarely
 * carry critic ratings.
 */
const underlyingModes: BrowseModeDefinition[] = [
    moodMode,
    storyThemesMode,
    plotElementsMode,
    worldsMode,
    stylesMode,
    decadesMode,
    yearMode,
    hiddenGemsMode,
    ageRatingMode,
    watchAgainMode,
    actorsMode,
    directorsMode,
    writersMode
];

/** Every mode a collection type can resolve, including the underlying modes reached under meta tiles. */
const modeRegistryByCollectionType: Partial<Record<CollectionType, BrowseModeDefinition[]>> = {
    [CollectionType.Movies]: [...movieBrowseModes, ...underlyingModes, criticsPicksMode],
    [CollectionType.Tvshows]: [...tvBrowseModes, ...underlyingModes]
};

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

export const getBrowseMode = (collectionType: CollectionType | null | undefined, mode: string | null) => {
    if (!mode || !collectionType) {
        return undefined;
    }

    return modeRegistryByCollectionType[collectionType]?.find(definition => definition.mode === mode);
};

/**
 * Reorders and filters the default modes to match a server-provided tile layout. Keys absent
 * from the layout are hidden; keys the layout mentions that this collection type does not offer
 * are skipped. An empty layout leaves the built-in order and visibility untouched.
 */
export const applyBrowseModeOrder = (
    modes: BrowseModeDefinition[],
    order?: string[] | null
): BrowseModeDefinition[] => {
    if (!order?.length) {
        return modes;
    }

    const byKey = new Map(modes.map(definition => [definition.mode, definition]));
    return order
        .map(key => byKey.get(key as BrowseMode))
        .filter((definition): definition is BrowseModeDefinition => Boolean(definition));
};
