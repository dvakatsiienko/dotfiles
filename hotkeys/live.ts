// Feeds the live half of map.html: how often each chord has actually been pressed.
//   node ./hotkeys/live.ts [--watch]
//
// The page cannot fetch a sibling file over file://, so the counts travel the same road the
// bindings do — a script the page re-inserts on a timer. Two seeds, not one: bindings change
// when an app's preferences change, counts change every time Dima presses anything, and
// rewriting the 12 kB binding seed twice a second to carry a number would be silly.
//
// The daemon stays dumb on purpose. It appends one jsonl line per chord and knows nothing about
// this file, the page, or the seed format — everything the map shows is derived here, from the
// log it already writes. A page format that reached into main.swift would need a swift rebuild,
// a codesign and an Input Monitoring re-grant every time the map wanted a new number.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { parseEvents } from './stats.ts';

const DATA = join(homedir(), '.local/share/x-monitor-hotkey-stats');
const SEED = join(import.meta.dirname, 'presses.js');
const EVERY_MS = 2000;

const readCounts = () => {
    const counts: Record<string, number> = {};

    for (const name of readdirSync(DATA).filter((n) => n.endsWith('.jsonl'))) {
        for (const event of parseEvents(
            readFileSync(join(DATA, name), 'utf8'),
        )) {
            if (event.kind !== 'chord' || !event.chord) continue;

            counts[event.chord] = (counts[event.chord] ?? 0) + 1;
        }
    }

    return counts;
};

const writeSeed = () => {
    const counts = readCounts();
    const payload = { counts, updatedAt: new Date().toISOString() };

    writeFileSync(SEED, `window.hotkeyPresses = ${JSON.stringify(payload)};\n`);

    return Object.keys(counts).length;
};

const chordCount = writeSeed();

if (process.argv.includes('--watch')) {
    console.log(
        `watching ${DATA} — presses.js every ${EVERY_MS / 1000}s, ctrl-c to stop`,
    );
    setInterval(writeSeed, EVERY_MS);
} else {
    console.log(`presses.js — ${chordCount} chords pressed so far`);
}
