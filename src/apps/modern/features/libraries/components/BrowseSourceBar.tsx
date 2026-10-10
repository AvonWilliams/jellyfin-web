import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
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
    'netflix-au': netflixLogo,
    'netflix-ph': netflixLogo,
    letterboxd: letterboxdLogo,
    rottentomatoes: rottentomatoesLogo
};

/**
 * Compact source selector: a row of pill chips, each a small provider mark plus label. The active
 * source is tinted with its accent colour and filled with a subtle scrim; the rest stay neutral.
 */
const BrowseSourceBar: FC<BrowseSourceBarProps> = ({ sources, activeSource, onChange }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
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
                        alignItems: 'center',
                        gap: 0.75,
                        padding: '4px 14px',
                        borderRadius: '999px',
                        border: `1px solid ${active ? source.color : 'var(--jf-palette-divider, rgba(255, 255, 255, 0.12))'}`,
                        backgroundColor: active ? 'rgba(var(--jf-palette-background-paperChannel, 32 32 32) / 0.5)' : 'transparent',
                        transition: 'background-color 120ms ease, border-color 120ms ease'
                    }}
                >
                    {logo ? (
                        <Box
                            component='img'
                            src={logo}
                            alt=''
                            sx={{ width: 16, height: 16, objectFit: 'contain', filter: active ? 'none' : 'grayscale(1) opacity(0.75)' }}
                        />
                    ) : null}
                    <Typography
                        variant='caption'
                        sx={{ color: active ? source.color : 'text.secondary', fontWeight: active ? 600 : 400, lineHeight: 1 }}
                    >
                        {source.label}
                    </Typography>
                </ButtonBase>
            );
        })}
    </Box>
);

export default BrowseSourceBar;
