// Bundle ids are unreadable — com.todesktop.230313mzl4w4u92 is Cursor. LaunchServices knows
// the display name, and mdfind reads its index without launching the app or asking for any
// permission (~25 ms per id, resolved once per process). osascript's inverse lookup would
// launch apps, so it is not used. An id Spotlight cannot place is returned as it is.
//
// Shared by `hotkeys:top` and the chords stats api on purpose: the page must show the same
// names the terminal does, and a second copy of the query would be a second escaping decision.
import { execFileSync } from 'node:child_process';
import { basename } from 'node:path';

const cache = new Map<string, string>();
// Bundle ids arrive from a file on disk and are spliced into an mdfind query, so anything
// outside the characters a real bundle id uses is refused rather than escaped.
const plain = /^[A-Za-z0-9._-]+$/;

export const appName = (id: string) => {
    const hit = cache.get(id);

    if (hit !== undefined) return hit;

    let name = id;

    if (plain.test(id)) {
        try {
            const found = execFileSync(
                'mdfind',
                [`kMDItemCFBundleIdentifier == '${id}'`],
                { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
            )
                .split('\n')[0]
                ?.trim();

            if (found) name = basename(found, '.app');
        } catch {
            // Spotlight off or the app is gone — the id is still a usable label.
        }
    }

    cache.set(id, name);

    return name;
};

// The read a request takes: whatever the warm-up has resolved, and the bundle id until it has.
// The first /api/stats after a daemon boot raced warmAppNames and resolved the remainder itself
// — 2.5 s against 0.21 s warm. An always-on server may not block on Spotlight, so the cold
// answer carries ids and the next request carries names.
export const cachedAppName = (id: string) => cache.get(id) ?? id;

// A cold cache costs about five seconds across the ~185 ids a month of log holds, and every
// one of those is a synchronous mdfind. In an always-on daemon that belongs at boot rather
// than inside the first request — and it yields between ids so the server keeps answering
// while it runs.
export const warmAppNames = async (ids: Iterable<string>) => {
    for (const id of new Set(ids)) {
        await new Promise((next) => setImmediate(next));
        appName(id);
    }
};
