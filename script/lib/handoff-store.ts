/**
 * ? The handoff store, as one set of rules.
 * ?
 * ? A CST handoff is a file in a flat directory, and every frontend used to
 * ? re-derive what that means — cc skills in bash, the x-cw mcp server in
 * ? TypeScript. The copies drifted. This module is the single owner: filename
 * ? grammar, the audience gate, age, the replace plan, ingest-deletes.
 * ?
 * ? Nothing here deletes on its own. Age is reported and never acted on — a
 * ? stale handoff is Dima's to see and decide about, which is exactly what the
 * ? old 7-day sweep took away from him.
 * ?
 * ? The store root is a parameter with a default, so tests point it at a
 * ? fixture and never touch ~/.claude.
 */

/* Core */
import {
    chmod,
    mkdir,
    readFile,
    readdir,
    rm,
    stat,
    writeFile,
} from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const AUDIENCES = ['any', 'ccli', 'cclio', 'cw', 'dpatch'] as const;

export type Audience = (typeof AUDIENCES)[number];

export const defaultRoot = join(homedir(), '.claude', 'shelf', 'handoffs');

/** Older than this and `list` says so. It says so, and that is all it does. */
export const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

const DIR_MODE = 0o700;
const FILE_MODE = 0o600;
const SHARED = '-shared';
const TIMESTAMP = /^\d{8}T\d{4,6}Z$/;

export type Name = {
    audience: Audience;
    shared: boolean;
    slug: string;
    ts: string;
};

export type Entry = Name & {
    mtimeMs: number;
    name: string;
    path: string;
    size: number;
};

type Ok<T> = { error: null; value: T };
type Err = { error: string; value: null };
export type Result<T> = Err | Ok<T>;

const ok = <T>(value: T): Ok<T> => ({ error: null, value });
const err = (error: string): Err => ({ error, value: null });

export function isAudience(token: string): token is Audience {
    return (AUDIENCES as readonly string[]).includes(token);
}

/**
 * ? `<audience>-<slug>-<utc-ts>[-shared].md`, and the two legacy shapes still
 * ? sitting in the store: a timestamp-first name, and a two-segment name with
 * ? no audience at all. Both read as `any`, which is what they always meant.
 * ?
 * ? Tolerant on purpose — a name it cannot fully parse still lists, because the
 * ? alternative is a stray file no frontend can see or delete.
 */
export function parseName(name: string): Name | null {
    if (!name.endsWith('.md')) return null;

    let stem = name.slice(0, -'.md'.length);
    const shared = stem.endsWith(SHARED);
    if (shared) stem = stem.slice(0, -SHARED.length);

    const parts = stem.split('-').filter(Boolean);
    const first = parts[0];
    const last = parts.at(-1);
    if (first === undefined || last === undefined) return null;

    if (TIMESTAMP.test(first)) {
        const rest = parts.slice(1);
        const head = rest[0];
        const audience = head !== undefined && isAudience(head) ? head : null;
        return {
            audience: audience ?? 'any',
            shared,
            slug: (audience === null ? rest : rest.slice(1)).join('-'),
            ts: first,
        };
    }

    const hasTs = TIMESTAMP.test(last);
    const body = hasTs ? parts.slice(0, -1) : parts;
    const head = body[0];
    // ? The audience segment is positional, so a two-segment name simply has
    // ? none — its first token is the slug, not a token that happens to match.
    const audience =
        body.length > 1 && head !== undefined && isAudience(head) ? head : null;

    return {
        audience: audience ?? 'any',
        shared,
        slug: (audience === null ? body : body.slice(1)).join('-'),
        ts: hasTs ? last : '',
    };
}

export function buildName(parts: Name) {
    return `${parts.audience}-${sanitizeSlug(parts.slug)}-${parts.ts}${parts.shared ? SHARED : ''}.md`;
}

export function sanitizeSlug(slug: string) {
    return (
        slug
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-shared$/, '') || 'handoff'
    );
}

export function utcTs(at: Date = new Date()) {
    return at
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d+Z$/, 'Z');
}

/**
 * ? The whole point of the audience segment: a CST addressed to another agent is
 * ? never pulled by accident, because pulling it feeds this thread the wrong
 * ? context AND deletes the file its real reader is waiting for.
 */
export function readableBy(audience: Audience, reader: Audience) {
    return audience === 'any' || audience === reader;
}

export type Age = { days: number; label: string; stale: boolean };

