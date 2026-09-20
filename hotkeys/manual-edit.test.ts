import { describe, expect, it } from 'vitest';

import type { Hotkey } from './manual.ts';
import {
    type ManualEdit,
    editManualText,
    moveManualText,
    printRow,
} from './manual-edit.ts';

const fixture = `export const manualHotkeys = [
    ...(
        [
            ['e', 'Linear'],
            ['n', 'Notion'],
        ] as const
    ).map(
        ([key, action]): Hotkey => ({
            action,
            app: 'raycast',
            key,
            mods: 'hyper',
        }),
    ),
    { action: 'Raycast', app: 'raycast', key: 'space', mods: 'cmd' },
    {
        action: 'Switch Windows (disabled)',
        app: 'raycast',
        key: 'tab',
        mods: 'opt',
    },
] satisfies readonly Hotkey[];
`;

const rows: Hotkey[] = [
    { action: 'Linear', app: 'raycast', key: 'e', mods: 'hyper' },
    { action: 'Notion', app: 'raycast', key: 'n', mods: 'hyper' },
    { action: 'Raycast', app: 'raycast', key: 'space', mods: 'cmd' },
    {
        action: 'Switch Windows (disabled)',
        app: 'raycast',
        key: 'tab',
        mods: 'opt',
    },
];

const edit = (from: Hotkey, to: ManualEdit['to']) =>
    editManualText(fixture, rows, { from, to });

describe('editManualText', () => {
    it('moves a tuple row to another key inside its own layer', () => {
        const next = edit(rows[0] as Hotkey, {
            action: 'Linear',
            key: 'l',
            mods: 'hyper',
        });

        expect(next).toContain("['l', 'Linear'],");
        expect(next).not.toContain("['e', 'Linear'],");
    });

    it('renames what a tuple row opens without touching its key', () => {
        const next = edit(rows[1] as Hotkey, {
            action: 'Obsidian',
            key: 'n',
            mods: 'hyper',
        });

        expect(next).toContain("['n', 'Obsidian'],");
    });

    it('lifts a tuple row out of its group when the layer changes', () => {
        const next = edit(rows[0] as Hotkey, {
            action: 'Linear',
            key: 'e',
            mods: 'ctrl+opt',
        });

        expect(next).not.toContain("['e', 'Linear'],");
        expect(next).toContain(
            "    { action: 'Linear', app: 'raycast', key: 'e', mods: 'ctrl+opt' },\n] satisfies",
        );
    });

    it('edits an object row in place', () => {
        const next = edit(rows[2] as Hotkey, {
            action: 'Raycast',
            key: 'space',
            mods: 'ctrl',
        });

        expect(next).toContain(
            "{ action: 'Raycast', app: 'raycast', key: 'space', mods: 'ctrl' }",
        );
    });

    it('edits a multi-line object row in place', () => {
        const next = edit(rows[3] as Hotkey, {
            action: 'Switch Windows',
            key: 'tab',
            mods: 'opt',
        });

        expect(next).toContain("action: 'Switch Windows',");
    });

    it('refuses a chord no hand-kept row carries', () => {
        expect(() =>
            edit(
                { action: 'Linear', app: 'raycast', key: 'z', mods: 'hyper' },
                { action: 'Linear', key: 'z', mods: 'hyper' },
            ),
        ).toThrow(/no hand-kept row/);
    });

    it('refuses when the same pair is written twice', () => {
        const twice = fixture.replace(
            "['n', 'Notion'],",
            "['n', 'Notion'],\n            ['n', 'Notion'],",
        );

        expect(() =>
            editManualText(twice, rows, {
                from: rows[1] as Hotkey,
                to: { action: 'Notion', key: 'm', mods: 'hyper' },
            }),
        ).toThrow(/appears 2 times/);
    });
});

