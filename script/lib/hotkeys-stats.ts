// Aggregation over the jsonl the hotkey-stats daemon appends. Pure functions on plain arrays —
// reading the file and printing the tables is the entrypoint's job (script/hotkeys-top.ts).
import { chordOf } from './hotkeys-chord.ts';
import type { Hotkey } from './hotkeys-manual.ts';

export interface Press {
    ts: string;
    chord: string;
    app: string;
}

export interface Tally {
    name: string;
    count: number;
}

export interface Window {
    days?: number;
    app?: string;
    now?: Date;
}

// A daemon killed mid-write leaves a torn last line; one bad line must not lose the month.
export const parsePresses = (jsonl: string): Press[] =>
    jsonl.split('\n').flatMap((line) => {
        if (!line.trim()) return [];
        try {
            const parsed: unknown = JSON.parse(line);
            if (
                typeof parsed !== 'object' ||
                parsed === null ||
                !('ts' in parsed && 'chord' in parsed && 'app' in parsed)
            ) {
                return [];
            }
            const { ts, chord, app } = parsed as Record<string, unknown>;
            if (
                typeof ts !== 'string' ||
                typeof chord !== 'string' ||
                typeof app !== 'string'
            ) {
                return [];
            }
            return [{ app, chord, ts }];
        } catch {
            return [];
        }
    });

export const selectPresses = (
    presses: readonly Press[],
    { days, app, now = new Date() }: Window = {},
): Press[] => {
    const since =
        days === undefined ? -Infinity : now.getTime() - days * 86_400_000;
    const needle = app?.toLowerCase();
    return presses.filter(
        (press) =>
            Date.parse(press.ts) >= since &&
            (needle === undefined ||
                needle === '' ||
                press.app.toLowerCase().includes(needle)),
    );
};

export const tally = (
    presses: readonly Press[],
    of: (press: Press) => string,
): Tally[] => {
    const counts = new Map<string, number>();
    for (const press of presses) {
        const name = of(press);
        counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts]
        .map(([name, count]) => ({ count, name }))
        .sort((a, z) => z.count - a.count || a.name.localeCompare(z.name));
};

export const byChord = (press: Press) => press.chord;
export const byApp = (press: Press) => press.app;

// Bound somewhere, never pressed in the window — the rebind candidates.
export const unpressed = (
    hotkeys: readonly Hotkey[],
    presses: readonly Press[],
): Hotkey[] => {
    const seen = new Set(presses.map((press) => press.chord));
    return hotkeys.filter((hotkey) => !seen.has(chordOf(hotkey)));
};
