/**
 * ? linear:read — the x:pm fetch contract as one call, so a decision-informing
 * ? read never skips comments, inverse relations or a capped list.
 */

export const TICKET_QUERY = (id: string) => `query { issue(id: "${id}") {
  identifier title description priority estimate
  state { name type } project { name } projectMilestone { name } assignee { name }
  labels(first: 50) { nodes { name } pageInfo { hasNextPage } }
  parent { identifier title }
  children(first: 50) { nodes { identifier title state { name type } } pageInfo { hasNextPage } }
  relations(first: 50) { nodes { type relatedIssue { identifier title state { name type } } } pageInfo { hasNextPage } }
  inverseRelations(first: 50) { nodes { type issue { identifier title state { name type } } } pageInfo { hasNextPage } }
  attachments(first: 50) { nodes { title url } pageInfo { hasNextPage } }
  comments(first: 100) { nodes { body createdAt user { name } botActor { name } } pageInfo { hasNextPage } }
} }`;

const CAPPED = '⚠️ capped';
const DONE_TYPES = new Set(['completed', 'canceled']);

/** the inverse side reads «X blocks me», so its verb flips for the reader */
const INVERSE_VERB: Record<string, string> = {
    blocks: 'blocked by',
    duplicate: 'duplicated by',
    related: 'related',
};

export function ticketLines(t: Ticket, opts: ReadOptions): string[] {
    const cap = (p: Page<unknown>) =>
        p.pageInfo.hasNextPage ? ` ${CAPPED}` : '';
    const labels = t.labels.nodes.map((l) => l.name).join(', ') || 'no labels';
    const blockers = t.inverseRelations.nodes
        .filter(
            (r) => r.type === 'blocks' && !DONE_TYPES.has(r.issue.state.type),
        )
        .map((r) => r.issue.identifier);
    const state = blockers.length
        ? `${t.state.name} 🚫 blocked by ${blockers.join(', ')}`
        : t.state.name;
    const lines = [
        `${t.identifier} · ${t.title} · ${state} · ${t.project?.name ?? 'no project'} · p${t.priority} · ${t.estimate === null ? 'e—' : `e${t.estimate}`} · ${t.assignee?.name ?? 'unassigned'} · ${labels}${cap(t.labels)}`,
    ];
    if (t.projectMilestone) lines.push(`milestone ${t.projectMilestone.name}`);
    if (t.parent) lines.push(`parent ${t.parent.identifier} ${t.parent.title}`);
    for (const c of t.children.nodes)
        lines.push(`child ${c.identifier} ${c.title} (${c.state.name})`);
    if (t.children.pageInfo.hasNextPage) lines.push(`children ${CAPPED}`);
    for (const r of t.relations.nodes) {
        lines.push(
            `${r.type} ${r.relatedIssue.identifier} ${r.relatedIssue.title} (${r.relatedIssue.state.name})`,
        );
    }
    if (t.relations.pageInfo.hasNextPage) lines.push(`relations ${CAPPED}`);
    for (const r of t.inverseRelations.nodes) {
        lines.push(
            `${INVERSE_VERB[r.type] ?? `${r.type} (inverse)`} ${r.issue.identifier} ${r.issue.title} (${r.issue.state.name})`,
        );
    }
    if (t.inverseRelations.pageInfo.hasNextPage)
        lines.push(`inverse relations ${CAPPED}`);
    for (const a of t.attachments.nodes)
        lines.push(`attachment ${a.title} ${a.url}`);
    if (t.attachments.pageInfo.hasNextPage) lines.push(`attachments ${CAPPED}`);

    if (!opts.noBody) lines.push('', '## body', '', t.description ?? '(empty)');

    if (!opts.noComments) {
        const sorted = [...t.comments.nodes].sort((a, b) =>
            a.createdAt.localeCompare(b.createdAt),
        );
        lines.push('', `## comments (${sorted.length})${cap(t.comments)}`);
        for (const c of sorted) {
            const author = c.user?.name ?? c.botActor?.name ?? 'unknown';
            lines.push('', `— ${author} · ${c.createdAt.slice(0, 10)}`, c.body);
        }
    }
    return lines;
}

/** one hop, never two: the id must sit in the main ticket's own graph */
export function hopTarget(t: Ticket, id: string): string | null {
    const graph = [
        t.parent?.identifier,
        ...t.children.nodes.map((c) => c.identifier),
        ...t.relations.nodes.map((r) => r.relatedIssue.identifier),
        ...t.inverseRelations.nodes.map((r) => r.issue.identifier),
    ];
    return graph.includes(id) ? id : null;
}

/* Types */
export type Page<T> = { nodes: T[]; pageInfo: { hasNextPage: boolean } };
type Named = { name: string };
type StateRef = { name: string; type: string };
type Ref = { identifier: string; state: StateRef; title: string };

export type Ticket = {
    assignee: Named | null;
    attachments: Page<{ title: string; url: string }>;
    children: Page<Ref>;
    comments: Page<{
        body: string;
        botActor: Named | null;
        createdAt: string;
        user: Named | null;
    }>;
    description: string | null;
    estimate: number | null;
    identifier: string;
    inverseRelations: Page<{ issue: Ref; type: string }>;
    labels: Page<Named>;
    parent: { identifier: string; title: string } | null;
    priority: number;
    project: Named | null;
    projectMilestone: Named | null;
    relations: Page<{ relatedIssue: Ref; type: string }>;
    state: StateRef;
    title: string;
};

export type ReadOptions = { noBody?: boolean; noComments?: boolean };
