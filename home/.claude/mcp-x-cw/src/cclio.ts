/* ── cclio mode ──────────────────────────────────────────────────────────────
 * cw has no way to boot as the coordinator, so the coordinator's resident
 * context is compiled into one file at every cclio halt (script/skill-cclio-mode-snapshot.ts)
 * and served here in pages: cw caps a single tool result (the whole 160 kB errors out), so the
 * snapshot is split on its top-level `# ` sections into ≤ PAGE_CHARS pages. Every page arrives,
 * nothing is trimmed — Dima's ruling.
 */

/* Core */
import { join } from 'node:path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import {
    CLAUDE_HOME,
    readOrNull,
    sizeLabel,
    statOrNull,
    text,
} from './shared.js';

const SNAPSHOT_PATH = join(CLAUDE_HOME, 'shelf', 'cclio-mode-snapshot.md');
/** cw refused 156 320 chars in one result; its exact cap is unknown, so a page stays well under */
const PAGE_CHARS = 96_000;

/** greedy packing of top-level sections; a section larger than a page becomes its own page */
const paginate = (body: string) => {
    const sections = body.split(/\n(?=# )/);
    const pages: string[] = [];
    for (const section of sections) {
        const last = pages.at(-1);
        if (
            last !== undefined &&
            last.length + section.length + 1 <= PAGE_CHARS
        )
            pages[pages.length - 1] = `${last}\n${section}`;
        else pages.push(section);
    }
    return pages;
};

export function registerCclioTools(server: McpServer) {
    server.registerTool(
        'cclio_mode',
        {
            description:
                "BECOME CCLIO — Dima's coordinator — for the rest of this thread. Returns the coordinator's whole resident context (fleet rules, cclio memory barrel, the live board and queue as of the last compile), ~40k tokens, in pages. " +
                'Call it ONLY when Dima says "cclio mode", "become cclio", "enable cclio", or runs /cclio-mode — never on your own, the read is deliberately expensive. ' +
                'Call page 1 first; the header names totalPages. Call every page up to totalPages, THEN act as the document says — its preamble (page 1) names what differs on this surface. Read-only.',
            inputSchema: {
                page: z
                    .number()
                    .int()
                    .min(1)
                    .optional()
                    .describe('1-based page; omit for page 1'),
            },
            title: 'cclio mode — load the coordinator snapshot',
        },
        async ({ page = 1 }) => {
            const body = readOrNull(SNAPSHOT_PATH);
            const stat = statOrNull(SNAPSHOT_PATH);
            if (!body || !stat)
                return text(
                    `no snapshot at ${SNAPSHOT_PATH}. it is compiled at every cclio halt; ask Dima to run \`pnpm skill:cclio-mode-snapshot\` in ~/dotfiles.`,
                );
            const ageH = ((Date.now() - stat.mtimeMs) / 3_600_000).toFixed(1);
            const pages = paginate(body);
            const chunk = pages[page - 1];
            if (chunk === undefined)
                return text(
                    `page ${page} does not exist — totalPages: ${pages.length}`,
                );
            const next =
                page < pages.length
                    ? ` — call again with page: ${page + 1}`
                    : ' — last page, now act as cclio';
            return text(
                `<!-- snapshot ${sizeLabel(body.length)}, compiled ${ageH} h ago · page ${page}/${pages.length} (${chunk.length} chars)${next} -->\n\n${chunk}`,
            );
        },
    );
}
