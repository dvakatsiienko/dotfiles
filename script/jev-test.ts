/**
 * jev:test — the fixture suite of every jev flow. one jsonl per flow in `shelf/jev/fixtures/`,
 * a line = the state jev sees + the lane cclio gave. run before a criterion changes and at the
 * halt; a criterion edit that lowers a flow's precision is refused. the router's fixtures are its
 * own probe set (`pnpm jev:route`). usage: pnpm jev:test [flow…]
 */

/* Core */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/* Instruments */
import { judge } from './lib/jev.ts';
import { laneCells, printTable } from './lib/jev-print.ts';
import { flawlogQuestions, inboxQuestions } from './lib/jev-questions.ts';
import { bold, dim, gb, rb } from './lib/print.ts';

const FIXTURES = join(homedir(), '.claude', 'shelf', 'jev', 'fixtures');

const flows = {
    'flawlog-lanes': { answer: 'lane', questions: flawlogQuestions },
    'inbox-lanes': { answer: 'lane', questions: inboxQuestions },
} as const;

const picked = process.argv.slice(2).filter((a) => a in flows);
const names = (picked.length ? picked : Object.keys(flows)) as FlowName[];

let failed = false;
for (const name of names) {
    const flow = flows[name];
    const fixtures = readFileSync(join(FIXTURES, `${name}.jsonl`), 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((l) => JSON.parse(l) as Fixture);
    const byLane: Record<string, { hit: number; total: number }> = {};
    console.log(`\n${bold(name)} ${dim(`· ${fixtures.length} fixtures`)}`);
    const rows: string[][] = [];
    for (const fx of fixtures) {
        const res = await judge(fx.state, flow.questions);
        const lane = res.answers[flow.answer];
        const hit = lane.choice === fx.expect;
        const tally = byLane[fx.expect] ?? { hit: 0, total: 0 };
        byLane[fx.expect] = {
            hit: tally.hit + (hit ? 1 : 0),
            total: tally.total + 1,
        };
        const text = String(Object.values(fx.state)[0]);
        rows.push([
            hit ? '✅' : '❌',
            ...laneCells(
                lane.choice,
                lane.confidence,
                lane.probabilities,
                hit ? text : `${bold(`want ${fx.expect}`)}  ${text}`,
                70,
            ),
        ]);
    }
    printTable(rows);
    const total = Object.values(byLane).reduce((n, t) => n + t.total, 0);
    const hits = Object.values(byLane).reduce((n, t) => n + t.hit, 0);
    const perLane = Object.entries(byLane)
        .map(([l, t]) => `${l} ${t.hit}/${t.total}`)
        .join('  ');
    const paint = hits === total ? gb : rb;
    console.log(`${paint(bold(`${hits}/${total}`))}  ${dim(perLane)}`);
    if (hits < total) failed = true;
}
process.exit(failed ? 1 : 0);

/* Types */
type FlowName = keyof typeof flows;
type Fixture = { state: Record<string, string>; expect: string; note?: string };
