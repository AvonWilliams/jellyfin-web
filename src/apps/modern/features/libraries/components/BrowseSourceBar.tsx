import type { SvgIconComponent } from '@mui/icons-material';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { type FC } from 'react';

import {
    ImdbSourceIcon,
    LetterboxdSourceIcon,
    NetflixSourceIcon,
    RottenTomatoesSourceIcon,
    TmdbSourceIcon
} from 'assets/icons/sources/sourceIcons';
import type { BrowseSource } from '../constants/browseSources';

interface BrowseSourceBarProps {
    sources: readonly BrowseSource[];
    activeSource: string;
    onChange: (id: string) => void;
}

/** Monochrome brand marks, keyed by the source id sent to /Discover. */
const SOURCE_ICONS: Record<string, SvgIconComponent> = {
    tmdb: TmdbSourceIcon,
    imdb: ImdbSourceIcon,
    netflix: NetflixSourceIcon,
    letterboxd: LetterboxdSourceIcon,
    rottentomatoes: RottenTomatoesSourceIcon
};

/**
 * Icon-tile bar for choosing the ranked-list data source. Each tile is a mark sized with a small
 * buffer and a descriptive label underneath. Rendered above the results grid and kept mounted while
 * the grid refreshes, so switching sources never navigates.
 */
const BrowseSourceBar: FC<BrowseSourceBarProps> = ({ sources, activeSource, onChange }) => (
    <Stack direction='row' spacing={1.5} sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {sources.map(source => {
            const active = source.id === activeSource;
            const Icon = SOURCE_ICONS[source.id];
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
                            width: 52,
                            height: 52,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '12px',
                            backgroundColor: active ? source.color : 'rgba(128,128,128,0.16)',
                            color: active ? '#fff' : 'text.primary'
                        }}
                    >
                        {Icon ? <Icon sx={{ fontSize: 30 }} /> : null}
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
