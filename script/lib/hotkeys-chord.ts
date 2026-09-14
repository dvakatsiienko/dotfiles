// One spelling for one chord, shared by the scanner (what is bound) and the reader (what was
// pressed) so the two can be joined. The swift daemon builds the same string independently —
// see the modifier order note in script/x-hotkey-stats-monitor/main.swift.
import type { Hotkey } from './hotkeys-manual.ts';

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

export const chordOf = (hotkey: Hotkey) => {
    const mods = canonicalMods(hotkey.mods);
    return mods ? `${mods}+${hotkey.key}` : hotkey.key;
};
