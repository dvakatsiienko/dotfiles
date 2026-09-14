import { describe, expect, it } from 'vitest';

import type { Hotkey } from './hotkeys-manual.ts';
import {
    byApp,
    byChord,
    parsePresses,
    selectPresses,
    tally,
    unpressed,
} from './hotkeys-stats.ts';

const at = (iso: string, chord: string, app = 'com.apple.finder') =>
    JSON.stringify({ app, chord, ts: iso });

const NOW = new Date('2026-09-14T12:00:00Z');

describe('parsePresses', () => {
    it('keeps the whole lines around a torn one', () => {
        const jsonl = [
            at('2026-09-14T10:00:00Z', 'cmd+c'),
            '{"ts":"2026-09-14T10:01:00Z","chord":"cmd',
            at('2026-09-14T10:02:00Z', 'hyper+a'),
            '',
        ].join('\n');
        expect(parsePresses(jsonl).map((p) => p.chord)).toEqual([
            'cmd+c',
            'hyper+a',
        ]);
    });

    it('drops a line missing a required field', () => {
        expect(
            parsePresses('{"ts":"2026-09-14T10:00:00Z","chord":"cmd+c"}'),
        ).toEqual([]);
    });
});

describe('selectPresses', () => {
    it('excludes a press older than the window', () => {
        const presses = parsePresses(
            [
                at('2026-09-10T12:00:00Z', 'old'),
                at('2026-09-13T12:00:00Z', 'new'),
            ].join('\n'),
        );
        expect(
            selectPresses(presses, { days: 2, now: NOW }).map((p) => p.chord),
        ).toEqual(['new']);
    });

    it('matches the app filter on a case-insensitive substring', () => {
        const presses = parsePresses(
            [
                at('2026-09-14T11:00:00Z', 'cmd+c', 'com.todesktop.Cursor'),
                at('2026-09-14T11:00:00Z', 'cmd+v', 'com.google.Chrome'),
            ].join('\n'),
        );
        expect(
            selectPresses(presses, { app: 'cursor', now: NOW }).map(
                (p) => p.chord,
            ),
        ).toEqual(['cmd+c']);
    });

    it('keeps every press when no window is given', () => {
        const presses = parsePresses(
            [at('2020-01-01T00:00:00Z', 'ancient')].join('\n'),
        );
        expect(selectPresses(presses, { now: NOW })).toHaveLength(1);
    });
});

describe('tally', () => {
    it('ranks the most pressed chord first', () => {
        const presses = parsePresses(
            [
                at('2026-09-14T11:00:00Z', 'cmd+c'),
                at('2026-09-14T11:01:00Z', 'hyper+a'),
                at('2026-09-14T11:02:00Z', 'cmd+c'),
            ].join('\n'),
        );
        expect(tally(presses, byChord)).toEqual([
            { count: 2, name: 'cmd+c' },
            { count: 1, name: 'hyper+a' },
        ]);
    });

    it('counts by app when asked for apps', () => {
        const presses = parsePresses(
            [
                at('2026-09-14T11:00:00Z', 'cmd+c', 'a'),
                at('2026-09-14T11:01:00Z', 'cmd+v', 'a'),
            ].join('\n'),
        );
        expect(tally(presses, byApp)).toEqual([{ count: 2, name: 'a' }]);
    });
});

describe('unpressed', () => {
    const bindings: Hotkey[] = [
        { action: 'Claude', app: 'raycast', key: 'a', mods: 'hyper' },
        { action: 'Copy', app: 'macos', key: 'c', mods: 'cmd' },
        { action: 'push to talk', app: 'wispr flow', key: 'ctrl', mods: '' },
    ];

    it('returns only the bindings whose chord never appears', () => {
        const presses = parsePresses(at('2026-09-14T11:00:00Z', 'hyper+a'));
        expect(unpressed(bindings, presses).map((h) => h.action)).toEqual([
            'Copy',
            'push to talk',
        ]);
    });

    it('matches a bare-modifier binding against a bare-modifier press', () => {
        const presses = parsePresses(at('2026-09-14T11:00:00Z', 'ctrl'));
        expect(unpressed(bindings, presses).map((h) => h.action)).not.toContain(
            'push to talk',
        );
    });
});
