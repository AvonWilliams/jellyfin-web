import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import { ItemFilter } from '@jellyfin/sdk/lib/generated-client/models/item-filter';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { PersonKind } from '@jellyfin/sdk/lib/generated-client/models/person-kind';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';

import { BrowseMode, type BrowseModeDefinition } from 'types/browseMode';
import { LibraryTab } from 'types/libraryTab';

import { BROWSE_ICONS } from './browseIcons';
import { MOOD_TAGS, PLOT_ELEMENT_TAGS, STORY_THEME_TAGS, STYLE_TAGS, WORLD_TAGS } from './browseTags';

const monthsAgo = (n: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - n);
    return d.toISOString();
};

const allMode: BrowseModeDefinition = {
    mode: BrowseMode.All,
    label: 'BrowseModeAll',
    iconSrc: BROWSE_ICONS.all,
    tier: 'primary'
};

const genresMode: BrowseModeDefinition = {
    mode: BrowseMode.Genres,
    label: 'Genres',
    iconSrc: BROWSE_ICONS.genres,
    tier: 'meta',
    picker: { filter: 'Genres' }
};

const justAddedMode: BrowseModeDefinition = {
    mode: BrowseMode.JustAdded,
    label: 'BrowseModeJustAdded',
    iconSrc: BROWSE_ICONS['just-added'],
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
    iconSrc: BROWSE_ICONS['new-releases'],
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
    iconSrc: BROWSE_ICONS.random,
    tier: 'primary',
    settings: {
        SortBy: [ItemSortBy.Random],
        SortOrder: SortOrder.Ascending
    }
};

const decadesMode: BrowseModeDefinition = {
    mode: BrowseMode.Decades,
    label: 'BrowseModeDecades',
    iconSrc: BROWSE_ICONS.decades,
    tier: 'meta',
    picker: { filter: 'Years' }
};

const yearMode: BrowseModeDefinition = {
    mode: BrowseMode.Year,
    label: 'BrowseModeYear',
    iconSrc: BROWSE_ICONS.year,
    tier: 'meta',
    picker: { filter: 'Years', individualYears: true }
};

const trendingMode: BrowseModeDefinition = {
    mode: BrowseMode.Trending,
    label: 'BrowseModeTrending',
    iconSrc: BROWSE_ICONS.trending,
    tier: 'primary',
    view: LibraryTab.Trending,
    source: 'tmdb'
};

const studiosMode: BrowseModeDefinition = {
    mode: BrowseMode.Studios,
    label: 'Studios',
    iconSrc: BROWSE_ICONS.studios,
    tier: 'meta',
    picker: { filter: 'Studios' }
};

const networksMode: BrowseModeDefinition = {
    ...studiosMode,
    label: 'TabNetworks',
    iconSrc: BROWSE_ICONS.networks
};

const criticsPicksMode: BrowseModeDefinition = {
    mode: BrowseMode.CriticsPicks,
    label: 'BrowseModeCriticsPicks',
    iconSrc: BROWSE_ICONS['critics-picks'],
    tier: 'meta',
    settings: {
        SortBy: [ItemSortBy.CriticRating],
        SortOrder: SortOrder.Descending
    }
};

const watchAgainMode: BrowseModeDefinition = {
    mode: BrowseMode.WatchAgain,
    label: 'BrowseModeWatchAgain',
    iconSrc: BROWSE_ICONS['watch-again'],
    tier: 'meta',
    settings: {
        SortBy: [ItemSortBy.DatePlayed],
        SortOrder: SortOrder.Descending
    }
};

const ageRatingMode: BrowseModeDefinition = {
    mode: BrowseMode.AgeRating,
    label: 'BrowseModeAgeRating',
    iconSrc: BROWSE_ICONS['age-rating'],
    tier: 'meta',
    picker: { filter: 'OfficialRatings' }
};

const topRatedMode: BrowseModeDefinition = {
    mode: BrowseMode.TopRated,
    label: 'BrowseModeTopRated',
    iconSrc: BROWSE_ICONS['top-rated'],
    tier: 'primary',
    view: LibraryTab.TopRated,
    source: 'tmdb'
};

const moodMode: BrowseModeDefinition = {
    mode: BrowseMode.Mood,
    label: 'BrowseModeMood',
    iconSrc: BROWSE_ICONS.mood,
    tier: 'meta',
    picker: { filter: 'Tags', tagList: MOOD_TAGS }
};

const storyThemesMode: BrowseModeDefinition = {
    mode: BrowseMode.StoryThemes,
    label: 'BrowseModeStoryThemes',
    iconSrc: BROWSE_ICONS['story-themes'],
    tier: 'meta',
    picker: { filter: 'Tags', tagList: STORY_THEME_TAGS }
};

const plotElementsMode: BrowseModeDefinition = {
    mode: BrowseMode.PlotElements,
    label: 'BrowseModePlotElements',
    iconSrc: BROWSE_ICONS['plot-elements'],
    tier: 'meta',
    picker: { filter: 'Tags', tagList: PLOT_ELEMENT_TAGS }
};

const worldsMode: BrowseModeDefinition = {
    mode: BrowseMode.Worlds,
    label: 'BrowseModeWorlds',
    iconSrc: BROWSE_ICONS.worlds,
    tier: 'meta',
    picker: { filter: 'Tags', tagList: WORLD_TAGS }
};

