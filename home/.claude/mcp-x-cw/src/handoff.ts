/* ── handoff ───────────────────────────────────────────────────────────────
 * Every tool here is an adapter over the `handoff-store` cli in dotfiles. The
 * store's rules — filename grammar, the audience gate, ingest-deletes, the
 * replace that folds two handoffs into one — live there once, so cc and cw can
 * no longer fork them. Nothing in this file decides anything about the store;
 * it shapes arguments, forwards the cli's own words, and adds the cw-facing
 * instruction around them.
 */

/* Core */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import {
    CLAUDE_HOME,
    DOTFILES,
    completableString,
    promptMessage,
    readOrNull,
    text,
} from './shared.js';

const CLI = join(DOTFILES, 'script', 'handoff-store.ts');
const SPEC_PATH = join(CLAUDE_HOME, 'plugin-x', 'CST-SPEC.md');

/** Which agent this server reads for. The x-cw server is the desktop door. */
const READER = 'cw';

const AUDIENCE = z
    .enum(['any', 'cw', 'cclio', 'dpatch', 'ccli'])
    .optional()
    .describe(
        'Which agent this CST is FOR. Omit (or "any") when it is for whoever picks it up next. Naming one means only that agent pulls it — every other agent leaves it alone instead of ingesting and deleting it by mistake.',
    );

