// The class strings more than one surface spells. `TAB` and `H2` were byte-identical in
// board.tsx and stats.tsx, and `NAV` in shell.tsx was `TAB` with the flex parts removed — a
// control defined in three files drifts the first time one of them is touched, and adding a
// hover state is exactly that kind of touch.
//
// These are strings rather than components on purpose: each call site still owns its selected
// and unselected tones, which differ by surface, and a component would have to take them as
// props and gain nothing.

// A bordered control — a layer tab, a window tab, the two page links. Hover moves the border and
// the label, which is the gesture the fold button, the move button and the notice retry already
// spoke; this pass only brought the rest of the page into it.
export const TAB =
    'flex cursor-pointer items-center gap-2 rounded-md border px-[11px] py-1.5 font-mono text-[13px]/[normal] font-medium select-none hover:border-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

// A panel label: deliberately smaller than the body it introduces, because it is a signpost and
// not a headline. The uppercase is dima's call, over the repo's own lowercase rule.
export const H2 =
    'm-0 font-sans text-[13px] font-semibold tracking-[.06em] text-ink-3 uppercase';

// A ghost button: transparent fill, hairline border, muted label, and the same hover.
export const GHOST =
    'cursor-pointer rounded-md border border-line bg-transparent px-3 py-1.5 font-sans text-[13px] font-medium text-ink-2 hover:border-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-default disabled:border-line disabled:bg-cap-free disabled:text-ink-3 disabled:hover:border-line disabled:hover:text-ink-3';
