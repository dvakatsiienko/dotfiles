import { describe, expect, it } from 'vitest';

import { type Ticket, hopTarget, ticketLines } from './linear-read.ts';

const ticket: Ticket = {
    assignee: null,
    attachments: {
        nodes: [{ title: 'pr #4', url: 'https://x/4' }],
        pageInfo: { hasNextPage: false },
    },
    children: { nodes: [], pageInfo: { hasNextPage: false } },
    comments: {
        nodes: [
            {
                body: 'second',
                botActor: null,
                createdAt: '2026-09-02T10:00:00.000Z',
                user: { name: 'dima' },
            },
            {
                body: 'first',
                botActor: { name: 'coder' },
                createdAt: '2026-09-01T10:00:00.000Z',
                user: null,
            },
        ],
        pageInfo: { hasNextPage: true },
    },
    description: 'the body',
    estimate: 2,
    identifier: 'DOT-1',
    inverseRelations: {
        nodes: [
            {
                issue: {
                    identifier: 'DOT-9',
                    state: { name: 'Todo', type: 'unstarted' },
                    title: 'nine',
                },
                type: 'related',
            },
        ],
        pageInfo: { hasNextPage: false },
    },
    labels: {
        nodes: [{ name: 'agent' }, { name: 'bug' }],
        pageInfo: { hasNextPage: false },
    },
    parent: { identifier: 'DOT-0', title: 'zero' },
    priority: 3,
    project: { name: 'pm' },
    projectMilestone: { name: 'm1' },
    relations: { nodes: [], pageInfo: { hasNextPage: false } },
    state: { name: 'In Progress', type: 'started' },
    title: 'one',
};

describe('ticketLines', () => {
    it('prints the header, graph, body and comments oldest first', () => {
        const out = ticketLines(ticket, {}).join('\n');
        expect(out).toContain(
            'DOT-1 · one · In Progress · pm · p3 · e2 · unassigned · agent, bug',
        );
        expect(out).toContain('parent DOT-0 zero');
        expect(out).toContain('related DOT-9 nine (Todo)');
        expect(out).toContain('pr #4 https://x/4');
        expect(out.indexOf('first')).toBeLessThan(out.indexOf('second'));
        expect(out).toContain('— coder · 2026-09-01');
    });

    it('marks a capped list', () => {
        expect(ticketLines(ticket, {}).join('\n')).toContain('⚠️ capped');
    });

    it('drops the body and the comments on request', () => {
        const out = ticketLines(ticket, {
            noBody: true,
            noComments: true,
        }).join('\n');
        expect(out).not.toContain('the body');
        expect(out).not.toContain('second');
    });
});

describe('blocked marker', () => {
    it('names open blockers right after the state', () => {
        const blocked: Ticket = {
            ...ticket,
            inverseRelations: {
                nodes: [
                    {
                        issue: {
                            identifier: 'DOT-9',
                            state: { name: 'Todo', type: 'unstarted' },
                            title: 'nine',
                        },
                        type: 'blocks',
                    },
                    {
                        issue: {
                            identifier: 'DOT-8',
                            state: { name: 'Done', type: 'completed' },
                            title: 'eight',
                        },
                        type: 'blocks',
                    },
                ],
                pageInfo: { hasNextPage: false },
            },
        };
        expect(ticketLines(blocked, {})[0]).toContain(
            'In Progress 🚫 blocked by DOT-9 ·',
        );
        expect(ticketLines(blocked, {})[0]).not.toContain('DOT-8');
    });
});

describe('hopTarget', () => {
    it('accepts a ticket in the graph and refuses one outside it', () => {
        expect(hopTarget(ticket, 'DOT-9')).toBe('DOT-9');
        expect(hopTarget(ticket, 'DOT-0')).toBe('DOT-0');
        expect(hopTarget(ticket, 'DOT-777')).toBeNull();
    });
});