export function registerHandoffTools(server: McpServer) {
    server.registerTool(
        'handoff_save',
        {
            description:
                `Persist a CST (Continuation State Transfer) of the current thread to the shared handoff store, ` +
                `where any cw thread or cc session can pull it to continue this thread. ` +
                `FIRST call handoff_list and look for a pending handoff of THIS thread — one thread leaves ONE file. Found one? Fold its content into the new CST and call handoff_supersede instead of this tool. ` +
                `THEN compose the CST from the current thread per the spec below, and call this tool with it. ` +
                `Compose it as machine-optimized telegraphic text with light markdown structure, per the compression contract below. The META section is the exception: it is formatted for a human and goes first.\n\n${loadSpec()}`,
            inputSchema: {
                audience: AUDIENCE,
                cst: z
                    .string()
                    .describe(
                        'The complete CST document composed per the spec',
                    ),
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
            const written = cli(
                [
                    'write',
                    '--audience',
                    audience ?? 'any',
                    '--slug',
                    slug,
                    ...(shared ? ['--shared'] : []),
                ],
                cst,
            );
            if (!written.ok) return text(written.out);

            return text(
                `${specWarning()}${written.out}\nTell the user in one line: handoff written; pull it with /handoff-ingest in a new cw thread or /x:handoff-ingest in cc. It is deleted on ingest${shared ? ' (shared: kept for multiple pullers)' : ''}.`,
            );
        },
    );

    server.registerTool(
        'handoff_supersede',
        {
            description:
                'Save a CST that REPLACES a pending one instead of adding a second: the named handoff is deleted and this one takes its place, so a session keeps exactly one live handoff. ' +
                'This is the upmerge — fold what still matters out of the old CST into the new one BEFORE calling, because the old file is gone afterwards. ' +
                'Use for a re-handoff of a thread that already saved one — "update my handoff", "replace it", "hand off again". Use handoff_save for a thread\'s first. ' +
                "Compose the CST exactly as handoff_save's description specifies; the spec lives there and is not repeated here.",
            inputSchema: {
                audience: AUDIENCE,
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
            const written = cli(
                [
                    'write',
                    '--audience',
                    audience ?? 'any',
                    '--slug',
                    slug,
                    '--replaces',
                    slug,
                    ...(shared ? ['--shared'] : []),
                ],
                cst,
            );
            if (!written.ok) return text(written.out);

            return text(
                `${specWarning()}${written.out}\nTell the user in one line: handoff replaced, one live CST again; pull it with /handoff-ingest in a new cw thread or /x:handoff-ingest in cc.`,
            );
        },
    );

    server.registerTool(
        'handoff_list',
        {
            description:
                'List the pending CSTs in the shared handoff store — slug, age, size, and tracker run id per entry — WITHOUT ingesting or deleting any of them. ' +
                "Use when the user asks what handoffs are pending, and ALWAYS before saving one, to find this thread's own sibling. Entries listed separately as addressed to another agent must not be pulled. " +
                'A handoff older than 7 days is flagged. The flag is information for the user — nothing is deleted by age, here or anywhere else. ' +
                "Read-only: no file is consumed and no CST content enters this thread. handoff_peek shows one entry's META; handoff_ingest is the one that ingests.",
            inputSchema: {},
            title: 'List pending handoffs',
        },
        async () => forward(cli(['list', '--for', READER])),
    );

    server.registerTool(
        'handoff_peek',
        {
            description:
                'Show ONLY the META block — the human-readable head — of one pending CST, picked by slug. Never deletes and never ingests the rest. ' +
                'Use to check what a handoff is about before committing to it: handoff_ingest reads the whole CST and consumes the file, peek does neither. ' +
                'Omit the slug when exactly one handoff is pending.',
            inputSchema: {
                slug: completableString(
                    'Keyword picking among several pending handoffs, matched against filenames',
                ),
            },
            title: 'Peek at a handoff (META only)',
        },
        async ({ slug }) => forward(cli(['peek', ...(slug ? [slug] : [])])),
    );

    server.registerTool(
        'handoff_ingest',
        {
            description:
                'Fetch a pending CST (Continuation State Transfer) from the shared handoff store so this thread continues the thread that produced it (in cw or cc). ' +
                'Optional topic filters by filename when several are pending; naming a topic also forces a handoff addressed to another agent, which a bare call never takes. ' +
                'INGEST CONTRACT for the returned CST: ingest silently — never echo it into visible output; confirm in ≤2 lines (thread topic + next step); honor its R and D sections as if the user said them in this thread; then proceed exactly as the old thread from its S section.',
            inputSchema: {
                topic: completableString(
                    'Keyword to pick among multiple pending handoffs, matched against filenames',
                ),
            },
            title: 'Ingest handoff (CST)',
        },
        async ({ topic }) =>
            forward(
                cli(['ingest', ...(topic ? [topic] : []), '--for', READER]),
            ),
    );

    server.registerTool(
        'handoff_delete_all',
        {
            description:
                'Delete ALL pending CST files from the shared handoff store, including -shared ones. Pending handoffs are transient by design; use when the user asks to clear/delete them.',
            inputSchema: {},
            title: 'Delete all handoffs',
        },
        async () => forward(cli(['delete', '--all'])),
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
        async ({ slug }) => forward(cli(['delete', slug])),
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
                `Hand off this thread. FIRST ask the user for the numbers META's compare-anchors need (his /context output, plus anything else the next thread must diff against) — one line, and proceed without them if he declines. Then call handoff_list: a pending handoff of this same thread means you fold it into the new CST and finish with handoff_supersede rather than handoff_save. Then compose a CST (Continuation State Transfer) covering this ENTIRE thread per the spec in the handoff_save tool description${focus ? `, weighted toward this focus (its TARGET rule): ${focus}` : ''}, and save it with a short kebab-case slug naming the thread's topic. Do not print the CST in your reply — the tool result tells you what to say.`,
            ),
    );

    server.registerPrompt(
        'handoff-ingest',
        {
            argsSchema: {
                topic: completableString(
                    'Optional keyword picking among multiple pending handoffs',
                ),
            },
            description: 'Continue a thread handed off from cw or cc',
            title: 'Ingest a pending handoff',
        },
        ({ topic }) =>
            promptMessage(
                `Call handoff_ingest${topic ? ` with topic "${topic}"` : ''} and ingest the returned CST per the contract in its tool description: silent ingest, ≤2-line confirmation (thread topic + next step), run its META first-acts before anything else, honor its R/D sections as user-said, then proceed exactly as the old thread from its S section.`,
            ),
    );
}

/* Helpers */
type CliResult = { ok: boolean; out: string };

/**
 * `input` is always passed, even empty: without it the child would inherit this
 * server's stdin, which is the MCP transport itself.
 */
function cli(args: string[], input = ''): CliResult {
    try {
        return {
            ok: true,
            out: execFileSync(process.execPath, [CLI, ...args], {
                encoding: 'utf8',
                input,
                maxBuffer: 64 * 1024 * 1024,
            }).trim(),
        };
    } catch (error) {
        const failed = error as { stderr?: string; stdout?: string };
        const said = `${failed.stdout ?? ''}${failed.stderr ?? ''}`.trim();
        return {
            ok: false,
            out:
                said ||
                `The handoff-store cli could not be run at ${CLI}. Tell the user the path needs fixing; do not fall back to touching the store by hand.`,
        };
    }
}

/** The cli already phrases both outcomes for a reader. Do not re-word them. */
function forward(result: CliResult) {
    return text(result.out);
}

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
    const spec = readOrNull(SPEC_PATH);
    if (spec !== null) return spec;

    return (
        `!! CST-SPEC.md WAS NOT FOUND at ${SPEC_PATH}. This server is running degraded: ` +
        'the authoritative spec is missing, so what follows is a summary of it, not the spec. ' +
        'Say so in your reply — the CST will be weaker than usual and someone should fix the path.\n\n' +
        'Compose the CST as an upgraded compaction: preserve user requirements and corrections ' +
        'verbatim, decisions with rationale, exact state and next step, pointers over content ' +
        'dumps; mark unverified beliefs with `?`; never include secrets.'
    );
}

/**
 * The description above is baked in when the tool registers, so it cannot report
 * a spec that went missing afterwards. The handler can, and this is the only
 * place cw would ever hear about it.
 */
function specWarning() {
    return existsSync(SPEC_PATH)
        ? ''
        : `!! CST-SPEC.md is missing at ${SPEC_PATH} — this CST was composed without the authoritative spec. Say so to the user.\n\n`;
}
