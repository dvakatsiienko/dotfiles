// The payload behind /api/stats: the four tables `hotkeys:top` prints, as data instead of as
// aligned text. top.ts stays the terminal's formatter and the chords app is the page's; both
// call the same primitives in stats.ts, so a number can only differ by the window it was asked
// for. Nothing here re-implements an aggregation — it selects, tallies and reshapes.
import { cachedAppName } from './app-name.ts';
import { chordOf } from './chord.ts';
import type { Hotkey } from './manual.ts';
import {
    LABEL_SEPARATOR,
    type LogEvent,
    byApp,
    byLabelledChord,
    liveHotkeys,
    ofKind,
    selectEvents,
    tally,
    unpressed,
} from './stats.ts';

// Words, not numbers — dima's call (2026-09-20). `all` is the default because the lifetime
// record is what he opens this for; the shorter two answer "what have I been reaching for
// lately", which is a different question.
export const windowDays = { all: undefined, month: 30, week: 7 } as const;

export const isWindowName = (value: unknown): value is WindowName =>
    typeof value === 'string' && Object.hasOwn(windowDays, value);

export const buildReport = (
    events: readonly LogEvent[],
    bindings: readonly Hotkey[],
    window: WindowName,
): StatsReport => {
    // Two different questions over one list. The chords table asks what a press meant at the
    // time, so it reads every row a move ever ended; the bound count and the never-pressed list
    // ask what is on the keyboard today, so they read only the live ones.
    const live = liveHotkeys(bindings);
    const selected = selectEvents(events, { days: windowDays[window] });
    const chords = ofKind(selected, 'chord');
    const switches = ofKind(selected, 'activate');

    // Never pressed means never, on purpose, and so it reads the whole log rather than the
    // selection. It is the rebind-candidate list: one that shrank because the view got shorter
    // would be making a different claim in the same words.
    const cold = unpressed(live, ofKind(events, 'chord'));

    return {
        boundCount: live.length,
        chordsPerApp: tally(chords, byApp).map(toAppRow),
        neverPressed: cold.map((hotkey) => ({
            action: hotkey.action,
            app: hotkey.app,
            chord: chordOf(hotkey),
        })),
        presses: chords.length,
        switches: switches.length,
        switchesPerApp: tally(switches, byApp).map(toAppRow),
        topChords: tally(chords, byLabelledChord(bindings)).map(toChordRow),
        window,
    };
};

/* Helpers */

// The log stores bundle ids, and nobody reads com.todesktop.230313mzl4w4u92 as Cursor. The id
// travels beside the name because it is the stable key and the lookup is the thing that can fail.
const toAppRow = ({
    name,
    count,
}: {
    name: string;
    count: number;
}): AppRow => ({
    app: cachedAppName(name),
    bundleId: name,
    count,
});

// byLabelledChord joins the chord to the meaning it carried at press time; the same separator
// takes it apart. A chord with no binding behind it arrives as the bare chord and keeps a null
// action rather than an invented one.
const toChordRow = ({
    name,
    count,
}: {
    name: string;
    count: number;
}): ChordRow => {
    const [chord, action, app] = name.split(LABEL_SEPARATOR);

    return {
        action: action ?? null,
        app: app ?? null,
        chord: chord ?? name,
        count,
    };
};

/* Types */
export type WindowName = keyof typeof windowDays;

export interface ChordRow {
    chord: string;
    action: string | null;
    app: string | null;
    count: number;
}
export interface AppRow {
    app: string;
    bundleId: string;
    count: number;
}
export interface ColdRow {
    chord: string;
    action: string;
    app: string;
}
export interface StatsReport {
    window: WindowName;
    presses: number;
    switches: number;
    boundCount: number;
    topChords: ChordRow[];
    chordsPerApp: AppRow[];
    switchesPerApp: AppRow[];
    neverPressed: ColdRow[];
}
