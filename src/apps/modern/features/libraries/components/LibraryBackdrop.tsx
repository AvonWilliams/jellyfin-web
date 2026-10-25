import Box from '@mui/material/Box';
import React, { type FC, useMemo } from 'react';

import { useApi } from 'hooks/useApi';
import { useItem } from 'hooks/useItem';

/** Sharp library backdrop base image, filling the whole surface. */
const BACKDROP_BASE_SX = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center'
} as const;

/** Frosted (blurred) overlay of the same image, clearest at the centre and frosting toward the edges. */
const BACKDROP_FROST_SX = {
    ...BACKDROP_BASE_SX,
    filter: 'blur(72px) saturate(130%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.75) 32%, black 82%)',
    maskImage: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.75) 32%, black 82%)'
} as const;

/** Light scrim that fades toward the bottom, keeping the frosted zone dim enough for tiles. */
const BACKDROP_SCRIM_SX = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(var(--jf-palette-background-paperChannel, 32 32 32) / 0.55), rgba(var(--jf-palette-background-paperChannel, 32 32 32) / 0.2) 45%, transparent 80%)'
} as const;

interface LibraryBackdropProps {
    libraryId?: string | null
}

/**
 * Full-viewport frosted library backdrop (backdrop fanart falling back to the primary image).
 * Shared by the Browse home and the library item-list view so the backdrop persists across
 * transitions between the two.
 */
const LibraryBackdrop: FC<LibraryBackdropProps> = ({ libraryId }) => {
    const { __legacyApiClient__ } = useApi();
    const { data: library } = useItem(libraryId ?? undefined);

    const libraryBackdropUrl = useMemo(() => {
        if (!__legacyApiClient__ || !library?.Id) {
            return undefined;
        }
        const backdropTag = library.BackdropImageTags?.[0];
        if (backdropTag) {
            return __legacyApiClient__.getScaledImageUrl(library.Id, { type: 'Backdrop', tag: backdropTag, maxWidth: 2560 });
        }
        const primaryTag = library.ImageTags?.Primary;
        if (primaryTag) {
            return __legacyApiClient__.getScaledImageUrl(library.Id, { type: 'Primary', tag: primaryTag, maxWidth: 2560 });
        }
        return undefined;
    }, [__legacyApiClient__, library]);

    return (
        <Box
            aria-hidden
            sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}
        >
            {libraryBackdropUrl ? (
                <>
                    <Box component='img' src={libraryBackdropUrl} alt='' sx={BACKDROP_BASE_SX} />
                    <Box component='img' src={libraryBackdropUrl} alt='' sx={BACKDROP_FROST_SX} />
                </>
            ) : null}
            <Box aria-hidden sx={BACKDROP_SCRIM_SX} />
        </Box>
    );
};

export default LibraryBackdrop;
