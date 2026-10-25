import { BROWSE_ICONS } from './browseIcons';

export interface PickTileStyle {
    iconSrc: string;
}

/**
 * How each decade is drawn, keyed by the first year of the decade. Each decade has its own
 * coloured illustration of how films of that era were watched.
 */
const DECADE_STYLES: Readonly<Record<number, PickTileStyle>> = {
    1910: { iconSrc: BROWSE_ICONS['decade-1910s'] },
    1920: { iconSrc: BROWSE_ICONS['decade-1920s'] },
    1930: { iconSrc: BROWSE_ICONS['decade-1930s'] },
    1940: { iconSrc: BROWSE_ICONS['decade-1940s'] },
    1950: { iconSrc: BROWSE_ICONS['decade-1950s'] },
    1960: { iconSrc: BROWSE_ICONS['decade-1960s'] },
    1970: { iconSrc: BROWSE_ICONS['decade-1970s'] },
    1980: { iconSrc: BROWSE_ICONS['decade-1980s'] },
    1990: { iconSrc: BROWSE_ICONS['decade-1990s'] },
    2000: { iconSrc: BROWSE_ICONS['decade-2000s'] },
    2010: { iconSrc: BROWSE_ICONS['decade-2010s'] },
    2020: { iconSrc: BROWSE_ICONS['decade-2020s'] }
};

/** Anything before 1910 shares the oldest treatment, anything after 2020 the newest. */
const OLDEST_DECADE_STYLE = DECADE_STYLES[1910];
const NEWEST_DECADE_STYLE = DECADE_STYLES[2020];

export const getDecadeStyle = (startYear: number): PickTileStyle => {
    if (startYear < 1910) {
        return OLDEST_DECADE_STYLE;
    }

    return DECADE_STYLES[startYear] ?? NEWEST_DECADE_STYLE;
};

/**
 * Each genre gets its own coloured illustration so the grid reads as distinct destinations rather
 * than a set of identical tiles. Keys are normalised genre names; common aliases (including
 * TV-style combined genres) share an icon.
 */
const GENRE_STYLES: Readonly<Record<string, PickTileStyle>> = {
    action: { iconSrc: BROWSE_ICONS['genre-action'] },
    actionadventure: { iconSrc: BROWSE_ICONS['genre-action'] },
    adventure: { iconSrc: BROWSE_ICONS['genre-adventure'] },
    animation: { iconSrc: BROWSE_ICONS['genre-animation'] },
    animated: { iconSrc: BROWSE_ICONS['genre-animation'] },
    comedy: { iconSrc: BROWSE_ICONS['genre-comedy'] },
    crime: { iconSrc: BROWSE_ICONS['genre-crime'] },
    documentary: { iconSrc: BROWSE_ICONS['genre-documentary'] },
    drama: { iconSrc: BROWSE_ICONS['genre-drama'] },
    family: { iconSrc: BROWSE_ICONS['genre-family'] },
    kids: { iconSrc: BROWSE_ICONS['genre-family'] },
    fantasy: { iconSrc: BROWSE_ICONS['genre-fantasy'] },
    history: { iconSrc: BROWSE_ICONS['genre-history'] },
    biography: { iconSrc: BROWSE_ICONS['genre-history'] },
    horror: { iconSrc: BROWSE_ICONS['genre-horror'] },
    music: { iconSrc: BROWSE_ICONS['genre-music'] },
    musical: { iconSrc: BROWSE_ICONS['genre-music'] },
    mystery: { iconSrc: BROWSE_ICONS['genre-mystery'] },
    romance: { iconSrc: BROWSE_ICONS['genre-romance'] },
    romantic: { iconSrc: BROWSE_ICONS['genre-romance'] },
    scifi: { iconSrc: BROWSE_ICONS['genre-scifi'] },
    sciencefiction: { iconSrc: BROWSE_ICONS['genre-scifi'] },
    scififantasy: { iconSrc: BROWSE_ICONS['genre-scifi'] },
    thriller: { iconSrc: BROWSE_ICONS['genre-thriller'] },
    war: { iconSrc: BROWSE_ICONS['genre-war'] },
    warpolitics: { iconSrc: BROWSE_ICONS['genre-war'] },
    western: { iconSrc: BROWSE_ICONS['genre-western'] }
};

/** Genres without a dedicated icon share the generic film-strip glyph. */
const FALLBACK_GENRE_STYLE: PickTileStyle = { iconSrc: BROWSE_ICONS['genre-other'] };

/** Normalises a genre name for lookup: case-insensitive with punctuation and spacing ignored. */
const normalizeGenre = (genre: string): string =>
    genre.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

export const getGenreStyle = (genre: string): PickTileStyle =>
    GENRE_STYLES[normalizeGenre(genre)] ?? FALLBACK_GENRE_STYLE;

/**
 * Age ratings graded by how restrictive they are, from everyone through to adults only.
 */
