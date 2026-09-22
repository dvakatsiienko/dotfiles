/**
 * jev:vet — the trial period of every jev flow. `pnpm jev:vet` prints each flow's streak;
 * `pnpm jev:vet ok|miss <flow> <note>` records cclio's verdict on one jev answer (the halt loop
 * calls it per disagreement, and once per clean day). logic and the registry shape live in
 * `script/lib/jev-vet.ts`.
 */

/* Instruments */
import { lastVerdictDay } from './lib/jev-report.ts';
import {
    registryRead,
    registryWrite,
    statusLines,
    verdictApply,
    verdictLog,
} from './lib/jev-vet.ts';

const [verdict, flow, ...noteWords] = process.argv.slice(2);
const today = new Date().toISOString().slice(0, 10);
const registry = registryRead();

// `lane=<x>` anywhere in the note credits that lane's precision; `spot` marks a spot-check
if (verdict === 'ok' || verdict === 'miss') {
    if (!flow)
        throw new Error(
            'usage: jev:vet ok|miss <flow> [lane=<x>] [spot] <note>',
        );
    const lane = noteWords.find((w) => w.startsWith('lane='))?.slice(5);
    const isSpot = noteWords.includes('spot');
    const note = noteWords.join(' ') || '-';
    const next = verdictApply(registry, flow, verdict, today, lane);
    const flowNext = next.flows[flow];
    registryWrite(
        isSpot && flowNext
            ? {
                  ...next,
                  flows: {
                      ...next.flows,
                      [flow]: { ...flowNext, spotCheckedAt: today },
                  },
              }
            : next,
    );
    verdictLog(flow, verdict, note);
    console.log(
        `${verdict} recorded for ${flow}${lane ? ` (lane ${lane})` : ''}`,
    );
}

const current = registryRead();
for (const line of statusLines(current, today)) console.log(line);
for (const name of Object.keys(current.flows)) {
    const last = lastVerdictDay(name);
    if (last !== today)
        console.log(`   ${name}: no verdict since ${last ?? 'ever'}`);
}
