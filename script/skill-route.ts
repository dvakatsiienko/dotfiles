// probe: can jev pick the x:* skill a prompt needs, from the skills' own descriptions?
// usage: script/op-run.sh node script/skill-route.ts            → the probe set
//        script/op-run.sh node script/skill-route.ts '<prompt>' → live: prints the loads, logs the pick
import { appendFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';

import type { Question } from './lib/jev.ts';
import { judge } from './lib/jev.ts';

// frontmatter description is one line, or a `>-` folded block of indented lines
function readDescription(md: string) {
    const lines = md.split('\n');
    const at = lines.findIndex((l) => l.startsWith('description:'));
    if (at < 0) return undefined;
    const first = lines[at]?.slice('description:'.length).trim() ?? '';
    if (!first.startsWith('>')) return first;
    const folded: string[] = [];
    for (const l of lines.slice(at + 1)) {
        if (!l.startsWith(' ')) break;
        folded.push(l.trim());
    }
    return folded.join(' ');
}

const routeThreshold = 0.6;
const logPath = `${process.env.HOME}/.claude/shelf/jev/route.log`;
mkdirSync(`${process.env.HOME}/.claude/shelf/jev`, { recursive: true });

const pluginDirs = {
    cclio: `${process.env.HOME}/dotfiles/cclio/plugin-cclio/skills`,
    x: `${process.env.HOME}/dotfiles/home/.claude/plugin-x/skills`,
};

const skills = Object.entries(pluginDirs).flatMap(([prefix, dir]) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        if (!entry.isDirectory()) return [];
        const md = readFileSync(`${dir}/${entry.name}/SKILL.md`, 'utf8');
        const description = readDescription(md);
        return description
            ? [{ description, name: `${prefix}:${entry.name}` }]
            : [];
    }),
);

const questions = Object.fromEntries(
    skills.map((s) => [
        s.name,
        {
            criteria: {
                false: 'The prompt asks for none of that.',
                true: s.description,
            },
            instructions: `Should the skill \`${s.name}\` be loaded before acting on \`prompt\`?`,
            type: 'noul',
        },
    ]),
) as Record<string, Question>;

const probes = [
    ['commit this and slay', 'x:cmt'],
    ['walk me through the rubric on real inbox lines', 'x:walkthrough'],
    ['read BYT-41 and fold today’s state into the body', 'x:pm'],
    ['does the chart render at mobile width?', 'x:browser-headless'],
    ['what entry options do i have in 1p?', '—'],
    ['append to inbox: try windscribe as the vpn fallback', 'x:notes'],
    ['1. flawlog flush, four lines ➡️ yes', 'cclio:flawlog'],
    ['park the rule for the week, then checkpoint', 'cclio:checkpoint'],
    ['sup, where are we', 'cclio:report'],
] as const;

const live = process.argv[2];
if (live) {
    const res = await judge({ prompt: live }, questions);
    const ranked = Object.entries(res.answers)
        .map(([name, a]) => [name, 'noul' in a ? a.noul : 0] as const)
        .sort((a, b) => b[1] - a[1]);
    const loads = ranked.filter(([, p]) => p >= routeThreshold).map(([n]) => n);
    const top = ranked[0];
    appendFileSync(
        logPath,
        `${new Date().toISOString()}\t${top?.[0]} ${top?.[1].toFixed(2)}\t${loads.join(',') || '-'}\t${live.slice(0, 80).replace(/\s+/g, ' ')}\n`,
    );
    if (loads.length) console.log(`skills (jev router): ${loads.join(', ')}`);
    process.exit(0);
}

for (const [prompt, expected] of probes) {
    const res = await judge({ prompt }, questions);
    const ranked = Object.entries(res.answers)
        .map(([name, a]) => [name, 'noul' in a ? a.noul : 0] as const)
        .sort((a, b) => b[1] - a[1]);
    const top = ranked.slice(0, 3).map(([n, p]) => `${n} ${p.toFixed(2)}`);
    const hit =
        ranked[0]?.[0] === expected ||
        (expected === '—' && (ranked[0]?.[1] ?? 0) < 0.5);
    console.log(
        `${hit ? '✅' : '❌'} ${prompt.padEnd(48)} want ${expected.padEnd(16)} got ${top.join(' · ')}`,
    );
}
console.log(`\n${skills.length} skills as nouls per request`);
