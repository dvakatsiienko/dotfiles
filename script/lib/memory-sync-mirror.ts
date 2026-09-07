/**
 * ? memory-sync mirror — renders the cc masters into cw memory entries.
 * ?
 * ? cw memory is a hosted store with no shell: one entry per master, body copied verbatim,
 * ? wrapped in the frontmatter cw expects. cw (`x-cw:memory-sync`) reads `manifest.json`,
 * ? compares the `source-sha256` stamped in each entry, and overwrites what changed.
 * ? no judgment on either side — the only transform is `- ` → `- [stated] ` on bullets,
 * ? which cw's memory guidance requires on fact lines.
 * ?
 * ? two shapes: an ENTRY is a whole cw file; a FRAGMENT is spliced into a cw-native entry
 * ? between `<!-- mirror:start -->` / `<!-- mirror:end -->` (only `/preferences.md` today —
 * ? the one auto-loaded entry, so voice + output-format must live there).
 * ?
 * ? `/preferences.md` is injected into every cw conversation and capped at 16 384 chars
 * ? (measured 2026-09-07; the write error names it). the full masters do not fit next to the
 * ? cw-native sections, so the fragment is rendered COMPACT: headers, bullets and marker-led
 * ? paragraphs kept whole, plain prose and html comments dropped. the full text of both
 * ? masters is mirrored as its own entry for on-demand reads. a mechanical rule, no judgment.
 */

/* Core */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';

export type Target = {
    /** cw memory path — `/areas/fleet-vibe.md` — or, for a fragment, the host entry */
    path: string;
    /** master files under home/.claude (or the gazette dir), relative to the dotfiles root */
    sources: string[];
    description: string;
    aliases?: string[];
    /** fragment targets splice into `path` instead of replacing it */
    fragment?: string;
    /** render with `compact()` — for the preferences fragment only */
    compact?: boolean;
    /** keep only these `## ` sections (plus the title block) — for masters that are partly cc-only */
    sections?: string[];
};

export type Rendered = {
    file: string;
    path: string;
    fragment?: string;
    sha256: string;
    /** file size — the byte marker cw compares */
    bytes: number;
    /** rendered length — what the cw caps count */
    chars: number;
    body: string;
};

export type Manifest = Record<
    string,
    {
        file: string;
        sha256: string;
        bytes: number;
        sources: string[];
        fragment?: string;
    }
>;

export const MARK_START = '<!-- mirror:start -->';
export const MARK_END = '<!-- mirror:end -->';

/** cw refuses `/preferences.md` above this many rendered chars (measured 2026-09-07). */
export const PREFERENCES_CAP = 16_384;
/** the fragment must leave room for the cw-native sections of `/preferences.md` (~3 k chars). */
export const FRAGMENT_CAP = 12_500;
/** cw refuses any other entry above this many bytes (measured 2026-09-07: «memory files are capped at 32768 bytes»). */
export const CW_ENTRY_CAP = 32_768;

const CLAUDE = 'home/.claude';
const RULES = `${CLAUDE}/rules`;

