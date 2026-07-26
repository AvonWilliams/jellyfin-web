import type { SvgIconComponent } from '@mui/icons-material';
import Album from '@mui/icons-material/Album';
import CameraRoll from '@mui/icons-material/CameraRoll';
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
 * Age ratings graded by how restrictive they are, from everyone through to adults only.
 */
const RATING_LEVELS = {
    everyone: { Icon: ChildCare, iconColor: '#5CD672' },
    guidance: { Icon: FamilyRestroom, iconColor: '#9CCC65' },
    teen: { Icon: Groups, iconColor: '#EECE55' },
    mature: { Icon: Warning, iconColor: '#F08A5D' },
    adult: { Icon: Explicit, iconColor: '#E0533D' },
    unrated: { Icon: HelpOutline, iconColor: '#9AA5B1' }
} as const satisfies Record<string, PickTileStyle>;

/**
 * Ratings whose meaning cannot be read off a number.
 *
 * Order matters: the first match wins, so longer codes have to precede the shorter ones they
 * start with, otherwise `R18+` would be read as `R` and `PG-13` as `PG`.
 */
const RATING_TOKENS: ReadonlyArray<readonly [string, PickTileStyle]> = [
    ['NC-17', RATING_LEVELS.adult],
    ['R18+', RATING_LEVELS.adult],
    ['X18+', RATING_LEVELS.adult],
    ['TV-MA', RATING_LEVELS.adult],
    ['MA15+', RATING_LEVELS.mature],
    ['PG-13', RATING_LEVELS.teen],
    ['TV-14', RATING_LEVELS.teen],
    ['TV-PG', RATING_LEVELS.guidance],
    ['TV-Y7', RATING_LEVELS.guidance],
    ['TV-Y', RATING_LEVELS.everyone],
    ['TV-G', RATING_LEVELS.everyone],
    ['AO', RATING_LEVELS.adult],
    ['MA', RATING_LEVELS.mature],
    ['PG', RATING_LEVELS.guidance],
    ['R', RATING_LEVELS.adult],
    ['X', RATING_LEVELS.adult],
    ['M', RATING_LEVELS.teen],
    ['T', RATING_LEVELS.teen],
    ['G', RATING_LEVELS.everyone],
    ['U', RATING_LEVELS.everyone],
    ['E', RATING_LEVELS.everyone]
];

/** Age in years above which each level applies, most restrictive first. */
const RATING_AGES: ReadonlyArray<readonly [number, PickTileStyle]> = [
    [18, RATING_LEVELS.adult],
    [15, RATING_LEVELS.mature],
    [12, RATING_LEVELS.teen],
    [6, RATING_LEVELS.guidance],
    [0, RATING_LEVELS.everyone]
];

export const getRatingStyle = (rating: string): PickTileStyle => {
    // Jellyfin prefixes ratings with the country they belong to, such as "AU-MA15+". The
    // negative lookahead matters: without it the US television ratings lose their own "TV-"
    // prefix, turning TV-MA into MA and TV-Y7 into an unrecognised Y7.
    const normalized = rating.trim().toUpperCase().replace(/^(?!TV-)[A-Z]{2}-/, '');

    if (!normalized || /^(NR|UR|UNRATED|NOT RATED|NONE)$/.test(normalized)) {
        return RATING_LEVELS.unrated;
    }

    const token = RATING_TOKENS.find(([code]) => normalized.startsWith(code));
    if (token) {
        return token[1];
    }

    // Whatever is left starts with an age in most systems: "15", "16+", "12A".
    const age = /^(\d{1,2})/.exec(normalized);
    if (age) {
        const years = parseInt(age[1], 10);
        return RATING_AGES.find(([minimum]) => years >= minimum)?.[1] ?? RATING_LEVELS.unrated;
    }

    return RATING_LEVELS.unrated;
};
