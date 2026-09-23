/**
 * ? memory-sync mirror — renders the cc masters into cw's three auto-loaded surfaces.
 * ?
 * ? cw auto-loads exactly three things per conversation: dima's «instructions for claude» box
 * ? (claude.ai settings → profile; only he can edit it, so the render hands him a paste block), and
 * ? the memory entries `/preferences.md` and `/profile.md`. every other memory entry is a leaf read
 * ? on demand.
 * ?
 * ? ROUTING IS A TAG IN THE MASTER, never a list here. a line `<!-- sync: <dest> -->` directly under
 * ? a heading sends that section — and every subsection under it — to one destination; a
 * ? subsection may override with its own tag, `none` keeps it cc-only. a tag on its own line before
 * ? the first heading routes the whole file. cc strips html comments at load, so a tag costs cc
 * ? nothing and the masters keep their natural section order. `grep -rn 'sync:' home/.claude` is the
 * ? whole routing table; the render also prints it and writes `map.md` beside the fragments.
 * ?
 * ? each destination injects a fixed number of CHARS — the box 32 768 (dima's paste test,
 * ? 2026-09-23), `/preferences.md` 16 384, `/profile.md` 8 192 (measured 2026-09-21) — and a memory
 * ? host's own native content eats the same budget. over budget, cw stores the write and
 * ? TRUNCATES the tail silently at load, so the render aborts instead. every fragment renders
 * ? COMPACT: headers, bullets and marker-led paragraphs whole, plain prose and html comments
 * ? dropped — except a leaf section left with nothing but its heading, which keeps its prose.
 * ? the only other transform is `- ` → `- [stated] ` on bullets, which cw's memory guidance
 * ? requires on fact lines.
 */

/* Core */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const DESTS = ['field', 'prefs', 'profile'] as const;
export type Dest = (typeof DESTS)[number];
type Tag = Dest | 'none';

export type Target = {
    dest: Dest;
    /** the cw host entry the fragment splices into, or `instructions` for dima's settings box */
    path: string;
    fragment: string;
    /** chars cw injects from this destination per conversation */
    injectedCap: number;
    /** chars of the host cw wrote itself — they eat the same budget */
    nativeReserve: number;
    /** dima pastes it by hand as a full replace — cw cannot write this destination */
    paste?: boolean;
};

/** what the fragment may spend: the injected cap minus the host's own native content. */
export const budgetOf = (t: Target) => t.injectedCap - t.nativeReserve;

export type Routed = { dest: Dest; file: string; section: string };

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
    /** the tagged sections this fragment carries, in render order */
    routed: Routed[];
};

export type Manifest = Record<
    string,
    {
        file: string;
        sha256: string;
        bytes: number;
        sources: string[];
        fragment: string;
        paste: boolean;
    }
>;

export const MARK_START = '<!-- mirror:start -->';
export const MARK_END = '<!-- mirror:end -->';

/**
 * ⚠️ the memory storage cap (32 768 bytes) is NOT the binding one for a memory host — an
 * over-budget entry stores fine and cw TRUNCATES it silently at load, so the render aborts on the
 * injected budget instead. the settings box refuses past 32 768 chars (dima, 2026-09-23).
 */
export const STORAGE_CAP = 32_768;

const CLAUDE = 'home/.claude';
const RULES = `${CLAUDE}/rules`;

/**
 * the masters scanned for tags, in render order. files in `rules/` not named here are scanned
 * after these, alphabetically — a new rule is never silently skipped.
 */
export const ORDER = [
    `${CLAUDE}/CLAUDE.md`,
    `${RULES}/fleet-identity.md`,
    `${RULES}/fleet-voice.md`,
    `${RULES}/dima-signals.md`,
    `${RULES}/fleet-vibe.md`,
    `${RULES}/fleet-doors.md`,
    `${RULES}/fleet-bypass-restraint.md`,
    `${RULES}/fleet-output-format.md`,
];

