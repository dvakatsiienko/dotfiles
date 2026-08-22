/* Core */

import {
    chmodSync,
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
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
const SWEEP_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const SPEC_PATH = join(
    homedir(),
    'projects/dotfiles',
    'home/.claude',
    'plugin-x',
    'CST-SPEC.md',
);
const server = new McpServer({ name: 'handoff', version: '0.1.0' });

server.registerTool(
    'save_handoff',
    {
        description:
            `Persist a CST (Continuation State Transfer) of the current thread to the shared handoff store, ` +
            `where any cw thread or cc session can pull it to continue this thread. ` +
            `FIRST compose the CST from the current thread per the spec below, THEN call this tool with it. ` +
            `Compose it as machine-optimized telegraphic text with light markdown structure, per the compression contract below. The META section is the exception: it is formatted for a human and goes first.\n\n${loadSpec()}`,
        inputSchema: {
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
    async ({ cst, slug, shared }) => {
        // The description above is baked in when the tool registers, so it cannot
        // report a spec that went missing afterwards. The handler can, and this is
        // the only place cw would ever hear about it.
        const specMissing = !existsSync(SPEC_PATH);
        sweep();
        mkdirSync(HANDOFF_DIR, { mode: 0o700, recursive: true });
        const file = join(
            HANDOFF_DIR,
            `${utcTs()}-${sanitizeSlug(slug)}${shared ? '-shared' : ''}.md`,
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
    'pull_handoff',
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
        const pending = listPending();
        if (pending.length === 0)
            return text(
                'Handoff store is clean — nothing pending. The old thread creates one via /handoff (cw) or /x:handoff (cc).',
            );

        const matches = topic
            ? pending.filter((p) =>
                  p.name.toLowerCase().includes(topic.toLowerCase()),
              )
            : pending;
        const [picked, ...rest] = matches;
        if (!picked)
            return text(
                `No pending handoff matches "${topic}". Pending:\n${describe(pending)}\nAsk the user to point at one.`,
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
    'prune_handoffs',
    {
        description:
            'Delete ALL pending CST files from the shared handoff store, including -shared ones. Pending handoffs are transient by design; use when the user asks to clear/prune them.',
        inputSchema: {},
        title: 'Prune handoff store',
    },
    async () => {
        const pending = listPending();
        for (const p of pending) rmSync(p.path);
        return text(
            pending.length === 0
                ? 'Handoff store already clean.'
                : `Pruned ${pending.length} handoff(s): ${pending.map((p) => p.name).join(', ')}`,
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
            `Hand off this thread. FIRST ask the user for the numbers META's compare-anchors need (his /context output, plus anything else the next thread must diff against) — one line, and proceed without them if he declines. Then compose a CST (Continuation State Transfer) covering this ENTIRE thread per the spec in the save_handoff tool description${focus ? `, weighted toward this focus (its TARGET rule): ${focus}` : ''}. Then call save_handoff with the CST and a short kebab-case slug naming the thread's topic. Do not print the CST in your reply — the tool result tells you what to say.`,
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
            `Call pull_handoff${topic ? ` with topic "${topic}"` : ''} and ingest the returned CST per the contract in its tool description: silent ingest, ≤2-line confirmation (thread topic + next step), run its META first-acts before anything else, honor its R/D sections as user-said, then proceed exactly as the old thread from its S section.`,
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
// readdir and the stat — another thread pulling, a cc session pruning. That is
// normal traffic, not an error, and it must never take a tool call down.
function mtimeOrNull(path: string) {
    try {
        return statSync(path).mtimeMs;
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
        const mtimeMs = mtimeOrNull(path);
        if (mtimeMs !== null && now - mtimeMs > SWEEP_MAX_AGE_MS) {
            try {
                rmSync(path);
            } catch {
                /* already gone */
            }
        }
    }
}

function listPending() {
    if (!existsSync(HANDOFF_DIR)) return [];
    return readdirSync(HANDOFF_DIR)
        .filter((entry) => entry.endsWith('.md'))
        .map((name) => {
            const path = join(HANDOFF_DIR, name);
            return { mtimeMs: mtimeOrNull(path), name, path };
        })
        .filter(
            (f): f is { mtimeMs: number; name: string; path: string } =>
                f.mtimeMs !== null,
        )
        .sort((a, b) => b.mtimeMs - a.mtimeMs);
}

function describe(files: ReturnType<typeof listPending>) {
    const now = Date.now();
    return files
        .map(
            (f) =>
                `- ${f.name} (${Math.round((now - f.mtimeMs) / 60000)}m old)`,
        )
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

const transport = new StdioServerTransport();
await server.connect(transport);
