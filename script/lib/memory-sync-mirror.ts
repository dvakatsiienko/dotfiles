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
 * ? each host injects a fixed number of CHARS per conversation — `/preferences.md` 16 384,
 * ? `/profile.md` 8 192 (measured 2026-09-21) — and the host's own native content eats the same
 * ? budget, so a fragment gets `injectedCap - nativeReserve`. over that, cw stores the write and
 * ? TRUNCATES it silently at load, so the render aborts instead. both fragments are therefore
 * ? rendered COMPACT (headers, bullets and marker-led paragraphs kept whole, plain prose and
 * ? html comments dropped) and a source may name the sections that reach cw, at any heading
 * ? depth; the rest of that master is cc-only.
 * ?
 * ? what is NOT mirrored is as deliberate: cw has a second tier of leaf entries it loads on
 * ? demand, so tooling detail and the vault hazards live there. the resident tier only has to
 * ? make cw KNOW a door exists — `rules/fleet-doors.md` is that routing table.
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
    /** render with `compact()` — headers, bullets and marker-led paragraphs only */
    compact?: boolean;
    /** chars cw injects from this host per conversation (measured 2026-09-21) */
    injectedCap: number;
    /** chars of the host cw wrote itself — they eat the same budget */
    nativeReserve: number;
};

/** what the fragment may spend: the injected cap minus the host's own native content. */
export const budgetOf = (t: Target) => t.injectedCap - t.nativeReserve;

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

/**
 * ⚠️ the storage cap (32 768 bytes) is NOT the binding one — an over-budget entry stores fine and
 * cw TRUNCATES it silently at load, so the render aborts on the injected budget instead.
 */
export const STORAGE_CAP = 32_768;

const CLAUDE = 'home/.claude';
const RULES = `${CLAUDE}/rules`;

export const targets: Target[] = [
    {
        compact: true,
        fragment: 'formatting',
        injectedCap: 16_384,
        nativeReserve: 4_252,
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
                    'never re-case, in any mode',
                    'questions, options, and the ➡️ cta',
                    'reply skeletons',
                    'boards — status reports have ONE shape',
                    'the output kit',
                    'a multi-item drop gets restated',
                ],
            },
        ],
    },
    {
        compact: true,
        fragment: 'fleet',
        injectedCap: 8_192,
        nativeReserve: 1_987,
        path: '/profile.md',
        sources: [
            {
                file: `${RULES}/fleet-identity.md`,
                sections: [
                    'The invariant',
                    'The glossary',
                    'The members — who acts',
                ],
            },
            { file: `${RULES}/fleet-voice.md` },
            { file: `${RULES}/dima-signals.md` },
            {
                file: `${RULES}/fleet-vibe.md`,
                sections: ['fleet words — how he steers an agent'],
            },
            { file: `${RULES}/fleet-doors.md` },
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

/**
 * the title block plus the named sections, in master order; everything else is cc-only.
 * any heading depth matches, so a `###` subsection can reach cw without its siblings — name its
 * parent too when the hierarchy should stay readable.
 */
export const selectSections = (body: string, names: string[]) =>
    body
        .split(/^(?=#{2,6} )/m)
        .filter(
            (part, i) =>
                i === 0 ||
                names.includes(
                    part.replace(/^#+ /, '').split('\n')[0]?.trim() ?? '',
                ),
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
    /**
     * over the SELECTED, COMPACTED bodies — never the raw masters. a map change (a section added
     * or dropped) alters the fragment without touching a master, and a masters-only sha left that
     * change invisible: cw compared the stamp, saw no diff, and skipped the splice. found when
     * `boards` and `the output kit` were added to the preferences fragment, 2026-09-21.
     */
    const sourceSha = sha(bodies.join('\n\n'));
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
