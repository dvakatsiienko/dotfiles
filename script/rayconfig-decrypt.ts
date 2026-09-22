// reads a raycast `.rayconfig` export and prints what it has bound inside.
//   node script/rayconfig-decrypt.ts <file.rayconfig> [--json]
// the passphrase comes from --password or $RAYCONFIG_PASSWORD, never from a literal here.
//
// the container, confirmed against this machine's own export (2026-09-18):
//   "RAYCFG3\n" · uint32le headerLength · gzip(header json) · ciphertext · 16-byte gcm tag
// the header is PLAINTEXT and carries the crypto parameters — iv and salt, 16 bytes each,
// hex — so the only secret is the passphrase. body = aes-256-gcm(gzip(payload json)) under
// scrypt(passphrase, salt, N=16384, r=8, p=1, 32). those scrypt parameters are node's own
// defaults, which is why the export is readable at all: raycast never picked its own.
//
// 📌 raycast writes a `.rayconfig` even when dima never set a passphrase — it generates one
// and files it in the login keychain, so an export is only as private as that keychain.

import { createDecipheriv, scryptSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

import { chordOf, keyCap } from '../hotkeys/chord.ts';

const [file] = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const wantsJson = process.argv.includes('--json');
const password =
    flag('--password') ??
    process.env.RAYCONFIG_PASSWORD ??
    fail('no passphrase — pass --password <p> or set RAYCONFIG_PASSWORD.');

if (!file)
    fail('usage: node script/rayconfig-decrypt.ts <file.rayconfig> [--json]');

const raw = readFileSync(file);
if (raw.subarray(0, 8).toString() !== 'RAYCFG3\n')
    fail(`${file} does not start with RAYCFG3 — not a schema-3 export.`);

const headerLength = raw.readUInt32LE(8);
const header = JSON.parse(
    gunzipSync(raw.subarray(12, 12 + headerLength)).toString(),
);

const key = scryptSync(
    password,
    Buffer.from(header.encryption.salt, 'hex'),
    32,
    {
        N: 16384,
        p: 1,
        r: 8,
    },
);
const decipher = createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(header.encryption.iv, 'hex'),
);
// the tag is the last 16 bytes, so a wrong passphrase fails here rather than handing back
// plausible garbage — `final()` is the check, and nothing downstream needs a second one.
decipher.setAuthTag(raw.subarray(raw.length - 16));

let payload: string;
try {
    payload = gunzipSync(
        Buffer.concat([
            decipher.update(raw.subarray(12 + headerLength, raw.length - 16)),
            decipher.final(),
        ]),
    ).toString();
} catch {
    fail('the tag did not verify — wrong passphrase, or a truncated file.');
}

if (wantsJson) {
    process.stdout.write(payload);
    process.exit(0);
}

// Raycast spells a modifier as an object and a key as a layout-independent virtual keycode —
// the same numbering the press daemon reads off CGEvent, so `keyCap` already names them and
// `chordOf` already sorts them into the one spelling the rest of hotkeys/ joins on.
const modName: Record<string, string> = {
    Alt: 'opt',
    Ctrl: 'ctrl',
    Meta: 'cmd',
    Shift: 'shift',
};

const data = JSON.parse(payload);
const rowList = [
    ...toRow(data.settings?.general?.globalHotkey, 'raycast itself'),
    ...(data.settings?.commands ?? []).flatMap((command: RayCommand) =>
        toRow(command.macosHotkey, nameOf(command.id)),
    ),
];

console.log(
    `${header.exportedAt} · raycast ${header.appVersion} · schema ${header.schemaVersion}`,
);
console.log(`${rowList.length} bound:`);
for (const row of rowList)
    console.log(`  ${row.chord.padEnd(24)} ${row.action}`);

/* Helpers */
function toRow(hotkey: RayHotkey | undefined, action: string) {
    const shortcut = hotkey?.kind?.shortcut;
    if (!shortcut) return [];

    const mods = shortcut.modifiers
        .map((one) => modName[one.modifier] ?? one.modifier.toLowerCase())
        .join('+');
    const cap = keyCap[shortcut.key.code] ?? `key${shortcut.key.code}`;

    return [{ action, chord: chordOf({ key: cap, mods }) }];
}

// A command id is a tagged path, and only its tail is readable: `::=::` fronts a target an
// app/quicklink/script row points at, `::-::` fronts the command name of an extension row.
// A target that is a file is worth only its basename — the rest is where it happens to live.
function nameOf(id: string) {
    const tail = id.split('::=::').pop() ?? id;
    const name = tail.split('::-::').pop() ?? tail;

    return name.includes('/') ? (name.split('/').pop() ?? name) : name;
}

function flag(name: string) {
    const at = process.argv.indexOf(name);
    return at === -1 ? undefined : process.argv[at + 1];
}

function fail(message: string): never {
    console.error(message);
    process.exit(1);
}

/* Types */
interface RayCommand {
    id: string;
    macosHotkey?: RayHotkey;
}
interface RayHotkey {
    kind?: {
        shortcut?: {
            key: { code: number };
            modifiers: { modifier: string }[];
        };
    };
}
