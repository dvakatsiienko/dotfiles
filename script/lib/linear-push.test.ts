/**
 * ? Tests for the push-revert decision. Everything is pure and offline — the
 * ? Linear history below is a verbatim capture of DOT-159's real one, taken
 * ? 2026-08-22, because that ticket holds the exact double-write this code
 * ? exists to undo.
 * ?
 * ?   pnpm test        # once
 * ?   pnpm test:watch  # on change
 */

/* Core */
import { describe, expect, test } from 'vitest';

/* Instruments */
import {
    type HistoryNode,
    branchOf,
    linkTargetsIn,
    magicRefsIn,
    parsePushedRefs,
    parseRemote,
    pickDoneState,
    planRevert,
    pushRange,
} from './linear-push.ts';

const TODO = { id: 'todo-id', name: 'Todo', type: 'unstarted' };
const STARTED = { id: 'started-id', name: 'In Progress', type: 'started' };
const DONE = { id: 'done-id', name: 'Done', type: 'completed' };

const at = (iso: string) => Date.parse(iso);

/** DOT-159, verbatim. Two integration double-writes, one manual revert between. */
const DOT_159: HistoryNode[] = [
    {
        createdAt: '2026-08-22T17:10:57.096Z',
        fromState: TODO,
        toAssignee: null,
        toState: STARTED,
    },
    {
        createdAt: '2026-08-22T17:10:57.096Z',
        fromState: null,
        toAssignee: { name: 'Dima Vakatsiienko' },
        toState: null,
    },
    {
        createdAt: '2026-08-22T17:10:57.096Z',
        fromState: null,
        toAssignee: null,
        toState: null,
    },
    {
        createdAt: '2026-08-22T17:10:23.382Z',
        fromState: STARTED,
        toAssignee: null,
        toState: TODO,
    },
    {
        createdAt: '2026-08-22T17:07:05.778Z',
        fromState: TODO,
        toAssignee: null,
        toState: STARTED,
    },
    {
        createdAt: '2026-08-22T17:07:05.778Z',
        fromState: null,
        toAssignee: { name: 'Dima Vakatsiienko' },
        toState: null,
    },
    {
        createdAt: '2026-08-22T17:07:05.778Z',
        fromState: null,
        toAssignee: null,
        toState: null,
    },
    {
        createdAt: '2026-08-22T14:25:59.617Z',
        fromState: null,
        toAssignee: null,
        toState: null,
    },
];

const plan = (options: Partial<Parameters<typeof planRevert>[0]> = {}) =>
    planRevert({
        closing: false,
        currentStateId: STARTED.id,
        history: DOT_159,
        pushedAtMs: at('2026-08-22T17:07:00Z'),
        ...options,
    });

describe('pre-push stdin', () => {
    test('parses refs and drops a deleted one', () => {
        const refs = parsePushedRefs(
            'refs/heads/main aaa refs/heads/main bbb\n' +
                `refs/heads/gone ${'0'.repeat(40)} refs/heads/gone ccc\n`,
        );

        expect(refs.map((ref) => ref.localRef)).toEqual(['refs/heads/main']);
    });

    test('a new branch is bounded by the other remotes, not by all history', () => {
        expect(
            pushRange({
                localOid: 'aaa',
                localRef: 'r',
                remoteOid: 'bbb',
                remoteRef: 'r',
            }),
        ).toEqual(['bbb..aaa']);
        expect(
            pushRange({
                localOid: 'aaa',
                localRef: 'r',
                remoteOid: '0'.repeat(40),
                remoteRef: 'r',
            }),
        ).toEqual(['aaa', '--not', '--remotes']);
    });
});

describe('remote ownership', () => {
    test('accepts both url shapes for a repo we own', () => {
        for (const url of [
            'git@github.com:dvakatsiienko/dotfiles.git',
            'https://github.com/dvakatsiienko/dotfiles',
            'https://github.com/dvakatsiienko/dotfiles.git',
            'ssh://git@github.com/dvakatsiienko/dotfiles.git',
        ])
            expect(parseRemote(url).ok, url).toBe(true);
    });

    test('carries owner and repo out, so a commit url can be built', () => {
        const parsed = parseRemote('git@github.com:dvakatsiienko/dotfiles.git');

        expect(parsed.ok && parsed.remote).toEqual({
            host: 'github.com',
            owner: 'dvakatsiienko',
            repo: 'dotfiles',
        });
    });

    test('stands down on anything else, with a reason', () => {
        for (const url of [
            'git@github.com:someone-else/their-repo.git',
            'git@gitlab.com:dvakatsiienko/mirror.git',
            './remote/r.git',
            '',
        ]) {
            const parsed = parseRemote(url);
            expect(parsed.ok, url).toBe(false);
            expect(!parsed.ok && parsed.reason.length, url).toBeGreaterThan(0);
        }
    });
});

