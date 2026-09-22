import { describe, expect, it } from 'vitest';

import { boundTwice, diffAgainstMap, toChord } from './rayconfig.ts';

const shortcut = (mods: string[], key: Record<string, unknown>) => ({
    key,
    modifiers: mods.map((modifier) => ({ modifier })),
});

describe('toChord', () => {
    // manual.ts and the swift daemon both call all four modifiers `hyper`; raycast spells
    // them out. Without the collapse every hyper binding reads as absent from both sides.
    it('collapses all four modifiers into hyper', () => {
        expect(
            toChord(
                shortcut(['Ctrl', 'Alt', 'Shift', 'Meta'], {
                    code: 14,
                    type: 'LayoutIndependent',
                }),
            ),
        ).toBe('hyper+e');
    });

    it('spells a partial modifier set out', () => {
        expect(
            toChord(
                shortcut(['Ctrl', 'Alt'], {
                    code: 14,
                    type: 'LayoutIndependent',
                }),
            ),
        ).toBe('ctrl+opt+e');
    });

    it('names a layout-dependent arrow the way the map does', () => {
        expect(
            toChord(
                shortcut(['Ctrl'], {
                    keyType: { key: 'ArrowRight', type: 'Control' },
                    type: 'LayoutDependent',
                }),
            ),
        ).toBe('ctrl+right');
    });

    // Printing `key${undefined}` is what the second encoding did before it was handled; a
    // chord nobody can name has to be reportable, not rendered as though it were fine.
    it('refuses a key it cannot name', () => {
        expect(
            toChord(shortcut(['Ctrl'], { type: 'SomethingNew' })),
        ).toBeNull();
    });
});

const row = (chord: string, action: string) => ({ action, chord });

describe('boundTwice', () => {
    it('names every owner of a chord two commands claim', () => {
        const clashes = boundTwice([
            row('cmd+space', 'raycast itself'),
            row('hyper+pageup', 'linear-query-tickets'),
            row('hyper+pageup', 'linear-query-wide'),
        ]);

        expect(clashes).toEqual([
            {
                actions: ['linear-query-tickets', 'linear-query-wide'],
                chord: 'hyper+pageup',
            },
        ]);
    });

    it('keeps three owners of one chord in a single entry', () => {
        const clashes = boundTwice([
            row('hyper+e', 'a'),
            row('hyper+e', 'b'),
            row('hyper+e', 'c'),
        ]);

        expect(clashes).toHaveLength(1);
        expect(clashes[0]?.actions).toEqual(['a', 'b', 'c']);
    });

    it('finds nothing when every chord has one owner', () => {
        expect(
            boundTwice([row('cmd+space', 'raycast'), row('hyper+e', 'linear')]),
        ).toEqual([]);
    });
});

describe('diffAgainstMap', () => {
    const exported = [row('cmd+space', 'raycast itself'), row('hyper+e', 'q')];
    const mapped = [row('cmd+space', 'Raycast'), row('hyper+k', 'Calendar')];

    it('names what raycast binds and the map does not', () => {
        expect(diffAgainstMap(exported, mapped).onlyInExport).toEqual([
            row('hyper+e', 'q'),
        ]);
    });

    it('names what the map keeps and raycast no longer binds', () => {
        expect(diffAgainstMap(exported, mapped).onlyInMap).toEqual([
            row('hyper+k', 'Calendar'),
        ]);
    });

    // The two sides spell an action differently on purpose — the map is dima's prose, the
    // export is raycast's command id — so only the chord can decide whether a row is shared.
    it('treats a chord both sides carry as shared however each names it', () => {
        const diff = diffAgainstMap(
            [row('cmd+space', 'raycast itself')],
            [row('cmd+space', 'Raycast')],
        );

        expect(diff.onlyInExport).toEqual([]);
        expect(diff.onlyInMap).toEqual([]);
    });

    it('sorts each list by chord so two runs read the same', () => {
        const diff = diffAgainstMap(
            [row('hyper+z', 'z'), row('hyper+a', 'a')],
            [],
        );

        expect(diff.onlyInExport.map((one) => one.chord)).toEqual([
            'hyper+a',
            'hyper+z',
        ]);
    });
});
