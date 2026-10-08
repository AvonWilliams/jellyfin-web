import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import React, { type FC } from 'react';

import type { BrowseSource } from '../constants/browseSources';

interface BrowseSourceBarProps {
    sources: readonly BrowseSource[];
    activeSource: string;
    onChange: (id: string) => void;
}

/**
 * Horizontal chip bar for choosing the ranked-list data source (TMDb, IMDb, …). Rendered above
 * the results grid and kept mounted while the grid refreshes, so switching sources never navigates.
 */
const BrowseSourceBar: FC<BrowseSourceBarProps> = ({ sources, activeSource, onChange }) => (
    <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap' }}>
        {sources.map(source => {
            const active = source.id === activeSource;
            return (
                <Chip
                    key={source.id}
                    label={source.label}
                    onClick={() => onChange(source.id)}
                    variant={active ? 'filled' : 'outlined'}
                    sx={active ? { backgroundColor: source.color, color: '#fff' } : undefined}
                />
            );
        })}
    </Stack>
);

export default BrowseSourceBar;