describe('magic words', () => {
    test('reads the class Linear would read, in prose as well as in a trailer', () => {
        expect(magicRefsIn(['- ref DOT-145'])).toEqual([
            { closing: false, id: 'DOT-145' },
        ]);
        expect(magicRefsIn(['Closes DOT-1', 'part of BYT-2'])).toEqual([
            { closing: true, id: 'DOT-1' },
            { closing: false, id: 'BYT-2' },
        ]);
        // The real 7b096a9 body: a magic word inside quoted prose still fires.
        expect(
            magicRefsIn(['one push carrying a plain `- ref DOT-159` wrote']),
        ).toEqual([{ closing: false, id: 'DOT-159' }]);
    });

    test('closing wins when a ticket is both referenced and closed', () => {
        expect(magicRefsIn(['- ref DOT-9', 'fixes DOT-9'])).toEqual([
            { closing: true, id: 'DOT-9' },
        ]);
    });

    test('ignores near-misses', () => {
        expect(
            magicRefsIn(['refactor DOT-3', 'DOT-4 alone', 'relates to DOT-5']),
        ).toEqual([]);
    });
});

describe('our own link form', () => {
    const commit = (sha: string, body: string) => ({
        body,
        branch: 'main',
        sha,
        subject: body.split('\n')[0] ?? '',
    });

    test('reads the form, and the closing marker with it', () => {
        expect(
            linkTargetsIn([
                commit('a1', 'subject\n\n- ticket: DOT-210'),
                commit('b2', 'subject\n\n- ticket: BYT-7 (closes)'),
            ]),
        ).toMatchObject([
            { closing: false, id: 'DOT-210' },
            { closing: true, id: 'BYT-7' },
        ]);
    });

    test('the form is invisible to the parser we are hiding from', () => {
        expect(magicRefsIn(['- ticket: DOT-210 (closes)'])).toEqual([]);
    });

    test('several commits on one ticket group, and closing wins', () => {
        const [target] = linkTargetsIn([
            commit('a1', 's\n\n- ticket: DOT-1'),
            commit('b2', 's\n\n- ticket: DOT-1 (closes)'),
        ]);

        expect(target?.closing).toBe(true);
        expect(target?.commits.map((one) => one.sha)).toEqual(['a1', 'b2']);
    });

    test('a repeated line still attaches the commit once', () => {
        expect(
            linkTargetsIn([
                commit('a1', 's\n\n- ticket: DOT-1\n- ticket: DOT-1'),
            ])[0]?.commits,
        ).toHaveLength(1);
    });

    test('ignores an id that is merely mentioned', () => {
        expect(
            linkTargetsIn([
                commit(
                    'a1',
                    'DOT-1 alone\nsee DOT-2\nthe ticket: DOT-3 is open',
                ),
            ]),
        ).toEqual([]);
    });
});

describe('push metadata', () => {
    test('a branch name is read out of the remote ref', () => {
        expect(
            branchOf({
                localOid: 'a',
                localRef: 'refs/heads/main',
                remoteOid: 'b',
                remoteRef: 'refs/heads/probe-linear-forms',
            }),
        ).toBe('probe-linear-forms');
    });

    test('a closing commit lands on Done, not on whatever completed state sorts first', () => {
        expect(
            pickDoneState([
                { id: 'x', name: 'Canceled', position: 0, type: 'canceled' },
                { id: 'y', name: 'Duplicate', position: 1, type: 'completed' },
                { id: 'z', name: 'Done', position: 2, type: 'completed' },
            ])?.id,
        ).toBe('z');
    });
});

describe('revert plan', () => {
    test('a write after the push is the integration — revert both halves', () => {
        expect(plan().reverts).toEqual([
            { kind: 'unassign' },
            { kind: 'state', stateId: TODO.id, stateName: TODO.name },
        ]);
    });

    test("a write before the push is Dima's — never touched", () => {
        expect(plan({ pushedAtMs: at('2026-08-22T17:11:00Z') })).toMatchObject({
            reverts: [],
        });
    });

    test('a closing keyword keeps its state move, and still loses the assignee', () => {
        expect(plan({ closing: true }).reverts).toEqual([{ kind: 'unassign' }]);
    });

    test('a state already back where it belongs is left alone', () => {
        expect(plan({ currentStateId: TODO.id }).reverts).toEqual([
            { kind: 'unassign' },
        ]);
    });

    test('refuses to reopen a completed state', () => {
        const closed: HistoryNode[] = [
            {
                createdAt: '2026-08-22T17:07:05.778Z',
                fromState: STARTED,
                toAssignee: null,
                toState: DONE,
            },
        ];

        expect(plan({ history: closed }).reverts).toEqual([]);
    });

    test('reports its reasoning even when it does nothing', () => {
        expect(
            plan({ pushedAtMs: at('2026-08-22T17:11:00Z') }).reasons,
        ).toHaveLength(1);
    });
});
