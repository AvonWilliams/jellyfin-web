import type { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';

import * as userSettings from 'scripts/settings/userSettings';

import { getBrowseModes } from '../constants/browseModes';
import { LibraryRoutes } from '../constants/libraryRoutes';

/**
 * Utility function to check if a path is a library path.
 */
export const isLibraryPath = (path: string) => (
    LibraryRoutes.some(route => route.path === path)
);

/**
 * Utility function to check whether opening a library should offer the browse modes rather than
 * going straight into a library view. A landing view the user has explicitly chosen always wins,
 * which is what keeps the old behaviour reachable.
 */
export const shouldShowBrowseModes = (collectionType?: CollectionType | null, libraryId?: string | null) => (
    !!getBrowseModes(collectionType)?.length
    && !userSettings.get('landing-' + libraryId, false)
);

/**
 * Utility function to get the default view index for a specified URL path and library.
 */
export const getDefaultViewIndex = (path: string, libraryId?: string | null) => {
    if (!libraryId) return 0;

    const views = LibraryRoutes.find(route => route.path === path)?.views ?? [];
    const defaultView = userSettings.get('landing-' + libraryId, false);

    return views.find(view => view.view === defaultView)?.index
        ?? views.find(view => view.isDefault)?.index
        ?? 0;
};
