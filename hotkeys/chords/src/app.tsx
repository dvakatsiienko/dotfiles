/* Core */
import { useEffect, useMemo, useState } from 'react';

/* Instruments */
import { chordOf } from '../../chord.ts';
import type { Hotkey } from '../../manual.ts';
import {
    type NoteStore,
    type ScanPayload,
    fetchNotes,
    fetchScan,
    putNote,
    subscribeLive,
} from './api.ts';
/* Components */
import { Board } from './components/Board.tsx';
import { List, ListEmpty, ListRow } from './components/List.tsx';
import { NoteEditor } from './components/NoteEditor.tsx';
import { colorOf, layerName, layerOrder, layout, modKeys } from './keyboard.ts';

const H2 =
    'm-0 font-sans text-[13px] font-semibold tracking-[.06em] text-ink-3 uppercase';
const TAB =
    'flex cursor-pointer items-center gap-2 rounded-md border px-[11px] py-1.5 font-mono text-[13px]/[normal] font-medium select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export const App = () => {
    const [scan, setScan] = useState<ScanPayload | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [presses, setPresses] = useState<Record<string, number>>({});
    const [pressedAt, setPressedAt] = useState<string | null>(null);
    const [notes, setNotes] = useState<NoteStore>({});
    const [layer, setLayer] = useState('hyper');
    const [selected, setSelected] = useState<string | null>(null);

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

    const bindRowJSX = (hotkey: Hotkey, at: number) => {
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

    const noteRowJSX = Object.values(notes)
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
                <h1 className='m-0 font-sans text-[22px]/[1.2] font-semibold text-balance'>
                    chords
                </h1>
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
                onSelect={setSelected}
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
                    <h2 className={H2}>Selected key</h2>
                    <div className='font-mono text-[16px] font-semibold'>
                        {selectedChord ?? 'click a key'}
                        {selected && selectedBinds.length === 0 ? (
                            <small className='ml-2 font-sans text-[13px] font-normal text-ink-3'>
                                free
                            </small>
                        ) : null}
                    </div>
                    <List>{selectedBinds.map(bindRowJSX)}</List>
                    <NoteEditor
                        chord={selectedChord}
                        notesMarkdown={notesMarkdown}
                        onSave={saveNote}
                        text={selectedNote?.text ?? ''}
                    />
                    <h2 className={H2}>Free keys on this layer</h2>
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
                    <h2 className={H2}>All bindings on this layer</h2>
                    <List>
                        {binds.length ? (
                            binds.map(bindRowJSX)
                        ) : (
                            <ListEmpty>nothing on this layer</ListEmpty>
                        )}
                    </List>
                    <h2 className={H2}>Notes</h2>
                    <List>
                        {noteRowJSX.length ? (
                            noteRowJSX
                        ) : (
                            <ListEmpty>no notes yet</ListEmpty>
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
