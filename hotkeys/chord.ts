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

// Takes the two fields it reads rather than a whole Hotkey, so the map can spell a free key's
// chord — a key with no binding has no row to hand over.
export const chordOf = (hotkey: Pick<Hotkey, 'key' | 'mods'>) => {
    const mods = canonicalMods(hotkey.mods);
    return mods ? `${mods}+${hotkey.key}` : hotkey.key;
};
