/**
 * hotkeys:top — what the hotkey-stats daemon actually recorded. Top chords, top apps, and the
 * bindings that exist but never get pressed (joined against `pnpm hotkeys:scan`).
 *   pnpm hotkeys:top --days 30 --app cursor
 * aggregation lives in `script/lib/hotkeys-stats.ts`; the daemon that fills the log is
 * `script/hotkey-stats/main.swift`.
 */

/* Core */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/* Instruments */
import { chordOf } from './lib/hotkeys-chord.ts';
import type { Hotkey } from './lib/hotkeys-manual.ts';
import {
    type Press,
    type Tally,
    byApp,
    byChord,
    parsePresses,
    selectPresses,
    tally,
    unpressed,
} from './lib/hotkeys-stats.ts';
import { bold, dim, done, note, step, title, warn, yb } from './lib/print.ts';

const DATA = join(homedir(), '.local/share/hotkey-stats');

const flag = (name: string) => {
    const at = process.argv.indexOf(`--${name}`);
    return at === -1 ? undefined : process.argv[at + 1];
};

const days = flag('days') ? Number(flag('days')) : 30;
const app = flag('app');
const limit = flag('limit') ? Number(flag('limit')) : 15;

if (!Number.isFinite(days) || days <= 0) {
    console.error('--days wants a positive number');
    process.exit(1);
}

const readLog = (): Press[] => {
    let files: string[];
    try {
        files = readdirSync(DATA).filter((name) => name.endsWith('.jsonl'));
    } catch {
        return [];
    }
    return files.flatMap((name) =>
        parsePresses(readFileSync(join(DATA, name), 'utf8')),
    );
};

const readBindings = (): Hotkey[] => {
    try {
        const raw = execFileSync(
            process.execPath,
            [join(import.meta.dirname, 'hotkeys-scan.ts')],
            { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
        );
        return JSON.parse(raw).hotkeys as Hotkey[];
    } catch {
        return [];
    }
};

const bar = (count: number, top: number) =>
    '█'.repeat(Math.max(1, Math.round((count / top) * 18)));

const table = (rows: Tally[], label: (row: Tally) => string) => {
    const top = rows[0]?.count ?? 1;
    const pad = String(top).length;
    for (const row of rows.slice(0, limit)) {
        console.log(
            `  ${bold(String(row.count).padStart(pad))} ${dim(bar(row.count, top).padEnd(18))} ${label(row)}`,
        );
    }
};

const all = readLog();
const window = selectPresses(all, { app, days });

title('hotkeys:top', `${days} d${app ? ` · app ~ ${app}` : ''}`);

if (all.length === 0) {
    warn('no presses logged yet', DATA.replace(homedir(), '~'));
    note(
        'is the daemon running?  launchctl print gui/$UID/com.dima.hotkey-stats',
    );
    done('nothing to report', { clean: false });
    process.exit(0);
}

step(`chords  ${dim(`${window.length} presses`)}`);
table(tally(window, byChord), (row) => row.name);

step('apps');
table(tally(window, byApp), (row) => row.name);

const bindings = readBindings();
if (bindings.length === 0) {
    step('bound but never pressed');
    warn('hotkeys:scan returned nothing — skipping the join');
} else {
    const cold = unpressed(bindings, window);
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
        plural(window.length, 'press', 'presses'),
        plural(tally(window, byChord).length, 'chord', 'chords'),
        plural(tally(window, byApp).length, 'app', 'apps'),
    ].join(' · '),
);
