/* Core */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, chmodSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const HANDOFF_DIR = join(homedir(), '.claude', 'handoffs');
const SWEEP_MAX_AGE_MS = 24 * 60 * 60 * 1000;
// source-of-truth candidates: post- and pre-rename locations of the plugin dir
const SPEC_CANDIDATES = [
    join(homedir(), '.dotfiles', '.clauderc', 'plugin-x', 'CST-SPEC.md'),
    join(homedir(), '.dotfiles', '.clauderc', 'x-plugin', 'CST-SPEC.md'),
];

const spec = loadSpec();
const server = new McpServer({ name: 'handoff', version: '0.1.0' });

server.registerTool(
    'save_handoff',
    {
        title: 'Save handoff (CST)',
        description:
            `Persist a CST (Continuation State Transfer) of the current thread to the shared handoff store, ` +
            `where any Claude Desktop thread or Claude Code session can pull it to continue this thread. ` +
            `FIRST compose the CST from the current thread per the spec below, THEN call this tool with it. ` +
            `Compose it as machine-optimized telegraphic text — no presentation polish, no human reads it.\n\n${spec}`,
        inputSchema: {
            cst: z.string().describe('The complete CST document composed per the spec'),
            slug: z.string().describe('Short kebab-case topic slug for the filename, e.g. "bg2ee-mod-order"'),
            shared: z
                .boolean()
                .optional()
                .describe('True only if several threads are expected to pull this CST (file then survives ingest)'),
        },
    },
    async ({ cst, slug, shared }) => {
        sweep();
        mkdirSync(HANDOFF_DIR, { recursive: true, mode: 0o700 });
        const file = join(HANDOFF_DIR, `${utcTs()}-${sanitizeSlug(slug)}${shared ? '-shared' : ''}.md`);
        writeFileSync(file, cst, { mode: 0o600 });
        chmodSync(file, 0o600);
        return text(
            `Handoff saved: ${file}\nTell the user in one line: handoff written; pull it with /handoff-pull in a new Desktop thread or /x:handoff-pull in Claude Code. It is deleted on ingest${shared ? ' (shared: kept for multiple pullers)' : ''}.`,
        );
    },
);

server.registerTool(
    'pull_handoff',
    {
        title: 'Pull handoff (CST)',
        description:
            'Fetch a pending CST (Continuation State Transfer) from the shared handoff store so this thread continues the thread that produced it (in Claude Desktop or Claude Code). ' +
            'Optional topic filters by filename when several are pending. ' +
            'INGEST CONTRACT for the returned CST: ingest silently — never echo it into visible output; confirm in ≤2 lines (thread topic + next step); honor its R and D sections as if the user said them in this thread; then proceed exactly as the old thread from its S section.',
        inputSchema: {
            topic: z
                .string()
                .optional()
                .describe('Keyword to pick among multiple pending handoffs, matched against filenames'),
        },
    },
    async ({ topic }) => {
        sweep();
        const pending = listPending();
        if (pending.length === 0)
            return text('Handoff store is clean — nothing pending. The old thread creates one via /handoff (Desktop) or /x:handoff (Claude Code).');

        const matches = topic
            ? pending.filter((p) => p.name.toLowerCase().includes(topic.toLowerCase()))
            : pending;
        if (matches.length === 0)
            return text(`No pending handoff matches "${topic}". Pending:\n${describe(pending)}\nAsk the user to point at one.`);
        if (matches.length > 1)
            return text(
                `Multiple pending handoffs — do not guess. Ask the user to point (then call again with a topic):\n${describe(matches)}`,
            );

        const picked = matches[0]!;
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
        title: 'Prune handoff store',
        description:
            'Delete ALL pending CST files from the shared handoff store, including -shared ones. Pending handoffs are transient by design; use when the user asks to clear/prune them.',
        inputSchema: {},
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
        title: 'Hand off this thread',
        description: 'Compose a CST of this thread and save it for a new thread (Desktop or Claude Code) to continue from',
        argsSchema: {
            focus: completableString(
                'Optional focus the continuation is for — the CST is weighted toward it',
            ),
        },
    },
    ({ focus }) => promptMessage(
        `Hand off this thread. Compose a CST (Continuation State Transfer) covering this ENTIRE thread per the spec in the save_handoff tool description${focus ? `, weighted toward this focus (its TARGET rule): ${focus}` : ''}. Then call save_handoff with the CST and a short kebab-case slug naming the thread's topic. Do not print the CST in your reply — the tool result tells you what to say.`,
    ),
);

server.registerPrompt(
    'handoff-pull',
    {
        title: 'Pull a pending handoff',
        description: 'Continue a thread handed off from Claude Desktop or Claude Code',
        argsSchema: {
            topic: completableString('Optional keyword picking among multiple pending handoffs'),
        },
    },
    ({ topic }) => promptMessage(
        `Call pull_handoff${topic ? ` with topic "${topic}"` : ''} and ingest the returned CST per the contract in its tool description: silent ingest, ≤2-line confirmation (thread topic + next step), honor its R/D sections as user-said, then proceed exactly as the old thread from its S section.`,
    ),
);

/* Helpers */
function loadSpec(): string {
    for (const candidate of SPEC_CANDIDATES) {
        if (existsSync(candidate)) return readFileSync(candidate, 'utf8');
    }
    // degraded but functional: the prompts/tools still work, composition falls back to model judgment
    return 'CST-SPEC.md not found on disk — compose the CST as an upgraded compaction: preserve user requirements/corrections verbatim, decisions with rationale, exact state and next step, pointers over content dumps; mark unverified beliefs with `?`; never include secrets.';
}

function sweep() {
    if (!existsSync(HANDOFF_DIR)) return;
    const now = Date.now();
    for (const entry of readdirSync(HANDOFF_DIR)) {
        if (!entry.endsWith('.md')) continue;
        const path = join(HANDOFF_DIR, entry);
        if (now - statSync(path).mtimeMs > SWEEP_MAX_AGE_MS) rmSync(path);
    }
}

function listPending() {
    if (!existsSync(HANDOFF_DIR)) return [];
    return readdirSync(HANDOFF_DIR)
        .filter((entry) => entry.endsWith('.md'))
        .map((name) => {
            const path = join(HANDOFF_DIR, name);
            return { name, path, mtimeMs: statSync(path).mtimeMs };
        })
        .sort((a, b) => b.mtimeMs - a.mtimeMs);
}

function describe(files: ReturnType<typeof listPending>) {
    const now = Date.now();
    return files
        .map((f) => `- ${f.name} (${Math.round((now - f.mtimeMs) / 60000)}m old)`)
        .join('\n');
}

function utcTs() {
    return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
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
    return { content: [{ type: 'text' as const, text: body }] };
}

function promptMessage(body: string) {
    return { messages: [{ role: 'user' as const, content: { type: 'text' as const, text: body } }] };
}

function completableString(description: string) {
    return z.string().optional().describe(description);
}

const transport = new StdioServerTransport();
await server.connect(transport);
