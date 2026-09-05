/* ── cclio mode ──────────────────────────────────────────────────────────────
 * cw has no way to boot as the coordinator, so the coordinator's resident
 * context is compiled into one file at every cclio halt (script/cclio-snapshot.ts)
 * and served here whole. One call, one read, the thread becomes cclio.
 */

/* Core */
import { join } from 'node:path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import {
    CLAUDE_HOME,
    readOrNull,
    sizeLabel,
    statOrNull,
    text,
} from './shared.js';

const SNAPSHOT_PATH = join(CLAUDE_HOME, 'shelf', 'cclio-mode-cw-snapshot.md');

export function registerCclioTools(server: McpServer) {
    server.registerTool(
        'cclio_mode',
        {
            description:
                "BECOME CCLIO — Dima's coordinator — for the rest of this thread. Returns the coordinator's whole resident context (fleet rules, cclio memory barrel, the live board and queue as of the last compile) as one document, ~30k tokens. " +
                'Call it ONLY when Dima says "cclio mode", "become cclio", "enable cclio", or runs /cclio-mode — never on your own, the read is deliberately expensive. ' +
                'Call it ONCE per thread; then act as the document says, its preamble names what differs on this surface. Read-only.',
            inputSchema: {},
            title: 'cclio mode — load the coordinator snapshot',
        },
        async () => {
            const body = readOrNull(SNAPSHOT_PATH);
            const stat = statOrNull(SNAPSHOT_PATH);
            if (!body || !stat)
                return text(
                    `no snapshot at ${SNAPSHOT_PATH}. it is compiled at every cclio halt; ask Dima to run \`pnpm cclio-snapshot\` in ~/dotfiles.`,
                );
            const ageH = ((Date.now() - stat.mtimeMs) / 3_600_000).toFixed(1);
            return text(
                `<!-- snapshot ${sizeLabel(body.length)}, compiled ${ageH} h ago -->\n\n${body}`,
            );
        },
    );
}
