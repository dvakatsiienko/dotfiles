// The press log on disk: which files it is made of, and the events inside them. The swift
// monitor appends one jsonl per month and every reader on this side wants the same two things,
// so they ask here rather than each spelling out the same directory walk.
//
// 📌 The directory may not exist, and that is the whole reason this file exists. The monitor
// creates it when it records its first press, so a machine where the job has never run — or has
// been disabled, or is pointed at a fixture path that is wrong — has no directory at all, and
// `readdirSync` answers that with a throw. `top.ts` had guarded it since a day it cost someone;
// the daemon had not, and pointed at a missing directory it died during startup. For an
// always-on launchd job that is not an error message, it is a crash loop.
//
// An absent log and an empty one mean the same thing to every caller: nothing has been pressed
// yet. Neither is a failure, so neither throws.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { type LogEvent, parseEvents } from './stats.ts';

export const logFiles = (dataDir: string): string[] => {
    try {
        return readdirSync(dataDir).filter((name) => name.endsWith('.jsonl'));
    } catch {
        return [];
    }
};

export const readLog = (dataDir: string): LogEvent[] =>
    logFiles(dataDir).flatMap((name) =>
        parseEvents(readFileSync(join(dataDir, name), 'utf8')),
    );
