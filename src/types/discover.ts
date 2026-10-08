import type { ItemDtoQueryResult } from './base/models/item-dto-query-result';

/**
 * An external title surfaced inside a ranked discover response that is not in the library. Clients
 * render these as dimmed "coming soon" tiles with a rank badge; they are never normal library
 * items and never navigate to detail or play.
 */
export interface MissingTitleDto {
    /** Data source this title came from (e.g. "tmdb"). */
    Source?: string;
    /** 1-based rank within the source's list, matching the badge in-library items show. */
    Rank?: number;
    /** Display title. */
    Title?: string;
    /** Release year, when the source provides one. */
    Year?: number | null;
    /** Provider ids for later re-matching, keyed the same way library items are. */
    ProviderIds?: Record<string, string>;
    /** A single lightweight poster URL, empty when the source has no poster. */
    PosterUrl?: string;
}

/**
 * The plugin's ranked discover response (Trending / Top Rated). In-library items plus external
 * "missing" stubs, and the resolved data source.
 */
export interface DiscoverRankedResult extends ItemDtoQueryResult {
    /** Resolved data source (e.g. "tmdb"). */
    Source?: string;
    /** External titles not in the library, returned only when show-missing is enabled. */
    Missing?: MissingTitleDto[];
}
