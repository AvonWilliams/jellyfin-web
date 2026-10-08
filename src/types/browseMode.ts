import type { SvgIconComponent } from '@mui/icons-material';
import type { PersonKind } from '@jellyfin/sdk/lib/generated-client/models/person-kind';

import type { LibraryViewSettings } from './library';
import type { LibraryTab } from './libraryTab';

/**
 * The ways a library can be browsed, presented as tiles when a library is opened.
 */
export enum BrowseMode {
    All = 'all',
    Genres = 'genres',
    Studios = 'studios',
    JustAdded = 'justadded',
    NewReleases = 'newreleases',
    Random = 'random',
    TopRated = 'toprated',
    HiddenGems = 'bestunseen',
    CriticsPicks = 'criticspicks',
    WatchAgain = 'recentlyplayed',
    Decades = 'decades',
    AgeRating = 'agerating',
    Trending = 'trending',
    Mood = 'mood',
    StoryThemes = 'storythemes',
    PlotElements = 'plotelements',
    Worlds = 'worlds',
    Styles = 'styles',
    // People secondaries (Jellyfin People data), offered through the ByPeople meta tile.
    Actors = 'actors',
    Directors = 'directors',
    Writers = 'writers',
    // Meta entry points (home "Browse by…" tiles). These group existing modes without
    // changing their underlying values, so deep links and settings keys keep working.
    ByMoodTone = 'bymoodtone',
    ByStory = 'bystory',
    ByWorldStyle = 'byworldstyle',
    ByPeople = 'bypeople',
    ByTime = 'bytime',
    ByQuality = 'byquality'
}

/**
 * A mode that shows a grid of values to narrow by before listing any items. The chosen values
 * travel in the `pick` search param and end up in the named filter.
 */
export interface BrowsePicker {
    filter: 'Years' | 'OfficialRatings' | 'Tags' | 'Genres' | 'Studios';
    /** Curated tag list to intersect against the library's available tags. */
    tagList?: readonly string[];
}

export interface BrowseModeDefinition {
    mode: BrowseMode;
    /** Key passed to globalize.translate for the tile caption. */
    label: string;
    /** Icon shown on the tile. */
    Icon: SvgIconComponent;
    /** Colour of the tile icon. Kept in step with the Android TV client's palette. */
    iconColor: string;
    /** Where the tile sits on the library home page: 'primary' quick-access vs 'meta' section. */
    tier: 'primary' | 'meta';
    /** Opens this view rather than the library's default one. */
    view?: LibraryTab;
    /** Applied over the view's default settings; persisted separately per mode. */
    settings?: Partial<LibraryViewSettings>;
    /** Narrows by a chosen value before listing any items. */
    picker?: BrowsePicker;
    /** For a meta tile: the underlying modes it offers as secondary targets. */
    children?: readonly BrowseMode[];
    /** Source used for ranked fetches (e.g. Discover endpoints). Defaults to 'tmdb'. */
    source?: string;
    /** For a people leaf (Actors/Directors/Writers): the person kind to list. */
    personType?: PersonKind;
}
