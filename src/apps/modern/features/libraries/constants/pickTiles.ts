import type { SvgIconComponent } from '@mui/icons-material';
import Album from '@mui/icons-material/Album';
import CameraRoll from '@mui/icons-material/CameraRoll';
import Category from '@mui/icons-material/Category';
import ChildCare from '@mui/icons-material/ChildCare';
import Explicit from '@mui/icons-material/Explicit';
import FamilyRestroom from '@mui/icons-material/FamilyRestroom';
import FourK from '@mui/icons-material/FourK';
import Groups from '@mui/icons-material/Groups';
import Hd from '@mui/icons-material/Hd';
import HelpOutline from '@mui/icons-material/HelpOutline';
import Radio from '@mui/icons-material/Radio';
import Slideshow from '@mui/icons-material/Slideshow';
import Theaters from '@mui/icons-material/Theaters';
import Tv from '@mui/icons-material/Tv';
import Videocam from '@mui/icons-material/Videocam';
import Warning from '@mui/icons-material/Warning';
import {
    ActionGenreIcon,
    AdventureGenreIcon,
    AnimationGenreIcon,
    ComedyGenreIcon,
    CrimeGenreIcon,
    DocumentaryGenreIcon,
    DramaGenreIcon,
    FamilyGenreIcon,
    FantasyGenreIcon,
    HistoryGenreIcon,
    HorrorGenreIcon,
    MusicGenreIcon,
    MysteryGenreIcon,
    RomanceGenreIcon,
    SciFiGenreIcon,
    ThrillerGenreIcon,
    WarGenreIcon,
    WesternGenreIcon
} from 'assets/icons/genres/genreIcons';

export interface PickTileStyle {
    Icon: SvgIconComponent;
    iconColor: string;
}

/**
 * How each decade is drawn, keyed by the first year of the decade.
 *
 * The icon nods to how films of that era were watched, and the colours run warm and faded for
 * the older decades through to cool and saturated for the recent ones, so the grid reads as a
 * timeline rather than a set of identical tiles.
 */
const DECADE_STYLES: ReadonlyArray<readonly [number, PickTileStyle]> = [
    [1940, { Icon: CameraRoll, iconColor: '#B08D57' }],
    [1950, { Icon: Theaters, iconColor: '#C9A227' }],
    [1960, { Icon: Radio, iconColor: '#D9814F' }],
    [1970, { Icon: Album, iconColor: '#CC6B49' }],
    [1980, { Icon: Videocam, iconColor: '#C05CB0' }],
    [1990, { Icon: Tv, iconColor: '#5B8FD9' }],
    [2000, { Icon: Slideshow, iconColor: '#4FA3C7' }],
    [2010, { Icon: Hd, iconColor: '#4FB3A0' }],
    [2020, { Icon: FourK, iconColor: '#5CD672' }]
];

/** Anything before the first entry above shares the oldest treatment. */
const OLDEST_DECADE_STYLE = DECADE_STYLES[0][1];
const NEWEST_DECADE_STYLE = DECADE_STYLES[DECADE_STYLES.length - 1][1];

export const getDecadeStyle = (startYear: number): PickTileStyle => {
    if (startYear < DECADE_STYLES[0][0]) {
        return OLDEST_DECADE_STYLE;
    }

    return DECADE_STYLES.find(([decade]) => decade === startYear)?.[1] ?? NEWEST_DECADE_STYLE;
};

/**
 * Each genre gets its own icon and accent colour so the grid reads as distinct destinations
 * rather than a set of identical tiles. The icon shape is the primary differentiator; the colour
 * reinforces it.
 */
