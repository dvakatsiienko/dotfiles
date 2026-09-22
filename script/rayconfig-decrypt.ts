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
//
// ⚠️ the decrypted payload holds every extension's stored preferences in the clear, api keys
// among them. `--json` prints all of it; the default output prints chords and nothing else.

import { createDecipheriv, scryptSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

import { chordOf } from '../hotkeys/chord.ts';
import { manualHotkeys } from '../hotkeys/manual.ts';
import { liveHotkeys } from '../hotkeys/stats.ts';
import {
    type ChordRow,
    type RayShortcut,
    boundTwice,
    diffAgainstMap,
    toChord,
} from './lib/rayconfig.ts';

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

// Raycast's own ui refuses a chord that is already taken, so a duplicate is never something
// dima did: it is a settings row that outlived the command it configured.
const GHOST_NOTE = [
    '   raycast keeps one settings row per command id and prunes none when an extension stops',
    '   declaring that command. the export carries no manifest and no deletion marker — so a',
    '   row that outlived its command still reads as bound, and the clash is the only tell.',
].join('\n');

// Filled by toRow as it goes: a shortcut whose key this reader cannot name is said once at
// the end rather than rendered as a chord nobody can press.
const unnamed: string[] = [];

const data = JSON.parse(payload);

// A quicklink's command id ends in an opaque ulid, and the readable name lives in a different
// top-level section. Without this join the row prints as `01M2QTVQHX49S3WKZD88Y9E8BE`.
const quicklinkName = new Map<string, string>(
    (data.quicklinks?.quicklinks ?? []).map((link: RayQuicklink) => [
        link.id,
        link.name,
    ]),
);
const rowList = [
    ...toRow(data.settings?.general?.globalHotkey, 'raycast itself'),
    ...(data.settings?.commands ?? []).flatMap((command: RayCommand) =>
        toRow(command.macosHotkey, nameOf(command.id)),
    ),
];

// Every live row, not just the ones credited to raycast: manual.ts names the app a binding
// DRIVES, not the app that holds it, and its own header says the cleanshot commands are bound
// in raycast's cleanshot extension. Filtering on `raycast` reported all eleven of those as
// missing from a map that has carried them all along.
const mapRowList = liveHotkeys(manualHotkeys).map((hotkey) => ({
    action: `${hotkey.action} · ${hotkey.app}`,
    chord: chordOf(hotkey),
}));

console.log(
    `${header.exportedAt} · raycast ${header.appVersion} · schema ${header.schemaVersion}`,
);
console.log(`${rowList.length} bound:`);
for (const row of rowList)
    console.log(`  ${row.chord.padEnd(24)} ${row.action}`);

for (const clash of boundTwice(rowList)) {
    console.log(
        `\n⚠️ bound twice: ${clash.chord} → ${clash.actions.join(', ')}`,
    );
    console.log(GHOST_NOTE);
}

const diff = diffAgainstMap(rowList, mapRowList);
report('raycast binds, hotkeys/manual.ts lacks', diff.onlyInExport);
report('hotkeys/manual.ts keeps, this export does not bind', diff.onlyInMap);

if (unnamed.length > 0)
    console.log(`\nkey shape this reader cannot name: ${unnamed.join(', ')}`);

/* Helpers */

function report(title: string, rows: readonly ChordRow[]) {
    if (rows.length === 0) {
        console.log(`\n${title}: none.`);
        return;
    }

    console.log(`\n${title} (${rows.length}):`);
    for (const row of rows)
        console.log(`  ${row.chord.padEnd(24)} ${row.action}`);
}
function toRow(hotkey: RayHotkey | undefined, action: string) {
    const shortcut = hotkey?.kind?.shortcut;
    if (!shortcut) return [];

    const chord = toChord(shortcut);
    if (chord === null) {
        unnamed.push(action);
        return [];
    }

    return [{ action, chord }];
}

// A command id is a tagged path, and only its tail is readable: `::=::` fronts a target an
// app/quicklink/script row points at, `::-::` fronts the command name of an extension row.
// A target that is a file is worth only its basename — the rest is where it happens to live.
function nameOf(id: string) {
    const tail = id.split('::=::').pop() ?? id;
    const name = tail.split('::-::').pop() ?? tail;

    const leaf = name.includes('/') ? (name.split('/').pop() ?? name) : name;

    return quicklinkName.get(leaf) ?? leaf;
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
interface RayQuicklink {
    id: string;
    name: string;
}
interface RayHotkey {
    kind?: { shortcut?: RayShortcut };
}
