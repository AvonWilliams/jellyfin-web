import { LibraryTab } from 'types/libraryTab';

/**
 * Ranked-list data sources offered above the Trending / Top Rated results.
 *
 * The source bar renders one chip per enabled source, so adding a source is a data change, not a
 * UI change: add it to <see cref="BROWSE_SOURCES"/> for its chip presentation and to the relevant
 * per-view id list once the plugin exposes the matching /Discover endpoint (which passes the
 * `source` query parameter straight through).
 */
export interface BrowseSource {
    /** Identifier sent as the /Discover `source` query parameter. */
    id: string;
    /** Chip label. Proper nouns, so not localised. */
    label: string;
    /** Accent colour used for the chip's active state. */
    color: string;
}

/** Known ranked sources and their chip presentation. */
export const BROWSE_SOURCES: readonly BrowseSource[] = [
    { id: 'tmdb', label: 'TMDb', color: '#01B4E4' },
    { id: 'imdb', label: 'IMDb', color: '#F5C518' },
    { id: 'netflix', label: 'Netflix', color: '#E50914' },
    { id: 'letterboxd', label: 'Letterboxd', color: '#00E054' },
    { id: 'rottentomatoes', label: 'Rotten Tomatoes', color: '#FA320A' }
];

/**
 * The sources offered on the Trending tile, in chip order. Netflix is trending-only; TMDb and IMDb
 * serve both.
 */
export const TRENDING_SOURCE_IDS: readonly string[] = ['tmdb', 'imdb', 'netflix'];

/**
 * The sources offered on the Top Rated tile, in chip order. Letterboxd and Rotten Tomatoes are
 * top-rated-only; TMDb and IMDb serve both.
 */
export const TOPRATED_SOURCE_IDS: readonly string[] = ['tmdb', 'imdb', 'letterboxd', 'rottentomatoes'];

/** Fallback source when no preference has been saved. */
export const DEFAULT_BROWSE_SOURCE = 'tmdb';

/** The sources rendered as chips for a given ranked view. */
export const getEnabledSources = (viewType: LibraryTab): readonly BrowseSource[] => {
    const ids = viewType === LibraryTab.Trending ? TRENDING_SOURCE_IDS : TOPRATED_SOURCE_IDS;
    return BROWSE_SOURCES.filter(source => ids.includes(source.id));
};
