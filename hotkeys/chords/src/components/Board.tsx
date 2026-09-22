import { useEffect, useRef } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/react';
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
// The three faces a key wears while something is being dragged. A landing place is a dashed
// ring and the selection tint; the one under the pointer fills solid; anything that cannot take
// the drop — a modifier, a taken key, the key being dragged — fades and says so with the
// cursor, so the answer is never colour alone.
const CAN_DROP =
    'bg-sel outline-2 outline-dashed outline-offset-1 outline-accent hover:shadow-[0_2px_0_var(--color-cap-edge)]';
const OVER =
    'bg-accent text-on-accent outline-2 outline-offset-1 outline-accent';
const CANNOT_DROP = 'cursor-not-allowed opacity-45';
// The cap in flight: a slight lift and lean, transform only, so reduced-motion has nothing to
// object to — there is no animation, just a pose.
const LIFTED =
    'z-10 rotate-[-2deg] scale-105 shadow-[0_10px_24px_-8px_rgba(0,0,0,.45)] outline-2 outline-accent';

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

            return (
                <Keycap
                    binds={bound.get(label) ?? []}
                    dragging={props.dragging}
                    isLit={modKeys.has(label) && lit.has(label)}
                    key={label}
                    label={label}
                    layer={props.layer}
                    noted={props.noted.has(label)}
                    onSelect={props.onSelect}
                    pending={props.pending.includes(label)}
                    presses={props.presses}
                    selected={props.selected === label}
                    width={width}
                />
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

// One keycap is both ends of a rebind: the draggable when it carries a hand-kept binding, the
// droppable when it is free. Only a row that lives in manual.ts can move — everything else is
// read out of its own app's config, so a write here would be a lie the next scan erases.
const Keycap = (props: KeycapProps) => {
    const isMod = modKeys.has(props.label);
    const chord = chordOf({ key: props.label, mods: props.layer });
    const hits = props.binds.length ? (props.presses[chord] ?? 0) : 0;
    const movable = props.binds.find((bind) => bind.source === 'manual');
    const isSource = props.dragging?.key === props.label;
    const canDrop = Boolean(
        props.dragging &&
            !isMod &&
            !isSource &&
            !props.pending &&
            props.binds.length === 0,
    );

    const drag = useDraggable({
        data: { hotkey: movable },
        disabled: !movable || props.pending,
        id: `cap:${props.label}`,
    });
    const drop = useDroppable({
        data: { key: props.label },
        disabled: !canDrop,
        id: `key:${props.label}`,
    });
    const cap = useRef<HTMLButtonElement | null>(null);

    // The selected key is where the keyboard is: a click lands focus here anyway, and a rebind
    // or a stats link selects without a click, so the cap takes it — never the note field.
    useEffect(() => {
        if (props.selected) cap.current?.focus({ preventScroll: true });
    }, [props.selected]);

    // 📌 The surface says unbound, the label does not. A free key and an unheld modifier are
    // focusable, operable buttons — clicking one selects it — so their legend is an accessible
    // name and owes 4.5:1, which Ink Faint never had here (2.55:1 light, 3.36:1 dark). The grey
    // cap keeps carrying the meaning; only the text that has to be read moved.
    const tone = [
        props.isLit ? 'bg-sel' : props.binds.length ? 'bg-cap' : 'bg-cap-free',
        isMod
            ? props.isLit
                ? 'text-ink'
                : 'text-ink-2'
            : props.binds.length
              ? 'text-ink'
              : 'text-ink-2',
        props.binds.length ? 'border-t-4' : '',
    ].join(' ');
    const dragTone = drag.isDragging
        ? LIFTED
        : props.dragging
          ? drop.isDropTarget
              ? OVER
              : canDrop
                ? CAN_DROP
                : CANNOT_DROP
          : '';
    const lip = props.binds.length && !hits ? COLD : FLAT;

    return (
        <button
            aria-busy={props.pending}
            aria-pressed={props.selected}
            className={`${BASE} ${tone} ${lip} ${dragTone} ${movable && !props.pending ? 'cursor-grab active:cursor-grabbing' : ''} ${props.pending ? 'cursor-progress outline-2 outline-dashed outline-offset-1 outline-ink-3' : ''}`}
            onClick={() => {
                // The pointer comes up on the cap it dragged, so a drop ends in a click on the
                // source — which is not a selection.
                if (drag.isDragging || drag.isDropping || props.pending) return;
                props.onSelect(props.label);
            }}
            ref={(element) => {
                cap.current = element;
                drag.ref(element);
                drop.ref(element);
            }}
            style={{
                borderTopColor: props.binds[0]
                    ? colorOf(props.binds[0].app)
                    : undefined,
                gridColumn: `span ${props.width}`,
            }}
            title={
                props.binds.map((b) => `${b.app}: ${b.action}`).join('\n') ||
                `${chord} — free`
            }
            type='button'>
            {/*
              The count rides the legend line rather than the bottom-right corner it used to sit
              in. Both it and the action label owed 12px — the fleet floor for dense data — and
              at 12px in the corner the count's clearance ate the narrow keycaps' labels down to
              one character and an ellipsis: 19 of 34 on the cmd layer. Up here the legend is
              short and the count is short, the two of them fit the tightest 1u cap together,
              and the label gets the whole second line instead of two thirds of it.
            */}
            <span className='flex items-baseline justify-between gap-1'>
                <span className='min-w-0 overflow-hidden'>
                    {props.label === 'caps' && props.layer === 'hyper'
                        ? 'hyper'
                        : (capLabel[props.label] ?? props.label)}
                </span>
                {props.binds.length > 0 && (
                    <span
                        className={`font-mono text-[12px]/none font-medium tabular-nums ${hits ? 'text-accent' : 'text-ink-3'}`}>
                        {props.pending ? '…' : hits || '—'}
                    </span>
                )}
            </span>
            <span className='overflow-hidden font-sans text-[12px]/[1.15] font-normal text-ellipsis whitespace-nowrap text-ink-2'>
                {props.pending && !props.binds[0]
                    ? 'was here…'
                    : props.binds[0]
                      ? props.binds[0].action +
                        (props.binds.length > 1
                            ? ` +${props.binds.length - 1}`
                            : '')
                      : ''}
            </span>
            {/* The corner the count left. A 7px dot fits anywhere; the count did not. */}
            {props.noted && (
                <span className='absolute right-1.5 bottom-1.5 size-[7px] rounded-full bg-accent' />
            )}
        </button>
    );
};

/* Types */
interface BoardProps {
    binds: readonly Hotkey[];
    // The binding in flight, while a drag is on; the board draws every landing place from it.
    dragging: Hotkey | null;
    layer: string;
    noted: ReadonlySet<string>;
    onSelect: (key: string) => void;
    // The two keys of a rebind in flight — where it left and where it landed — held until the
    // daemon writes and rescans.
    pending: readonly string[];
    presses: Record<string, number>;
    selected: string | null;
}
interface KeycapProps {
    binds: readonly Hotkey[];
    dragging: Hotkey | null;
    isLit: boolean;
    label: string;
    layer: string;
    noted: boolean;
    onSelect: (key: string) => void;
    pending: boolean;
    presses: Record<string, number>;
    selected: boolean;
    width: number;
}
