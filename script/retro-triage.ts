// lanes every line of a flawlog file through jev before the halt flush reads it.
// usage: pnpm jev:retro [<flawlog path>]   (default: the newest file in the shelf)
import { readFileSync, readdirSync } from 'node:fs';

import { judge } from './lib/jev.ts';
import { retroQuestions } from './lib/jev-questions.ts';

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
for (const line of lines) {
    const res = await judge(
        { line, log: path.split('/').at(-1) },
        retroQuestions,
    );
    tokens += res.usage.input_tokens;
    const { lane } = res.answers;
    const p = Object.entries(lane.probabilities)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k} ${Math.round(v * 100)}`)
        .join(' · ');
    console.log(
        `${lane.choice.padEnd(7)} conf ${String(Math.round(lane.confidence * 100)).padStart(3)}  [${p}]  ${line.slice(0, 90)}`,
    );
}
console.log(`${lines.length} lines · ${tokens} input tokens`);