const GENRE_STYLES: Readonly<Record<string, PickTileStyle>> = {
    action: { Icon: ActionGenreIcon, iconColor: '#E53935' },
    adventure: { Icon: AdventureGenreIcon, iconColor: '#FB8C00' },
    animation: { Icon: AnimationGenreIcon, iconColor: '#FDD835' },
    animated: { Icon: AnimationGenreIcon, iconColor: '#FDD835' },
    comedy: { Icon: ComedyGenreIcon, iconColor: '#F06292' },
    crime: { Icon: CrimeGenreIcon, iconColor: '#546E7A' },
    documentary: { Icon: DocumentaryGenreIcon, iconColor: '#1E88E5' },
    drama: { Icon: DramaGenreIcon, iconColor: '#8E24AA' },
    family: { Icon: FamilyGenreIcon, iconColor: '#43A047' },
    fantasy: { Icon: FantasyGenreIcon, iconColor: '#5E35B1' },
    history: { Icon: HistoryGenreIcon, iconColor: '#8D6E63' },
    horror: { Icon: HorrorGenreIcon, iconColor: '#C62828' },
    music: { Icon: MusicGenreIcon, iconColor: '#26A69A' },
    mystery: { Icon: MysteryGenreIcon, iconColor: '#3949AB' },
    romance: { Icon: RomanceGenreIcon, iconColor: '#EC407A' },
    romantic: { Icon: RomanceGenreIcon, iconColor: '#EC407A' },
    scifi: { Icon: SciFiGenreIcon, iconColor: '#00ACC1' },
    sciencefiction: { Icon: SciFiGenreIcon, iconColor: '#00ACC1' },
    thriller: { Icon: ThrillerGenreIcon, iconColor: '#EF6C00' },
    war: { Icon: WarGenreIcon, iconColor: '#6D4C41' },
    western: { Icon: WesternGenreIcon, iconColor: '#C9A227' }
};

/** Genres without a dedicated icon share the generic category glyph. */
const FALLBACK_GENRE_STYLE: PickTileStyle = { Icon: Category, iconColor: '#9AA5B1' };

/** Normalises a genre name for lookup: case-insensitive with punctuation and spacing ignored. */
const normalizeGenre = (genre: string): string =>
    genre.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

export const getGenreStyle = (genre: string): PickTileStyle =>
    GENRE_STYLES[normalizeGenre(genre)] ?? FALLBACK_GENRE_STYLE;

/**
 * Age ratings graded by how restrictive they are, from everyone through to adults only.
 */
export const RATING_LEVELS = {
    everyone: { Icon: ChildCare, iconColor: '#5CD672' },
    guidance: { Icon: FamilyRestroom, iconColor: '#9CCC65' },
    teen: { Icon: Groups, iconColor: '#EECE55' },
    mature: { Icon: Warning, iconColor: '#F08A5D' },
    adult: { Icon: Explicit, iconColor: '#E0533D' },
    unrated: { Icon: HelpOutline, iconColor: '#9AA5B1' }
} as const satisfies Record<string, PickTileStyle>;

export type RatingLevel = keyof typeof RATING_LEVELS;

/** Display order for grouped rating tiles, most restrictive first. */
export const RATING_LEVEL_ORDER: readonly RatingLevel[] = ['adult', 'mature', 'teen', 'guidance', 'everyone', 'unrated'];

/** Canonical label shown for each grouped rating level. */
export const RATING_LEVEL_LABEL: Record<RatingLevel, string> = {
    everyone: 'G',
    guidance: 'PG',
    teen: 'PG-13',
    mature: 'MA',
    adult: 'R',
    unrated: 'Unrated'
};

/**
 * Ratings whose meaning cannot be read off a number.
 *
 * Order matters: the first match wins, so longer codes have to precede the shorter ones they
 * start with, otherwise `R18+` would be read as `R` and `PG-13` as `PG`.
 */
const RATING_TOKENS: ReadonlyArray<readonly [string, RatingLevel]> = [
    ['NC-17', 'adult'],
    ['R18+', 'adult'],
    ['X18+', 'adult'],
    ['TV-MA', 'adult'],
    ['MA15+', 'mature'],
    ['PG-13', 'teen'],
    ['TV-14', 'teen'],
    ['TV-PG', 'guidance'],
    ['TV-Y7', 'guidance'],
    ['TV-Y', 'everyone'],
    ['TV-G', 'everyone'],
    ['AO', 'adult'],
    ['MA', 'mature'],
    ['PG', 'guidance'],
    ['R', 'adult'],
    ['X', 'adult'],
    ['M', 'teen'],
    ['T', 'teen'],
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
