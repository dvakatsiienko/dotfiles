import { chordOf } from '../../../chord.ts';
import type { Hotkey } from '../../../manual.ts';
import { capLabel, colorOf, layerMods, layout, modKeys } from '../keyboard.ts';

const BASE =
    'relative flex min-h-[46px] cursor-pointer flex-col justify-between rounded-md border-0 px-[7px] py-[5px] text-left font-mono text-[12px]/[1.15] font-medium select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-pressed:outline-2 aria-pressed:outline-offset-1 aria-pressed:outline-accent';
const FLAT = 'shadow-[0_2px_0_var(--color-cap-edge)]';
// A bound key nobody has ever pressed is ringed rather than greyed: it is not disabled, it is
// a question — why is this here.
const COLD =
    'shadow-[0_2px_0_var(--color-cap-edge),inset_0_0_0_1.5px_var(--color-ink-3)]';

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
                    <span className='text-[13px]'>
                        {label === 'caps' && props.layer === 'hyper'
                            ? 'hyper'
                            : (capLabel[label] ?? label)}
                    </span>
                    <span
                        className={`overflow-hidden font-sans text-[10.5px]/[1.15] font-normal text-ellipsis whitespace-nowrap text-ink-2 ${binds.length ? 'pr-5' : ''}`}>
                        {binds[0]
                            ? binds[0].action +
                              (binds.length > 1 ? ` +${binds.length - 1}` : '')
                            : ''}
                    </span>
                    {binds.length > 0 && (
                        <span
                            className={`absolute right-[5px] bottom-[4px] font-mono text-[9.5px]/none font-medium tabular-nums ${hits ? 'text-accent' : 'text-ink-3'}`}>
                            {hits || '—'}
                        </span>
                    )}
                    {props.noted.has(label) && (
                        <span className='absolute top-1.5 right-1.5 size-[7px] rounded-full bg-accent' />
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