export function ageOf(mtimeMs: number, now: number = Date.now()): Age {
    const elapsed = Math.max(0, now - mtimeMs);
    const minutes = Math.round(elapsed / 60_000);
    const label =
        minutes < 90
            ? `${minutes}m`
            : minutes < 60 * 36
              ? `${Math.round(minutes / 60)}h`
              : `${Math.round(minutes / 1440)}d`;

    return {
        days: Math.floor(elapsed / 86_400_000),
        label,
        stale: elapsed > STALE_AFTER_MS,
    };
}

export function sizeLabel(bytes: number) {
    return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} kB`;
}

export async function listStore({ root = defaultRoot } = {}): Promise<Entry[]> {
    let names: string[];
    try {
        const found = await readdir(root, { withFileTypes: true });
        names = found.filter((one) => one.isFile()).map((one) => one.name);
    } catch {
        return [];
    }

    const entries: Entry[] = [];
    for (const name of names) {
        const parsed = parseName(name);
        if (parsed === null) continue;

        // ? The store is shared, so a file can vanish between the readdir and
        // ? the stat — another thread pulled it. Normal traffic, not an error.
        const path = join(root, name);
        const stats = await statOrNull(path);
        if (stats === null) continue;

        entries.push({
            ...parsed,
            mtimeMs: stats.mtimeMs,
            name,
            path,
            size: stats.size,
        });
    }

    return entries.sort((a, b) => b.mtimeMs - a.mtimeMs);
}

/** Every verb addressing one file by slug refuses rather than guesses. */
export function pick(
    slug: string | undefined,
    entries: Entry[],
): Result<Entry> {
    const matches = slug
        ? entries.filter((entry) =>
              entry.name.toLowerCase().includes(slug.toLowerCase()),
          )
        : entries;
    const [picked, ...rest] = matches;

    if (picked === undefined)
        return err(
            entries.length === 0
                ? 'handoff store is clean — nothing pending.'
                : `no pending handoff matches "${slug}". pending:\n${describe(entries)}`,
        );
    if (rest.length > 0)
        return err(
            `several pending handoffs match — pick one with a slug that is unique:\n${describe(matches)}`,
        );

    return ok(picked);
}

export function describe(entries: Entry[], now: number = Date.now()) {
    return entries
        .map(
            (entry) =>
                `- ${entry.slug} — for ${entry.audience} · ${ageOf(entry.mtimeMs, now).label} old`,
        )
        .join('\n');
}

export type WritePlan = { name: string; remove: Entry[]; shared: boolean };

/**
 * ? The upmerge, decided before anything touches disk: `--replaces` folds a
 * ? follow-up into its sibling instead of brooding a second file for the same
 * ? thread. A replace matching nothing is an error, never a quiet plain write —
 * ? the caller believed a sibling was there and the fold never happened.
 */
export function planWrite(options: {
    audience: Audience;
    entries: Entry[];
    replaces?: string | undefined;
    shared?: boolean | undefined;
    slug: string;
    ts: string;
}): Result<WritePlan> {
    const name = (shared: boolean) =>
        buildName({
            audience: options.audience,
            shared,
            slug: options.slug,
            ts: options.ts,
        });

    if (options.replaces === undefined) {
        const shared = options.shared ?? false;
        return ok({ name: name(shared), remove: [], shared });
    }

    const target = pick(options.replaces, options.entries);
    if (target.error !== null)
        return err(
            `${target.error}\nnothing was replaced. drop --replaces to write this as a new handoff.`,
        );

    const shared = options.shared ?? target.value.shared;
    return ok({ name: name(shared), remove: [target.value], shared });
}

export async function writeHandoff(options: {
    audience: Audience;
    body: string;
    replaces?: string | undefined;
    root?: string;
    shared?: boolean | undefined;
    slug: string;
    ts?: string;
}): Promise<Result<{ path: string; removed: Entry[] }>> {
    const root = options.root ?? defaultRoot;
    const planned = planWrite({
        audience: options.audience,
        entries: await listStore({ root }),
        replaces: options.replaces,
        shared: options.shared,
        slug: options.slug,
        ts: options.ts ?? utcTs(),
    });
    if (planned.error !== null) return planned;

    await mkdir(root, { mode: DIR_MODE, recursive: true });
    // ? Remove first, write second. The standing rule is one live CST per
    // ? thread, so the window this order risks is zero live, never two.
    for (const entry of planned.value.remove) await rmOrIgnore(entry.path);

    const path = join(root, planned.value.name);
    await writeFile(path, options.body, { mode: FILE_MODE });
    await chmod(path, FILE_MODE);

    return ok({ path, removed: planned.value.remove });
}

export async function ingestHandoff(options: {
    reader?: Audience | undefined;
    root?: string;
    slug?: string | undefined;
}): Promise<Result<{ body: string; entry: Entry; kept: boolean }>> {
    const root = options.root ?? defaultRoot;
    const all = await listStore({ root });
    if (all.length === 0)
        return err('handoff store is clean — nothing pending.');

    const reader = options.reader;
    const mine =
        reader === undefined
            ? all
            : all.filter((entry) => readableBy(entry.audience, reader));

    // ? Naming a slug forces a foreign file — that is the user saying so out
    // ? loud, which is the whole point of the exception.
    const candidates = options.slug === undefined ? mine : all;
    if (candidates.length === 0) {
        const others = all.filter((entry) => !mine.includes(entry));
        return err(
            `nothing pending for ${reader}. ${others.length} handoff(s) are addressed to another agent and were left untouched:\n${describe(others)}`,
        );
    }

    const picked = pick(options.slug, candidates);
    if (picked.error !== null) return picked;

    const body = await readFile(picked.value.path, 'utf8');
    if (!picked.value.shared) await rmOrIgnore(picked.value.path);

    return ok({ body, entry: picked.value, kept: picked.value.shared });
}

export async function peekHandoff(options: {
    root?: string;
    slug?: string | undefined;
}): Promise<Result<{ entry: Entry; meta: string | null }>> {
    const entries = await listStore({ root: options.root ?? defaultRoot });
    const picked = pick(options.slug, entries);
    if (picked.error !== null) return picked;

    return ok({
        entry: picked.value,
        meta: metaBlock(await readOrNull(picked.value.path)),
    });
}

/**
 * ? An explicit delete is a deletion, not a trim: it takes `-shared` files too.
 * ? That suffix means the file survives being PULLED, not that it survives
 * ? someone asking for it to go.
 */
export async function deleteHandoffs(options: {
    all?: boolean;
    root?: string;
    slug?: string | undefined;
}): Promise<Result<Entry[]>> {
    const entries = await listStore({ root: options.root ?? defaultRoot });
    if (options.all === true) {
        for (const entry of entries) await rmOrIgnore(entry.path);
        return ok(entries);
    }

    const picked = pick(options.slug, entries);
    if (picked.error !== null)
        return err(`${picked.error}\nnothing was deleted.`);

    await rmOrIgnore(picked.value.path);
    return ok([picked.value]);
}

/**
 * ? META is the human-facing head of a CST and ends where the next top-level
 * ? heading begins. Bounding the slice is what makes it trustworthy: "run id"
 * ? also occurs in ordinary prose further down, and a whole-file search would
 * ? happily report one of those as the run marker.
 */
export function metaBlock(cst: string | null) {
    if (cst === null) return null;

    const lines = cst.split('\n');
    const start = lines.findIndex((line) => /^#\s+META\b/i.test(line));
    if (start === -1) return null;

    const rest = lines.slice(start + 1);
    const end = rest.findIndex((line) => /^#\s/.test(line));
    return [lines[start], ...(end === -1 ? rest : rest.slice(0, end))]
        .join('\n')
        .trim();
}

// ? Two shapes are live in the store — `run id: **x**` today, `**Run marker:**`
// ? with backticks in older CSTs. Anything else is null rather than a guess: a
// ? wrong run id silently merges two tracker runs, worse than an absent one.
export function parseRunId(meta: string | null) {
    const match = meta?.match(
        /run\s*(?:id|marker)\s*:?\**\s*(?:\*\*|`)([^*`\n]+)(?:\*\*|`)/i,
    );
    return match?.[1]?.trim() ?? null;
}

export async function runIdOf(entry: Entry) {
    return parseRunId(metaBlock(await readOrNull(entry.path)));
}

/* Helpers */
async function statOrNull(path: string) {
    try {
        return await stat(path);
    } catch {
        return null;
    }
}

async function readOrNull(path: string) {
    try {
        return await readFile(path, 'utf8');
    } catch {
        return null;
    }
}

async function rmOrIgnore(path: string) {
    try {
        await rm(path);
    } catch {
        /* already gone — another frontend got there first */
    }
}
