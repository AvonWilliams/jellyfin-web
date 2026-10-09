import type { SvgIconComponent } from '@mui/icons-material';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import React, { type FC } from 'react';

import {
    ImdbSourceIcon,
    LetterboxdSourceIcon,
    NetflixSourceIcon,
    RottenTomatoesSourceIcon
} from 'assets/icons/sources/sourceIcons';
import type { BrowseSource } from '../constants/browseSources';

interface BrowseSourceBarProps {
    sources: readonly BrowseSource[];
    activeSource: string;
    onChange: (id: string) => void;
}

/** Monochrome brand marks for the sources that have one; TMDb stays text-only for now. */
const SOURCE_ICONS: Record<string, SvgIconComponent> = {
    imdb: ImdbSourceIcon,
    netflix: NetflixSourceIcon,
    letterboxd: LetterboxdSourceIcon,
    rottentomatoes: RottenTomatoesSourceIcon
};

/**
 * Horizontal chip bar for choosing the ranked-list data source (TMDb, IMDb, …). Rendered above
 * the results grid and kept mounted while the grid refreshes, so switching sources never navigates.
 */
const BrowseSourceBar: FC<BrowseSourceBarProps> = ({ sources, activeSource, onChange }) => (
    <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap' }}>
        {sources.map(source => {
            const active = source.id === activeSource;
            const Icon = SOURCE_ICONS[source.id];
            return (
                <Chip
                    key={source.id}
                    label={source.label}
                    icon={Icon ? <Icon /> : undefined}
                    onClick={() => onChange(source.id)}
                    variant={active ? 'filled' : 'outlined'}
                    sx={active ? { backgroundColor: source.color, color: '#fff' } : undefined}
                />
            );
        })}
    </Stack>
);

export default BrowseSourceBar;
