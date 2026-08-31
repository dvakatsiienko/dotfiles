/**
 * x-cw — the local stdio MCP server that gives Claude Desktop the doors it has
 * no shell to open for itself: CST handoffs against the shared store, YouTube
 * transcripts, and the Linear PM handbook.
 *
 * Wiring only. Each tool family owns its own module, and the handoff family
 * owns nothing at all — it forwards to the `handoff-store` cli in dotfiles, so
 * cc and cw read one set of store rules.
 */

/* Core */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerHandoffTools } from './handoff.js';
import { registerPmTools } from './pm.js';
import { registerTranscriptTools } from './transcripts.js';

const server = new McpServer({ name: 'x-cw', version: '0.1.0' });

registerHandoffTools(server);
registerTranscriptTools(server);
registerPmTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
