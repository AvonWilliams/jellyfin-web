/**
 * Ranked-list data sources offered above the Trending / Top Rated results.
 *
 * The source bar renders one chip per enabled source, so adding a source is a data change, not a
 * UI change: add it to <see cref="BROWSE_SOURCES"/> for its chip presentation and to
 * <see cref="ENABLED_SOURCE_IDS"/> once the plugin exposes the matching /Discover endpoint (which
 * passes the `source` query parameter straight through).
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
    { id: 'rotten-tomatoes', label: 'Rotten Tomatoes', color: '#FA320A' },
    { id: 'netflix', label: 'Netflix', color: '#E50914' }
];

/**
 * The sources a user can currently pick from, in chip order. Mirrors the plugin's `EnabledSources`
 * configuration; only TMDb is implemented in this phase, so it is the sole enabled source.
 */
export const ENABLED_SOURCE_IDS: readonly string[] = ['tmdb'];

/** Fallback source when no preference has been saved. */
export const DEFAULT_BROWSE_SOURCE = 'tmdb';

/** The sources rendered as chips in the source bar. */
export const ENABLED_BROWSE_SOURCES = BROWSE_SOURCES.filter(source => ENABLED_SOURCE_IDS.includes(source.id));
