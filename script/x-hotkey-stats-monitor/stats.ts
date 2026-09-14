// Aggregation over the jsonl the x-hotkey-stats-monitor daemon appends. Pure functions on plain
// arrays — reading the file and printing the tables is the entrypoint's job (top.ts).
import { chordOf } from '../lib/hotkeys-chord.ts';
import type { Hotkey } from '../lib/hotkeys-manual.ts';

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
