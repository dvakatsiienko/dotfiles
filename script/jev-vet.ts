/**
 * jev:vet — the trial period of every jev flow. `pnpm jev:vet` prints each flow's streak;
 * `pnpm jev:vet ok|miss <flow> <note>` records cclio's verdict on one jev answer (the halt loop
 * calls it per disagreement, and once per clean day). logic and the registry shape live in
 * `script/lib/jev-vet.ts`.
 */

/* Instruments */
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

if (verdict === 'ok' || verdict === 'miss') {
    if (!flow) throw new Error('usage: jev:vet ok|miss <flow> <note>');
    const note = noteWords.join(' ') || '-';
    registryWrite(verdictApply(registry, flow, verdict, today));
    verdictLog(flow, verdict, note);
    console.log(`${verdict} recorded for ${flow}`);
}

for (const line of statusLines(registryRead(), today)) console.log(line);
