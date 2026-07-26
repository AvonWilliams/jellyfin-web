import { CollectionType } from '@jellyfin/sdk/lib/generated-client/models/collection-type';
import { UseQueryResult } from '@tanstack/react-query';
import React, { type FC, type PropsWithChildren, createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';

import useCurrentTab from 'hooks/useCurrentTab';
import { useGetItemsViewByType } from 'hooks/useFetchItems';
import { ItemDtoQueryResult } from 'types/base/models/item-dto-query-result';
import { LibraryViewSettings } from 'types/library';
import { LibraryTab } from 'types/libraryTab';
import { LibraryTabContent } from 'types/libraryTabContent';

import { getBrowseMode } from '../constants/browseModes';
import { LibraryRoutes } from '../constants/libraryRoutes';
import { isLibraryPath } from '../utils/path';
import { getDefaultLibraryViewSettings, getSettingsKey } from '../utils/settings';
import { getViewContent } from '../utils/viewContent';

interface LibraryState {
    collectionType?: CollectionType;
    content?: LibraryTabContent;
    isLibraryPath: boolean;
    id?: string;
    itemsResult?: UseQueryResult<ItemDtoQueryResult | undefined, Error>;
    viewSettings?: LibraryViewSettings;
    setViewSettings?: React.Dispatch<React.SetStateAction<LibraryViewSettings>>;
}

const DEFAULT_LIBRARY_STATE: LibraryState = {
    isLibraryPath: false
};

export const LibraryContext = createContext<LibraryState>(DEFAULT_LIBRARY_STATE);
export const useLibrary = () => useContext(LibraryContext);

export const LibraryProvider: FC<PropsWithChildren<unknown>> = ({ children }) => {
    const { pathname } = useLocation();
    const { searchParams, libraryId, activeTab, settingsKey } = useCurrentTab();

    const route = useMemo(() => LibraryRoutes.find(({ path }) => path === pathname), [pathname]);
    const collectionType = route?.type;
    const isLibPath = isLibraryPath(pathname);
    const id = libraryId ?? undefined;

    const content = useMemo(() => collectionType && getViewContent(collectionType, activeTab), [collectionType, activeTab]);
    const viewType = content?.viewType;

    // A browse mode seeds the sort and filters for the view it opens. Picker modes additionally
    // carry the chosen value, so each choice is treated as a distinct mode of its own.
    const browseMode = searchParams.get('browseMode');
    const browsePick = searchParams.get('pick');
    const browseModeSettings = useMemo(() => {
        const definition = getBrowseMode(collectionType, browseMode);
        if (!definition) {
            return undefined;
        }

        if (!definition.picker || !browsePick) {
            return definition.settings;
        }

        const values = browsePick.split(',');
        const filterValue = definition.picker.filter === 'Years' ?
            values.map(value => parseInt(value, 10)).filter(value => !isNaN(value)) :
            values;

        return {
            ...definition.settings,
            Filters: {
                ...definition.settings?.Filters,
                [definition.picker.filter]: filterValue
            }
        };
    }, [collectionType, browseMode, browsePick]);
    const browseModeKey = browseMode && browsePick ? `${browseMode}-${browsePick}` : browseMode;

    // Local storage requires the view type to be known upfront so default to movies if unknown
    const settingsViewType = viewType ?? LibraryTab.Movies;
    const [viewSettings, setViewSettings] = useLocalStorage<LibraryViewSettings>(
        getSettingsKey(settingsViewType, settingsKey, browseModeKey),
        getDefaultLibraryViewSettings(settingsViewType, browseModeSettings)
    );

    const itemsResult = useGetItemsViewByType(
        viewType,
        libraryId,
        content?.itemType,
        viewSettings
    );

    const state = useMemo(() => ({
        ...DEFAULT_LIBRARY_STATE,
        collectionType,
        isLibraryPath: isLibPath,
        id,
        content,
        viewSettings,
        setViewSettings,
        itemsResult
    }), [collectionType, isLibPath, id, content, viewSettings, setViewSettings, itemsResult]);

    return (
        <LibraryContext.Provider value={state}>
            {children}
        </LibraryContext.Provider>
    );
};
