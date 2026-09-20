import type { ReactNode } from 'react';

// Three lists on this page share one row — a colour dot, a chord in mono, and whatever the
// chord means. Keeping them one component is what keeps the two columns aligned.
export const List = (props: { children: ReactNode }) => (
    <ul className='m-0 grid list-none gap-1 p-0'>{props.children}</ul>
);

export const ListRow = (props: ListRowProps) => (
    <li className='grid grid-cols-[9px_128px_1fr] items-baseline gap-2.5 border-b border-line py-[3px] text-[13.5px]'>
        <span
            className='relative top-px size-[9px] rounded-full'
            style={{ background: props.color }}
        />
        <span className='font-mono'>{props.chord}</span>
        <span>
            {props.children}
            {props.who ? (
                <span className='ml-1.5 text-[12px] text-ink-3'>
                    {props.who}
                </span>
            ) : null}
        </span>
    </li>
);

export const ListEmpty = (props: { children: ReactNode }) => (
    <li className='grid grid-cols-[9px_128px_1fr] items-baseline gap-2.5 py-[3px] text-[12.5px] text-ink-3'>
        <span />
        <span />
        <span>{props.children}</span>
    </li>
);

/* Types */
interface ListRowProps {
    children: ReactNode;
    chord: string;
    color: string;
    who?: string;
}
