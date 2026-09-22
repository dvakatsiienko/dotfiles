// One spelling for one chord, shared by the scanner (what is bound) and the reader (what was
// pressed) so the two can be joined. The swift daemon builds the same string independently —
// see the modifier order note in schedule/jobs/x-monitor-hotkey-stats/main.swift.
import type { Hotkey } from './manual.ts';

// Carbon key codes → key caps (us layout). It sits here rather than in scan.ts because
// scan.ts is an entrypoint — it writes hotkeys.json and prints at import time — so any
// reader wanting to name a key code would run a whole hotkey scan to get the table.
// 📌 schedule/jobs/x-monitor-hotkey-stats/main.swift carries the same table and has
// drifted: 95 codes there against this one's 65.
export const keyCap: Record<number, string> = {
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

export const modOrder = ['hyper', 'ctrl', 'opt', 'shift', 'cmd'];

export const canonicalMods = (mods: string) =>
    mods
        .split('+')
        .filter(Boolean)
        .sort((a, z) => modOrder.indexOf(a) - modOrder.indexOf(z))
        .join('+');

export const canonical = (hotkey: Hotkey): Hotkey => ({
    ...hotkey,
    mods: canonicalMods(hotkey.mods),
});

// A typed filter query, spelled the way chordOf spells a chord. dima reaches for the modifiers
// in whatever order his hand finds them, so `cmd+shift+l` has to match the canonical
// `shift+cmd+l`. Tokens this file knows as modifiers are sorted into modOrder; anything else
// keeps its place behind them, which is what lets a query that is not a chord at all pass
// through unchanged and still match a note's prose.
export const canonicalQuery = (text: string) => {
    const parts = text.split('+').filter(Boolean);
    const mods = parts.filter((part) => modOrder.includes(part));
    const rest = parts.filter((part) => !modOrder.includes(part));

    return [canonicalMods(mods.join('+')), ...rest].filter(Boolean).join('+');
};

// Takes the two fields it reads rather than a whole Hotkey, so the map can spell a free key's
// chord — a key with no binding has no row to hand over.
export const chordOf = (hotkey: Pick<Hotkey, 'key' | 'mods'>) => {
    const mods = canonicalMods(hotkey.mods);
    return mods ? `${mods}+${hotkey.key}` : hotkey.key;
};
