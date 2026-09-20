import { chordOf } from '@hotkeys/chord.ts';
import type { Hotkey } from '@hotkeys/manual.ts';

import { capLabel, colorOf, layerMods, layout, modKeys } from '@/keyboard.ts';

const BASE =
    'relative flex min-h-[46px] cursor-pointer flex-col justify-between rounded-md border-0 px-[7px] py-[5px] text-left font-mono text-[12px]/[1.15] font-medium select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-pressed:outline-2 aria-pressed:outline-offset-1 aria-pressed:outline-accent';
// Hover deepens the lip rather than tinting the cap. The lip is the only depth this world
// carries, a firmer edge reads as a key taken under a finger, and no new tone or motion enters
// the system to say it. Zero blur holds: the offset is still 2px and the radius still 0.
//
// Ink Muted rather than Ink Faint, measured against the deck the caps sit in: faint managed
// 2.43:1 in light, which is under the 3:1 a mark owes and too quiet to read as an answer. This
// pair is 4.78:1 light and 6.85:1 dark. The accent would have cleared too and is not available
// — it marks chosen, pressed and annotated, and a pointer resting on a key is none of them.
const FLAT =
    'shadow-[0_2px_0_var(--color-cap-edge)] hover:shadow-[0_2px_0_var(--color-ink-2)]';
// A bound key nobody has ever pressed is ringed rather than greyed: it is not disabled, it is
// a question — why is this here.
const COLD =
    'shadow-[0_2px_0_var(--color-cap-edge),inset_0_0_0_1.5px_var(--color-ink-3)] hover:shadow-[0_2px_0_var(--color-ink-2),inset_0_0_0_1.5px_var(--color-ink-3)]';

export const Board = (props: BoardProps) => {
    const bound = new Map<string, Hotkey[]>();

    for (const hotkey of props.binds) {
        const existing = bound.get(hotkey.key);

        if (existing) existing.push(hotkey);
        else bound.set(hotkey.key, [hotkey]);
    }

    const lit = layerMods(props.layer);

    const rowListJSX = layout.map((row) => {
        // The first keycap names the row — a fixed board never reorders, and a row index would
        // be a key that means nothing.
        const rowId = row[0][0];
        const keyListJSX = row.map(([label, width]) => {
            if (!label) {
                return (
                    <span
                        className='invisible'
                        key={`gap-${rowId}`}
                        style={{ gridColumn: `span ${width}` }}
                    />
                );
            }

            const binds = bound.get(label) ?? [];
            const isMod = modKeys.has(label);
            const chord = chordOf({ key: label, mods: props.layer });
            const hits = binds.length ? (props.presses[chord] ?? 0) : 0;
            // A held modifier wins the surface even when something is bound to it, and a
            // modifier always reads dim unless this layer holds it down.
            const isLit = isMod && lit.has(label);
            const tone = [
                isLit ? 'bg-sel' : binds.length ? 'bg-cap' : 'bg-cap-free',
                isMod
                    ? isLit
                        ? 'text-ink'
                        : 'text-ink-3'
                    : binds.length
                      ? 'text-ink'
                      : 'text-ink-3',
                binds.length ? 'border-t-4' : '',
            ].join(' ');

            return (
                <button
                    aria-pressed={props.selected === label}
                    className={`${BASE} ${tone} ${binds.length && !hits ? COLD : FLAT}`}
                    key={label}
                    onClick={() => props.onSelect(label)}
                    style={{
                        borderTopColor: binds[0]
                            ? colorOf(binds[0].app)
                            : undefined,
                        gridColumn: `span ${width}`,
                    }}
                    title={
                        binds.map((b) => `${b.app}: ${b.action}`).join('\n') ||
                        `${chord} — free`
                    }
                    type='button'>
                    {/*
                      The count rides the legend line rather than the bottom-right corner it
                      used to sit in. Both it and the action label owed 12px — the fleet floor
                      for dense data — and at 12px in the corner the count's clearance ate the
                      narrow keycaps' labels down to one character and an ellipsis: 19 of 34 on
                      the cmd layer. Up here the legend is short and the count is short, the two
                      of them fit the tightest 1u cap together, and the label gets the whole
                      second line instead of two thirds of it.
                    */}
                    {/*
                      The legend is 12px, which is what DESIGN.md's ramp always said a keycap
                      was; the 13px it wore was drift from the port. On the tightest pairing the
                      board can produce — `esc` beside a four-digit count on a 1u cap — the two
                      of them come to 52.4px of a 52px box, so the legend may shrink by that
                      fraction rather than the row escaping the key. A clip, not an ellipsis:
                      at half a pixel an ellipsis costs more than it saves.
                    */}
                    <span className='flex items-baseline justify-between gap-1'>
                        <span className='min-w-0 overflow-hidden'>
                            {label === 'caps' && props.layer === 'hyper'
                                ? 'hyper'
                                : (capLabel[label] ?? label)}
                        </span>
                        {binds.length > 0 && (
                            <span
                                className={`font-mono text-[12px]/none font-medium tabular-nums ${hits ? 'text-accent' : 'text-ink-3'}`}>
                                {hits || '—'}
                            </span>
                        )}
                    </span>
                    <span className='overflow-hidden font-sans text-[12px]/[1.15] font-normal text-ellipsis whitespace-nowrap text-ink-2'>
                        {binds[0]
                            ? binds[0].action +
                              (binds.length > 1 ? ` +${binds.length - 1}` : '')
                            : ''}
                    </span>
                    {/* The corner the count left. A 7px dot fits anywhere; the count did not. */}
                    {props.noted.has(label) && (
                        <span className='absolute right-1.5 bottom-1.5 size-[7px] rounded-full bg-accent' />
                    )}
                </button>
            );
        });

        return (
            <div
                className='grid grid-cols-[repeat(64,minmax(0,1fr))] gap-1.5'
                key={`row-${rowId}`}>
                {keyListJSX}
            </div>
        );
    });

    return (
        <div className='overflow-x-auto rounded-[14px] bg-board p-3.5'>
            <div className='grid min-w-[760px] gap-1.5'>{rowListJSX}</div>
        </div>
    );
};

/* Types */
interface BoardProps {
    binds: readonly Hotkey[];
    layer: string;
    noted: ReadonlySet<string>;
    onSelect: (key: string) => void;
    presses: Record<string, number>;
    selected: string | null;
}