export const RATING_LEVELS = {
    everyone: { iconSrc: BROWSE_ICONS['rating-everyone'] },
    guidance: { iconSrc: BROWSE_ICONS['rating-guidance'] },
    teen: { iconSrc: BROWSE_ICONS['rating-teen'] },
    mature: { iconSrc: BROWSE_ICONS['rating-mature'] },
    adult: { iconSrc: BROWSE_ICONS['rating-adult'] },
    specialAdult: { iconSrc: BROWSE_ICONS['rating-special-adult'] },
    unrated: { iconSrc: BROWSE_ICONS['rating-unrated'] },
    pending: { iconSrc: BROWSE_ICONS['rating-pending'] }
} as const satisfies Record<string, PickTileStyle>;

export type RatingLevel = keyof typeof RATING_LEVELS;

/** Display order for grouped rating tiles, most restrictive first. */
export const RATING_LEVEL_ORDER: readonly RatingLevel[] = ['specialAdult', 'adult', 'mature', 'teen', 'guidance', 'everyone', 'pending', 'unrated'];

/** Canonical label plus the recommended minimum age shown on each grouped rating tile. */
export const RATING_LEVEL_LABEL: Record<RatingLevel, string> = {
    everyone: 'G · All ages',
    guidance: 'PG · 6+',
    teen: 'PG-13 · 13+',
    mature: 'MA · 15+',
    adult: 'R · 18+',
    specialAdult: 'X · 18+',
    unrated: 'Unrated',
    pending: 'Pending'
};

/**
 * Ratings whose meaning cannot be read off a number.
 *
 * Order matters: the first match wins, so longer codes have to precede the shorter ones they
 * start with, otherwise `R18+` would be read as `R` and `PG-13` as `PG`.
 */
const RATING_TOKENS: ReadonlyArray<readonly [string, RatingLevel]> = [
    // Special adult — prohibited / adult-entertainment / objectionable.
    ['OBJECTIONABLE', 'specialAdult'],
    ['X18+', 'specialAdult'],
    ['AO', 'specialAdult'],
    ['RC', 'specialAdult'],
    ['X', 'specialAdult'],
    // Adult (18+) — longer R-prefixed codes before the bare "R".
    ['NC-17', 'adult'],
    ['R21', 'adult'],
    ['R18+', 'adult'],
    ['R18', 'adult'],
    ['RP16', 'mature'],
    ['RP13', 'teen'],
    ['R16', 'mature'],
    ['R15', 'mature'],
    ['R13', 'teen'],
    ['R', 'adult'],
    // Mature (15+) — longer M-prefixed codes before the bare "M".
    ['MA15+', 'mature'],
    ['M18', 'mature'],
    ['MA', 'mature'],
    ['NC16', 'mature'],
    ['18A', 'mature'],
    ['14A', 'mature'],
    ['TV-MA', 'mature'],
    // Teen (13+).
    ['PG-13', 'teen'],
    ['PG13', 'teen'],
    ['12A', 'teen'],
    ['TV-14', 'teen'],
    ['M', 'teen'],
    ['T', 'teen'],
    // Guidance (6+).
    ['TV-Y7-FV', 'guidance'],
    ['TV-Y7', 'guidance'],
    ['TV-PG', 'guidance'],
    ['PG', 'guidance'],
    // Everyone.
    ['TV-G', 'everyone'],
    ['TV-Y', 'everyone'],
    ['G', 'everyone'],
    ['U', 'everyone'],
    ['E', 'everyone']
];

/** Age in years above which each level applies, most restrictive first. */
const RATING_AGES: ReadonlyArray<readonly [number, RatingLevel]> = [
    [18, 'adult'],
    [15, 'mature'],
    [12, 'teen'],
    [6, 'guidance'],
    [0, 'everyone']
];

/**
 * Capitalises each word in a tag name for display, handling hyphens as word boundaries.
 * "new york city" → "New York City", "post-apocalyptic" → "Post-Apocalyptic".
 */
export const toTitleCase = (str: string): string =>
    str.split(/(\s|-)/g).map(part =>
        part.length > 0 && part !== ' ' && part !== '-' ?
            part.charAt(0).toUpperCase() + part.slice(1) :
            part
    ).join('');

export const getRatingLevel = (rating: string): RatingLevel => {
    // Jellyfin prefixes ratings with the country they belong to, such as "AU-MA15+". The
    // negative lookahead matters: without it the US television ratings lose their own "TV-"
    // prefix, turning TV-MA into MA and TV-Y7 into an unrecognised Y7.
    const normalized = rating.trim().toUpperCase().replace(/^(?!TV-)[A-Z]{2}-/, '');

    if (!normalized || /^(NR|UR|UNRATED|NOT RATED|NONE)$/.test(normalized)) {
        return 'unrated';
    }

    if (/^(CTC|TBA|TO BE CLASSIFIED|CHECK THE CLASSIFICATION)$/.test(normalized) || normalized.includes('CLASSIFICATION')) {
        return 'pending';
    }

    const token = RATING_TOKENS.find(([code]) => normalized.startsWith(code));
    if (token) {
        return token[1];
    }

    // Whatever is left starts with an age in most systems: "15", "16+", "12A".
    const age = /^(\d{1,2})/.exec(normalized);
    if (age) {
        const years = parseInt(age[1], 10);
        return RATING_AGES.find(([minimum]) => years >= minimum)?.[1] ?? 'unrated';
    }

    return 'unrated';
};

export const getRatingStyle = (rating: string): PickTileStyle => RATING_LEVELS[getRatingLevel(rating)];
