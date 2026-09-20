import type { ReactNode } from 'react';

// Something went wrong, said above the page rather than instead of it.
//
// 📌 The reason this is a component and not a paragraph in each route: /stats used to return the
// error in place of the report, so killing the daemon and clicking a window tab threw away 402
// rows that were still on screen and still true — they had only stopped being fresh. A failure
// to refresh is not a reason to forget what was already fetched.
//
// The border is a plain hairline on all four sides. A 4px accent edge on one side is the one
// shape DESIGN.md reserves for a keycap's owner tag, and the mechanical detector calls it out
// by name wherever else it appears.
export const Notice = (props: NoticeProps) => (
    <p className='m-0 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 rounded-md border border-line bg-cap px-3 py-2.5 text-[13px]/[1.5] text-ink'>
        <span>{props.children}</span>
        {props.onRetry ? (
            <button
                className='cursor-pointer rounded-md border border-line bg-transparent px-2.5 py-0.5 font-sans text-[13px] font-medium text-ink-2 hover:border-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
                onClick={props.onRetry}
                type='button'>
                try again
            </button>
        ) : null}
    </p>
);

// `Failed to fetch` is the browser's words for "nothing answered at all", and they name neither
// what was asked nor what failed to answer. Every other message on this path was written by the
// daemon itself and is already in the page's own language, so it passes through untouched.
export const apiTrouble = (message: string) =>
    message === 'Failed to fetch'
        ? 'the daemon is not answering'
        : message.toLowerCase();

/* Types */
interface NoticeProps {
    children: ReactNode;
    // Absent where there is nothing a second attempt could change.
    onRetry?: () => void;
}
