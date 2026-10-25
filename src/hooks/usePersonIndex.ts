import { isAxiosError, type AxiosRequestConfig } from 'axios';
import type { PersonKind } from '@jellyfin/sdk/lib/generated-client/models/person-kind';
import { useInfiniteQuery } from '@tanstack/react-query';

import { type JellyfinApiContext, useApi } from './useApi';
import type { ParentId } from 'types/library';

/** The sort orders the plugin's /Discover/People endpoint serves. */
export type PersonIndexSort = 'az' | 'za' | 'most' | 'fewest';

/** How many people one request asks for. */
export const PERSON_INDEX_PAGE_SIZE = 100;

/** A person as the plugin's /Discover/People endpoint returns it. */
export interface PersonIndexItem {
    Id: string
    Name: string
    /** How many movies or series the person appears in. */
    Count: number
    /** Cache tag of the person's primary image; absent when the person has none. */
    ImageTag?: string | null
}

/** One page of /Discover/People. */
export interface PersonIndexPage {
    Total: number
    StartIndex: number
    Items: PersonIndexItem[]
    /** People per first letter (A-Z, then "#"), present when the request asked for it. */
    Letters?: Record<string, number> | null
    /** "index" when served from the plugin's stored index, "live" when computed for the request. */
    Source?: string
}

/**
 * Whether an error means the server has no /Discover/People (an older plugin or none), as opposed
 * to a temporary failure. In that case the caller should use the older per-person requests.
 */
export const isPersonIndexMissing = (error: unknown) => (
    isAxiosError(error) && [404, 405, 501].includes(error.response?.status ?? 0)
);

/** The start index of the page after `last`, or undefined when everything has been loaded. */
export const getNextPersonIndexStart = (last: PersonIndexPage) => {
    const next = last.StartIndex + last.Items.length;
    return last.Items.length > 0 && next < last.Total ? next : undefined;
};

const fetchPersonIndexPage = async (
    currentApi: JellyfinApiContext,
    parentId: ParentId,
    personType: PersonKind,
    sort: PersonIndexSort,
    letter: string | null,
    startIndex: number,
    options?: AxiosRequestConfig
) => {
    const { api } = currentApi;
    if (!api) {
        throw new Error('No API client');
    }

    const { data } = await api.axiosInstance.get<PersonIndexPage>(
        `${api.basePath}/Discover/People`,
        {
            params: {
                parentId: parentId ?? undefined,
                kind: personType,
                sort,
                startIndex,
                limit: PERSON_INDEX_PAGE_SIZE,
                nameStartsWith: letter ?? undefined,
                includeLetters: startIndex === 0 ? true : undefined
            },
            headers: { Authorization: api.authorizationHeader },
            signal: options?.signal
        }
    );
    return data;
};

/**
 * Pages through a library's people of one kind from the plugin's people index. The server sorts,
 * filters by first letter and counts, so the client only ever holds the pages it has shown.
 */
export const useGetPersonIndex = (
    parentId: ParentId,
    personType: PersonKind | undefined,
    sort: PersonIndexSort,
    letter: string | null
) => {
    const currentApi = useApi();
    return useInfiniteQuery({
        queryKey: ['PersonIndex', parentId, personType, sort, letter],
        initialPageParam: 0,
        queryFn: ({ pageParam, signal }) =>
            fetchPersonIndexPage(currentApi, parentId, personType!, sort, letter, pageParam, { signal }),
        getNextPageParam: getNextPersonIndexStart,
        // An older plugin answers 404 for good; do not retry that, or a single transient error.
        retry: (failureCount, error) => !isPersonIndexMissing(error) && failureCount < 1,
        // Refetching an infinite list re-requests every page loaded so far; the index changes
        // slowly, so keep what was fetched for a few minutes instead.
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!currentApi.api && !!parentId && !!personType
    });
};
