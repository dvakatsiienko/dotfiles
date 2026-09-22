#!/usr/bin/env node

/**
 * ? linear:read — print one ticket's whole fetch contract (x:pm «Reading»):
 * ? header, milestone, parent, children, relations both ways, attachments,
 * ? body, comments oldest first. `--no-body` `--no-comments` `--json`.
 * ?
 * ?   pnpm linear:read DOT-237
 */

/* Core */
import * as zx from 'zx';

import { TICKET_QUERY, type Ticket, ticketLines } from './lib/linear-read.ts';

const args = process.argv.slice(2);
const id = args.find((a) => /^[A-Z]+-\d+$/.test(a));
if (!id) {
    console.error(
        'usage: pnpm linear:read <DOT-N|BYT-N> [--no-body] [--no-comments] [--json]',
    );
    process.exit(2);
}

const result = await zx.$({
    quiet: true,
})`linear api ${TICKET_QUERY(id)}`.nothrow();
const body = parseReply(result.stdout);
if (!body?.data?.issue) {
    const reason =
        body?.errors?.map((e) => e.message).join('; ') ||
        result.stderr.trim() ||
        'no reply from linear api';
    console.error(`${id}: ${reason}`);
    process.exit(1);
}

if (args.includes('--json')) {
    console.log(JSON.stringify(body.data.issue, null, 4));
} else {
    console.log(
        ticketLines(body.data.issue, {
            noBody: args.includes('--no-body'),
            noComments: args.includes('--no-comments'),
        }).join('\n'),
    );
}

function parseReply(raw: string): Reply | null {
    try {
        return JSON.parse(raw) as Reply;
    } catch {
        return null;
    }
}

/* Types */
type Reply = {
    data?: { issue: Ticket | null } | null;
    errors?: { message: string }[];
};
