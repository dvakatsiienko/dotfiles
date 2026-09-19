/**
 * hotkeys:audit — does macOS still hold the hotkey settings we committed?
 *
 *   node ./hotkeys/macos-audit.ts             diff live against hotkeys/macos/, exit 1 on any drift
 *   node ./hotkeys/macos-audit.ts --snapshot  rewrite the snapshot from live, once dima approves a diff
 *
 * The three domains are where every system-level chord lives, and macOS rewrites them behind
 * our back: an OS update seeds new symbolic hotkeys with apple's defaults, and a stray click in
 * System Settings flips one. The snapshot is the record of what we decided; this is the check
 * that the decision survived.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { bold, dim, done, note, warn } from '../script/lib/print.ts';

const DOMAIN_LIST = [
    'com.apple.symbolichotkeys',
    'com.apple.universalaccess',
    'com.apple.speech.synthesis.general.prefs',
] as const;

const SNAPSHOT_DIR = join(import.meta.dirname, 'macos');

const audit = () => {
    const scratch = mkdtempSync(join(tmpdir(), 'hotkeys-audit-'));

    try {
        if (process.argv.includes('--snapshot')) return snapshot(scratch);

        return report(DOMAIN_LIST.map((domain) => review(domain, scratch)));
    } finally {
        rmSync(scratch, { force: true, recursive: true });
    }
};

/* Helpers */
// `defaults export` is the only reader that sees what cfprefsd holds; reading the file under
// ~/Library/Preferences directly can hand back a stale copy the daemon has not flushed.
const exportDomain = (domain: string, into: string) => {
    const path = join(into, `${domain}.plist`);

    execFileSync('defaults', ['export', domain, path]);

    return path;
};

// `plutil -convert json` refuses any plist holding <data> or <date>, and universalaccess holds
// both — so the whole-file comparison reads xml, the one format every value survives. A drift
// detector with a blind spot is the bug it was written to catch.
const readXml = (path: string) =>
    execFileSync('plutil', ['-convert', 'xml1', '-o', '-', path], {
        encoding: 'utf8',
    });

// The unit of comparison is a top-level key and the xml block under it: that is the grain a
// reader thinks in ("universalaccess changed AccessibilityReaderEnabled"), and it needs no
// plist parser to compute.
const readBlockMap = (xml: string): Record<string, string> => {
    const body = xml.slice(xml.indexOf('<dict>') + '<dict>'.length);
    const tokenList = [
        ...body.matchAll(/<key>([^<]*)<\/key>|<(\/?)(dict|array)>/g),
    ];
    const blockMap: Record<string, string> = {};
    let depth = 0;
    let openKey: string | null = null;
    let from = 0;

    for (const token of tokenList) {
        if (token[3]) {
            depth += token[2] === '/' ? -1 : 1;

            if (depth < 0) break;

            continue;
        }

        if (depth !== 0) continue;

        if (openKey !== null) {
            blockMap[openKey] = body.slice(from, token.index).trim();
        }

        openKey = token[1] ?? '';
        from = token.index + token[0].length;
    }

    if (openKey !== null) {
        const end = body.lastIndexOf('</dict>');
        blockMap[openKey] = body
            .slice(from, end === -1 ? undefined : end)
            .trim();
    }

    return blockMap;
};

// Only the two keys the report speaks about in their own vocabulary are read structurally;
// everything else is compared as its xml block, which is enough to name it.
const extract = (path: string, key: string): Value => {
    try {
        return JSON.parse(
            execFileSync('plutil', ['-extract', key, 'json', '-o', '-', path], {
                encoding: 'utf8',
            }),
        );
    } catch {
        return null;
    }
};

const STRUCTURED_KEYS = ['AppleSymbolicHotKeys', 'UserAssignableHotKeys'];

// Keys that live in these domains without being hotkey settings, and that move on their own.
// Each one earns its place by having actually fired a false difference — never by guess, or
// the list becomes the blind spot. A tool that cries drift every run stops being read.
const IGNORED_KEYS = new Set([
    // the pointer's last position per display; changes whenever dima uses the machine
    'displaysLastCursorLocation',
]);

const review = (domain: string, scratch: string): Review => {
    const livePath = exportDomain(domain, scratch);
    const savedPath = join(SNAPSHOT_DIR, `${domain}.plist`);
    const liveBlock = readBlockMap(readXml(livePath));
    const savedBlock = readBlockMap(readXml(savedPath));
    const live: Record<string, Value> = {};
    const changeList: Change[] = [];

    for (const key of STRUCTURED_KEYS) {
        if (!(key in liveBlock) && !(key in savedBlock)) continue;

        live[key] = extract(livePath, key);
        changeList.push(...diff(extract(savedPath, key), live[key], [key]));
    }

    // Everything outside those two: the xml block is the value, and a difference is named
    // rather than explained. Enough to send a reader to `defaults read <domain> <key>`.
    const keyList = [
        ...new Set([...Object.keys(savedBlock), ...Object.keys(liveBlock)]),
    ].sort();

    for (const key of keyList) {
        if (STRUCTURED_KEYS.includes(key) || IGNORED_KEYS.has(key)) continue;

        const before = savedBlock[key];
        const after = liveBlock[key];

        if (before === after) continue;
        if (before === undefined) {
            changeList.push({ after, kind: 'added', path: [key] });
            continue;
        }
        if (after === undefined) {
            changeList.push({ before, kind: 'removed', path: [key] });
            continue;
        }

        changeList.push({ after, before, kind: 'changed', path: [key] });
    }

    return { changeList, domain, live };
};