describe('editManualText escaping', () => {
    // A raw newline ends the string literal mid-line and manual.ts stops parsing, which takes
    // the daemon's own import of it down with the file.
    it('writes a newline in an action as an escaped one, never as a line break', () => {
        const next = edit(rows[1] as Hotkey, {
            action: 'a\nb',
            key: 'n',
            mods: 'hyper',
        });

        expect(next).toContain("['n', 'a\\nb']");
        expect(next).not.toContain("'a\nb'");
    });

    it('escapes a tab and a backslash the same way', () => {
        const next = edit(rows[1] as Hotkey, {
            action: 'a\tb\\c',
            key: 'n',
            mods: 'hyper',
        });

        expect(next).toContain("['n', 'a\\tb\\\\c']");
    });

    // biome's own rule, measured 2026-09-20: single quotes unless the value holds MORE singles
    // than doubles. Writing the other form produces a file biome refuses, failing the next commit.
    it('keeps single quotes when a value holds both kinds', () => {
        const next = edit(rows[1] as Hotkey, {
            action: 'it\'s a "thing"',
            key: 'n',
            mods: 'hyper',
        });

        expect(next).toContain("['n', 'it\\'s a \"thing\"']");
    });

    it('switches to double quotes only when singles outnumber doubles', () => {
        const next = edit(rows[1] as Hotkey, {
            action: "only 'singles' here",
            key: 'n',
            mods: 'hyper',
        });

        expect(next).toContain("['n', \"only 'singles' here\"]");
    });
});

describe('moveManualText', () => {
    const move = (
        from: Hotkey,
        to: { mods: string; key: string; action: string },
    ) => moveManualText(fixture, rows, { from, on: '2026-09-20', to });

    // A row crosses 80 columns once it carries a date, so it prints multi-line. These assert
    // the fields and their order, which is the contract, not where biome put the newlines.
    const flat = (text: string) => text.replace(/\s+/g, ' ');

    // The presses already on hyper+e were Linear's and stay Linear's; the chord itself stops
    // meaning anything. Both halves, one action.
    it('ends the old meaning and starts the new one', () => {
        const next = move(rows[0] as Hotkey, {
            action: 'Linear',
            key: 'l',
            mods: 'hyper',
        });

        expect(next).not.toContain("['e', 'Linear'],");
        expect(flat(next)).toContain(
            "action: 'Linear', app: 'raycast', key: 'e', mods: 'hyper', until: '2026-09-20',",
        );
        expect(flat(next)).toContain(
            "action: 'Linear', app: 'raycast', key: 'l', mods: 'hyper', since: '2026-09-20',",
        );
    });

    it('leaves an object row where it is and only dates its end', () => {
        const next = move(rows[2] as Hotkey, {
            action: 'Raycast',
            key: 'space',
            mods: 'ctrl',
        });

        // the ended row keeps its place, still ahead of the row that always followed it
        expect(flat(next)).toContain(
            "mods: 'cmd', until: '2026-09-20', }, { action: 'Switch Windows",
        );
        expect(flat(next)).toContain(
            "key: 'space', mods: 'ctrl', since: '2026-09-20',",
        );
    });

    it('carries the app across, because a move is the same binding on a new chord', () => {
        const next = move(rows[1] as Hotkey, {
            action: 'Notion',
            key: 'm',
            mods: 'hyper',
        });

        expect(flat(next)).toContain(
            "action: 'Notion', app: 'raycast', key: 'm', mods: 'hyper', since: '2026-09-20',",
        );
    });

    it('refuses a move that changes nothing', () => {
        expect(() =>
            move(rows[0] as Hotkey, {
                action: 'Linear',
                key: 'e',
                mods: 'hyper',
            }),
        ).toThrow(/changes nothing/);
    });

    it('refuses a chord no hand-kept row carries', () => {
        expect(() =>
            move(
                { action: 'Linear', app: 'raycast', key: 'z', mods: 'hyper' },
                { action: 'Linear', key: 'q', mods: 'hyper' },
            ),
        ).toThrow(/no hand-kept row/);
    });
});

describe('printRow', () => {
    it('keeps a row on one line while it fits the 80-column budget', () => {
        expect(
            printRow({
                action: 'Autofill',
                app: '1password',
                key: '\\',
                mods: 'cmd',
            }),
        ).toBe(
            "    { action: 'Autofill', app: '1password', key: '\\\\', mods: 'cmd' },",
        );
    });

    it('explodes a row that does not fit', () => {
        expect(
            printRow({
                action: 'Switch Windows (disabled)',
                app: 'raycast',
                key: 'tab',
                mods: 'opt',
            }),
        ).toBe(
            "    {\n        action: 'Switch Windows (disabled)',\n        app: 'raycast',\n        key: 'tab',\n        mods: 'opt',\n    },",
        );
    });
});
