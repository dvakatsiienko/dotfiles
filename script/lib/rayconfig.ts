/**
 * ? The two questions `rayconfig:decrypt` asks of a decrypted export, kept here so they have
 * ? tests: which chords more than one command claims, and how the export differs from the
 * ? hand-kept map in `hotkeys/manual.ts`.
 * ?
 * ? Both answer on the CHORD alone. The two sides name an action differently by nature — the
 * ? map carries dima's prose ("Raycast"), the export carries a command id ("raycast itself") —
 * ? so a name comparison would report every shared row as a difference.
 */

import { chordOf, keyCap } from '../../hotkeys/chord.ts';

export interface ChordRow {
    action: string;
    chord: string;
}

/**
 * ? Raycast's spelling of a shortcut, turned into ours. Two things differ, and both were
 * ? found by running the tool rather than by reading the schema:
 * ?
 * ? Raycast writes the four modifiers out; `manual.ts` and the swift daemon both call that
 * ? combination `hyper`. Left uncollapsed, every hyper binding reads as present on one side
 * ? and absent on the other, which made a 34-against-21 diff out of two identical sets.
 * ?
 * ? And a key arrives in one of two encodings: `LayoutIndependent` carries the virtual
 * ? keycode `keyCap` already names, while `LayoutDependent` carries a name like `ArrowRight`.
 * ? Only the arrows were observed in the wild, so the rule strips an `Arrow` prefix and
 * ? lowercases; anything it still cannot name returns null rather than printing `keyundefined`.
 */
export const toChord = (shortcut: RayShortcut) => {
    const key = nameOfKey(shortcut.key);
    if (key === null) return null;

    const mods = shortcut.modifiers.map(
        (one) => MOD_NAME[one.modifier] ?? one.modifier.toLowerCase(),
    );
    const isHyper = HYPER.every((mod) => mods.includes(mod));

    return chordOf({
        key,
        mods: (isHyper ? ['hyper', ...mods.filter(notHyper)] : mods).join('+'),
    });
};

/**
 * ? Raycast's own ui refuses a chord that is already taken, so a duplicate in an export is
 * ? never something dima did on purpose: it is a settings row outliving the command it
 * ? configured. Raycast keeps `settings.commands[]` keyed by command id and prunes nothing
 * ? when an extension stops declaring one, and the export carries no manifest and no deletion
 * ? marker — so the collision is the only thing in the file that says a row is stale.
 */
export const boundTwice = (rows: readonly ChordRow[]) => {
    const owners = new Map<string, string[]>();

    for (const row of rows) {
        const existing = owners.get(row.chord);
        if (existing) existing.push(row.action);
        else owners.set(row.chord, [row.action]);
    }

    return [...owners]
        .filter(([, actions]) => actions.length > 1)
        .map(([chord, actions]) => ({ actions, chord }))
        .sort((a, z) => a.chord.localeCompare(z.chord));
};

export const diffAgainstMap = (
    exported: readonly ChordRow[],
    mapped: readonly ChordRow[],
) => {
    const exportedChords = new Set(exported.map((row) => row.chord));
    const mappedChords = new Set(mapped.map((row) => row.chord));

    return {
        onlyInExport: byChord(
            exported.filter((row) => !mappedChords.has(row.chord)),
        ),
        onlyInMap: byChord(
            mapped.filter((row) => !exportedChords.has(row.chord)),
        ),
    };
};

/* Helpers */
const byChord = (rows: readonly ChordRow[]) =>
    [...rows].sort((a, z) => a.chord.localeCompare(z.chord));

const MOD_NAME: Record<string, string> = {
    Alt: 'opt',
    Ctrl: 'ctrl',
    Meta: 'cmd',
    Shift: 'shift',
};
const HYPER = ['ctrl', 'opt', 'shift', 'cmd'];
const notHyper = (mod: string) => !HYPER.includes(mod);

const nameOfKey = (key: RayShortcut['key']) => {
    if (key.code !== undefined) return keyCap[key.code] ?? `key${key.code}`;
    if (key.keyType?.key === undefined) return null;

    return key.keyType.key.replace(/^Arrow/, '').toLowerCase();
};

/* Types */
export interface RayShortcut {
    key: {
        code?: number;
        keyType?: { key?: string; type?: string };
        type?: string;
    };
    modifiers: readonly { modifier: string }[];
}
