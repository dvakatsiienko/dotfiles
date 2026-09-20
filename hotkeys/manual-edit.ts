// Rebinding and surface editing from the chords ui, written back into manual.ts — which stays
// the single source for the sealed apps, so the ui is its editor and never a second list.
//
// The edit is surgical, not a regenerate. manual.ts is as much prose as data: the group
// comments carry where each binding came from and when it was bound, and a printer that
// re-emitted the array from parsed rows would flatten every one of them. So the row's own
// literal is found in the text and only its fields move.
//
// Two literal forms exist in that file, because the repeated groups are written as tuples fed
// through .map: `['e', 'Linear']` inside a hyper group, and `{ action, app, key, mods }`
// standing alone. A tuple carries no mods of its own, so changing the layer cannot be an
// in-place edit — the tuple leaves its group and comes back as a full object row.
//
// 🚫 Nothing here guesses. Every lookup must land on exactly one place in the file; zero or
// more than one throws, and the caller answers the request with the reason.
import { canonicalMods } from './chord.ts';
import type { Hotkey } from './manual.ts';

const TERMINATOR = '] satisfies readonly Hotkey[];';
const LINE_WIDTH = 80;
const FIELD_ORDER = ['action', 'app', 'key', 'mods', 'note', 'since'] as const;

// biome's string style, measured rather than assumed (2026-09-20): single quotes win unless the
// value holds MORE singles than doubles, and the losing mark is escaped rather than switched to.
// Getting this wrong writes a file biome then refuses, which fails the next commit.
//
// The control characters are not paranoia about the api — that boundary rejects them. They can
// arrive from manual.ts itself, where `'a\nb'` parses to a real newline, and re-emitting one raw
// would end the string mid-line and take the rest of the file with it.
const quote = (value: string) => {
    const mark =
        (value.match(/'/g)?.length ?? 0) > (value.match(/"/g)?.length ?? 0)
            ? '"'
            : "'";
    const body = value
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replaceAll(mark, `\\${mark}`);

    return `${mark}${body}${mark}`;
};

const sameRow = (row: Hotkey, ref: ManualRowRef) =>
    row.app === ref.app &&
    row.key === ref.key &&
    row.action === ref.action &&
    canonicalMods(row.mods) === canonicalMods(ref.mods);

const indexesOf = (text: string, needle: string) => {
    const found: number[] = [];

    for (
        let at = text.indexOf(needle);
        at !== -1;
        at = text.indexOf(needle, at + 1)
    ) {
        found.push(at);
    }

    return found;
};

const onlyIndex = (text: string, needle: string, what: string) => {
    const found = indexesOf(text, needle);

    if (found.length === 0) return null;
    if (found.length > 1) {
        throw new ManualEditError(
            `${what} appears ${found.length} times in manual.ts — edit it by hand`,
        );
    }

    return found[0] as number;
};

// The braces around a row hold only string fields, so the nearest pair in each direction is
// the whole literal — no nesting to balance.
const objectBlockAt = (text: string, fieldAt: number) => {
    const open = text.lastIndexOf('{', fieldAt);
    const close = text.indexOf('}', fieldAt);

    if (open === -1 || close === -1) {
        throw new ManualEditError('the row is not inside an object literal');
    }

    return { close: close + 1, open, text: text.slice(open, close + 1) };
};

const setField = (block: string, field: string, next: string) => {
    const pattern = new RegExp(
        `(\\b${field}:\\s*)(('(?:[^'\\\\]|\\\\.)*')|("(?:[^"\\\\]|\\\\.)*"))`,
    );

    if (!pattern.test(block)) {
        throw new ManualEditError(`the row has no ${field} field to change`);
    }

    return block.replace(pattern, `$1${quote(next)}`);
};

// biome keeps an object on one line while it fits the 80-column budget and explodes it the
// moment it does not — matched here so a written row needs no reformat before it commits.
export const printRow = (row: Hotkey) => {
    const fields = FIELD_ORDER.filter((name) => row[name] !== undefined).map(
        (name) => [name, String(row[name])] as const,
    );
    const inline = fields
        .map(([name, value]) => `${name}: ${quote(value)}`)
        .join(', ');
    const oneLine = `    { ${inline} },`;

    if (oneLine.length <= LINE_WIDTH) return oneLine;

    const lines = fields.map(
        ([name, value]) => `        ${name}: ${quote(value)},`,
    );

    return ['    {', ...lines, '    },'].join('\n');
};

export const editManualText = (
    text: string,
    rows: readonly Hotkey[],
    edit: ManualEdit,
) => {
    // The text search alone cannot tell which layer a tuple sits in, so the parsed rows are
    // what proves the target is the row the ui meant. One match, or nothing happens.
    const matched = rows.filter((row) => sameRow(row, edit.from));

    if (matched.length === 0) {
        throw new ManualEditError('no hand-kept row matches that chord');
    }
    if (matched.length > 1) {
        throw new ManualEditError(
            `${matched.length} hand-kept rows match that chord — edit manual.ts by hand`,
        );
    }

    const row = matched[0] as Hotkey;
    const mods = canonicalMods(edit.to.mods);
    const next: Hotkey = {
        ...row,
        action: edit.to.action,
        key: edit.to.key,
        mods,
    };

    const tuple = `[${quote(row.key)}, ${quote(row.action)}]`;
    const tupleAt = onlyIndex(text, tuple, `the pair ${tuple}`);

    if (tupleAt !== null) {
        if (mods === canonicalMods(row.mods)) {
            return text.replace(
                tuple,
                `[${quote(next.key)}, ${quote(next.action)}]`,
            );
        }

        return appendRow(dropTupleLine(text, tupleAt), next);
    }

    const fieldAt = onlyIndex(
        text,
        `action: ${quote(row.action)}`,
        `the action ${quote(row.action)}`,
    );

    if (fieldAt === null) {
        throw new ManualEditError(
            'the row is not written literally in manual.ts',
        );
    }

    const block = objectBlockAt(text, fieldAt);
    let edited = setField(block.text, 'action', next.action);
    edited = setField(edited, 'key', next.key);
    edited = setField(edited, 'mods', next.mods);

    return text.slice(0, block.open) + edited + text.slice(block.close);
};

/* Helpers */

// A tuple owns its whole line in that file, and taking the line takes the trailing comma and
// the indent with it; leaving a bare `,` behind would not parse.
const dropTupleLine = (text: string, tupleAt: number) => {
    const lineStart = text.lastIndexOf('\n', tupleAt) + 1;
    const lineEnd = text.indexOf('\n', tupleAt);

    if (text.slice(lineStart, tupleAt).trim() !== '') {
        throw new ManualEditError(
            'that pair shares its line — edit manual.ts by hand',
        );
    }

    return text.slice(0, lineStart) + text.slice(lineEnd + 1);
};

const appendRow = (text: string, row: Hotkey) => {
    const at = text.lastIndexOf(TERMINATOR);

    if (at === -1) {
        throw new ManualEditError(
            'manual.ts does not end in the shape this writer knows',
        );
    }

    return `${text.slice(0, at)}${printRow(row)}\n${text.slice(at)}`;
};

/* Types */
export class ManualEditError extends Error {}

export interface ManualRowRef {
    app: string;
    mods: string;
    key: string;
    action: string;
}
export interface ManualEdit {
    from: ManualRowRef;
    to: { mods: string; key: string; action: string };
}
