// Aggregation over the jsonl the x-monitor-hotkey-stats daemon appends. Pure functions on plain
// arrays — reading the file and printing the tables is the entrypoint's job (top.ts).
import { chordOf } from './chord.ts';
import type { Hotkey } from './manual.ts';

export const eventKinds = ['chord', 'activate', 'launch'] as const;
export type EventKind = (typeof eventKinds)[number];

export interface LogEvent {
    ts: string;
    kind: EventKind;
    app: string;
    chord?: string;
}

export interface Tally {
    name: string;
    count: number;
}

export interface Window {
    days?: number;
    app?: string;
    ignore?: readonly string[];
    now?: Date;
}

const isKind = (value: unknown): value is EventKind =>
    eventKinds.includes(value as EventKind);

// A daemon killed mid-write leaves a torn last line; one bad line must not lose the month.
// Lines written before app events existed carry no `kind` — those are chords.
export const parseEvents = (jsonl: string): LogEvent[] =>
    jsonl.split('\n').flatMap((line): LogEvent[] => {
        if (!line.trim()) return [];
        let parsed: unknown;
        try {
            parsed = JSON.parse(line);
        } catch {
            return [];
        }
        if (typeof parsed !== 'object' || parsed === null) return [];
        const { ts, kind, chord, app } = parsed as Record<string, unknown>;
        if (typeof ts !== 'string' || typeof app !== 'string') return [];
        const resolved: EventKind = isKind(kind) ? kind : 'chord';
        if (resolved === 'chord') {
            return typeof chord === 'string'
                ? [{ app, chord, kind: resolved, ts }]
                : [];
        }
        return [{ app, kind: resolved, ts }];
    });

export const selectEvents = (
    events: readonly LogEvent[],
    { days, app, ignore = [], now = new Date() }: Window = {},
): LogEvent[] => {
    const since =
        days === undefined ? -Infinity : now.getTime() - days * 86_400_000;
    const needle = app?.toLowerCase();
    const muted = new Set(ignore);
    return events.filter(
        (event) =>
            Date.parse(event.ts) >= since &&
            !(event.chord !== undefined && muted.has(event.chord)) &&
            (needle === undefined ||
                needle === '' ||
                event.app.toLowerCase().includes(needle)),
    );
};

export const ofKind = (events: readonly LogEvent[], kind: EventKind) =>
    events.filter((event) => event.kind === kind);

export const tally = (
    events: readonly LogEvent[],
    of: (event: LogEvent) => string,
): Tally[] => {
    const counts = new Map<string, number>();
    for (const event of events) {
        const name = of(event);
        counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts]
        .map(([name, count]) => ({ count, name }))
        .sort((a, z) => z.count - a.count || a.name.localeCompare(z.name));
};

export const byChord = (event: LogEvent) => event.chord ?? '';

// The label a chord carried when it was pressed: the binding for that chord whose `since` is the
// latest one not after the press (a row without `since` is the oldest meaning), and which had
// not already ended. A reshuffle adds a dated row and the history stays honest instead of being
// relabelled; a move ends the old row, so a press on the freed chord afterwards belongs to
// nobody rather than to whatever used to be there.
export const labelAt = (
    hotkeys: readonly Hotkey[],
    chord: string,
    ts: string,
): Hotkey | undefined =>
    hotkeys
        .filter(
            (hotkey) =>
                chordOf(hotkey) === chord &&
                (hotkey.since === undefined || hotkey.since <= ts) &&
                (hotkey.until === undefined || ts < hotkey.until),
        )
        .sort((a, z) => (a.since ?? '').localeCompare(z.since ?? ''))
        .at(-1);

export const LABEL_SEPARATOR = '\t';

// Tally key for the chords table: the chord plus the label it had at press time, so a swapped
// chord shows one row per meaning.
export const byLabelledChord =
    (hotkeys: readonly Hotkey[]) =>
    (event: LogEvent): string => {
        const chord = event.chord ?? '';
        const hotkey = labelAt(hotkeys, chord, event.ts);
        return hotkey
            ? `${chord}${LABEL_SEPARATOR}${hotkey.action}${LABEL_SEPARATOR}${hotkey.app}`
            : chord;
    };
export const byApp = (event: LogEvent) => event.app;

// Bound somewhere, never pressed in the window — the rebind candidates.
export const unpressed = (
    hotkeys: readonly Hotkey[],
    events: readonly LogEvent[],
): Hotkey[] => {
    const seen = new Set(
        events.flatMap((event) => (event.chord ? [event.chord] : [])),
    );
    return hotkeys.filter((hotkey) => !seen.has(chordOf(hotkey)));
};
