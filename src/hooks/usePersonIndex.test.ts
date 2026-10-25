import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it, vi } from 'vitest';

// The hook module pulls in the whole API context; only its pure helpers are tested here.
vi.mock('./useApi', () => ({ useApi: () => ({}) }));

import { getNextPersonIndexStart, isPersonIndexMissing, type PersonIndexPage } from './usePersonIndex';

const page = (startIndex: number, count: number, total: number): PersonIndexPage => ({
    Total: total,
    StartIndex: startIndex,
    Items: Array.from({ length: count }, (_, i) => ({ Id: `${startIndex + i}`, Name: `P${startIndex + i}`, Count: 1 }))
});

const httpError = (status: number) => new AxiosError('failed', 'ERR', undefined, undefined, {
    status,
    statusText: '',
    data: undefined,
    headers: {},
    config: { headers: new AxiosHeaders() }
});

describe('getNextPersonIndexStart', () => {
    it('continues after the last person of the page', () => {
        expect(getNextPersonIndexStart(page(0, 100, 250))).toBe(100);
        expect(getNextPersonIndexStart(page(200, 50, 250))).toBeUndefined();
    });

    it('stops on an empty page even if the total says there is more', () => {
        expect(getNextPersonIndexStart(page(100, 0, 500))).toBeUndefined();
    });
});

describe('isPersonIndexMissing', () => {
    it('is true when the server has no such endpoint', () => {
        expect(isPersonIndexMissing(httpError(404))).toBe(true);
        expect(isPersonIndexMissing(httpError(405))).toBe(true);
    });

    it('is false for temporary failures and other errors', () => {
        expect(isPersonIndexMissing(httpError(500))).toBe(false);
        expect(isPersonIndexMissing(httpError(401))).toBe(false);
        expect(isPersonIndexMissing(new Error('network'))).toBe(false);
    });
});
