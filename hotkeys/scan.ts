// prints every hotkey the machine will tell us about, as json: wispr flow, magnet, bartender,
// cursor, macos, plus the hand-kept list in manual.ts.
//   node ./hotkeys/scan.ts
//
// stdout is an api — top.ts parses it — so it stays json. the same payload is also dropped
// beside this file as hotkeys.json, which is what the daemon hands the chords app over
// /api/hotkeys; the scan is five plutil calls and the page must not wait on them.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { canonical } from './chord.ts';
import { type Hotkey, manualHotkeys } from './manual.ts';
import {
    bartenderPreference,
    cursorKeybindings,
    macosPreference,
    magnetPreference,
    wisprConfig,
} from './sources.ts';

const plistJson = (path: string, key: string) =>
    execFileSync('plutil', ['-extract', key, 'raw', '-o', '-', path], {
        encoding: 'utf8',
    });

// carbon key codes → key caps (us layout)
const keyCap: Record<number, string> = {
    0: 'a',
    1: 's',
    11: 'b',
    117: 'del',
    12: 'q',
    123: 'left',
    124: 'right',
    125: 'down',
    126: 'up',
    13: 'w',
    14: 'e',
    15: 'r',
    16: 'y',
    17: 't',
    18: '1',
    19: '2',
    2: 'd',
    20: '3',
    21: '4',
    22: '6',
    23: '5',
    24: '=',
    25: '9',
    26: '7',
    27: '-',
    28: '8',
    29: '0',
    3: 'f',
    30: ']',
    31: 'o',
    32: 'u',
    33: '[',
    34: 'i',
    35: 'p',
    36: 'return',
    37: 'l',
    38: 'j',
    39: "'",
    4: 'h',
    40: 'k',
    41: ';',
    42: '\\',
    43: ',',
    44: '/',
    45: 'n',
    46: 'm',
    47: '.',
    48: 'tab',
    49: 'space',
    5: 'g',
    50: '`',
    51: 'backspace',
    53: 'esc',
    54: 'rcmd',
    55: 'cmd',
    56: 'shift',
    58: 'opt',
    59: 'ctrl',
    6: 'z',
    60: 'rshift',
    61: 'ropt',
    62: 'rctrl',
    63: 'fn',
    7: 'x',
    8: 'c',
    9: 'v',
};
const modifierCodes = new Set([55, 56, 58, 59, 63]);
const modsOf = (mask: number, bits: [number, string][]) =>
    bits
        .filter(([bit]) => mask & bit)
        .map(([, name]) => name)
        .join('+');
const carbonMods = (mask: number) =>
    modsOf(mask, [
        [4096, 'ctrl'],
        [2048, 'opt'],
        [512, 'shift'],
        [256, 'cmd'],
    ]);
// NX event flags, what symbolichotkeys stores
const nxMods = (mask: number) =>
    modsOf(mask, [
        [0x40000, 'ctrl'],
        [0x80000, 'opt'],
        [0x20000, 'shift'],
        [0x100000, 'cmd'],
    ]);

// wispr's config lists its in-app editing shortcuts beside its global ones, so a scan that
// takes the file wholesale credits wispr with cmd+z and the rest of the system's chords. only
// these six reach outside the app; everything else is macos, and the macos table already has
// it. `paste_event` is wispr's hook on the system paste chord, not a binding of its own.
const wisprGlobalActions = new Set([
    'ptt',
    'dismiss',
    'lens',
    'paste_last_text',
    'copy_last_text',
    'open_meeting_recorder',
]);

const wispr = (): Hotkey[] => {
    const config = JSON.parse(readFileSync(wisprConfig, 'utf8'));
    const binds: { shortcut: number[]; value: string }[] =
        config.prefs.cache.splitKeybinds;
    return binds
        .filter(({ value }) => wisprGlobalActions.has(value))
        .map(({ shortcut, value }) => {
            const mods = shortcut
                .filter((c) => modifierCodes.has(c))
                .map((c) => keyCap[c]);
            const keys = shortcut
                .filter((c) => !modifierCodes.has(c))
                .map((c) => keyCap[c] ?? String(c));
            return keys.length === 0
                ? {
                      action: value,
                      app: 'wispr flow',
                      key: mods.join('+'),
                      mods: '',
                      note: 'bare modifier',
                  }
                : {
                      action: value,
                      app: 'wispr flow',
                      key: keys.join('+'),
                      mods: mods.join('+'),
                  };
        });
};

