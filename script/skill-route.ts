// probe: can jev pick the x:* skill a prompt needs, from the skills' own descriptions?
// usage: script/op-run.sh node script/skill-route.ts
import { readFileSync, readdirSync } from 'node:fs';

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

const skillsDir = `${process.env.HOME}/dotfiles/home/.claude/plugin-x/skills`;

const skills = readdirSync(skillsDir, { withFileTypes: true }).flatMap(
    (entry) => {
        if (!entry.isDirectory()) return [];
        const name = entry.name;
        const md = readFileSync(`${skillsDir}/${name}/SKILL.md`, 'utf8');
        const description = readDescription(md);
        return description ? [{ description, name }] : [];
    },
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
    ['commit this and slay', 'cmt'],
    ['walk me through the rubric on real inbox lines', 'walkthrough'],
    ['read BYT-41 and fold today’s state into the body', 'pm'],
    ['does the chart render at mobile width?', 'browser-headless'],
    ['what entry options do i have in 1p?', '—'],
    ['append to inbox: try windscribe as the vpn fallback', 'notes'],
] as const;

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