export const targets: Target[] = [
    {
        dest: 'field',
        fragment: 'core',
        injectedCap: 32_768,
        nativeReserve: 0,
        paste: true,
        path: 'instructions',
    },
    {
        dest: 'prefs',
        fragment: 'habits',
        injectedCap: 16_384,
        nativeReserve: 4_400,
        path: '/preferences.md',
    },
    {
        dest: 'profile',
        fragment: 'fleet',
        injectedCap: 8_192,
        nativeReserve: 2_000,
        path: '/profile.md',
    },
];

export function listMasters(root: string): string[] {
    const rules = readdirSync(join(root, RULES))
        .filter((f) => f.endsWith('.md'))
        .map((f) => `${RULES}/${f}`)
        .filter((f) => !ORDER.includes(f))
        .sort();
    return [...ORDER, ...rules];
}

const sha = (text: string) => createHash('sha256').update(text).digest('hex');

const TAG_LINE = /^<!-- sync: ([a-z]+) -->$/;

/**
 * the compact shape. blocks are separated by blank lines; a block survives when its first line is
 * a header, a bullet, a numbered item, or a paragraph led by a rule marker (bold, 🚫 🚨 📌 ⚠️).
 * html comments, plain prose, indented examples and the file's own `**scope:**` / `**not here**`
 * navigation blocks are dropped. kept blocks stay byte-identical.
 */
