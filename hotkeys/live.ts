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
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { sourceList } from './sources.ts';
import { parseEvents } from './stats.ts';

const DATA = join(homedir(), '.local/share/x-monitor-hotkey-stats');
const SEED = join(import.meta.dirname, 'presses.js');
const SCAN = join(import.meta.dirname, 'scan.ts');
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

// This runs as an always-on launchd job, so the idle path has to cost nothing: the log is a
// month of lines (27k by mid-september) and re-parsing it every 2s to learn that nothing
// happened would burn cpu forever. One stat per file per tick answers that instead, and the
// seed is only rewritten when a press actually landed.
const logSignature = () =>
    readdirSync(DATA)
        .filter((name) => name.endsWith('.jsonl'))
        .map((name) => `${name}:${statSync(join(DATA, name)).mtimeMs}`)
        .join('|');

// The bindings go stale too: dima rebinds something in wispr or cursor and the map keeps
// drawing yesterday's keyboard until someone remembers `pnpm hotkeys:scan`. Same trick,
// different files — the scan's own source list, stat'd, and a change reruns it.
const sourceSignature = () =>
    sourceList
        .map(
            (path) =>
                `${path}:${statSync(path, { throwIfNoEntry: false })?.mtimeMs ?? 0}`,
        )
        .join('|');

// Run out of process: the scan opens five app config files through plutil, and a throw from
// any of them must not take the watcher down with it. scan.ts rewrites hotkeys.js as it runs.
const rescan = () => {
    try {
        execFileSync(process.execPath, [SCAN], {
            stdio: ['ignore', 'ignore', 'inherit'],
        });
        console.log(`bindings rescanned — ${new Date().toISOString()}`);
    } catch (error) {
        console.error(`scan failed — ${(error as Error).message}`);
    }
};

let lastSources = sourceSignature();
let lastSignature = logSignature();
const chordCount = writeSeed();

if (process.argv.includes('--watch')) {
    console.log(
        `watching ${DATA} and ${sourceList.length} config sources — checked every ${EVERY_MS / 1000}s`,
    );

    setInterval(() => {
        const sources = sourceSignature();

        if (sources !== lastSources) {
            lastSources = sources;
            rescan();
        }

        const signature = logSignature();

        if (signature === lastSignature) return;

        lastSignature = signature;
        writeSeed();
    }, EVERY_MS);
} else {
    console.log(`presses.js — ${chordCount} chords pressed so far`);
}
