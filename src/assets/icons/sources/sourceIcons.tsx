import type { SvgIconComponent } from '@mui/icons-material';
import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';
import type { ReactNode } from 'react';

/**
 * The monochrome source brand marks in this directory, inlined as tintable MUI icon components.
 *
 * Mirrors <c>genres/genreIcons.tsx</c>: the webpack build loads `.svg` files as asset URLs rather
 * than components, so the path data is inlined here instead. MUI's SvgIcon renders its root with
 * `fill: currentColor`, so the chip's colour flows straight through to the mark.
 */
const makeSourceIcon = (children: ReactNode): SvgIconComponent =>
    ((props: SvgIconProps) => (
        <SvgIcon viewBox='0 0 24 24' {...props}>
            {children}
        </SvgIcon>
    )) as SvgIconComponent;

export const ImdbSourceIcon = makeSourceIcon(
    <path fill='currentColor' d='M2 5H4.6V6.6H4V17.4H4.6V19H2V17.4H2.6V6.6H2ZM5.6 5V19H7.8V5L9.6 14L11.4 5V19H13.6V5ZM14.6 5H16.8C18.7 5 19.2 7 19.2 12C19.2 17 18.7 19 16.8 19H14.6ZM19.8 5H21.8V10.8C22.4 10.8 22.4 14.8 22.4 15.2C22.4 17.4 22.1 19 21.8 19H19.8Z' />
);

export const NetflixSourceIcon = makeSourceIcon(
    <path fill='currentColor' d='M3 4V20H6V8L18 20H21V4H18V16L6 4Z' />
);

export const LetterboxdSourceIcon = makeSourceIcon(
    <path fill='currentColor' d='M7.5 7.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 1 0 0-9M12 7.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 1 0 0-9M16.5 7.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 1 0 0-9Z' />
);

export const RottenTomatoesSourceIcon = makeSourceIcon(
    <path fill='currentColor' d='M12 6a7.5 7.5 0 1 0 0 15a7.5 7.5 0 1 0 0-15ZM12 2C14 3.2 15 4.9 12 6.3C9 4.9 10 3.2 12 2Z' />
);
