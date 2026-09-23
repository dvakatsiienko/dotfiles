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

import {
    TICKET_QUERY,
    type Ticket,
    hopTarget,
    ticketLines,
} from './lib/linear-read.ts';

const args = process.argv.slice(2);
const id = args.find((a) => /^[A-Z]+-\d+$/.test(a));
if (!id) {
    console.error(
        'usage: pnpm linear:read <FRM-N|BYT-N> [--no-body] [--no-comments] [--json]',
    );
    process.exit(2);
}

const ticket = await fetchTicket(id);
const opts = {
    noBody: args.includes('--no-body'),
    noComments: args.includes('--no-comments'),
};
const hopId = args[args.indexOf('--hop') + 1];
const hop = args.includes('--hop') ? hopTarget(ticket, hopId ?? '') : null;
if (args.includes('--hop') && !hop) {
    console.error(
        `${hopId ?? '(missing id)'} is not in ${id}'s graph — parent, child, relation or inverse relation only`,
    );
    process.exit(1);
}

const hopTicket = hop ? await fetchTicket(hop) : null;
if (args.includes('--json')) {
    console.log(
        JSON.stringify(
            hopTicket ? { hop: hopTicket, ticket } : ticket,
            null,
            4,
        ),
    );
} else {
    const lines = ticketLines(ticket, opts);
    if (hopTicket)
        lines.push(
            '',
            `## hop → ${hopTicket.identifier}`,
            '',
            ...ticketLines(hopTicket, opts),
        );
    console.log(lines.join('\n'));
}

async function fetchTicket(ticketId: string): Promise<Ticket> {
    const result = await zx.$({
        quiet: true,
    })`linear api ${TICKET_QUERY(ticketId)}`.nothrow();
    const body = parseReply(result.stdout);
    if (body?.data?.issue) return body.data.issue;
    const reason =
        body?.errors?.map((e) => e.message).join('; ') ||
        result.stderr.trim() ||
        'no reply from linear api';
    console.error(`${ticketId}: ${reason}`);
    process.exit(1);
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
