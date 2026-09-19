// dry run: lanes every inbox item through jev and prints them next to the expected lane.
// usage: script/op-run.sh node script/inbox-triage.ts
import { readFileSync } from 'node:fs';

import { judge } from './lib/jev.ts';
import { inboxQuestions, verdictBand } from './lib/jev-questions.ts';

const inboxPath = `${process.env.HOME}/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Dima's Vault/prompts/inbox.md`;

// an item is a `**title**` block under a `## section` header; the section is context, not a lane
function parseInbox(md: string) {
    const items: { section: string; title: string; text: string }[] = [];
    let section = '';
    let current: (typeof items)[number] | null = null;
    for (const line of md.split('\n')) {
        const header = line.match(/^## (.+)/)?.[1];
        if (header) {
            section = header.trim();
            current = null;
            continue;
        }
        const title = line.match(/^\s*\*\*(.+?)\*\*\s*$/)?.[1];
        if (title) {
            current = { section, text: '', title };
            items.push(current);
            continue;
        }
        if (current && !line.startsWith('>') && line.trim() !== '---')
            current.text += `${line}\n`;
    }
    return items.map((i) => ({ ...i, text: i.text.trim() }));
}

const runs = Number(process.env.RUNS ?? 1);
const items = parseInbox(readFileSync(inboxPath, 'utf8'));
let tokens = 0;
for (const item of items) {
    for (let run = 0; run < runs; run++) {
        const res = await judge(
            { item: `${item.title}: ${item.text}`, section: item.section },
            inboxQuestions,
        );
        tokens += res.usage.input_tokens;
        const { lane, needsVerdict } = res.answers;
        const p = Object.entries(lane.probabilities)
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => `${k} ${Math.round(v * 100)}`)
            .join(' · ');
        const band =
            needsVerdict.noul > verdictBand.high
                ? '⏳ dima'
                : needsVerdict.noul < verdictBand.low
                  ? 'agent'
                  : '~ unsure';
        console.log(
            `${item.title.padEnd(14)} → ${lane.choice.padEnd(8)} conf ${Math.round(lane.confidence * 100)}  [${p}]  verdict ${needsVerdict.noul.toFixed(2)} ${band}`,
        );
    }
}
console.log(`\n${items.length} items · ${tokens} input tokens`);
