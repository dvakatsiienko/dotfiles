/* Core */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Feedback, defaultPreset } from '@dnd-kit/dom';
import { DragDropProvider } from '@dnd-kit/react';
/* Instruments */
import { canonicalQuery, chordOf, modOrder } from '@hotkeys/chord.ts';
import type { Hotkey } from '@hotkeys/manual.ts';

/* Components */
import { Board } from '@/components/Board.tsx';
import { List, ListEmpty, ListRow } from '@/components/List.tsx';
import { NoteEditor } from '@/components/NoteEditor.tsx';
import { Notice, apiTrouble } from '@/components/Notice.tsx';

import {
    type NoteStore,
    type ScanPayload,
    fetchNotes,
    fetchScan,
    postManualMove,
    putNote,
    subscribeLive,
} from '@/api.ts';
import { colorOf, layerName, layerOrder, layout, modKeys } from '@/keyboard.ts';
import { GHOST, H2, TAB } from '@/ui.ts';

export const BoardPage = (props: BoardPageProps) => {
    const [scan, setScan] = useState<ScanPayload | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [presses, setPresses] = useState<Record<string, number>>({});
    const [pressedAt, setPressedAt] = useState<string | null>(null);
    const [notes, setNotes] = useState<NoteStore>({});
    // stats hands a chord back as ?layer=&key=, so a row there opens the board on that key. An
    // absent param is not the same as an empty one: layer='' is the no-modifier layer.
    const [layer, setLayer] = useState(props.params.get('layer') ?? 'hyper');
    const [selected, setSelected] = useState<string | null>(
        props.params.get('key'),
    );
    const [noteFilter, setNoteFilter] = useState('');
    // A rebind is one gesture: drag a bound keycap onto a free one, or arm `listening` and press
    // the new chord on the real keyboard. `dragging` is the binding in flight, `pending` the key
    // it is landing on until the daemon has written manual.ts and pushed the rescan.
    const [dragging, setDragging] = useState<Hotkey | null>(null);
    const [pending, setPending] = useState<Pending | null>(null);
    const [listening, setListening] = useState(false);
    const [lastPress, setLastPress] = useState<{
        chord: string;
        at: number;
    } | null>(null);
    const [moveError, setMoveError] = useState<string | null>(null);

    // Lifted out of the effect below so the retry in the notice can call the same function the
    // stream calls. It has no dependencies, so the effect still runs exactly once and pressing
    // retry re-fetches the scan without tearing the EventSource down and building it again.
    const loadScan = useCallback(() => {
        fetchScan()
            .then((next) => {
                setScan(next);
                setScanError(null);
                // A rescan is how a rebind finishes: the daemon rewrote manual.ts and pushed.
                setPending(null);
            })
            .catch((error: Error) => setScanError(error.message));
    }, []);

    // One stream for the life of the page: a rerun would open a second EventSource and leak
    // the first.
    useEffect(() => {
        loadScan();
        fetchNotes()
            .then(setNotes)
            .catch(() => undefined);

        // Both kinds of news arrive on one stream, so the page holds no timer: a press
        // repaints the counts, a config change repulls the whole scan.
        return subscribeLive({
            onBindings: loadScan,
            onPresses: (payload) => {
                // The stream carries totals, so the chord just pressed is the one whose count
                // moved. That is what press-to-pick listens for.
                setPresses((previous) => {
                    const pressed = Object.keys(payload.counts).find(
                        (chord) =>
                            (payload.counts[chord] ?? 0) >
                            (previous[chord] ?? 0),
                    );

                    if (pressed)
                        setLastPress({ at: Date.now(), chord: pressed });

                    return payload.counts;
                });
                setPressedAt(payload.updatedAt);
            },
        });
    }, [loadScan]);

    // While a rebind is in flight the board already shows it landed: the row sits on its new
    // chord and the old one is empty, and both caps are held until the daemon's rescan confirms
    // or the request fails and the real rows come back.
    const hotkeys = useMemo(() => {
        const scanned = scan?.hotkeys ?? [];

        if (!pending) return scanned;

        return scanned.map((hotkey) =>
            hotkey === pending.from
                ? { ...hotkey, key: pending.key, mods: pending.layer }
                : hotkey,
        );
    }, [scan, pending]);
    const binds = useMemo(
        () => hotkeys.filter((hotkey) => hotkey.mods === layer),
        [hotkeys, layer],
    );

    const layers = useMemo(() => {
        const present = [...new Set(hotkeys.map((hotkey) => hotkey.mods))];

        return present.sort(
            (a, z) =>
                (layerOrder.indexOf(a) + 1 || 99) -
                (layerOrder.indexOf(z) + 1 || 99),
        );
    }, [hotkeys]);

    const noted = useMemo(
        () =>
            new Set(
                Object.values(notes)
                    .filter((note) => note.layer === layer)
                    .map((note) => note.key),
            ),
        [notes, layer],
    );

    const taken = new Set(binds.map((hotkey) => hotkey.key));
    const free = layout
        .flat()
        .map(([label]) => label)
        .filter((label) => label && !modKeys.has(label) && !taken.has(label));
    const apps = [...new Set(binds.map((hotkey) => hotkey.app))];
    const coldCount = hotkeys.filter(
        (hotkey) => !presses[chordOf(hotkey)],
    ).length;
    const selectedBinds = binds.filter((hotkey) => hotkey.key === selected);
    const selectedChord = selected
        ? chordOf({ key: selected, mods: layer })
        : null;
    const selectedNote = Object.values(notes).find(
        (note) => note.layer === layer && note.key === selected,
    );

    const rebind = useCallback(
        async (from: Hotkey, to: { key: string; layer: string }) => {
            setPending({ from, key: to.key, layer: to.layer });
            setMoveError(null);
            setListening(false);
            setLayer(to.layer);
            setSelected(to.key);

            try {
                await postManualMove({
                    from: {
                        action: from.action,
                        app: from.app,
                        key: from.key,
                        mods: from.mods,
                    },
                    to: { action: from.action, key: to.key, mods: to.layer },
                });

                // The note is about the meaning and not the keycap, so it travels with it
                // (dima, 2026-09-20). Cleared from the old chord, written on the new one.
                const note = Object.values(notes).find(
                    (each) => each.layer === from.mods && each.key === from.key,
                );

                if (note) {
                    await putNote({
                        key: from.key,
                        layer: from.mods,
                        text: '',
                    });
                    setNotes(
                        await putNote({
                            key: to.key,
                            layer: to.layer,
                            text: note.text,
                        }),
                    );
                }

                // Nothing refetches the scan here: manual.ts changed, the daemon sees its
                // mtime move, reruns the scan and pushes `bindings` — the same road a hand edit
                // takes — and loadScan is what clears `pending`.
            } catch (error) {
                setPending(null);
                setMoveError((error as Error).message);
            }
        },
        [notes],
    );

    // Press-to-pick: with a hand-kept binding selected and the ear armed, the next chord pressed
    // on the real keyboard is the destination — any layer. A taken chord is refused with its
    // owner named, so the answer is never a silent second binding.
    const movable = selectedBinds.find((hotkey) => hotkey.source === 'manual');

    useEffect(() => {
        if (!(listening && lastPress && movable)) return;
        if (Date.now() - lastPress.at > 2000) return;

        const parts = lastPress.chord.split('+');
        const key = parts.at(-1) ?? '';
        const mods = parts.slice(0, -1).join('+');

        if (!key || parts.length === 1 || !modOrder.includes(parts[0] ?? '')) {
            return;
        }
        if (lastPress.chord === chordOf(movable)) return;

        const owner = hotkeys.find(
            (hotkey) => chordOf(hotkey) === lastPress.chord,
        );

        if (owner) {
            setMoveError(
                `${lastPress.chord} is taken — ${owner.app}: ${owner.action}`,
            );
            setListening(false);
            return;
        }

        void rebind(movable, { key, layer: mods });
    }, [listening, lastPress, movable, hotkeys, rebind]);

    useEffect(() => {
        if (!listening) return;

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setListening(false);
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [listening]);

    const saveNote = async (text: string) => {
        if (!selected) return;

        setNotes(await putNote({ key: selected, layer, text }));
    };

    // Markdown, because the destination is always a chat with an agent.
    const notesMarkdown = () =>
        Object.values(notes)
            .sort((a, z) => (a.layer + a.key).localeCompare(z.layer + z.key))
            .map(
                (note) =>
                    `- ${chordOf({ key: note.key, mods: note.layer })} — ${note.text}`,
            )
            .join('\n');

    const bindRow = (hotkey: Hotkey, at: number) => {
        return (
            <ListRow
                chord={chordOf(hotkey)}
                color={colorOf(hotkey.app)}
                key={`${hotkey.app}-${hotkey.key}-${at}`}
                who={
                    hotkey.note ? `${hotkey.app} · ${hotkey.note}` : hotkey.app
                }>
                {hotkey.action}
            </ListRow>
        );
    };

    // The filter reads the chord and the text, because dima looks for a note either way round —
    // he remembers the key, or he remembers what he wrote. Two needles, not one: a chord is
    // matched against the canonical spelling, so `cmd+shift+l` finds `shift+cmd+l`, while the
    // prose keeps the raw text — a note that literally says `cmd+shift+l` is still findable.
    const needle = noteFilter.trim().toLowerCase();
    const chordNeedle = canonicalQuery(needle);
    const matchingNotes = Object.values(notes).filter(
        (note) =>
            needle === '' ||
            note.text.toLowerCase().includes(needle) ||
            chordOf({ key: note.key, mods: note.layer })
                .toLowerCase()
                .includes(chordNeedle),
    );

    const noteRowJSX = matchingNotes
        .sort((a, z) => z.updatedAt.localeCompare(a.updatedAt))
        .map((note) => {
            return (
                <ListRow
                    chord={chordOf({ key: note.key, mods: note.layer })}
                    color='var(--color-accent)'
                    key={`${note.layer}-${note.key}`}>
                    {note.text}
                </ListRow>
            );
        });

    return (
        <div className='grid grid-cols-[minmax(0,1fr)] gap-[22px]'>
            <div className='flex flex-wrap items-baseline gap-x-[18px] gap-y-2'>
                <span className='text-[13px] text-ink-2'>
                    NuPhy Air75 · {hotkeys.length} bindings · scanned{' '}
                    <span className='font-mono'>
                        {scan
                            ? scan.scannedAt.slice(0, 16).replace('T', ' ')
                            : 'never'}
                    </span>{' '}
                    ·{' '}
                    {pressedAt
                        ? `${coldCount} never pressed · last press ${new Date(pressedAt).toLocaleTimeString()}`
                        : 'no press data — run pnpm hotkeys:live'}
                </span>
            </div>

            {scanError ? (
                <Notice onRetry={loadScan}>
                    no hotkey data — {apiTrouble(scanError)}. the scan behind it
                    is <span className='font-mono'>pnpm hotkeys:scan</span>, run
                    in dotfiles.
                </Notice>
            ) : null}

            <div
                aria-label='modifier layer'
                className='flex flex-wrap gap-1.5'
                role='tablist'>
                {layers.map((each) => {
                    return (
                        <button
                            aria-controls='board-panel'
                            aria-selected={each === layer}
                            className={`${TAB} ${each === layer ? 'border-accent bg-sel text-ink' : 'border-line bg-transparent text-ink-2'}`}
                            key={each || 'none'}
                            onClick={() => {
                                setLayer(each);
                                setSelected(null);
                            }}
                            role='tab'
                            type='button'>
                            <b className='font-semibold text-ink'>
                                {layerName(each)}
                            </b>
                            <span className='text-[12px] tabular-nums text-ink-2'>
                                {
                                    hotkeys.filter(
                                        (hotkey) => hotkey.mods === each,
                                    ).length
                                }
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* The region the layer tabs switch. A tablist that controls nothing is a promise
                to a screen reader that the page does not keep. */}
            <div id='board-panel' role='tabpanel'>
                <DragDropProvider
                    onDragEnd={(event) => {
                        const from = dragging;
                        const target = event.operation.target;

                        setDragging(null);
                        if (event.canceled || !(from && target)) return;

                        const to = target.data as { key: string };

                        void rebind(from, { key: to.key, layer });
                    }}
                    onDragStart={(event) => {
                        const data = event.operation.source?.data as
                            | { hotkey?: Hotkey }
                            | undefined;

                        setDragging(data?.hotkey ?? null);
                        setMoveError(null);
                    }}
                    // No slide back to the origin: the board has already drawn the cap on its
                    // new key by the time the pointer lets go.
                    plugins={[
                        ...defaultPreset.plugins.filter(
                            (plugin) => plugin !== Feedback,
                        ),
                        Feedback.configure({ dropAnimation: null }),
                    ]}>
                    <Board
                        binds={binds}
                        dragging={dragging}
                        layer={layer}
                        noted={noted}
                        onSelect={setSelected}
                        pending={
                            pending && pending.layer === layer
                                ? [pending.from.key, pending.key]
                                : []
                        }
                        presses={presses}
                        selected={selected}
                    />
                </DragDropProvider>
            </div>

            <div className='flex flex-wrap gap-x-[14px] gap-y-1.5 text-[12px] text-ink-2'>
                {apps.map((app) => {
                    return (
                        <span className='flex items-center gap-1.5' key={app}>
                            <span
                                className='size-[9px] rounded-full'
                                style={{ background: colorOf(app) }}
                            />
                            {app}
                        </span>
                    );
                })}
            </div>

            <div className='grid grid-cols-1 gap-[22px] min-[761px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
                <section className='grid content-start gap-2.5'>
                    <h2 className={H2}>selected key</h2>
                    <div className='font-mono text-[16px] font-semibold'>
                        {selectedChord ?? 'no key selected'}
                        {selected && selectedBinds.length === 0 ? (
                            <small className='ml-2 font-sans text-[13px] font-normal text-ink-2'>
                                free
                            </small>
                        ) : null}
                    </div>
                    <List>
                        {selectedBinds.map((hotkey, at) => bindRow(hotkey, at))}
                    </List>
                    {movable ? (
                        <div className='flex flex-wrap items-center gap-2 text-[12px] text-ink-2'>
                            {pending ? (
                                <span>rebinding…</span>
                            ) : listening ? (
                                <span className='text-ink'>
                                    press the new chord on the keyboard — esc
                                    stops
                                </span>
                            ) : (
                                <span>
                                    drag the key to a free cap to rebind, or
                                </span>
                            )}
                            {!pending && (
                                <button
                                    aria-pressed={listening}
                                    className={`${GHOST} px-2 py-0.5 text-[12px] aria-pressed:border-accent aria-pressed:text-ink`}
                                    onClick={() => {
                                        setListening((on) => !on);
                                        setMoveError(null);
                                    }}
                                    type='button'>
                                    {listening ? 'cancel' : 'press to rebind'}
                                </button>
                            )}
                            {moveError ? (
                                <span className='basis-full text-ink'>
                                    {moveError}
                                </span>
                            ) : null}
                        </div>
                    ) : null}
                    <NoteEditor
                        chord={selectedChord}
                        notesMarkdown={notesMarkdown}
                        onSave={saveNote}
                        text={selectedNote?.text ?? ''}
                    />
                    <h2 className={H2}>free keys on this layer</h2>
                    <div className='font-mono text-[13px]/[1.9] text-ink-2'>
                        {free.map((label) => {
                            return (
                                <kbd
                                    className='mr-[3px] mb-[3px] inline-block rounded border border-line bg-cap px-1.5 font-[inherit] text-ink'
                                    key={label}>
                                    {label}
                                </kbd>
                            );
                        })}
                    </div>
                </section>

                <section className='grid content-start gap-2.5'>
                    <h2 className={H2}>notes</h2>
                    <input
                        aria-label='filter notes'
                        className='w-full rounded-md border border-line bg-cap px-2.5 py-1.5 font-sans text-[13px] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
                        onChange={(event) => setNoteFilter(event.target.value)}
                        placeholder='filter by chord or text'
                        type='search'
                        value={noteFilter}
                    />
                    <List>
                        {noteRowJSX.length ? (
                            noteRowJSX
                        ) : (
                            <ListEmpty>
                                {Object.keys(notes).length === 0
                                    ? 'no notes yet'
                                    : `no note matches ${noteFilter.trim()}`}
                            </ListEmpty>
                        )}
                    </List>
                    <h2 className={H2}>all bindings on this layer</h2>
                    <List>
                        {binds.length ? (
                            binds.map((hotkey, at) => bindRow(hotkey, at))
                        ) : (
                            <ListEmpty>nothing on this layer</ListEmpty>
                        )}
                    </List>
                </section>
            </div>
        </div>
    );
};

/* Types */
interface BoardPageProps {
    params: URLSearchParams;
}

/* Types */
interface Pending {
    from: Hotkey;
    key: string;
    layer: string;
}
