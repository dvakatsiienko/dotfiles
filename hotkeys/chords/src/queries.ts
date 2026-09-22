import { QueryClient, useQuery } from '@tanstack/react-query';

import { type WindowName, fetchNotes, fetchScan, fetchStats } from '@/api.ts';

// The cache behind the two routes. Before this, `shell.tsx` unmounted a page on every
// navigation and each page refetched from its mount effect — board pulled the scan and the
// notes, stats reparsed the whole press log. Switching tabs twice paid for all of it twice.
//
// 📌 Nothing here goes stale on a timer, and that is the whole design. This app already has a
// better invalidation signal than any `staleTime` could be: the daemon pushes a `bindings`
// event the moment a config source moves, and a `presses` event on every chord. A timer would
// only ever refetch data that is still true, or miss a change that already happened. So the
// cache holds until the stream says otherwise, and the pages invalidate by key.
export const makeQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                // The daemon is on 127.0.0.1 and tells us when to look again.
                gcTime: Number.POSITIVE_INFINITY,
                refetchOnWindowFocus: false,
                retry: false,
                staleTime: Number.POSITIVE_INFINITY,
            },
        },
    });

// `stats` is the prefix every window's report shares: the stream does not know which window is
// on screen, so it invalidates the family and whichever one is mounted refetches.
export const queryKeys = {
    notes: ['notes'] as const,
    scan: ['scan'] as const,
    stats: ['stats'] as const,
    statsWindow: (window: WindowName) => ['stats', window] as const,
};

export const useScan = () =>
    useQuery({ queryFn: fetchScan, queryKey: queryKeys.scan });

export const useNotes = () =>
    useQuery({ queryFn: fetchNotes, queryKey: queryKeys.notes });

// `placeholderData` keeps the previous window's report on screen while the next one loads, so
// the lists do not collapse to empty and shove the page around under the reader — the same
// reason DESIGN.md gives for an empty state occupying the grid its rows will fill.
export const useStats = (window: WindowName) =>
    useQuery({
        placeholderData: (previous) => previous,
        queryFn: () => fetchStats(window),
        queryKey: queryKeys.statsWindow(window),
    });
