// One spelling for one chord, shared by the scanner (what is bound) and the reader (what was
// pressed) so the two can be joined. The swift daemon builds the same string independently —
// see the modifier order note in schedule/jobs/x-monitor-hotkey-stats/main.swift.
import type { Hotkey } from './manual.ts';

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