const diff = (before: Value, after: Value, path: string[] = []): Change[] => {
    if (isRecord(before) && isRecord(after)) {
        const keyList = [
            ...new Set([...Object.keys(before), ...Object.keys(after)]),
        ].sort();

        return keyList.flatMap((key) => {
            if (!(key in after)) {
                return [
                    {
                        before: before[key],
                        kind: 'removed',
                        path: [...path, key],
                    } as const,
                ];
            }
            if (!(key in before)) {
                return [
                    {
                        after: after[key],
                        kind: 'added',
                        path: [...path, key],
                    } as const,
                ];
            }

            return diff(before[key], after[key], [...path, key]);
        });
    }

    if (Array.isArray(before) && Array.isArray(after)) {
        const length = Math.max(before.length, after.length);

        return Array.from({ length }, (_, index) => index).flatMap((index) => {
            if (index >= after.length) {
                return [
                    {
                        before: before[index],
                        kind: 'removed',
                        path: [...path, String(index)],
                    } as const,
                ];
            }
            if (index >= before.length) {
                return [
                    {
                        after: after[index],
                        kind: 'added',
                        path: [...path, String(index)],
                    } as const,
                ];
            }

            return diff(before[index], after[index], [...path, String(index)]);
        });
    }

    if (JSON.stringify(before) === JSON.stringify(after)) return [];

    return [{ after, before, kind: 'changed', path }];
};

// One diff engine, three readings. A path is turned back into the vocabulary of the domain it
// came from, so a reader sees "id 35 — enabled" rather than a json pointer.
const toLabel = (change: Change, live: Value): string => {
    const [head, second, ...rest] = change.path;

    if (head === 'AppleSymbolicHotKeys' && second) {
        const tail = rest.join('.');

        return tail ? `id ${second} — ${tail}` : `id ${second}`;
    }

    if (head === 'UserAssignableHotKeys' && second) {
        const entry = readEntry(live, second);
        const which = entry ? `sybmolichotkey ${entry}` : `entry ${second}`;
        const tail = rest.join('.');

        return tail ? `${which} — ${tail}` : which;
    }

    return change.path.join('.');
};

const readEntry = (live: Value, index: string) => {
    if (!isRecord(live)) return null;

    const list = live.UserAssignableHotKeys;

    if (!Array.isArray(list)) return null;

    const entry = list[Number(index)];

    return isRecord(entry) ? String(entry.sybmolichotkey) : null;
};

const toLine = (change: Change, live: Value) => {
    const label = toLabel(change, live);

    if (change.kind === 'added') {
        return `${label} — ${bold('NEW')}, absent from the snapshot`;
    }
    if (change.kind === 'removed') {
        return `${label} — gone from live, still in the snapshot`;
    }

    return `${label}: ${dim(brief(change.before))} → ${bold(brief(change.after))}`;
};

// A whole xml block printed raw buries the one line that matters. The name plus a glimpse is
// what a reader acts on; `defaults read <domain> <key>` is the rest.
const brief = (value: Value) => {
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    const flat = String(text).replace(/\s+/g, ' ').trim();

    return flat.length > 72 ? `${flat.slice(0, 69)}…` : flat;
};

const report = (reviewList: Review[]) => {
    const total = reviewList.reduce(
        (sum, review) => sum + review.changeList.length,
        0,
    );

    if (total === 0) {
        done(`${DOMAIN_LIST.length} domains match the snapshot`);
        return 0;
    }

    for (const review of reviewList) {
        if (review.changeList.length === 0) continue;

        console.log(`\n${bold(review.domain)}`);

        for (const change of review.changeList) {
            console.log(`  • ${toLine(change, review.live)}`);
        }
    }

    warn(
        `\n${total} difference(s). Approve them, then re-snapshot: pnpm hotkeys:audit --snapshot`,
    );

    return 1;
};

const snapshot = (scratch: string) => {
    for (const domain of DOMAIN_LIST) {
        const target = join(SNAPSHOT_DIR, `${domain}.plist`);

        exportDomain(domain, scratch);
        execFileSync('defaults', ['export', domain, target]);
        note(`${domain} — snapshot rewritten`);
    }

    done('snapshot now matches live; commit it with the change that caused it');

    return 0;
};

const isRecord = (value: Value): value is Record<string, Value> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/* Types */
type Value = unknown;

interface Change {
    after?: Value;
    before?: Value;
    kind: 'added' | 'changed' | 'removed';
    path: string[];
}

interface Review {
    changeList: Change[];
    domain: string;
    live: Value;
}

process.exitCode = audit();
