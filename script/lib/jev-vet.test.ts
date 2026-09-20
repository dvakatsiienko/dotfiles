import { describe, expect, test } from 'vitest';

import { type Registry, statusLines, verdictApply } from './jev-vet.ts';

// biome-ignore lint/suspicious/noControlCharactersInRegex: the escape byte is the point
const ANSI = /\x1b\[[0-9;]*m/g;

const registry: Registry = {
    flows: {
        'inbox-lanes': {
            misses: 0,
            since: '2026-09-01',
            state: 'vetting',
            verdicts: 3,
            what: 'lanes',
        },
    },
    windowDays: 14,
};

describe('verdictApply', () => {
    test('a miss restarts the window from that day', () => {
        const next = verdictApply(
            registry,
            'inbox-lanes',
            'miss',
            '2026-09-10',
        );
        expect(next.flows['inbox-lanes']).toMatchObject({
            misses: 1,
            since: '2026-09-10',
            state: 'vetting',
        });
    });

    test('an ok after the window promotes the flow to green', () => {
        const next = verdictApply(registry, 'inbox-lanes', 'ok', '2026-09-15');
        expect(next.flows['inbox-lanes']?.state).toBe('green');
    });

    test('an ok inside the window keeps it vetting', () => {
        const next = verdictApply(registry, 'inbox-lanes', 'ok', '2026-09-10');
        expect(next.flows['inbox-lanes']?.state).toBe('vetting');
    });

    test('a green flow that misses drops back to vetting', () => {
        const green = verdictApply(registry, 'inbox-lanes', 'ok', '2026-09-15');
        const next = verdictApply(green, 'inbox-lanes', 'miss', '2026-09-16');
        expect(next.flows['inbox-lanes']?.state).toBe('vetting');
    });
});

describe('statusLines', () => {
    test('prints the clean streak against the window', () => {
        const plain = statusLines(registry, '2026-09-10').map((l) =>
            l.replace(ANSI, ''),
        );
        expect(plain).toEqual([
            '🟡 inbox-lanes — vetting 9/14 d clean · 3 verdicts, 0 misses',
        ]);
    });
});
