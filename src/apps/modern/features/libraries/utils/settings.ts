
import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';

import { type ParentId, ViewMode, type LibraryViewSettings } from 'types/library';
import { LibraryTab } from 'types/libraryTab';

export const getDefaultSortBy = (viewType: LibraryTab): ItemSortBy[] => {
    if (viewType === LibraryTab.Episodes) {
        return [ItemSortBy.SeriesSortName];
    }

    return [ItemSortBy.SortName];
};

export const getDefaultLibraryViewSettings = (
    viewType: LibraryTab,
    browseModeSettings?: Partial<LibraryViewSettings>
): LibraryViewSettings => {
    return {
        ShowTitle: true,
        ShowYear: true,
        ViewMode: viewType === LibraryTab.Songs ? ViewMode.ListView : ViewMode.GridView,
        ImageType: viewType === LibraryTab.Studios ? ImageType.Thumb : ImageType.Primary,
        CardLayout: false,
        SortBy: getDefaultSortBy(viewType),
        SortOrder: SortOrder.Ascending,
        StartIndex: 0,
        ...browseModeSettings
    };
};

/**
 * Browse modes get their own storage key so that adjusting the sort within, say, "Just Added"
 * does not overwrite the sort the user chose for the plain library view.
 */
export const getSettingsKey = (viewType: LibraryTab, parentId: ParentId, browseMode?: string | null) => {
    return browseMode ?
        `${viewType} - ${parentId} - ${browseMode}` :
        `${viewType} - ${parentId}`;
};
