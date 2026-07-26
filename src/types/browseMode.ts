import type { SvgIconComponent } from '@mui/icons-material';

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
    HighestRated = 'highestrated',
    TopRated = 'toprated',
    BestUnseen = 'bestunseen',
    CriticsPicks = 'criticspicks',
    Unwatched = 'unwatched',
    Favorites = 'favorites',
    RecentlyPlayed = 'recentlyplayed',
    Longest = 'longest',
    Decades = 'decades',
    AgeRating = 'agerating',
    Trending = 'trending'
}

/**
 * A mode that shows a grid of values to narrow by before listing any items. The chosen values
 * travel in the `pick` search param and end up in the named filter.
 */
export interface BrowsePicker {
    filter: 'Years' | 'OfficialRatings';
}

export interface BrowseModeDefinition {
    mode: BrowseMode;
    /** Key passed to globalize.translate for the tile caption. */
    label: string;
    /** Icon shown on the tile. */
    Icon: SvgIconComponent;
    /** Colour of the tile icon. Kept in step with the Android TV client's palette. */
    iconColor: string;
    /** Opens this view rather than the library's default one. */
    view?: LibraryTab;
    /** Applied over the view's default settings; persisted separately per mode. */
    settings?: Partial<LibraryViewSettings>;
    /** Narrows by a chosen value before listing any items. */
    picker?: BrowsePicker;
}
