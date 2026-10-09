import type { SvgIconComponent } from '@mui/icons-material';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { type FC } from 'react';

import imdbLogo from 'assets/icons/sources/imdb.png';
import netflixLogo from 'assets/icons/sources/netflix.png';
import tmdbLogo from 'assets/icons/sources/tmdb.png';
import { LetterboxdSourceIcon, RottenTomatoesSourceIcon } from 'assets/icons/sources/sourceIcons';
import type { BrowseSource } from '../constants/browseSources';

interface BrowseSourceBarProps {
    sources: readonly BrowseSource[];
    activeSource: string;
    onChange: (id: string) => void;
}

/** A source's mark: a full-colour logo image, or a monochrome glyph. */
type SourceMark = { img: string } | { Icon: SvgIconComponent };

const SOURCE_MARKS: Record<string, SourceMark> = {
    tmdb: { img: tmdbLogo },
    imdb: { img: imdbLogo },
    netflix: { img: netflixLogo },
    letterboxd: { Icon: LetterboxdSourceIcon },
    rottentomatoes: { Icon: RottenTomatoesSourceIcon }
};

/**
 * Icon-tile bar for choosing the ranked-list data source. Each tile is a mark sized with a small
 * buffer over a dark scrim (matching the coming-soon cards), with a descriptive label underneath.
 * Rendered above the results grid and kept mounted while the grid refreshes, so switching sources
 * never navigates.
 */
const BrowseSourceBar: FC<BrowseSourceBarProps> = ({ sources, activeSource, onChange }) => (
    <Stack direction='row' spacing={1.5} sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {sources.map(source => {
            const active = source.id === activeSource;
            const mark = SOURCE_MARKS[source.id];
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
                        {mark && 'img' in mark ? (
                            <Box component='img' src={mark.img} alt={source.label} sx={{ width: 40, height: 40, objectFit: 'contain' }} />
                        ) : mark ? (
                            <mark.Icon sx={{ fontSize: 30, color: '#1a1a1a' }} />
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
