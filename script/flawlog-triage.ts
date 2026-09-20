// lanes every line of a flawlog file through jev before the halt flush reads it.
// usage: pnpm jev:flawlog [<flawlog path>]   (default: the newest file in the shelf)
import { readFileSync, readdirSync } from 'node:fs';

import { judge } from './lib/jev.ts';
import { laneCells, printTable, tailLine } from './lib/jev-print.ts';
import { flawlogQuestions } from './lib/jev-questions.ts';

const dir = `${process.env.HOME}/.claude/shelf/flawlog`;
const path =
    process.argv[2] ??
    `${dir}/${readdirSync(dir)
        .filter((f) => f.endsWith('.md'))
        .sort()
        .at(-1)}`;

const lines = readFileSync(path, 'utf8')
    .split('\n')
    .filter((l) => l.startsWith('- '))
    .map((l) => l.slice(2));

let tokens = 0;
const rows: string[][] = [];
for (const line of lines) {
    const res = await judge(
        { line, log: path.split('/').at(-1) },
        flawlogQuestions,
    );
    tokens += res.usage.input_tokens;
    const { lane } = res.answers;
    rows.push(
        laneCells(lane.choice, lane.confidence, lane.probabilities, line),
    );
}
printTable(rows);
console.log(tailLine(lines.length, 'lines', tokens));
