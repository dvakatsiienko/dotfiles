export const meta = {
    description:
        'read every open ticket, return a verdict per ticket — stale, misplaced, closable, orphan — no mutations',
    name: 'board-sweep',
    phases: [
        {
            detail: 'one agent per batch of 8 tickets, bodies read via linear api',
            title: 'Judge',
        },
    ],
    whenToUse:
        'the board wide-scan: a groom, a milestone close, a boot with «board». pass the open-ticket list as args (id, title, state, project, prio, upd, parent, mil, labels).',
};

const VERDICTS = {
    properties: {
        rows: {
            items: {
                properties: {
                    closingWord: {
                        description: 'only for closable: what became better',
                        type: 'string',
                    },
                    id: { type: 'string' },
                    reason: {
                        description:
                            'one line, ≤20 words, cites a fact from the body',
                        type: 'string',
                    },
                    verdict: {
                        enum: [
                            'fine',
                            'stale',
                            'closable',
                            'misplaced',
                            'orphan',
                            'needs-dima',
                        ],
                        type: 'string',
                    },
                },
                required: ['id', 'verdict', 'reason'],
                type: 'object',
            },
            type: 'array',
        },
    },
    required: ['rows'],
    type: 'object',
};

const BATCH = 8;
const batches = [];
for (let i = 0; i < args.length; i += BATCH)
    batches.push(args.slice(i, i + BATCH));
log(`${args.length} open tickets → ${batches.length} batches of ${BATCH}`);

phase('Judge');
const results = await pipeline(batches, (batch, _, i) =>
    agent(
        `You judge ${batch.length} Linear tickets for a pm sweep. READ-ONLY: no mutations, no comments.
For each id run: linear api 'query { issue(id: "<ID>") { description comments(first: 10) { nodes { body createdAt } } } }'
Then return one row per ticket. Verdicts: fine · stale (overtaken by events, body proves it) · closable (work done, say the closing word) · misplaced (project or parent contradicts the body) · orphan (no project, no parent, no milestone, and it is not a one-off) · needs-dima (a question in the body waits on him).
Metadata: ${JSON.stringify(batch)}`,
        {
            effort: 'low',
            label: `batch ${i + 1}`,
            model: 'sonnet',
            phase: 'Judge',
            schema: VERDICTS,
        },
    ),
);

const rows = results.filter(Boolean).flatMap((r) => r.rows);
const dropped = args.length - rows.length;
if (dropped) log(`⚠️ ${dropped} tickets got no verdict (agent skipped or died)`);
return { dropped, rows }
