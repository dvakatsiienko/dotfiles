/**
 * hotkey-monitor:top — what the x-hotkey-stats-monitor daemon recorded. Top chords, the apps they
 * were pressed in, app switches, and the bindings that exist but never get pressed.
 * Aggregation lives in `stats.ts`; the daemon that fills the log is `main.swift`.
 */

import { execFileSync } from 'node:child_process';
/* Core */
import { readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';

/* Instruments */
import { chordOf } from '../lib/hotkeys-chord.ts';
import type { Hotkey } from '../lib/hotkeys-manual.ts';
import { bold, dim, done, note, step, title, warn, yb } from '../lib/print.ts';
import {
    type LogEvent,
    type Tally,
    byApp,
    byChord,
    ofKind,
    parseEvents,
    selectEvents,
    tally,
    unpressed,
} from './stats.ts';

const DATA = join(homedir(), '.local/share/x-hotkey-stats-monitor');

const HELP = `
hotkey-monitor:top — read the chord and app-switch log

  pnpm hotkey-monitor:top [options]

  --days <n>       how far back to look, in days           (default 30)
  --app <text>     only events whose bundle id contains    (default all apps)
                   this text, case-insensitive
  --ignore <chord> drop a chord from the window entirely;
                   repeatable, or comma-separated          (default none)
                   e.g. --ignore opt+esc,shift+cmd+4
  --limit <n>      rows per section, 0 for every row        (default 15)
  --help           this text

  Log: ~/.local/share/x-hotkey-stats-monitor/YYYY-MM.jsonl
`;

if (process.argv.includes('--help')) {
    console.log(HELP.trim());
    process.exit(0);
}

const flag = (name: string) => {
    const at = process.argv.indexOf(`--${name}`);
    return at === -1 ? undefined : process.argv[at + 1];
};

const flagAll = (name: string) =>
    process.argv.flatMap((arg, at) =>
        arg === `--${name}` ? (process.argv[at + 1]?.split(',') ?? []) : [],
    );

const days = flag('days') ? Number(flag('days')) : 30;
const app = flag('app');
// A section truncates by default, so every row past the cap is unreachable at
// any terminal height — `--limit 0` is the way to see all of them.
const capped = Number(flag('limit') ?? 15);
const ignore = flagAll('ignore');

if (!Number.isFinite(days) || days <= 0) {
    console.error('--days wants a positive number');
    process.exit(1);
}

if (!Number.isInteger(capped) || capped < 0) {
    console.error('--limit wants a whole number, 0 or more');
    process.exit(1);
}

const limit = capped === 0 ? Number.POSITIVE_INFINITY : capped;

const readLog = (): LogEvent[] => {
    let files: string[];
    try {
        files = readdirSync(DATA).filter((name) => name.endsWith('.jsonl'));
    } catch {
        return [];
    }
    return files.flatMap((name) =>
        parseEvents(readFileSync(join(DATA, name), 'utf8')),
    );
};

const readBindings = (): Hotkey[] => {
    try {
        const raw = execFileSync(
            process.execPath,
            [join(import.meta.dirname, '..', 'hotkeys-scan.ts')],
            { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
        );
        return JSON.parse(raw).hotkeys as Hotkey[];
    } catch {
        return [];
    }
};

// Bundle ids are unreadable — com.todesktop.230313mzl4w4u92 is Cursor. LaunchServices knows
// the display name, and mdfind reads its index without launching the app or asking for any
// permission (~25 ms per id, resolved once per run). osascript's inverse lookup would launch
// apps, so it is not used. An id Spotlight cannot place prints as it is.
const appName = (() => {
    const cache = new Map<string, string>();
    // Bundle ids arrive from a file on disk and are spliced into an mdfind query, so anything
    // outside the characters a real bundle id uses is refused rather than escaped.
    const plain = /^[A-Za-z0-9._-]+$/;
    return (id: string) => {
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
})();

const bar = (count: number, top: number) =>
    '█'.repeat(Math.max(1, Math.round((count / top) * 18)));

const table = (
    rows: Tally[],
    label: (name: string) => string = (name) => name,
) => {
    const top = rows[0]?.count ?? 1;
    const pad = String(top).length;
    for (const row of rows.slice(0, limit)) {
        console.log(
            `  ${bold(String(row.count).padStart(pad))} ${dim(bar(row.count, top).padEnd(18))} ${label(row.name)}`,
        );
    }
    if (rows.length > limit) note(`… ${rows.length - limit} more`);
};

const all = readLog();
const window = selectEvents(all, { app, days, ignore });
const chords = ofKind(window, 'chord');
const switches = ofKind(window, 'activate');

const subtitle = [
    `${days} d`,
    app ? `app ~ ${app}` : '',
    ignore.length > 0 ? `ignoring ${ignore.join(', ')}` : '',
]
    .filter(Boolean)
    .join(' · ');

title('hotkey-monitor:top', subtitle);

if (all.length === 0) {
    warn('nothing logged yet', DATA.replace(homedir(), '~'));
    note(
        'is the daemon up?  launchctl print gui/$UID/com.dima.x-hotkey-stats-monitor',
    );
    done('nothing to report', { clean: false });
    process.exit(0);
}

step(`chords  ${dim(`${chords.length} presses`)}`);
table(tally(chords, byChord));

step('chords per app');
table(tally(chords, byApp), appName);

if (switches.length > 0) {
    step(`switches per app  ${dim(`${switches.length} activations`)}`);
    table(tally(switches, byApp), appName);
}

const bindings = readBindings();
if (bindings.length === 0) {
    step('bound but never pressed');
    warn('hotkeys:scan returned nothing — skipping the join');
} else {
    const cold = unpressed(bindings, chords);
    step(
        `bound but never pressed  ${dim(`${cold.length} of ${bindings.length}`)}`,
    );
    for (const hotkey of cold.slice(0, limit)) {
        console.log(
            `  ${yb(chordOf(hotkey).padEnd(22))} ${hotkey.action} ${dim(hotkey.app)}`,
        );
    }
    if (cold.length > limit) note(`… ${cold.length - limit} more`);
}

const plural = (n: number, one: string, many: string) =>
    `${n} ${n === 1 ? one : many}`;
done(
    [
        plural(chords.length, 'press', 'presses'),
        plural(tally(chords, byChord).length, 'chord', 'chords'),
        plural(switches.length, 'switch', 'switches'),
    ].join(' · '),
);
