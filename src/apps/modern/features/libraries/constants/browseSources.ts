import { LibraryTab } from 'types/libraryTab';

/**
 * Ranked-list data sources offered above the Trending / Top Rated results.
 *
 * The source bar renders one icon tile per ranked list, so adding a list is a data change, not a
 * UI change: add it to the relevant per-view array below once the plugin exposes the matching
 * /Discover endpoint (which passes the `source` query parameter straight through).
 */
export interface BrowseSource {
    /** Identifier sent as the /Discover `source` query parameter. */
    id: string;
    /** Descriptive tile label, e.g. "IMDb Top 250". Proper nouns, so not localised. */
    label: string;
    /** Accent colour used for the tile's active state. */
    color: string;
}

/**
 * The lists offered on the Trending tile, in display order. Netflix is trending-only; TMDb and
 * IMDb serve both.
 */
const TRENDING_SOURCES: readonly BrowseSource[] = [
    { id: 'tmdb', label: 'TMDb Trending', color: '#01B4E4' },
    { id: 'imdb', label: 'IMDb Most Popular', color: '#F5C518' },
    { id: 'netflix', label: 'Netflix Global', color: '#E50914' },
    { id: 'netflix-au', label: 'Netflix Australia', color: '#E50914' },
    { id: 'netflix-ph', label: 'Netflix Philippines', color: '#E50914' }
];

/**
 * The lists offered on the Top Rated tile, in display order. Letterboxd and Rotten Tomatoes are
 * top-rated-only; TMDb and IMDb serve both.
 */
const TOPRATED_SOURCES: readonly BrowseSource[] = [
    { id: 'tmdb', label: 'TMDb Top Rated', color: '#01B4E4' },
    { id: 'imdb', label: 'IMDb Top 250', color: '#F5C518' },
    { id: 'letterboxd', label: 'Letterboxd Top 250', color: '#00E054' },
    { id: 'rottentomatoes', label: 'Rotten Tomatoes Top Movies', color: '#FA320A' }
];

/** Fallback source when no preference has been saved. */
export const DEFAULT_BROWSE_SOURCE = 'tmdb';

/** The sources rendered as tiles for a given ranked view. */
export const getEnabledSources = (viewType: LibraryTab): readonly BrowseSource[] =>
    viewType === LibraryTab.Trending ? TRENDING_SOURCES : TOPRATED_SOURCES;
