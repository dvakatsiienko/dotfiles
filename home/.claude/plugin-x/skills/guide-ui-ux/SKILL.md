---
name: guide-ui-ux
description: Load EVERY time you render anything a human looks at — html, react/jsx, an artifact page, a chart, a tui — before the first element is written or reviewed.
---

# UI/UX floor

Binding on every rendered element, whatever the stack; a review flags each miss. Distilled
from WCAG 2.2, MDN and Material 3 — the rules a senior reviewer flags on sight. Stack-specific
guides (`guide-react`) sit on top of this one.


- **text ≥14px, dense data ≥12px, never below** — small AND dim is the failure pair; ≥4.5:1
  contrast for text, ≥3:1 for icons, chart marks, axis lines, focus rings
- **`user-select: none` only on chrome** — buttons, icons, chart marks, drag handles. Values,
  ids, code, errors stay selectable. Dark theme sets `::selection` explicitly (opaque bg)
- **every clickable is `<button>`/`<a>` with `cursor: pointer`** — a `div` with onClick is a
  keyboard hole. Hit target ≥24×24 (44 touch); a dense chart gets a transparent padded hit
  rect per cell, empty cells included
- **state never by colour alone** — pair with weight, underline, border. `:focus-visible` ring
  ≥2px, never removed
- **honour `prefers-reduced-motion` and `prefers-color-scheme`** — both palettes as tokens
- **`tabular-nums` on every numeric column**; truncated text carries the full value in a
  tooltip; tooltips are hoverable and Esc-dismissible
- **dark surface ≈ `#121212`, never `#000`** — elevation by lighter surface, accents
  desaturated
- one spacing scale (4px base), never ad-hoc px
- **a visual fix is measured, never eyeballed** — before the change, read the computed geometry of
  the element and its container (bounding boxes, at 390 / 768 / 1280); state the delta in px; make
  ONE change that closes it; re-measure. three guessed offsets on one emoji is the failure this kills

A rule here grows only from a defect Dima saw — the trigger was trophy-sys: dim colours on
10px text, `user-select` on chart marks, dead clicks on empty cells.
