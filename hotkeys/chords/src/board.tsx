/* Core */
import { useEffect, useMemo, useState } from 'react';
/* Instruments */
import { chordOf } from '@hotkeys/chord.ts';
import type { Hotkey } from '@hotkeys/manual.ts';

/* Components */
import { Board } from '@/components/Board.tsx';
import { List, ListEmpty, ListRow } from '@/components/List.tsx';
import { NoteEditor } from '@/components/NoteEditor.tsx';

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

const MOVE_BTN =
    'cursor-pointer rounded-md border px-3 py-1 font-sans text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
const H2 =
    'm-0 font-sans text-[13px] font-semibold tracking-[.06em] text-ink-3 uppercase';
const TAB =
    'flex cursor-pointer items-center gap-2 rounded-md border px-[11px] py-1.5 font-mono text-[13px]/[normal] font-medium select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export const BoardPage = (props: BoardPageProps) => {
    const [scan, setScan] = useState<ScanPayload | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [presses, setPresses] = useState<Record<string, number>>({});
    const [pressedAt, setPressedAt] = useState<string | null>(null);
    const [notes, setNotes] = useState<NoteStore>({});
    // hk hands a chord back as ?layer=&key=, so a row there opens the board on that key. An
    // absent param is not the same as an empty one: layer='' is the no-modifier layer.
    const [layer, setLayer] = useState(props.params.get('layer') ?? 'hyper');
    const [selected, setSelected] = useState<string | null>(
        props.params.get('key'),
    );
    const [noteFilter, setNoteFilter] = useState('');
    // The move, in two clicks. `moving` is the row that left; `target` is where it went, and
    // until that is set every click on the board picks a destination rather than a selection.
    const [moving, setMoving] = useState<Hotkey | null>(null);
    const [target, setTarget] = useState<{ layer: string; key: string } | null>(
        null,
    );
    const [opens, setOpens] = useState('');
    const [moveError, setMoveError] = useState<string | null>(null);

    // Everything here is mount-scoped on purpose: one stream for the life of the page, and a
    // rerun would open a second EventSource and leak the first.
    useEffect(() => {
        const loadScan = () => {
            fetchScan()
                .then((next) => {
                    setScan(next);
                    setScanError(null);
                })
                .catch((error: Error) => setScanError(error.message));
        };

        loadScan();
        fetchNotes()
            .then(setNotes)
            .catch(() => undefined);

        // Both kinds of news arrive on one stream, so the page holds no timer: a press
        // repaints the counts, a config change repulls the whole scan.
        return subscribeLive({
            onBindings: loadScan,
            onPresses: (payload) => {
                setPresses(payload.counts);
                setPressedAt(payload.updatedAt);
            },
        });
    }, []);

    const hotkeys = useMemo(() => scan?.hotkeys ?? [], [scan]);
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

    const cancelMove = () => {
        setMoving(null);
        setTarget(null);
        setMoveError(null);
    };

    const confirmMove = async () => {
        if (!(moving && target)) return;

        try {
            await postManualMove({
                from: {
                    action: moving.action,
                    app: moving.app,
                    key: moving.key,
                    mods: moving.mods,
                },
                to: {
                    action: opens.trim() || moving.action,
                    key: target.key,
                    mods: target.layer,
                },
            });

            // The note is about the meaning and not the keycap, so it travels with it
            // (dima, 2026-09-20). Cleared from the old chord, written on the new one.
            const note = Object.values(notes).find(
                (each) => each.layer === moving.mods && each.key === moving.key,
            );

            if (note) {
                await putNote({
                    key: moving.key,
                    layer: moving.mods,
                    text: '',
                });
                setNotes(
                    await putNote({
                        key: target.key,
                        layer: target.layer,
                        text: note.text,
                    }),
                );
            }

            // Nothing refetches the scan here: manual.ts changed, the daemon sees its mtime
            // move, reruns the scan and pushes `bindings` — the same road a hand edit takes.
            cancelMove();
        } catch (error) {
            setMoveError((error as Error).message);
        }
    };

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

    // Only a row that lives in manual.ts can move. Everything else is read out of its own app's
    // config, so a write here would be a lie the next scan erases — the action is absent rather
    // than present-and-failing.
    const bindRow = (hotkey: Hotkey, at: number, canMove = false) => {
        return (
            <ListRow
                action={
                    canMove && hotkey.source === 'manual' ? (
                        <button
                            className='ml-2 cursor-pointer rounded border border-line bg-transparent px-1.5 font-sans text-[11.5px] text-ink-2 hover:border-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
                            onClick={() => {
                                setMoving(hotkey);
                                setTarget(null);
                                setOpens(hotkey.action);
                                setMoveError(null);
                            }}
                            type='button'>
                            moved
                        </button>
                    ) : null
                }
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
    // he remembers the key, or he remembers what he wrote. Case-insensitive, no other cleverness.
    const needle = noteFilter.trim().toLowerCase();
    const matchingNotes = Object.values(notes).filter(
        (note) =>
            needle === '' ||
            note.text.toLowerCase().includes(needle) ||
            chordOf({ key: note.key, mods: note.layer })
                .toLowerCase()
                .includes(needle),
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
        <div className='mx-auto grid max-w-[1180px] gap-[22px]'>
            <header className='flex flex-wrap items-baseline gap-x-[18px] gap-y-2'>
                <span className='text-[13px] text-ink-3'>
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
            </header>

            {scanError ? (
                <p className='rounded-lg border border-l-4 border-accent bg-cap px-3 py-2.5 text-[13.5px]/[1.5] text-ink'>
                    no hotkey data — {scanError}. run{' '}
                    <span className='font-mono'>pnpm hotkeys:scan</span> in
                    dotfiles.
                </p>
            ) : null}

            <div className='flex flex-wrap gap-1.5' role='tablist'>
                {layers.map((each) => {
                    return (
                        <button
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
                            <span className='text-[12px] tabular-nums text-ink-3'>
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

            <Board
                binds={binds}
                layer={layer}
                noted={noted}
                onSelect={(key) =>
                    moving ? setTarget({ key, layer }) : setSelected(key)
                }
                presses={presses}
                selected={selected}
            />

            <div className='flex flex-wrap gap-x-[14px] gap-y-1.5 text-[12.5px] text-ink-2'>
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
                            <small className='ml-2 font-sans text-[13px] font-normal text-ink-3'>
                                free
                            </small>
                        ) : null}
                    </div>
                    <List>
                        {selectedBinds.map((hotkey, at) =>
                            bindRow(hotkey, at, true),
                        )}
                    </List>
                    {moving ? (
                        <div className='grid gap-2 rounded-md border border-accent bg-cap px-3 py-2.5'>
                            {target ? (
                                <>
                                    <div className='font-mono text-[13px] text-ink'>
                                        {chordOf(moving)} →{' '}
                                        {chordOf({
                                            key: target.key,
                                            mods: target.layer,
                                        })}
                                    </div>
                                    <label className='grid gap-1 font-sans text-[12.5px] text-ink-3'>
                                        opens
                                        <input
                                            className='rounded-md border border-line bg-cap px-2.5 py-1.5 font-sans text-[13px] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
                                            onChange={(event) =>
                                                setOpens(event.target.value)
                                            }
                                            value={opens}
                                        />
                                    </label>
                                    <div className='flex flex-wrap items-center gap-2'>
                                        <button
                                            className={`${MOVE_BTN} border-accent bg-accent text-white`}
                                            onClick={() => void confirmMove()}
                                            type='button'>
                                            record the move
                                        </button>
                                        <button
                                            className={`${MOVE_BTN} border-line bg-transparent text-ink-2`}
                                            onClick={cancelMove}
                                            type='button'>
                                            cancel
                                        </button>
                                        {moveError ? (
                                            <span className='text-[12.5px] text-ink-2'>
                                                {moveError}
                                            </span>
                                        ) : null}
                                    </div>
                                </>
                            ) : (
                                <div className='flex flex-wrap items-center gap-2 text-[13px] text-ink'>
                                    <span>
                                        click where{' '}
                                        <span className='font-mono'>
                                            {moving.action}
                                        </span>{' '}
                                        went — any key, any layer
                                    </span>
                                    <button
                                        className={`${MOVE_BTN} border-line bg-transparent text-ink-2`}
                                        onClick={cancelMove}
                                        type='button'>
                                        cancel
                                    </button>
                                </div>
                            )}
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

            <footer className='border-t border-line pt-3 text-[12.5px] text-ink-3'>
                seeded by <span className='font-mono'>pnpm hotkeys:scan</span>{' '}
                in dotfiles — wispr flow, magnet, bartender, cursor and macos
                are read from their files; raycast, cleanshot and 1password are
                typed by hand in{' '}
                <span className='font-mono'>hotkeys/manual.ts</span>. notes live
                in <span className='font-mono'>hotkeys/notes.json</span>,
                committed.
            </footer>
        </div>
    );
};

/* Types */
interface BoardPageProps {
    params: URLSearchParams;
}
