import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { type FC } from 'react';

import imdbLogo from 'assets/icons/sources/imdb.png';
import letterboxdLogo from 'assets/icons/sources/letterboxd.png';
import netflixLogo from 'assets/icons/sources/netflix.png';
import rottentomatoesLogo from 'assets/icons/sources/rottentomatoes.png';
import tmdbLogo from 'assets/icons/sources/tmdb.png';
import type { BrowseSource } from '../constants/browseSources';

interface BrowseSourceBarProps {
    sources: readonly BrowseSource[];
    activeSource: string;
    onChange: (id: string) => void;
}

/** The provider logo for each source, keyed by the source id sent to /Discover. */
const SOURCE_LOGOS: Record<string, string> = {
    tmdb: tmdbLogo,
    imdb: imdbLogo,
    netflix: netflixLogo,
    letterboxd: letterboxdLogo,
    rottentomatoes: rottentomatoesLogo
};

/**
 * Icon-tile bar for choosing the ranked-list data source. Each tile is a provider logo sized with
 * a small buffer over a white scrim, with a descriptive label underneath. Rendered above the
 * results grid and kept mounted while the grid refreshes, so switching sources never navigates.
 */
const BrowseSourceBar: FC<BrowseSourceBarProps> = ({ sources, activeSource, onChange }) => (
    <Stack direction='row' spacing={1.5} sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {sources.map(source => {
            const active = source.id === activeSource;
            const logo = SOURCE_LOGOS[source.id];
            return (
                <ButtonBase
                    key={source.id}
                    onClick={() => onChange(source.id)}
                    aria-pressed={active}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5,
                        width: 84,
                        padding: 0.5,
                        borderRadius: 1
                    }}
                >
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.92)',
                            border: active ? `2px solid ${source.color}` : '1px solid rgba(0, 0, 0, 0.12)'
                        }}
                    >
                        {logo ? (
                            <Box component='img' src={logo} alt={source.label} sx={{ width: 50, height: 50, objectFit: 'contain' }} />
                        ) : null}
                    </Box>
                    <Typography
                        variant='caption'
                        align='center'
                        sx={{ lineHeight: 1.2, color: active ? source.color : 'text.secondary' }}
                    >
                        {source.label}
                    </Typography>
                </ButtonBase>
            );
        })}
    </Stack>
);

export default BrowseSourceBar;
