/**
 * ? The two questions `rayconfig:decrypt` asks of a decrypted export, kept here so they have
 * ? tests: which chords more than one command claims, and how the export differs from the
 * ? hand-kept map in `hotkeys/manual.ts`.
 * ?
 * ? Both answer on the CHORD alone. The two sides name an action differently by nature — the
 * ? map carries dima's prose ("Raycast"), the export carries a command id ("raycast itself") —
 * ? so a name comparison would report every shared row as a difference.
 */

import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
    scryptSync,
} from 'node:crypto';
import { gunzipSync, gzipSync } from 'node:zlib';

import { chordOf, keyCap } from '../../hotkeys/chord.ts';

// The container, confirmed against this machine's own exports rather than any published spec:
//   "RAYCFG3\n" · uint32le headerLength · gzip(header json) · ciphertext · 16-byte gcm tag
// The header is PLAINTEXT and carries the crypto parameters, so the only secret is the
// passphrase. Body = aes-256-gcm(gzip(payload json)) under scrypt with node's own defaults —
// which is the reason an export opens at all: raycast never picked parameters of its own.
const MAGIC = 'RAYCFG3\n';
const HEADER_AT = MAGIC.length + 4;
const TAG_BYTES = 16;
const IV_BYTES = 16;
const SALT_BYTES = 16;
const KEY_BYTES = 32;
const SCRYPT = { N: 16384, p: 1, r: 8 } as const;

const keyFor = (password: string, salt: Buffer) =>
    scryptSync(password, salt, KEY_BYTES, { ...SCRYPT });

export const decryptExport = (raw: Buffer, password: string) => {
    if (raw.subarray(0, MAGIC.length).toString() !== MAGIC)
        throw new Error(
            'not a schema-3 export — it does not open with RAYCFG3.',
        );

    const headerLength = raw.readUInt32LE(MAGIC.length);
    const header = JSON.parse(
        gunzipSync(
            raw.subarray(HEADER_AT, HEADER_AT + headerLength),
        ).toString(),
    ) as RayHeader;
    const decipher = createDecipheriv(
        'aes-256-gcm',
        keyFor(password, Buffer.from(header.encryption.salt, 'hex')),
        Buffer.from(header.encryption.iv, 'hex'),
    );

    // The tag is the last 16 bytes, so a wrong passphrase fails in `final()` rather than
    // handing back plausible garbage. Reading the body to EOF instead is what made the first
    // attempt at this format fail identically for every parameter combination it tried.
    decipher.setAuthTag(raw.subarray(raw.length - TAG_BYTES));

    const payload = gunzipSync(
        Buffer.concat([
            decipher.update(
                raw.subarray(HEADER_AT + headerLength, raw.length - TAG_BYTES),
            ),
            decipher.final(),
        ]),
    ).toString();

    return { header, payload };
};

/**
 * ? Seals a payload back into the same container. The iv and the salt are minted fresh every
 * ? time — reusing the pair from the file being edited would leak that two exports share a
 * ? key stream, and it costs nothing to avoid. Every other header field is carried across
 * ? untouched, in its original order, so the file raycast reads back differs only where it
 * ? has to.
 */
export const encryptExport = (options: {
    header: RayHeader;
    password: string;
    payload: string;
}) => {
    const iv = randomBytes(IV_BYTES);
    const salt = randomBytes(SALT_BYTES);
    const header: RayHeader = {
        ...options.header,
        encryption: { iv: iv.toString('hex'), salt: salt.toString('hex') },
    };
    const headerBytes = gzipSync(Buffer.from(JSON.stringify(header)));
    const cipher = createCipheriv(
        'aes-256-gcm',
        keyFor(options.password, salt),
        iv,
    );
    const body = Buffer.concat([
        cipher.update(gzipSync(Buffer.from(options.payload))),
        cipher.final(),
    ]);
    const headerLength = Buffer.alloc(4);
    headerLength.writeUInt32LE(headerBytes.length);

    return Buffer.concat([
        Buffer.from(MAGIC),
        headerLength,
        headerBytes,
        body,
        cipher.getAuthTag(),
    ]);
};

/**
 * ? Takes one command's binding away and leaves the rest of the export alone. It removes the
 * ? `macosHotkey` field and nothing else: the settings row itself stays, alias and all, so the
 * ? edit is the smallest one that frees the chord. A row whose command no longer exists is
 * ? invisible in raycast either way — it is only its hotkey that collides with a live command.
 */
export const dropHotkey = (payload: string, commandName: string) => {
    const data = JSON.parse(payload) as RayPayload;
    const removed: string[] = [];

    for (const command of data.settings?.commands ?? []) {
        if (commandNameOf(command.id) !== commandName) continue;
        if (command.macosHotkey === undefined) continue;

        command.macosHotkey = undefined;
        removed.push(command.id);
    }

    if (removed.length === 0)
        throw new Error(
            `nothing named "${commandName}" carries a hotkey in this export.`,
        );

    return { payload: JSON.stringify(data), removed };
};

// A command id is a tagged path and only its tail is readable: `::=::` fronts the target an
// app, quicklink or script row points at, `::-::` fronts the command name of an extension row.
// A target that is a file is worth only its basename — the rest is where it happens to live.
export const commandNameOf = (id: string) => {
    const tail = id.split('::=::').pop() ?? id;
    const name = tail.split('::-::').pop() ?? tail;

    return name.includes('/') ? (name.split('/').pop() ?? name) : name;
};

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

export interface RayHeader {
    encryption: { iv: string; salt: string };
    schemaVersion: number;
    [field: string]: unknown;
}
interface RayPayload {
    settings?: { commands?: { id: string; macosHotkey?: unknown }[] };
}
