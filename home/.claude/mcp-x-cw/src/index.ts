/* Core */

import { execFileSync } from 'node:child_process';
import {
    chmodSync,
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    renameSync,
    rmSync,
    statSync,
    writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const HANDOFF_DIR = join(homedir(), '.claude', 'shelf', 'handoffs');
const SUPERSEDED_DIR = join(HANDOFF_DIR, 'superseded');
const SWEEP_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const SPEC_PATH = join(
    homedir(),
    'projects/dotfiles',
    'home/.claude',
    'plugin-x',
    'CST-SPEC.md',
);
const TRANSCRIPT_DIR = join(homedir(), '.claude', 'shelf', 'yt-transcripts');
const TRANSCRIPT_SCRIPTS = join(
    homedir(),
    'projects/dotfiles',
    'home/.claude',
    'plugin-x',
    'skills',
    'yt-transcript',
    'scripts',
);
const server = new McpServer({ name: 'x-cw', version: '0.1.0' });

server.registerTool(
    'handoff_save',
    {
        description:
            `Persist a CST (Continuation State Transfer) of the current thread to the shared handoff store, ` +
            `where any cw thread or cc session can pull it to continue this thread. ` +
            `FIRST compose the CST from the current thread per the spec below, THEN call this tool with it. ` +
            `Compose it as machine-optimized telegraphic text with light markdown structure, per the compression contract below. The META section is the exception: it is formatted for a human and goes first.\n\n${loadSpec()}`,
        inputSchema: {
            audience: z
                .enum(['any', 'cw', 'cclio', 'dpatch', 'ccli'])
                .optional()
                .describe(
                    'Which agent this CST is FOR. Omit (or "any") when it is for whoever picks it up next. Naming one means only that agent pulls it — every other agent leaves it alone instead of ingesting and deleting it by mistake.',
                ),
            cst: z
                .string()
                .describe('The complete CST document composed per the spec'),
            shared: z
                .boolean()
                .optional()
                .describe(
                    'True only if several threads are expected to pull this CST (file then survives ingest)',
                ),
            slug: z
                .string()
                .describe(
                    'Short kebab-case topic slug for the filename, e.g. "bg2ee-mod-order"',
                ),
        },
        title: 'Save handoff (CST)',
    },
    async ({ cst, slug, shared, audience }) => {
        // The description above is baked in when the tool registers, so it cannot
        // report a spec that went missing afterwards. The handler can, and this is
        // the only place cw would ever hear about it.
        const specMissing = !existsSync(SPEC_PATH);
        sweep();
        mkdirSync(HANDOFF_DIR, { mode: 0o700, recursive: true });
        const file = join(
            HANDOFF_DIR,
            `${utcTs()}-${audience ?? 'any'}-${sanitizeSlug(slug)}${shared ? '-shared' : ''}.md`,
        );
        writeFileSync(file, cst, { mode: 0o600 });
        chmodSync(file, 0o600);
        return text(
            (specMissing
                ? `!! CST-SPEC.md is missing at ${SPEC_PATH} — this CST was composed without the authoritative spec. Say so to the user.\n\n`
                : '') +
                `Handoff saved: ${file}\nTell the user in one line: handoff written; pull it with /handoff-pull in a new cw thread or /x:handoff-pull in cc. It is deleted on ingest${shared ? ' (shared: kept for multiple pullers)' : ''}.`,
        );
    },
);

server.registerTool(
    'handoff_supersede',
    {
        description:
            'Save a CST that REPLACES a pending one instead of adding a second: the old file moves to handoffs/superseded/ and the new one takes its place, so a session keeps exactly one live handoff. ' +
            'Use for a re-handoff of a thread that already saved one — "update my handoff", "replace it", "hand off again". Use handoff_save for a thread\'s first. ' +
            "Compose the CST exactly as handoff_save's description specifies; the spec lives there and is not repeated here.",
        inputSchema: {
            audience: z
                .enum(['any', 'cw', 'cclio', 'dpatch', 'ccli'])
                .optional()
                .describe(
                    'Which agent this CST is FOR. Omit (or "any") when it is for whoever picks it up next. Naming one means only that agent pulls it — every other agent leaves it alone instead of ingesting and deleting it by mistake.',
                ),
            cst: z
                .string()
                .describe(
                    "The complete CST document, composed per the spec in handoff_save's description",
                ),
            shared: z
                .boolean()
                .optional()
                .describe(
                    'Override the -shared suffix; omit to inherit it from the handoff being replaced',
                ),
            slug: z
                .string()
                .describe(
                    'Slug of the pending handoff to replace, matched against filenames; also names the new file',
                ),
        },
        title: 'Supersede handoff (CST)',
    },
    async ({ cst, slug, shared, audience }) => {
        const specMissing = !existsSync(SPEC_PATH);
        sweep();
        const { error, file: old } = pickBySlug(slug, listPending());
        if (!old)
            return text(
                `${error}\nNothing was superseded. If this thread has no pending handoff yet, use handoff_save instead.`,
            );

        const keepShared = shared ?? old.name.endsWith('-shared.md');
        mkdirSync(SUPERSEDED_DIR, { mode: 0o700, recursive: true });
        // Move first, write second: the standing rule is one live CST per
        // session, so the window this order risks is zero live, never two.
        renameSync(old.path, join(SUPERSEDED_DIR, old.name));
        const file = join(
            HANDOFF_DIR,
            `${utcTs()}-${audience ?? audienceOf(old.name)}-${sanitizeSlug(slug)}${keepShared ? '-shared' : ''}.md`,
        );
        writeFileSync(file, cst, { mode: 0o600 });
        chmodSync(file, 0o600);
        return text(
            (specMissing
                ? `!! CST-SPEC.md is missing at ${SPEC_PATH} — this CST was composed without the authoritative spec. Say so to the user.\n\n`
                : '') +
                `Superseded ${old.name} → handoffs/superseded/.\nNew handoff: ${file}\nTell the user in one line: handoff replaced, one live CST again; pull it with /handoff-pull in a new cw thread or /x:handoff-pull in cc${keepShared ? ' (shared: kept for multiple pullers)' : ''}.`,
        );
    },
);

server.registerTool(
    'handoff_list',
    {
        description:
            'List the pending CSTs in the shared handoff store — slug, age, size, and tracker run id per entry — WITHOUT ingesting or deleting any of them. ' +
            'Use when the user asks what handoffs are pending, what is in the store, or whether anything is waiting. Each row names the agent it is FOR; rows marked NOT ours belong to another agent and must not be pulled. ' +
            "Read-only: no file is consumed and no CST content enters this thread. handoff_peek shows one entry's META; handoff_pull is the one that ingests.",
        inputSchema: {},
        title: 'List pending handoffs',
    },
    async () => {
        const pending = listPending();
        if (pending.length === 0)
            return text(
                'Handoff store is clean — nothing pending. A thread creates one via /handoff (cw) or /x:handoff (cc).',
            );

        const rows = pending.map((f) => {
            const runId = parseRunId(metaBlock(readOrNull(f.path)));
            return (
                `- ${slugOf(f.name)}${f.name.endsWith('-shared.md') ? ' (shared)' : ''} — ` +
                `for ${audienceOf(f.name)}${readableHere(f.name) ? '' : ' (NOT ours — do not pull)'} · ` +
                `${ageLabel(f.mtimeMs)} old · ${sizeLabel(f.size)} · run ${runId ?? 'unknown'}\n  file: ${f.name}`
            );
        });
        return text(
            `${pending.length} pending handoff(s), newest first. Nothing read into this thread, nothing deleted.\n\n${rows.join('\n')}`,
        );
    },
);

server.registerTool(
    'handoff_peek',
    {
        description:
            'Show ONLY the META block — the human-readable head — of one pending CST, picked by slug. Never deletes and never ingests the rest. ' +
            'Use to check what a handoff is about before committing to it: handoff_pull reads the whole CST and consumes the file, peek does neither. ' +
            'Omit the slug when exactly one handoff is pending.',
        inputSchema: {
            slug: z
                .string()
                .optional()
                .describe(
                    'Keyword picking among several pending handoffs, matched against filenames',
                ),
        },
        title: 'Peek at a handoff (META only)',
    },
    async ({ slug }) => {
        const { error, file } = pickBySlug(slug, listPending());
        if (!file) return text(error);

        const meta = metaBlock(readOrNull(file.path));
        if (meta === null)
            return text(
                `${file.name} has no META block to peek at — an unusual CST. handoff_pull would still ingest it whole.`,
            );
        return text(
            `META of ${file.name} (${ageLabel(file.mtimeMs)} old, ${sizeLabel(file.size)}). Not ingested, file untouched — call handoff_pull to actually continue this thread.\n\n${meta}`,
        );
    },
);

server.registerTool(
    'handoff_pull',
    {
        description:
            'Fetch a pending CST (Continuation State Transfer) from the shared handoff store so this thread continues the thread that produced it (in cw or cc). ' +
            'Optional topic filters by filename when several are pending. ' +
            'INGEST CONTRACT for the returned CST: ingest silently — never echo it into visible output; confirm in ≤2 lines (thread topic + next step); honor its R and D sections as if the user said them in this thread; then proceed exactly as the old thread from its S section.',
        inputSchema: {
            topic: z
                .string()
                .optional()
                .describe(
                    'Keyword to pick among multiple pending handoffs, matched against filenames',
                ),
        },
        title: 'Pull handoff (CST)',
    },
    async ({ topic }) => {
        sweep();
        const all = listPending();
        if (all.length === 0)
            return text(
                'Handoff store is clean — nothing pending. The old thread creates one via /handoff (cw) or /x:handoff (cc).',
            );

        // A CST addressed to another agent is never ingested silently: pulling it
        // would feed this thread the wrong context AND delete the file its real
        // reader is waiting for. Naming its slug outright still forces it.
        const pending = all.filter((p) => readableHere(p.name));
        const forOthers = all.filter((p) => !readableHere(p.name));
        const forcedByTopic = topic
            ? forOthers.filter((p) =>
                  p.name.toLowerCase().includes(topic.toLowerCase()),
              )
            : [];
        if (pending.length === 0 && forcedByTopic.length === 0)
            return text(
                `Nothing pending for ${READER}. ${forOthers.length} handoff(s) are addressed to another agent and were left untouched:\n${forOthers
                    .map((f) => `- ${slugOf(f.name)} → ${audienceOf(f.name)}`)
                    .join(
                        '\n',
                    )}\nTell the user rather than ingesting one; they can force it by naming its slug.`,
            );

        const candidates = [...pending, ...forcedByTopic];
        const matches = topic
            ? candidates.filter((p) =>
                  p.name.toLowerCase().includes(topic.toLowerCase()),
              )
            : candidates;
        const [picked, ...rest] = matches;
        if (!picked)
            return text(
                `No pending handoff matches "${topic}". Readable here:\n${describe(pending)}\nAsk the user to point at one.`,
            );
        if (rest.length > 0)
            return text(
                `Multiple pending handoffs — do not guess. Ask the user to point (then call again with a topic):\n${describe(matches)}`,
            );

        const cst = readFileSync(picked.path, 'utf8');
        const kept = picked.name.endsWith('-shared.md');
        if (!kept) rmSync(picked.path);
        return text(
            `CST from ${picked.name} (${kept ? 'shared file kept for other pullers' : 'file deleted on ingest'}). Ingest per contract in the tool description.\n\n${cst}`,
        );
    },
);

server.registerTool(
    'handoff_delete_all',
    {
        description:
            'Delete ALL pending CST files from the shared handoff store, including -shared ones. Pending handoffs are transient by design; use when the user asks to clear/delete them.',
        inputSchema: {},
        title: 'Delete all handoffs',
    },
    async () => {
        const pending = listPending();
        for (const p of pending) rmSync(p.path);
        return text(
            pending.length === 0
                ? 'Handoff store already empty.'
                : `Deleted ${pending.length} handoff(s): ${pending.map((p) => p.name).join(', ')}`,
        );
    },
);

server.registerTool(
    'handoff_delete',
    {
        description:
            'Delete ONE pending CST from the shared handoff store, picked by slug, leaving the rest alone. ' +
            'Use when the user wants a specific handoff dropped — stale, wrong thread, no longer needed. handoff_delete_all is the one that clears everything. ' +
            'An explicit delete also removes a -shared file: that suffix means the file survives being pulled, not that it survives an explicit delete.',
        inputSchema: {
            slug: z
                .string()
                .describe(
                    'Slug of the handoff to delete, matched against filenames',
                ),
        },
        title: 'Delete one handoff',
    },
    async ({ slug }) => {
        const { error, file } = pickBySlug(slug, listPending());
        if (!file) return text(`${error}\nNothing was deleted.`);

        rmSync(file.path);
        return text(
            `Deleted ${file.name}${file.name.endsWith('-shared.md') ? ' — it was -shared, so any other thread waiting on it no longer has it' : ''}.`,
        );
    },
);

server.registerPrompt(
    'handoff',
    {
        argsSchema: {
            focus: completableString(
                'Optional focus the continuation is for — the CST is weighted toward it',
            ),
        },
        description:
            'Compose a CST of this thread and save it for a new thread (cw or cc) to continue from',
        title: 'Hand off this thread',
    },
    ({ focus }) =>
        promptMessage(
            `Hand off this thread. FIRST ask the user for the numbers META's compare-anchors need (his /context output, plus anything else the next thread must diff against) — one line, and proceed without them if he declines. Then compose a CST (Continuation State Transfer) covering this ENTIRE thread per the spec in the handoff_save tool description${focus ? `, weighted toward this focus (its TARGET rule): ${focus}` : ''}. Then call handoff_save with the CST and a short kebab-case slug naming the thread's topic. Do not print the CST in your reply — the tool result tells you what to say.`,
        ),
);

server.registerPrompt(
    'handoff-pull',
    {
        argsSchema: {
            topic: completableString(
                'Optional keyword picking among multiple pending handoffs',
            ),
        },
        description: 'Continue a thread handed off from cw or cc',
        title: 'Pull a pending handoff',
    },
    ({ topic }) =>
        promptMessage(
            `Call handoff_pull${topic ? ` with topic "${topic}"` : ''} and ingest the returned CST per the contract in its tool description: silent ingest, ≤2-line confirmation (thread topic + next step), run its META first-acts before anything else, honor its R/D sections as user-said, then proceed exactly as the old thread from its S section.`,
        ),
);

/* Helpers */
/**
 * Read per call, never cached at boot: the spec is edited in the repo while this
 * server keeps running, and a cached copy would serve text that no longer exists
 * with nothing to say it was doing so.
 *
 * The fallback is deliberately LOUD. Silently composing CSTs from a one-paragraph
 * summary of the spec is the failure nobody would notice — the tool still works,
 * the output is just quietly worse.
 */
function loadSpec(): string {
    if (existsSync(SPEC_PATH)) return readFileSync(SPEC_PATH, 'utf8');
    return (
        `!! CST-SPEC.md WAS NOT FOUND at ${SPEC_PATH}. This server is running degraded: ` +
        'the authoritative spec is missing, so what follows is a summary of it, not the spec. ' +
        'Say so in your reply — the CST will be weaker than usual and someone should fix the path.\n\n' +
        'Compose the CST as an upgraded compaction: preserve user requirements and corrections ' +
        'verbatim, decisions with rationale, exact state and next step, pointers over content ' +
        'dumps; mark unverified beliefs with `?`; never include secrets.'
    );
}

// The store is shared by every frontend, so a file can vanish between the
// readdir and the read — another thread pulling, a cc session pruning. That is
// normal traffic, not an error, and it must never take a tool call down.
function statOrNull(path: string) {
    try {
        return statSync(path);
    } catch {
        return null;
    }
}

function readOrNull(path: string) {
    try {
        return readFileSync(path, 'utf8');
    } catch {
        return null;
    }
}

function sweep() {
    if (!existsSync(HANDOFF_DIR)) return;
    const now = Date.now();
    for (const entry of readdirSync(HANDOFF_DIR)) {
        if (!entry.endsWith('.md')) continue;
        const path = join(HANDOFF_DIR, entry);
        const stat = statOrNull(path);
        if (stat !== null && now - stat.mtimeMs > SWEEP_MAX_AGE_MS) {
            try {
                rmSync(path);
            } catch {
                /* already gone */
            }
        }
    }
}

type PendingFile = {
    mtimeMs: number;
    name: string;
    path: string;
    size: number;
};

// Only *.md is a handoff, which is also what keeps superseded/ invisible here:
// it is a directory, so it never matches, and no tool has to know it exists.
function listPending(): PendingFile[] {
    if (!existsSync(HANDOFF_DIR)) return [];
    return readdirSync(HANDOFF_DIR)
        .filter((entry) => entry.endsWith('.md'))
        .map((name) => {
            const path = join(HANDOFF_DIR, name);
            const stat = statOrNull(path);
            return stat === null
                ? null
                : { mtimeMs: stat.mtimeMs, name, path, size: stat.size };
        })
        .filter((f): f is PendingFile => f !== null)
        .sort((a, b) => b.mtimeMs - a.mtimeMs);
}

// Four tools address one file by slug and every one of them must refuse rather
// than guess, so the ambiguity wording is written once, here.
function pickBySlug(
    slug: string | undefined,
    pending: PendingFile[],
): { error: string; file: null } | { error: null; file: PendingFile } {
    const matches = slug
        ? pending.filter((p) =>
              p.name.toLowerCase().includes(slug.toLowerCase()),
          )
        : pending;
    const [picked, ...rest] = matches;
    if (!picked)
        return {
            error:
                pending.length === 0
                    ? 'Handoff store is clean — nothing pending.'
                    : `No pending handoff matches "${slug}". Pending:\n${describe(pending)}\nAsk the user to point at one.`,
            file: null,
        };
    if (rest.length > 0)
        return {
            error: `Several pending handoffs match — do not guess. Ask the user to point (then call again with a slug that picks one):\n${describe(matches)}`,
            file: null,
        };
    return { error: null, file: picked };
}

/**
 * META is the human-facing head of a CST and ends where the next top-level
 * heading begins. Bounding the slice is what makes it trustworthy: the words
 * "run id" also occur in ordinary prose further down a CST, and a whole-file
 * search would happily report one of those as the run marker.
 */
function metaBlock(cst: string | null) {
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

// Two shapes are live in the store — `run id: **x**` today, `**Run marker:** `x``
// in older CSTs. Anything else returns null rather than a guess: a wrong run id
// silently merges two tracker runs, which is worse than an absent one.
function parseRunId(meta: string | null) {
    const match = meta?.match(
        /run\s*(?:id|marker)\s*:?\**\s*(?:\*\*|`)([^*`\n]+)(?:\*\*|`)/i,
    );
    return match ? match[1].trim() : null;
}

const AUDIENCES = ['any', 'cw', 'cclio', 'dpatch', 'ccli'] as const;
type Audience = (typeof AUDIENCES)[number];

/** Which agent THIS server reads for. The x-cw server is the desktop (`cw`) door. */
const READER: Audience = 'cw';

/** A legacy two-segment name has no audience token and counts as `any` (CST-SPEC store contract). */
function audienceOf(name: string): Audience {
    const match = name.match(/^\d{8}T\d{6}Z-([a-z0-9]+)-/);
    const token = match?.[1];
    return token && (AUDIENCES as readonly string[]).includes(token)
        ? (token as Audience)
        : 'any';
}

function readableHere(name: string) {
    const audience = audienceOf(name);
    return audience === 'any' || audience === READER;
}

function slugOf(name: string) {
    return name
        .replace(/^\d{8}T\d{6}Z-/, '')
        .replace(new RegExp(`^(${AUDIENCES.join('|')})-`), '')
        .replace(/(?:-shared)?\.md$/, '');
}

function ageLabel(mtimeMs: number) {
    const minutes = Math.round((Date.now() - mtimeMs) / 60000);
    if (minutes < 90) return `${minutes}m`;
    if (minutes < 60 * 36) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / 1440)}d`;
}

function sizeLabel(bytes: number) {
    return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} kB`;
}

function describe(files: PendingFile[]) {
    return files
        .map((f) => `- ${f.name} (${ageLabel(f.mtimeMs)} old)`)
        .join('\n');
}

function utcTs() {
    return new Date()
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d+Z$/, 'Z');
}

function sanitizeSlug(slug: string) {
    return (
        slug
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-shared$/, '') || 'handoff'
    );
}

function text(body: string) {
    return { content: [{ text: body, type: 'text' as const }] };
}

function promptMessage(body: string) {
    return {
        messages: [
            {
                content: { text: body, type: 'text' as const },
                role: 'user' as const,
            },
        ],
    };
}

function completableString(description: string) {
    return z.string().optional().describe(description);
}

/* ── yt-transcript ─────────────────────────────────────────────────────────
 * The same pipeline `x:yt-transcript` describes for cc, run here instead of
 * described. Desktop has no shell of its own, so a tool is the only door that
 * does not need Desktop Commander cooperating with this server.
 *
 * One process holds its own variables, so the skill's "shell state does not
 * survive between calls" workarounds are deliberately NOT ported: no fixed
 * .work dir, no re-derived VID. The hard-won yt-dlp details ARE ported.
 */

server.registerTool(
    'yt_transcript_fetch',
    {
        description:
            'YOUTUBE VIDEOS — THE DEFAULT ONE. Download the spoken words of a YouTube video and return them as text. ' +
            'Use whenever the user shares a youtube.com or youtu.be link and wants what was said in it — summarising a talk, quoting it, answering questions about it, or pulling it into the conversation. ' +
            'Use this unless the user explicitly asks not to keep the video; a plain request for a transcript means this tool, not yt_transcript_transit. ' +
            'Prefer this over running yt-dlp yourself: it writes to the shared shelf on the mac, so cc and cw see the same transcripts, it dedupes against what is already there, and the file still exists tomorrow. ' +
            'Nothing to do with session handoffs or CSTs.',
        inputSchema: {
            url: z.string().describe('The YouTube video url'),
        },
        title: 'Download a YouTube transcript',
    },
    async ({ url }) => transcriptRun(url, false),
);

server.registerTool(
    'yt_transcript_transit',
    {
        description:
            'YOUTUBE VIDEOS — THE EXCEPTION, NOT THE DEFAULT. Download the spoken words of a YouTube video, return them as text, then delete the files immediately. ' +
            'ONLY use this when the user says so — "do not keep it", "just read it to me", "throw it away after". A plain "get me the transcript" is NOT this tool: use yt_transcript_fetch. ' +
            'The user picks videos he already judged worth keeping, so keeping is the norm; discarding by default would leave yt_transcript_recall with nothing to recall. ' +
            'Safe when it is asked for: captions re-download in seconds, so nothing is lost. Nothing to do with session handoffs or CSTs.',
        inputSchema: {
            url: z.string().describe('The YouTube video url'),
        },
        title: 'Transcript, read and discard',
    },
    async ({ url }) => transcriptRun(url, true),
);

server.registerTool(
    'yt_transcript_recall',
    {
        description:
            'YOUTUBE VIDEOS. Read the words of a YouTube video already downloaded, found by a word from its title, its channel name, or its YouTube video id. ' +
            'Read-only: downloads nothing and deletes nothing. Use when the user refers back to a video fetched earlier, in this conversation or another one. ' +
            'Nothing to do with session handoffs or CSTs.',
        inputSchema: {
            query: z
                .string()
                .describe(
                    'A word from the title or channel, or the YouTube video id',
                ),
        },
        title: 'Recall a stored transcript',
    },
    async ({ query }) => {
        const hits = transcriptDirs().filter((name) =>
            name.toLowerCase().includes(query.toLowerCase()),
        );
        if (hits.length === 0)
            return text(
                `Nothing on the shelf matches "${query}". ${transcriptDirs().length} transcript(s) stored; call yt_transcript_list to see them, or yt_transcript_fetch to download a new one.`,
            );
        if (hits.length > 1)
            return text(
                `Several match "${query}" — ask which:\n${hits.map((h) => `- ${h}`).join('\n')}`,
            );

        const dir = join(TRANSCRIPT_DIR, hits[0]);
        const body = readOrNull(join(dir, 'transcript.txt'));
        if (body === null)
            return text(
                `${hits[0]} exists but has no transcript.txt — an incomplete fetch. Re-run yt_transcript_fetch on its url.`,
            );
        return text(
            `${transcriptHeader(dir, hits[0])}\nRead only — nothing was downloaded or deleted.\n\n${body}`,
        );
    },
);

server.registerTool(
    'yt_transcript_list',
    {
        description:
            'YOUTUBE VIDEOS. List the YouTube videos already downloaded as text — channel, title and size per entry. ' +
            'Read-only. Use when the user asks which videos have been transcribed, or before fetching one that may already be stored. ' +
            'Nothing to do with session handoffs or CSTs.',
        inputSchema: {},
        title: 'List stored transcripts',
    },
    async () => {
        const dirs = transcriptDirs();
        if (dirs.length === 0)
            return text(
                'No transcripts on the shelf yet. yt_transcript_fetch downloads one from a YouTube url.',
            );
        const rows = dirs.map((name) => {
            const meta = transcriptMeta(join(TRANSCRIPT_DIR, name));
            const size = statOrNull(
                join(TRANSCRIPT_DIR, name, 'transcript.txt'),
            );
            return `- ${meta?.channel ?? 'unknown channel'} — ${meta?.title ?? name} (${size ? sizeLabel(size.size) : 'no transcript.txt'})\n  dir: ${name}`;
        });
        return text(
            `${dirs.length} transcript(s) on the shelf. Nothing read into this thread.\n\n${rows.join('\n')}`,
        );
    },
);

type TranscriptMeta = {
    channel?: string;
    duration_seconds?: number;
    title?: string;
    url?: string;
    video_id?: string;
};

function transcriptDirs(): string[] {
    if (!existsSync(TRANSCRIPT_DIR)) return [];
    return readdirSync(TRANSCRIPT_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
        .map((entry) => entry.name)
        .sort();
}

function transcriptMeta(dir: string): TranscriptMeta | null {
    const raw = readOrNull(join(dir, 'metadata.json'));
    if (raw === null) return null;
    try {
        return JSON.parse(raw) as TranscriptMeta;
    } catch {
        return null;
    }
}

function transcriptHeader(dir: string, name: string) {
    const meta = transcriptMeta(dir);
    const size = statOrNull(join(dir, 'transcript.txt'));
    const minutes = meta?.duration_seconds
        ? `${Math.round(meta.duration_seconds / 60)} min`
        : 'unknown length';
    return [
        `${meta?.title ?? name}`,
        `channel: ${meta?.channel ?? 'unknown'} · ${minutes} · ${size ? sizeLabel(size.size) : 'unknown size'}`,
        `source: ${meta?.url ?? 'unknown url'}`,
    ].join('\n');
}

function run(command: string, args: string[], cwd?: string) {
    // yt-dlp exits non-zero on conditions that still produced the file, so the
    // caller judges success by what landed on disk, never by this exit code.
    try {
        return execFileSync(command, args, {
            cwd,
            encoding: 'utf8',
            maxBuffer: 64 * 1024 * 1024,
            stdio: ['ignore', 'pipe', 'ignore'],
        });
    } catch (error) {
        const partial = (error as { stdout?: string }).stdout;
        return typeof partial === 'string' ? partial : '';
    }
}

/** One code, never a pattern: a pattern makes yt-dlp fetch many tracks and YouTube answers 429. */
function pickLang(info: {
    automatic_captions?: Record<string, unknown>;
    subtitles?: Record<string, unknown>;
}) {
    const manual = Object.keys(info.subtitles ?? {});
    if (manual.length > 0) return manual.includes('en') ? 'en' : manual[0];
    const auto = Object.keys(info.automatic_captions ?? {});
    const orig = auto.find((key) => key.endsWith('-orig'));
    if (orig) return orig;
    return auto.includes('en') ? 'en' : (auto[0] ?? null);
}

async function transcriptRun(url: string, transit: boolean) {
    for (const binary of ['yt-dlp', 'python3']) {
        try {
            execFileSync('which', [binary], { stdio: 'ignore' });
        } catch {
            return text(
                `\`${binary}\` is not on PATH, so no transcript can be produced. Tell the user; do not retry.`,
            );
        }
    }

    const raw = run('yt-dlp', ['-J', '--skip-download', url]);
    let info: {
        automatic_captions?: Record<string, unknown>;
        channel?: string;
        duration?: number;
        id?: string;
        subtitles?: Record<string, unknown>;
        title?: string;
        upload_date?: string;
        uploader?: string;
    };
    try {
        info = JSON.parse(raw);
    } catch {
        return text(
            `yt-dlp returned no usable metadata for ${url}. The url may be wrong, private, or region-blocked. Tell the user; do not retry.`,
        );
    }
    if (!info.id)
        return text(`No video id came back for ${url} — nothing to fetch.`);

    // Anchored on the trailing id: the id is always the tail after a hyphen, so
    // this can only ever hit the same video. An unanchored test would match a
    // slug that merely contains those letters.
    const existing = transcriptDirs().find((name) =>
        name.endsWith(`-${info.id}`),
    );
    if (existing && !transit) {
        const dir = join(TRANSCRIPT_DIR, existing);
        const body = readOrNull(join(dir, 'transcript.txt'));
        if (body !== null)
            return text(
                `${transcriptHeader(dir, existing)}\nAlready on the shelf — reused, nothing downloaded.\n\n${body}`,
            );
    }

    const lang = pickLang(info);
    if (!lang)
        return text(
            `"${info.title ?? url}" has no captions in any language. Only the whisper tier could transcribe it, and that is not built. Tell the user.`,
        );

    const channel = info.channel ?? info.uploader ?? '';
    // Built and checked separately: an inlined failure would leave the path at
    // the store root and download into it.
    const name = run('python3', [
        join(TRANSCRIPT_SCRIPTS, 'sanitize_title.py'),
        channel,
        info.title ?? '',
        info.id,
    ]).trim();
    if (!name || name.includes('/'))
        return text(
            `Could not build a safe directory name for "${info.title ?? url}". Nothing was written.`,
        );

    const dir = join(TRANSCRIPT_DIR, name);
    mkdirSync(dir, { recursive: true });
    // Both flags: manual and auto captions are separate, and a video can have
    // one without the other.
    run(
        'yt-dlp',
        [
            '--skip-download',
            '--write-subs',
            '--write-auto-subs',
            '--sub-langs',
            lang,
            '--sub-format',
            'vtt',
            '-o',
            'captions',
            url,
        ],
        dir,
    );

    const vtt = readdirSync(dir).find(
        (file) => file.startsWith('captions.') && file.endsWith('.vtt'),
    );
    if (!vtt) {
        if (transcriptDirs().includes(name)) rmSync(dir, { recursive: true });
        return text(
            `The caption download produced no file for "${info.title ?? url}" (language ${lang}). Nothing was kept. Tell the user; do not retry the same language.`,
        );
    }
    renameSync(join(dir, vtt), join(dir, 'captions.vtt'));
    run(
        'python3',
        [
            join(TRANSCRIPT_SCRIPTS, 'clean_captions.py'),
            'captions.vtt',
            'transcript.txt',
        ],
        dir,
    );

    const body = readOrNull(join(dir, 'transcript.txt'));
    if (body === null) {
        rmSync(dir, { recursive: true });
        return text(
            `Captions downloaded but cleaning produced nothing for "${info.title ?? url}". Nothing was kept.`,
        );
    }

    writeFileSync(
        join(dir, 'metadata.json'),
        `${JSON.stringify(
            {
                caption_lang: lang,
                channel: channel || null,
                duration_seconds: info.duration ?? null,
                fetched_at: new Date().toISOString(),
                source: 'captions',
                title: info.title ?? null,
                upload_date: info.upload_date ?? null,
                url,
                video_id: info.id,
            },
            null,
            2,
        )}\n`,
    );

    const header = transcriptHeader(dir, name);
    if (transit) {
        rmSync(dir, { recursive: true });
        return text(
            `${header}\nTransit — the files were deleted after reading. Captions re-download in seconds if it is wanted again.\n\n${body}`,
        );
    }
    return text(`${header}\nKept on the shelf as \`${name}\`.\n\n${body}`);
}

const transport = new StdioServerTransport();
await server.connect(transport);
