import type { SvgIconComponent } from '@mui/icons-material';
import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';
import type { ReactNode } from 'react';

/**
 * The monochrome genre SVGs in this directory, inlined as tintable MUI icon components.
 *
 * The webpack build loads `.svg` files with `asset/resource`, so importing one yields a URL rather
 * than a component and there is no SVGR loader to convert the markup. Inlining the path data here
 * keeps the icons tintable: MUI's SvgIcon renders its root with `fill: currentColor`, so the
 * `color` the genre tiles apply flows straight through to the paths.
 */
const makeGenreIcon = (children: ReactNode): SvgIconComponent =>
    ((props: SvgIconProps) => (
        <SvgIcon viewBox='0 0 24 24' {...props}>
            {children}
        </SvgIcon>
    )) as SvgIconComponent;

export const ActionGenreIcon = makeGenreIcon(
    <path fill='currentColor' d='M7 2v11h3v9l7-12h-4l4-8z' />
);

export const AdventureGenreIcon = makeGenreIcon(
    <path fill='currentColor' d='M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1 1.1-.49 1.1-1.1-.49-1.1-1.1-1.1M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m2.19 12.19L6 18l3.81-8.19L18 6z' />
);

export const AnimationGenreIcon = makeGenreIcon(
    <>
        <path fill='currentColor' d='m18 4 2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4z' />
        <path fill='currentColor' d='M16.583 3.583 16.017 3.017 18.617 0.417 19.183 0.983z' />
        <path fill='currentColor' d='M19.383 3.583 18.817 3.017 20.617 1.217 21.183 1.783z' />
    </>
);

export const ComedyGenreIcon = makeGenreIcon(
    <path fill='currentColor' fillRule='evenodd' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.7 9.6A2.3 2.3 0 0 0 10.3 9.6A1.3 1.3 0 0 1 7.7 9.6zM13.7 9.6A2.3 2.3 0 0 0 16.3 9.6A1.3 1.3 0 0 1 13.7 9.6zM8 13.2c0 2.9 1.8 4.9 4 4.9s4-2 4-4.9v-.9H8v.9z' />
);

export const CrimeGenreIcon = makeGenreIcon(
    <path fill='currentColor' d='m5.2494 8.0688 2.83-2.8269 14.1343 14.15-2.83 2.8269zm4.2363-4.2415 2.828-2.8289 5.6577 5.656-2.828 2.8289zM.9989 12.3147l2.8284-2.8285 5.6569 5.6569-2.8285 2.8284zM1 21h12v2H1z' />
);

export const DocumentaryGenreIcon = makeGenreIcon(
    <path fill='currentColor' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39' />
);

export const DramaGenreIcon = makeGenreIcon(
    <>
        <path fill='currentColor' d='M2 16.5C2 19.54 4.46 22 7.5 22s5.5-2.46 5.5-5.5V10H2zm5.5 2C6.12 18.5 5 17.83 5 17h5c0 .83-1.12 1.5-2.5 1.5M10 13c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1m-5 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1' />
        <path fill='currentColor' d='M11 3v6h3v2.5c0-.83 1.12-1.5 2.5-1.5s2.5.67 2.5 1.5h-5v2.89c.75.38 1.6.61 2.5.61 3.04 0 5.5-2.46 5.5-5.5V3zm3 5.08c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1c0 .56-.45 1-1 1m5 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1c0 .56-.45 1-1 1' />
    </>
);

export const FamilyGenreIcon = makeGenreIcon(
    <path fill='currentColor' d='M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2m4 18v-6h2.5l-2.54-7.63C19.68 7.55 18.92 7 18.06 7h-.12c-.86 0-1.63.55-1.9 1.37l-.86 2.58c1.08.6 1.82 1.73 1.82 3.05v8zm-7.5-10.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5M5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2m2 16v-7H9V9c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6h1.5v7zm6.5 0v-4h1v-4c0-.82-.68-1.5-1.5-1.5h-2c-.82 0-1.5.68-1.5 1.5v4h1v4z' />
);

export const FantasyGenreIcon = makeGenreIcon(
    <path fill='currentColor' d='m19 9 1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25z' />
);

export const HorrorGenreIcon = makeGenreIcon(
    <path fill='currentColor' fillRule='evenodd' d='M12 2C8.69 2 6 4.35 6 7.4V14c0 2.8 1.9 5.2 4.5 5.9l-.8 2.1 2.1-1.2c.7.2 1.4.2 2.2.2s1.5-.1 2.2-.2l2.1 1.2-.8-2.1c2.6-.7 4.5-3.1 4.5-5.9V7.4C22 4.35 19.31 2 16 2zM9.2 8.6a1.4 1.6 0 1 0 0 3.2 1.4 1.6 0 1 0 0-3.2zM14.8 8.6a1.4 1.6 0 1 0 0 3.2 1.4 1.6 0 1 0 0-3.2zM12 13.3a1.1 1 0 1 0 0 2 1.1 1 0 1 0 0-2z' />
);

export const MysteryGenreIcon = makeGenreIcon(
    <path fill='currentColor' d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14' />
);

export const RomanceGenreIcon = makeGenreIcon(
    <path fill='currentColor' d='m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z' />
);

export const SciFiGenreIcon = makeGenreIcon(
    <path fill='currentColor' d='M12 2.5s4.5 2.04 4.5 10.5c0 2.49-1.04 5.57-1.6 7H9.1c-.56-1.43-1.6-4.51-1.6-7C7.5 4.54 12 2.5 12 2.5m2 8.5c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2m-6.31 9.52c-.48-1.23-1.52-4.17-1.67-6.87l-1.13.75c-.56.38-.89 1-.89 1.67V22zM20 22v-5.93c0-.67-.33-1.29-.89-1.66l-1.13-.75c-.15 2.69-1.2 5.64-1.67 6.87z' />
);

export const ThrillerGenreIcon = makeGenreIcon(
    <path fill='currentColor' d='M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z' />
);
