/**
 * ? memory-sync mirror — renders the cc masters into the two auto-loaded cw memory entries.
 * ?
 * ? cw auto-loads only `/preferences.md` and `/profile.md`; every other entry is a listing line
 * ? nobody reads (measured over three weeks, 2026-09-21). so the mirror is two FRAGMENTS, each
 * ? spliced into its host between `<!-- mirror:start -->` / `<!-- mirror:end -->`. cw
 * ? (`x-cw:memory-sync`) reads `manifest.json`, compares the `source-sha256` stamped in each
 * ? block, and replaces what changed. no judgment on either side — the only transform is
 * ? `- ` → `- [stated] ` on bullets, which cw's memory guidance requires on fact lines.
 * ?
 * ? `/preferences.md` is capped at 16 384 chars (measured 2026-09-07; the write error names it),
 * ? so its fragment is rendered COMPACT: headers, bullets and marker-led paragraphs kept whole,
 * ? plain prose and html comments dropped. `/profile.md` has the room for full text. a source
 * ? may name the `## ` sections that reach cw; the rest of that master is cc-only.
 */

/* Core */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

export type Source = {
    /** master file, relative to the dotfiles root */
    file: string;
    /** keep only these `## ` sections (plus the title block); absent = the whole master */
    sections?: string[];
};

export type Target = {
    /** the cw host entry the fragment splices into */
    path: string;
    fragment: string;
    sources: Source[];
    /** render with `compact()` — for the capped preferences host */
    compact?: boolean;
};

export type Rendered = {
    file: string;
    path: string;
    fragment: string;
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
        fragment: string;
    }
>;

export const MARK_START = '<!-- mirror:start -->';
export const MARK_END = '<!-- mirror:end -->';

/** cw refuses `/preferences.md` above this many rendered chars (measured 2026-09-07). */
export const PREFERENCES_CAP = 16_384;
/** the fragment must leave room for the cw-native sections of `/preferences.md` (~3 k chars). */
export const FRAGMENT_CAP = 12_500;
/** cw refuses any other entry above 32 768 bytes (measured 2026-09-07); the profile fragment leaves room for the cw-native profile body (~2.3 k chars). */
export const PROFILE_CAP = 30_000;

const CLAUDE = 'home/.claude';
const RULES = `${CLAUDE}/rules`;

export const targets: Target[] = [
    {
        compact: true,
        fragment: 'formatting',
        path: '/preferences.md',
        sources: [
            {
                file: `${RULES}/fleet-output-format.md`,
                sections: [
                    'the shapes that keep breaking',
                    'typography',
                    'emoji',
                    'links and paths — one click, always',
                    'copy-paste blocks get visible ends 📋',
                    'casing — lowercase sentence-initial capitals',
                    'questions, options, and the ➡️ cta',
                    'reply skeletons',
                    'a multi-item drop gets restated',
                ],
            },
        ],
    },
    {
        fragment: 'fleet',
        path: '/profile.md',
        sources: [
            { file: `${RULES}/fleet-identity.md` },
            { file: `${RULES}/fleet-voice.md` },
            { file: `${RULES}/dima-signals.md` },
            {
                file: `${RULES}/fleet-vibe.md`,
                sections: ['fleet words — how he steers an agent'],
            },
            {
                file: `${RULES}/fleet-hazards.md`,
                sections: ['the obsidian vault'],
            },
            {
                file: `${CLAUDE}/CLAUDE.md`,
                sections: [
                    'global Claude Code configuration, applies to all projects',
                ],
            },
            {
                file: `${RULES}/tooling.md`,
                sections: ['shared — cc and cw'],
            },
        ],
    },
];

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

const outName = (target: Target) =>
    `${basename(target.path, '.md')}.${target.fragment}.md`;

export function renderTarget(root: string, target: Target): Rendered {
    const masters = target.sources.map((s) =>
        readFileSync(join(root, s.file), 'utf8'),
    );
    const sourceSha = sha(masters.join('\n'));
    const bodies = masters.map((m, i) => {
        const source = target.sources[i];
        if (!source) throw new Error(`no source ${i} for ${target.path}`);
        const selected = source.sections
            ? selectSections(m.trim(), source.sections)
            : m.trim();
        const trimmed = tagBullets(
            target.compact ? compact(selected) : selected,
        );
        return `<!-- ${source.file} -->\n\n${trimmed}`;
    });
    const body = `${MARK_START}\n<!-- rendered by script/skill-memory-sync-mirror.ts from ${target.sources.map((s) => s.file).join(' + ')}${target.compact ? ' (compact: headers, bullets and marker-led paragraphs)' : ''} · source-sha256: ${sourceSha} · never edit by hand -->\n\n${bodies.join('\n\n')}\n\n${MARK_END}\n`;
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

export function renderAll(root: string): Rendered[] {
    return targets.map((t) => renderTarget(root, t));
}

export function toManifest(rendered: Rendered[]): Manifest {
    const out: Manifest = {};
    for (const r of rendered) {
        const t = targets.find(
            (x) => x.path === r.path && x.fragment === r.fragment,
        );
        if (!t) throw new Error(`no target for ${r.path}`);
        out[`${r.path}#${r.fragment}`] = {
            bytes: r.bytes,
            file: r.file,
            fragment: r.fragment,
            sha256: r.sha256,
            sources: t.sources.map((s) => s.file),
        };
    }
    return out;
}
