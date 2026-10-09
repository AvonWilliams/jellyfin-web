import Box from '@mui/material/Box';
import React, { type FC } from 'react';

import globalize from 'lib/globalize';
import type { MissingTitleDto } from 'types/discover';

import 'components/cardbuilder/card.scss';

interface ComingSoonCardProps {
    title: MissingTitleDto;
}

/**
 * A "coming soon" tile for a ranked title that is not in the library. Renders the source poster
 * dimmed/desaturated with a "Coming soon" banner and the active source's rank badge, and is
 * deliberately not clickable — there is no detail or play navigation for a missing title.
 */
const ComingSoonCard: FC<ComingSoonCardProps> = ({ title }) => (
    <div className='card portraitCard comingSoonCard'>
        <div className='cardBox cardBox-bottompadded'>
            <div className='cardScalable'>
                <div className='cardPadder cardPadder-portrait' />
                <div className='cardContent'>
                    <div className='cardImageContainer'>
                        {title.Rank != null && (
                            <Box className='cardRankBadge'>{title.Rank}</Box>
                        )}
                        {title.PosterUrl ? (
                            <img
                                className='comingSoonPoster'
                                src={title.PosterUrl}
                                alt={title.Title ?? ''}
                                referrerPolicy='no-referrer'
                            />
                        ) : (
                            <div className='comingSoonPlaceholder'>
                                {title.Title}
                            </div>
                        )}
                        <div className='comingSoonBanner'>
                            {globalize.translate('ComingSoon')}
                        </div>
                    </div>
                </div>
            </div>
            <div className='cardFooter'>
                <div className='cardText cardTextCentered'>
                    {title.Title}
                </div>
                {title.Year != null && (
                    <div className='cardText cardText-secondary cardTextCentered'>
                        {title.Year}
                    </div>
                )}
            </div>
        </div>
    </div>
);

export default ComingSoonCard;