const magnet = (): Hotkey[] => {
    const raw = Buffer.from(
        plistJson(magnetPreference, 'horizontalCommands'),
        'base64',
    ).toString();
    const commands: {
        name: string;
        keyboardShortcut: {
            enabled: boolean;
            shortcut?: { carbonModifiers: number; carbonKeyCode: number };
        };
    }[] = JSON.parse(raw);
    return commands
        .filter(
            (c) => c.keyboardShortcut.enabled && c.keyboardShortcut.shortcut,
        )
        .map((c) => {
            const { carbonModifiers, carbonKeyCode } = c.keyboardShortcut
                .shortcut as { carbonModifiers: number; carbonKeyCode: number };
            return {
                action: c.name.replace('command:default.name.', ''),
                app: 'magnet',
                key: keyCap[carbonKeyCode] ?? String(carbonKeyCode),
                mods: carbonMods(carbonModifiers),
            };
        });
};

const bartender = (): Hotkey[] => {
    const { carbonKeyCode, carbonModifiers } = JSON.parse(
        plistJson(bartenderPreference, 'KeyboardShortcuts_showAllItems'),
    );
    const mods = carbonMods(carbonModifiers);
    return [
        {
            action: 'show all items',
            app: 'bartender',
            key: keyCap[carbonKeyCode] ?? String(carbonKeyCode),
            mods: mods === 'ctrl+opt+shift+cmd' ? 'hyper' : mods,
        },
    ];
};

const cursor = (): Hotkey[] => {
    const text = readFileSync(cursorKeybindings, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
    const binds: { key: string; command: string }[] = JSON.parse(text);
    return binds
        .filter((b) => !b.command.startsWith('-'))
        .map((b) => {
            const parts = b.key
                .split('+')
                .map((p) => (p === 'alt' ? 'opt' : p));
            return {
                action: b.command,
                app: 'cursor',
                key: parts.at(-1) ?? b.key,
                mods: parts.slice(0, -1).join('+'),
            };
        });
};

const macos = (): Hotkey[] => {
    const plist = execFileSync(
        'plutil',
        ['-convert', 'json', '-o', '-', macosPreference],
        { encoding: 'utf8' },
    );
    const all: Record<
        string,
        { enabled: boolean; value?: { parameters: number[] } }
    > = JSON.parse(plist).AppleSymbolicHotKeys;
    const names: Record<string, string> = {
        79: 'space left',
        80: 'space left (drag)',
        81: 'space right',
        82: 'space right (drag)',
    };
    return Object.entries(all).flatMap(([id, v]) => {
        const action = names[id];
        const [, code, mask] = v.value?.parameters ?? [];
        if (!(v.enabled && action && code !== undefined)) return [];
        return {
            action,
            app: 'macos',
            key: keyCap[code] ?? String(code),
            mods: nxMods(mask ?? 0),
        };
    });
};

const scanned = [wispr, magnet, bartender, cursor, macos].flatMap((scan) => {
    try {
        return scan();
    } catch (error) {
        console.error(`skipped ${scan.name}: ${(error as Error).message}`);
        return [];
    }
});

const payload = JSON.stringify(
    {
        // Stamped here rather than declared in manual.ts: the two lists are only
        // distinguishable at the moment they are merged, and `macos` rows appear in both.
        hotkeys: [
            ...manualHotkeys.map((hotkey) => ({
                ...hotkey,
                source: 'manual' as const,
            })),
            ...scanned.map((hotkey) => ({
                ...hotkey,
                source: 'scan' as const,
            })),
        ].map(canonical),
        scannedAt: new Date().toISOString(),
    },
    null,
    2,
);

writeFileSync(join(import.meta.dirname, 'hotkeys.json'), `${payload}\n`);

console.log(payload);
