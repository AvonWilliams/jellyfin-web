/**
 * Ranked-list data sources offered above the Trending / Top Rated results.
 *
 * The source bar renders this array as chips, so adding a source is a data change, not a UI
 * change: flip `enabled` once the plugin exposes the matching /Discover endpoint and the fetch
 * (which passes `source` straight through) picks it up. Phase 1 ships TMDb only.
 */
export interface BrowseSource {
    /** Identifier sent as the /Discover `source` query parameter. */
    id: string;
    /** Chip label. Proper nouns, so not localised. */
    label: string;
    /** Whether the source is selectable in the current phase. */
    enabled: boolean;
    /** Accent colour used for the chip's active state. */
    color: string;
}

export const BROWSE_SOURCES: readonly BrowseSource[] = [
    { id: 'tmdb', label: 'TMDb', enabled: true, color: '#01B4E4' },
    { id: 'imdb', label: 'IMDb', enabled: false, color: '#F5C518' },
    { id: 'rotten-tomatoes', label: 'Rotten Tomatoes', enabled: false, color: '#FA320A' },
    { id: 'netflix', label: 'Netflix', enabled: false, color: '#E50914' }
];

/** Fallback source when no preference has been saved. */
export const DEFAULT_BROWSE_SOURCE = 'tmdb';

/** The sources a user can currently pick from. */
export const ENABLED_BROWSE_SOURCES = BROWSE_SOURCES.filter(source => source.enabled);