export const targets: Target[] = [
    {
        aliases: [
            'identity',
            'the invariant',
            'the refusals',
            'fleet contract',
        ],
        description:
            'the fleet identity master, verbatim — the invariant, the refusals, the members and entities glossary, who edits it. read before acting on any request of his.',
        path: '/areas/fleet-identity.md',
        sources: [`${RULES}/fleet-identity.md`],
    },
    {
        aliases: ['vibe', 'his words', 'shell words'],
        description:
            'his fleet words (slay, freebie, propose, pause) and the git shell words, verbatim from the master. read when he uses a one-word command.',
        path: '/areas/fleet-vibe.md',
        sources: [`${RULES}/fleet-vibe.md`],
    },
    {
        aliases: ['signals', 'reading him'],
        description:
            'how to read his own messages — markers, casing, half-formed ideas, mid-turn corrections. verbatim master. read at session start.',
        path: '/areas/dima-signals.md',
        sources: [`${RULES}/dima-signals.md`],
    },
    {
        aliases: ['the rails', 'bypass', 'restraint'],
        description:
            'what restraint looks like with approval prompts off — the never-without-a-named-target list. verbatim master. read before any delete, reset, overwrite or move.',
        path: '/areas/fleet-bypass-restraint.md',
        sources: [`${RULES}/fleet-bypass-restraint.md`],
    },
    {
        aliases: ['hazards', 'vault hazards'],
        description:
            'fleet-wide pitfalls, verbatim master — the obsidian vault sync and rename hazards. read before touching a vault note.',
        path: '/areas/fleet-hazards.md',
        sections: ['the obsidian vault'],
        sources: [`${RULES}/fleet-hazards.md`],
    },
    {
        aliases: [
            'CLAUDE.md',
            'root claude md',
            'coding preferences',
            'tooling picks',
        ],
        description:
            'his root CLAUDE.md, the sections that reach cw verbatim — coding preferences, questions are read-only, naming conventions, artifacts. read before any coding or design call.',
        path: '/areas/claude-md.md',
        sections: [
            'coding preferences — general',
            'coding preferences (typescript focused)',
            'questions are read-only',
            'visual and design work',
            'global naming conventions',
            'artifacts + dataviz — use proactively',
        ],
        sources: [`${CLAUDE}/CLAUDE.md`],
    },
    {
        aliases: ['voice', 'the voice stack', 'manner'],
        description:
            'the voice master, verbatim — the voice stack, manner, corrections. the compact copy in /preferences.md is what applies; read this when a voice question needs the full text.',
        path: '/areas/fleet-voice.md',
        sources: [`${RULES}/fleet-voice.md`],
    },
    {
        aliases: [
            'output format',
            'formatting',
            'reply shapes',
            'casing',
            'copy blocks',
        ],
        description:
            'the output-format master, verbatim — links, typography, emoji, casing, copy fences, skeletons, boards, the ➡️ cta. the compact copy in /preferences.md is what applies; read this when a formatting question needs the full text.',
        path: '/areas/fleet-output-format.md',
        sources: [`${RULES}/fleet-output-format.md`],
    },
    {
        compact: true,
        description: '',
        fragment: 'voice-and-formatting',
        path: '/preferences.md',
        sources: [`${RULES}/fleet-voice.md`, `${RULES}/fleet-output-format.md`],
    },
];

export const GAZETTE_DIR = 'cclio/gazette';
export const GAZETTE_PATH = '/areas/fleet-cclio-gazette.md';
export const GAZETTE_WINDOW = 5;

const sha = (text: string) => createHash('sha256').update(text).digest('hex');

/**
 * the compact shape for the capped preferences entry. blocks are separated by blank lines; a
 * block survives when its first line is a header, a bullet, or a paragraph led by a rule marker
 * (bold, 🚫 🚨 📌 ⚠️). html comments, plain prose, indented examples and the file's own
 * `**scope:**` / `**not here**` navigation blocks are dropped. kept blocks stay byte-identical.
 */
