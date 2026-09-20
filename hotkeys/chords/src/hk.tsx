/* Core */
import { useEffect, useState } from 'react';

/* Components */
import { StatRow } from '@/components/StatRow.tsx';

/* Instruments */
import {
    type StatsReport,
    type WindowName,
    fetchStats,
    windowNames,
} from '@/api.ts';
import { colorOf } from '@/keyboard.ts';
import { navigate } from '@/router.ts';

const H2 =
    'm-0 font-sans text-[13px] font-semibold tracking-[.06em] text-ink-3 uppercase';
const TAB =
    'flex cursor-pointer items-center gap-2 rounded-md border px-[11px] py-1.5 font-mono text-[13px]/[normal] font-medium select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export const HkPage = () => {
    const [window, setWindow] = useState<WindowName>('all');
    const [report, setReport] = useState<StatsReport | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let live = true;

        fetchStats(window)
            .then((next) => {
                if (live) {
                    setReport(next);
                    setError(null);
                }
            })
            .catch((failure: Error) => live && setError(failure.message));

        return () => {
            live = false;
        };
    }, [window]);

    const windowTabListJSX = windowNames.map((name) => {
        return (
            <button
                aria-selected={name === window}
                className={`${TAB} ${name === window ? 'border-accent bg-sel text-ink' : 'border-line bg-transparent text-ink-2'}`}
                key={name}
                onClick={() => setWindow(name)}
                role='tab'
                type='button'>
                {name}
            </button>
        );
    });

    if (error) {
        return (
            <p className='rounded-lg border border-l-4 border-accent bg-cap px-3 py-2.5 text-[13.5px]/[1.5] text-ink'>
                no stats — {error}
            </p>
        );
    }
    if (!report) {
        return <p className='text-[13px] text-ink-3'>reading the log…</p>;
    }

    // The log is a month of lines and every table is ranked, so the first row is the scale for
    // the rest of its own section — never for another's.
    const topOf = (rows: readonly { count: number }[]) => rows[0]?.count ?? 0;

    return (
        <div className='grid gap-[22px]'>
            <div className='flex flex-wrap gap-1.5' role='tablist'>
                {windowTabListJSX}
            </div>

            <div className='flex flex-wrap gap-[22px]'>
                <Tile label='presses' value={report.presses} />
                <Tile label='chords' value={report.topChords.length} />
                <Tile label='switches' value={report.switches} />
                <Tile
                    label='never pressed'
                    of={report.boundCount}
                    value={report.neverPressed.length}
                />
            </div>

            {/*
              Four sections of very different length, and the shortest one — the rebind
              candidates — used to sit 12,000px down a single column. The board already owns
              this breakpoint and this grid, so the sections borrow it: the ranked chords lead
              on the left, the three supporting lists stack on the right, and the page stops
              being a scroll to reach its own conclusion. Reading order is unchanged — the dom
              order is still the brief's order, and each column runs top to bottom.

              The two columns are NOT equal, and the board's own 1fr 1fr is the wrong borrow
              here: a chord row carries a chord, an action and an app; an app row carries a
              name. Both numbers below were measured on the real 89 rows, not reasoned:
              1fr 1fr at 768 truncates 79 of 89 details, 1.45fr truncates 0 at full width, 5
              at 1024 and 30 at 900. So the second column is earned at 1024 and not before —
              a shorter page is not worth a third of the labels.
            */}
            <div className='grid grid-cols-1 items-start gap-[22px] min-[1024px]:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]'>
                <section className='grid gap-2.5'>
                    <h2 className={H2}>chords</h2>
                    <ul className='m-0 grid list-none gap-1 p-0'>
                        {report.topChords.map((row) => {
                            return (
                                <StatRow
                                    count={row.count}
                                    detail={
                                        row.action
                                            ? `${row.action} · ${row.app ?? ''}`
                                            : undefined
                                    }
                                    dotColor={
                                        row.app ? colorOf(row.app) : undefined
                                    }
                                    key={`${row.chord}-${row.action ?? ''}`}
                                    label={row.chord}
                                    onSelect={() => openOnBoard(row.chord)}
                                    top={topOf(report.topChords)}
                                />
                            );
                        })}
                    </ul>
                </section>

                <div className='grid gap-[22px]'>
                    <section className='grid gap-2.5'>
                        <h2 className={H2}>chords per app</h2>
                        <ul className='m-0 grid list-none gap-1 p-0'>
                            {report.chordsPerApp.map((row) => {
                                return (
                                    <StatRow
                                        count={row.count}
                                        key={row.bundleId}
                                        label={row.app}
                                        top={topOf(report.chordsPerApp)}
                                    />
                                );
                            })}
                        </ul>
                    </section>

                    <section className='grid gap-2.5'>
                        <h2 className={H2}>switches per app</h2>
                        <ul className='m-0 grid list-none gap-1 p-0'>
                            {report.switchesPerApp.map((row) => {
                                return (
                                    <StatRow
                                        count={row.count}
                                        key={row.bundleId}
                                        label={row.app}
                                        top={topOf(report.switchesPerApp)}
                                    />
                                );
                            })}
                        </ul>
                    </section>

                    <section className='grid gap-2.5'>
                        <h2 className={H2}>never pressed</h2>
                        <p className='text-[12.5px] text-ink-3'>
                            lifetime, whatever the window above says — a rebind
                            candidate does not stop being one because you
                            shortened the view.
                        </p>
                        <ul className='m-0 grid list-none gap-1 p-0'>
                            {report.neverPressed.map((row) => {
                                return (
                                    <li
                                        className='grid grid-cols-[64px_1fr] items-baseline gap-2.5 border-b border-line py-[3px] text-[13px]'
                                        key={row.chord}>
                                        <span />
                                        <span className='flex items-baseline gap-2 overflow-hidden'>
                                            <span
                                                className='relative top-px size-[9px] shrink-0 rounded-full'
                                                style={{
                                                    background: colorOf(
                                                        row.app,
                                                    ),
                                                }}
                                            />
                                            <button
                                                className='shrink-0 cursor-pointer border-0 bg-transparent p-0 font-mono text-[13px] text-ink underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
                                                onClick={() =>
                                                    openOnBoard(row.chord)
                                                }
                                                type='button'>
                                                {row.chord}
                                            </button>
                                            <span className='truncate text-[12.5px] text-ink-3'>
                                                {row.action} · {row.app}
                                            </span>
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

/* Helpers */

// A chord is `mods+key`, and the board wants the two apart: the layer to open and the key to
// select. The last segment is the key, because a modifier never ends a chord.
const openOnBoard = (chord: string) => {
    const at = chord.lastIndexOf('+');
    const mods = at === -1 ? '' : chord.slice(0, at);
    const key = at === -1 ? chord : chord.slice(at + 1);

    navigate(
        `/?layer=${encodeURIComponent(mods)}&key=${encodeURIComponent(key)}`,
    );
};

const Tile = (props: TileProps) => (
    <div className='grid gap-1'>
        <span className='font-mono text-[26px]/[1] font-semibold tabular-nums text-ink'>
            {props.value.toLocaleString()}
            {props.of === undefined ? null : (
                <span className='text-[15px] font-normal text-ink-3'>
                    {' '}
                    of {props.of}
                </span>
            )}
        </span>
        <span className='font-sans text-[12.5px] tracking-[.06em] text-ink-3 uppercase'>
            {props.label}
        </span>
    </div>
);

/* Types */
interface TileProps {
    label: string;
    of?: number;
    value: number;
}