export const compact = (body: string) =>
    body
        .split(/\n{2,}/)
        .filter((block) => {
            const first = block.trimStart();
            if (first.startsWith('<!--')) return false;
            if (/^\*\*(scope|not here)/.test(first)) return false;
            return /^(#|- |\d+\. |\*\*|🚫|🚨|📌|⚠|╭|╰|```)/.test(first);
        })
        .join('\n\n');

/** drops comments and navigation blocks, keeps prose — the fallback for a prose-only leaf. */
const clean = (body: string) =>
    body
        .split(/\n{2,}/)
        .filter((block) => {
            const first = block.trimStart();
            return (
                !first.startsWith('<!--') &&
                !/^\*\*(scope|not here)/.test(first)
            );
        })
        .join('\n\n');

/** the one transform: fact bullets get cw's `[stated]` tag; indentation and everything else stay. */
export const tagBullets = (body: string) =>
    body.replace(/^(\s*)- (?!\[stated\] )/gm, '$1- [stated] ');

type Part = {
    level: number;
    title: string;
    /** the part without its tag line */
    text: string;
    own?: Tag;
    eff?: Tag;
};

/** splits a master at its headings and resolves each part's tag, inherited down the tree. */
export function parseMaster(body: string, file = 'master'): Part[] {
    const parts: Part[] = body
        .split(/^(?=#{1,6} )/m)
        .filter((p) => p.trim())
        .map((raw) => {
            const heading = raw.match(/^(#{1,6}) (.*)/);
            const lines = raw.split('\n');
            const at = heading
                ? 1
                : lines.findIndex((l) => TAG_LINE.test(l.trim()));
            const match = at >= 0 ? lines[at]?.trim().match(TAG_LINE) : null;
            let own: Tag | undefined;
            if (match?.[1]) {
                const tag = match[1];
                if (tag !== 'none' && !DESTS.includes(tag as Dest))
                    throw new Error(`${file}: unknown sync tag «${tag}»`);
                own = tag as Tag;
                lines.splice(at, 1);
            }
            return {
                level: heading ? (heading[1]?.length ?? 0) : 0,
                own,
                text: lines.join('\n'),
                title: heading?.[2]?.trim() ?? '',
            };
        });
    const stack: Part[] = [];
    for (const part of parts) {
        while (stack.length && (stack.at(-1)?.level ?? 0) >= part.level)
            stack.pop();
        part.eff = part.own ?? stack.at(-1)?.eff;
        stack.push(part);
    }
    return parts;
}

/**
 * the parts routed to `dest`, compacted. a routed part pulls its ancestors' heading lines along so
 * the hierarchy reads; a routed leaf left with only its heading keeps its prose.
 */
export function selectFor(
    body: string,
    dest: Dest,
    file = 'master',
): { text: string; sections: string[] } {
    const parts = parseMaster(body, file);
    const out: string[] = [];
    const sections: string[] = [];
    const emitted = new Set<Part>();
    const stack: Part[] = [];
    parts.forEach((part, i) => {
        while (stack.length && (stack.at(-1)?.level ?? 0) >= part.level)
            stack.pop();
        if (part.eff === dest) {
            for (const up of stack)
                if (!emitted.has(up) && up.level > 0) {
                    out.push(up.text.split('\n')[0] ?? '');
                    emitted.add(up);
                }
            const next = parts[i + 1];
            const hasRoutedChild =
                !!next && next.level > part.level && next.eff === dest;
            let text = compact(part.text.trim());
            if (!hasRoutedChild && !text.includes('\n'))
                text = clean(part.text.trim());
            if (text) out.push(text);
            emitted.add(part);
            if (part.own === dest) sections.push(part.title || '(whole file)');
        }
        stack.push(part);
    });
    return { sections, text: out.join('\n\n') };
}

const outName = (target: Target) =>
    `${target.path.replace(/^\//, '').replace(/\.md$/, '')}.${target.fragment}.md`;

export function renderTarget(root: string, target: Target): Rendered {
    const bodies: string[] = [];
    const routed: Routed[] = [];
    const used: string[] = [];
    for (const file of listMasters(root)) {
        const master = readFileSync(join(root, file), 'utf8');
        const { text, sections } = selectFor(master.trim(), target.dest, file);
        if (!text) continue;
        used.push(file);
        for (const section of sections)
            routed.push({ dest: target.dest, file, section });
        // `[stated]` is a memory convention; the pasted box is dima's own text and carries none
        bodies.push(
            `<!-- ${file} -->\n\n${target.paste ? text : tagBullets(text)}`,
        );
    }
    /**
     * over the SELECTED, COMPACTED bodies — never the raw masters. a tag change alters the
     * fragment without touching a master's prose, and a masters-only sha left that change
     * invisible: cw compared the stamp, saw no diff, and skipped the splice (2026-09-21).
     */
    const sourceSha = sha(bodies.join('\n\n'));
    const body = `${MARK_START}\n<!-- rendered by script/skill-memory-sync-mirror.ts from the \`sync: ${target.dest}\` sections of ${used.join(' + ') || 'nothing'} · source-sha256: ${sourceSha} · never edit by hand -->\n\n${bodies.join('\n\n')}\n\n${MARK_END}\n`;
    return {
        body,
        bytes: Buffer.byteLength(body),
        chars: body.length,
        file: outName(target),
        fragment: target.fragment,
        path: target.path,
        routed,
        sha256: sourceSha,
    };
}

export function renderAll(root: string): Rendered[] {
    return targets.map((t) => renderTarget(root, t));
}

/** the human routing table — what reaches cw, from where, into which destination. */
export function toMap(rendered: Rendered[]): string {
    const lines = [
        '# cc → cw sync map',
        '',
        'generated by `pnpm skill:memory-sync-mirror` — never edit by hand. a route is a',
        '`<!-- sync: <dest> -->` line under a heading in the master; change the tag, not this file.',
    ];
    for (const r of rendered) {
        const t = targets.find(
            (x) => x.path === r.path && x.fragment === r.fragment,
        );
        if (!t) throw new Error(`no target for ${r.path}`);
        lines.push(
            '',
            `## ${t.dest} → ${t.path}#${t.fragment} — ${r.chars} / ${budgetOf(t)} chars${t.paste ? ' — pasted by dima' : ''}`,
            '',
        );
        if (!r.routed.length) lines.push('- (nothing routed)');
        for (const x of r.routed) lines.push(`- \`${x.file}\` › ${x.section}`);
    }
    return `${lines.join('\n')}\n`;
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
            paste: !!t.paste,
            sha256: r.sha256,
            sources: [...new Set(r.routed.map((x) => x.file))],
        };
    }
    return out;
}