const stylesMode: BrowseModeDefinition = {
    mode: BrowseMode.Styles,
    label: 'BrowseModeStyles',
    iconSrc: BROWSE_ICONS.styles,
    tier: 'meta',
    picker: { filter: 'Tags', tagList: STYLE_TAGS }
};

// The best thing you own but have not got to yet.
const hiddenGemsMode: BrowseModeDefinition = {
    mode: BrowseMode.HiddenGems,
    label: 'BrowseModeHiddenGems',
    iconSrc: BROWSE_ICONS['hidden-gems'],
    tier: 'meta',
    settings: {
        Filters: { Status: [ItemFilter.IsUnplayed] },
        SortBy: [ItemSortBy.CommunityRating],
        SortOrder: SortOrder.Descending
    }
};

// Meta entry points ("Browse by…" tiles). Each opens the existing underlying mode(s) listed in
// `children`; the underlying modes' enum values and definitions stay intact for deep links and
// settings keys.

export const byCategoriesMode: BrowseModeDefinition = {
    mode: BrowseMode.ByCategories,
    label: 'Categories',
    iconSrc: BROWSE_ICONS.categories,
    tier: 'meta',
    children: [BrowseMode.Genres, BrowseMode.Studios, BrowseMode.Decades, BrowseMode.Year, BrowseMode.AgeRating],
    inline: true
};

export const byVibeMode: BrowseModeDefinition = {
    mode: BrowseMode.ByVibe,
    label: 'Mood & Themes',
    iconSrc: BROWSE_ICONS['mood-and-themes'],
    tier: 'meta',
    children: [BrowseMode.Mood, BrowseMode.StoryThemes, BrowseMode.PlotElements, BrowseMode.Worlds, BrowseMode.Styles],
    inline: true
};

export const byPeopleMode: BrowseModeDefinition = {
    mode: BrowseMode.ByPeople,
    label: 'People',
    iconSrc: BROWSE_ICONS.people,
    tier: 'meta',
    children: [BrowseMode.Actors, BrowseMode.Directors, BrowseMode.Writers],
    inline: true,
    compact: true
};

// People leaves, offered through the People meta tile. Each lists the library's persons of that
// kind (via the /Persons endpoint) and links to the person's detail page.
const actorsMode: BrowseModeDefinition = {
    mode: BrowseMode.Actors,
    label: 'BrowseModeActors',
    iconSrc: BROWSE_ICONS.actors,
    tier: 'meta',
    personType: PersonKind.Actor
};

const directorsMode: BrowseModeDefinition = {
    mode: BrowseMode.Directors,
    label: 'BrowseModeDirectors',
    iconSrc: BROWSE_ICONS.directors,
    tier: 'meta',
    personType: PersonKind.Director
};

const writersMode: BrowseModeDefinition = {
    mode: BrowseMode.Writers,
    label: 'BrowseModeWriters',
    iconSrc: BROWSE_ICONS.writers,
    tier: 'meta',
    personType: PersonKind.Writer
};

export const byQualityMode: BrowseModeDefinition = {
    mode: BrowseMode.ByQuality,
    label: 'Discover',
    iconSrc: BROWSE_ICONS.discover,
    tier: 'meta',
    children: [BrowseMode.CriticsPicks, BrowseMode.HiddenGems, BrowseMode.WatchAgain],
    inline: true,
    compact: true
};

// TV libraries have no Critics' Picks (series rarely carry critic ratings), so the Quality
// secondary drops that child.
const byQualityTvMode: BrowseModeDefinition = {
    ...byQualityMode,
    children: [BrowseMode.HiddenGems, BrowseMode.WatchAgain]
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
    byCategoriesMode,
    byVibeMode,
    byPeopleMode,
    byQualityMode
];

const tvBrowseModes: BrowseModeDefinition[] = [
    allMode,
    trendingMode,
    topRatedMode,
    newReleasesMode,
    justAddedMode,
    randomMode,
    byCategoriesMode,
    byVibeMode,
    byPeopleMode,
    byQualityTvMode
];

/**
 * Modes still reachable through a meta tile (or a `browseMode` deep link) but no longer shown as
 * top-level tiles. Split per collection type so Studios resolves to Networks for TV libraries.
 */
const movieUnderlyingModes: BrowseModeDefinition[] = [
    genresMode,
    studiosMode,
    decadesMode,
    yearMode,
    moodMode,
    storyThemesMode,
    plotElementsMode,
    worldsMode,
    stylesMode,
    hiddenGemsMode,
    ageRatingMode,
    watchAgainMode,
    actorsMode,
    directorsMode,
    writersMode
];

const tvUnderlyingModes: BrowseModeDefinition[] = [
    genresMode,
    networksMode,
    decadesMode,
    yearMode,
    moodMode,
    storyThemesMode,
    plotElementsMode,
    worldsMode,
    stylesMode,
    hiddenGemsMode,
    ageRatingMode,
    watchAgainMode,
    actorsMode,
    directorsMode,
    writersMode
];

/** Every mode a collection type can resolve, including the underlying modes reached under meta tiles. */
const modeRegistryByCollectionType: Partial<Record<CollectionType, BrowseModeDefinition[]>> = {
    [CollectionType.Movies]: [...movieBrowseModes, ...movieUnderlyingModes, criticsPicksMode],
    [CollectionType.Tvshows]: [...tvBrowseModes, ...tvUnderlyingModes]
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
