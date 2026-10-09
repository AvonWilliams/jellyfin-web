import type { SvgIconComponent } from '@mui/icons-material';
import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';
import type { ReactNode } from 'react';

/**
 * Monochrome brand marks for the sources that ship as vector glyphs rather than a full-colour
 * logo image. TMDb, IMDb and Netflix use real logos (imdb.png / netflix.png / tmdb.png) loaded as
 * assets; Letterboxd and Rotten Tomatoes keep the inlined marks below.
 */
const makeSourceIcon = (children: ReactNode): SvgIconComponent =>
    ((props: SvgIconProps) => (
        <SvgIcon viewBox='0 0 24 24' {...props}>
            {children}
        </SvgIcon>
    )) as SvgIconComponent;

export const LetterboxdSourceIcon = makeSourceIcon(
    <path fill='currentColor' d='M7.5 7.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 1 0 0-9M12 7.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 1 0 0-9M16.5 7.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 1 0 0-9Z' />
);

export const RottenTomatoesSourceIcon = makeSourceIcon(
    <path fill='currentColor' d='M12 6a7.5 7.5 0 1 0 0 15a7.5 7.5 0 1 0 0-15ZM12 2C14 3.2 15 4.9 12 6.3C9 4.9 10 3.2 12 2Z' />
);