export const compact = (body: string) =>
    body
        .split(/\n{2,}/)
        .filter((block) => {
            const first = block.trimStart();
            if (first.startsWith('<!--')) return false;
            if (/^\*\*(scope|not here)/.test(first)) return false;
            return /^(#|- |\*\*|🚫|🚨|📌|⚠|╭|╰|```)/.test(first);
        })
        .join('\n\n');

/** the title block plus the named `## ` sections, in master order; everything else is cc-only. */
export const selectSections = (body: string, names: string[]) =>
    body
        .split(/^(?=## )/m)
        .filter(
            (part, i) =>
                i === 0 ||
                names.includes(part.slice(3).split('\n')[0]?.trim() ?? ''),
        )
        .join('')
        .trimEnd();

/** the one transform: fact bullets get cw's `[stated]` tag; indentation and everything else stay. */
export const tagBullets = (body: string) =>
    body.replace(/^(\s*)- (?!\[stated\] )/gm, '$1- [stated] ');

/** ordered tuples, not an object — the formatter sorts object keys and `name` must stay first. */
const frontmatter = (fields: [string, string | string[] | undefined][]) =>
    `---\n${fields
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? `[${v.join(', ')}]` : v}`)
        .join('\n')}\n---\n`;

const outName = (target: Target) =>
    `${target.path.replace(/^\//, '').replace(/\//g, '.').replace(/\.md$/, '')}${
        target.fragment ? `.${target.fragment}` : ''
    }.md`;

export function renderTarget(root: string, target: Target): Rendered {
    const masters = target.sources.map((s) =>
        readFileSync(join(root, s), 'utf8'),
    );
    const sourceSha = sha(masters.join('\n'));
    const bodies = masters.map((m, i) => {
        const selected = target.sections
            ? selectSections(m.trim(), target.sections)
            : m.trim();
        const trimmed = tagBullets(
            target.compact ? compact(selected) : selected,
        );
        return target.sources.length > 1
            ? `<!-- ${target.sources[i]} -->\n\n${trimmed}`
            : trimmed;
    });
    const body = target.fragment
        ? `${MARK_START}\n<!-- rendered by script/skill-memory-sync-mirror.ts from ${target.sources.join(' + ')}${target.compact ? ' (compact: headers, bullets and marker-led paragraphs; full text in the mirrored entries)' : ''} · source-sha256: ${sourceSha} · never edit by hand -->\n\n${bodies.join('\n\n')}\n\n${MARK_END}\n`
        : `${frontmatter([
              ['name', basename(target.path, '.md')],
              ['description', target.description],
              ['sources', ['cowork']],
              ['aliases', target.aliases],
              ['derived-from', target.sources],
              ['source-sha256', sourceSha],
          ])}\n${bodies.join('\n\n')}\n`;
    return {
        body,
        bytes: Buffer.byteLength(body),
        chars: body.length,
        file: outName(target),
        fragment: target.fragment,
        path: target.path,
        sha256: sourceSha,
    };
}

/** the `cw:` block of a gazette post — cclio's three pre-digested lines for cw. */
export const cwBlock = (post: string) => {
    const m = /^cw: \|\n((?:[ \t]+.*\n?)+)/m.exec(post);
    return m?.[1]
        ? m[1]
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
        : [];
};

export function renderGazette(root: string): Rendered {
    const dir = join(root, GAZETTE_DIR);
    const files = readdirSync(dir)
        .filter((f) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f))
        .sort()
        .reverse()
        .slice(0, GAZETTE_WINDOW);
    const posts = files.map((f) => {
        const text = readFileSync(join(dir, f), 'utf8');
        const date = f.slice(0, 10);
        const slug = f.slice(11, -3);
        return {
            header: `## ${date} · ${slug} · ${Buffer.byteLength(text)}b`,
            lines: cwBlock(text),
        };
    });
    const sourceSha = sha(
        posts.map((p) => p.header + p.lines.join('\n')).join('\n'),
    );
    const body = `${frontmatter([
        ['name', 'fleet-cclio-gazette'],
        [
            'description',
            "what dima and cclio shipped lately — a rolling window of the 5 freshest gazette posts, cclio's daily end-of-day summary. read when he asks what the two of them are up to, or for cv / recruiter / hr positioning («this week we shipped…»). refreshed only by `x-cw:memory-sync`.",
        ],
        ['sources', ['cowork']],
        [
            'aliases',
            ['gazette', "cclio's gazette", 'cclio gazette', 'daily gazette'],
        ],
        ['derived-from', [`${GAZETTE_DIR}/*.md`]],
        ['source-sha256', sourceSha],
    ])}
## how to read this entry

- [stated] cclio prints her gazette at the end of each day — a summary of what they accomplished; master posts live in \`~/dotfiles/${GAZETTE_DIR}/\`
- [stated] each section below is one post: \`<date> · <slug> · <bytes>b\`, freshest first; the three lines are cclio's pre-digest for cw (shipped · live / next · the one line worth repeating to a human)
- [stated] this entry is a rolling window rendered by \`script/skill-memory-sync-mirror.ts\`, never edited by hand; see [[fleet-identity]] for who cclio is

${posts.map((p) => `${p.header}\n\n${p.lines.map((l) => `- [stated] ${l}`).join('\n')}`).join('\n\n')}
`;
    return {
        body,
        bytes: Buffer.byteLength(body),
        chars: body.length,
        file: 'areas.fleet-cclio-gazette.md',
        path: GAZETTE_PATH,
        sha256: sourceSha,
    };
}

export function renderAll(root: string): Rendered[] {
    return [...targets.map((t) => renderTarget(root, t)), renderGazette(root)];
}

export function toManifest(rendered: Rendered[]): Manifest {
    const out: Manifest = {};
    for (const r of rendered) {
        const t = targets.find(
            (x) => x.path === r.path && x.fragment === r.fragment,
        );
        out[r.fragment ? `${r.path}#${r.fragment}` : r.path] = {
            bytes: r.bytes,
            file: r.file,
            sha256: r.sha256,
            sources: t?.sources ?? [`${GAZETTE_DIR}/*.md`],
            ...(r.fragment ? { fragment: r.fragment } : {}),
        };
    }
    return out;
}
