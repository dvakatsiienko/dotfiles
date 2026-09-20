---
name: chords
description: the keyboard drawn as a keyboard — what is bound, and what is actually pressed
colors:
  signal-blue: "#1d5ae0"
  on-signal: "#ffffff"
  held-blue: "#cfe0ff"
  bar-fill: "#7c8496"
  cap-white: "#f8f9fb"
  cap-edge: "#c9cdd6"
  unbound-grey: "#e4e7ec"
  deck-grey: "#dfe2e8"
  desk-grey: "#eceef2"
  rule-grey: "#cfd3db"
  ink: "#171a20"
  ink-muted: "#5b6170"
  ink-faint: "#8b91a0"
  app-raycast: "#ff5c5c"
  app-magnet: "#3b82f6"
  app-wispr: "#8b5cf6"
  app-cleanshot: "#0ea5a3"
  app-cursor: "#f59e0b"
  app-1password: "#4f6df5"
  app-bartender: "#22c55e"
  app-macos: "#6b7280"
typography:
  display:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.2
  tally:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1
  subject:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "16px"
    fontWeight: 600
  title:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.06em"
  body:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  keycap:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.15
  chord:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 500
  count:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1
rounded:
  hairline: "3px"
  chip: "4px"
  control: "6px"
  board: "14px"
spacing:
  key-gap: "6px"
  panel: "10px"
  board-pad: "14px"
  section: "22px"
components:
  keycap-bound:
    backgroundColor: "{colors.cap-white}"
    textColor: "{colors.ink}"
    typography: "{typography.keycap}"
    rounded: "{rounded.control}"
    padding: "5px 7px"
    height: "46px"
  keycap-free:
    backgroundColor: "{colors.unbound-grey}"
    textColor: "{colors.ink-faint}"
    typography: "{typography.keycap}"
    rounded: "{rounded.control}"
    padding: "5px 7px"
    height: "46px"
  keycap-held:
    backgroundColor: "{colors.held-blue}"
    textColor: "{colors.ink}"
    typography: "{typography.keycap}"
    rounded: "{rounded.control}"
    padding: "5px 7px"
    height: "46px"
  tab:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.chord}"
    rounded: "{rounded.control}"
    padding: "6px 11px"
  tab-selected:
    backgroundColor: "{colors.held-blue}"
    textColor: "{colors.ink}"
    typography: "{typography.chord}"
    rounded: "{rounded.control}"
    padding: "6px 11px"
  button-primary:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.on-signal}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
  field:
    backgroundColor: "{colors.cap-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 10px"
    height: "72px"
  freekey-chip:
    backgroundColor: "{colors.cap-white}"
    textColor: "{colors.ink}"
    typography: "{typography.chord}"
    rounded: "{rounded.chip}"
    padding: "0 6px"
  stat-tile:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.tally}"
  notice:
    backgroundColor: "{colors.cap-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  fold-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
  scrollbar-thumb:
    backgroundColor: "{colors.bar-fill}"
    rounded: "{rounded.hairline}"
    width: "6px"
---

# Design System: chords

## Overview

**Creative North Star: "The Keycap"**

the system draws a keyboard as a keyboard. its one structural decision is a `box-shadow` with a
blur radius of zero — `0 2px 0` in the cap-edge grey — which is not a shadow at all but the lip
of a moulded key seen straight on. every other decision follows from that literalism: surfaces
stack in flat tones instead of floating, corners round the way a cap rounds, and the mono face
on a keycap is the face printed on the real one.

the register is quiet on purpose. a key is grey until something is bound to it, plain until it
has been pressed, and coloured only to say which application owns it. nothing on the page is
decorated; every mark is a fact that was measured on this machine, and the things that carry no
fact carry no ink.

density is high and unapologetic — a 64-column grid holding seventy-odd keys above two reading
columns — because the whole board has to be legible in one glance, without scrolling, at the
moment a decision is being made.

**Key Characteristics:**
- zero blur anywhere; depth is tonal stacking plus one 2px physical lip
- two type families split by gesture: mono for what you type, sans for what you read
- colour is a label, never a decoration — eight app hues and one accent, nothing else
- flat, bright, and legible at a glance; no gradients, no glass, no animation

## Colors

a near-neutral grey stack carrying one blue accent and a set of eight application tags — the
palette is almost entirely greyscale so that a single coloured edge reads instantly.

### Primary
- **Signal Blue** (`#1d5ae0`): the one accent. it marks the selected layer tab, a press count
  above zero, the dot on a chord carrying a note, and the primary button. in dark it lightens to
  `#6b9bff` rather than shifting hue. it was `#2f6df6` until the count reached 12px and the pair
  was measured: that blue carried text at 4.30:1 against a bound keycap, under the 4.5:1 text
  owes. this one is 5.55:1 there, 5.03:1 as a dot on the page, and 4.51:1 as a focus ring on the
  deck — the same blue, one step down.
- **On Signal** (`#ffffff` light, `#15171b` dark): whatever is legible ON the accent, which is
  not one colour. white on the dark theme's pale accent measured 2.71:1 — the save button's own
  label — where the darkest surface reads 6.63:1.
- **Held Blue** (`#cfe0ff`): the surface of something currently held down or currently chosen —
  a lit modifier key, the selected tab. never used as text, never as a border.

### Secondary
the eight **application tags**, each owning exactly one source: **Raycast Coral** (`#ff5c5c`),
**Magnet Blue** (`#3b82f6`), **Wispr Violet** (`#8b5cf6`), **CleanShot Teal** (`#0ea5a3`),
**Cursor Amber** (`#f59e0b`), **1Password Indigo** (`#4f6df5`), **Bartender Green** (`#22c55e`),
**System Grey** (`#6b7280`). they appear on a 4px top edge and a 9px list dot, and nowhere else.

### Neutral
- **Desk Grey** (`#eceef2`): the page beneath everything.
- **Deck Grey** (`#dfe2e8`): the board the keys sit in, one step darker than the desk.
- **Cap White** (`#f8f9fb`): a key that has something bound to it, one step lighter than the deck.
- **Unbound Grey** (`#e4e7ec`): a key with nothing on it. reads as part of the deck, not as a cap.
- **Cap Edge** (`#c9cdd6`): the 2px lip under every key. structural, never a fill.
- **Bar Fill** (`#7c8496`): the filled part of a ranked bar on the stats route, on an
  Unbound Grey track. its own step in each theme rather than a reused surface — measured at
  3.03:1 light and 4.36:1 dark against that track, because a chart mark owes 3:1 and the
  surface first reached for managed 1.28:1 and inverted in dark.
- **Rule Grey** (`#cfd3db`): hairlines — list dividers, field borders, the footer rule.
- **Ink** (`#171a20`), **Ink Muted** (`#5b6170`), **Ink Faint** (`#8b91a0`): the three text
  weights — a fact, its qualifier, and its label.

### Named Rules

**The Owner Edge Rule.** an application's colour appears only as a bound key's 4px top edge and
its 9px list dot. never a fill, never text, never a border on more than one side. the moment a
second surface takes an app colour, the board stops reading as grey with tags on it.

**The Earned Accent Rule.** Signal Blue marks exactly three states — chosen, pressed, annotated.
a count of zero renders as an em dash in Ink Faint, not a blue nought. accent that was not
earned by a measurement is a lie about the data.

## Typography

**Display / Body Font:** IBM Plex Sans (with `system-ui`, `sans-serif`)
**Keycap / Chord Font:** IBM Plex Mono (with `ui-monospace`, `monospace`)

**Character:** Plex is a workstation face, drawn for terminals and technical documents, and the
pairing here is the same family in two voices rather than a contrast. the mono is doing literal
work — a keycap legend is monospaced on the physical keyboard, and a chord string has to align
down a column.

### Hierarchy

five sizes, and no step between them is smaller than a whole pixel. the ramp carried eight
before the typeset pass, including a 13.5px and a 12.5px doing the same job as their neighbours;
a half pixel cannot carry a different meaning, and two of the eight sat under the floor.

- **Display** (600, 22px, 1.2): the app name, once, top left.
- **Tally** (600, 22px, 1, mono, tabular): a summary number on the stats route. it shares Display's
  size rather than exceeding it — the app name is the largest thing on any page, and a stat that
  outranked it was the one hierarchy inversion this system had.
- **Subject** (600, 16px, mono): the chord a panel is about, above the rows describing it. the one
  step between Display and Body, and the only role that owns it.
- **Title** (600, 13px, `0.06em`, uppercase, Ink Faint): the four panel labels. deliberately
  smaller than the body it introduces — it is a signpost, not a headline.
- **Body** (400, 15px, 1.5): the page default, carrying the footer, prose and the note field.
- **Label** (400, 13px): a list row — an action and the app that owns it.
- **Chord** (500, 13px, mono): a chord string anywhere it appears — tabs, list rows, free keys.
- **Keycap** (500, 12px, 1.15, mono): the legend on a key.
- **Count** (500, 12px, 1, mono, tabular): a press count, and the action label beside it on a
  keycap. both were below the floor — 9.5px and 10.5px — and both are 12px now, which is the
  smallest this system will print. 📌 raising the count in the corner it used to sit in cost the
  narrow keycaps their labels, so it moved onto the legend line instead; the measurement is in
  Components.

### Named Rules

**The Two Hands Rule.** mono for anything you could type; sans for anything you only read. a
chord is always mono, a sentence is never. this is what lets a chord be recognised as a chord
without a label saying so.

**The Tabular Rule.** every number that can be compared to another number carries
`font-variant-numeric: tabular-nums`. press counts sit in a column and a column that jitters
cannot be scanned.

## Layout

a single centred column, `max-width: 1180px`, with `22px` between sections and `20px` page
gutters. three bands in fixed order: header, layer tabs, board — then two reading columns
below it, `1fr 1fr`, collapsing to one under 761px.

the stats route splits its four sections into **two independent column stacks at 1024px**, and
neither number is arbitrary. the columns are `1.45fr 1fr` because the two are not equivalent — a
chord row carries a chord, an action and an app, an app row carries a name — and an even split
truncated 79 of 89 detail labels at 768px against 0 at full width. they are stacks rather than a
shared row grid so expanding one list grows only its own column; in a flat grid the rows are
shared and opening the long table would push the short one down.

the board is a **64-column grid**. every keycap spans a whole number of those columns, which is
how a `1u` key (4 columns), a `1.5u` tab (6) and a `6.25u` spacebar (25) keep the proportions of
the real Air75. gaps are `6px` between keys and between rows; the board's own padding is `14px`.
below `760px` the board scrolls horizontally inside its own rounded container rather than
reflowing — a keyboard that rewraps is no longer a keyboard.

density steps by role: `6px` inside the board, `10px` between items in a panel, `22px` between
sections. there is no larger step; the page never breathes more than 22px anywhere.

## Elevation & Depth

**there are no blurred shadows in this system, at any elevation, ever.** depth is carried by two
mechanisms only: a three-step tonal stack (Desk → Deck → Cap, each one step lighter than the
last) and a single hard lip beneath every keycap.

### Shadow Vocabulary
- **Cap lip** (`box-shadow: 0 2px 0 #c9cdd6`): under every keycap, bound or free. zero blur, zero
  spread, one offset. it is the moulded edge of the key, not light falling on it.
- **Cold ring** (`box-shadow: 0 2px 0 #c9cdd6, inset 0 0 0 1.5px #8b91a0`): a key that is bound
  but has never been pressed. it keeps its lip and gains an inner outline.
- **Pressed lip** (`box-shadow: 0 2px 0 #5b6170`): the same lip in Ink Muted, under the pointer.
  a keycap has no hover tint — the lip is the only depth this system owns, so a firmer edge is
  how a key answers a pointer resting on it. Ink Faint was tried first and measured 2.43:1
  against the deck, under the 3:1 a mark owes; this is 4.78:1 light and 6.85:1 dark. the offset
  is still 2px and the blur is still 0.

### Named Rules

**The Zero Blur Rule.** no `box-shadow` in this system carries a blur radius. not on hover, not
on a dialog, not on a dropdown that does not exist yet. a blurred shadow is atmospheric and this
board is physical; the moment one appears the keyboard becomes a dashboard.

**The Cold Ring Rule.** a bound key nobody has pressed is outlined, not greyed. it is not
disabled and it is not an error — it is a question about why the binding exists, and it has to
stay legible enough to read while asking it.

## Shapes

radius rises with the size of the thing it is rounding: `3px` on the 6px scrollbar of a folded
list, `4px` on a free-key chip, `6px` on everything interactive (keycaps, tabs, buttons, the note
field), `14px` on the board that holds them. nothing is a circle except two dots — the 9px list
marker and the 7px note indicator. the 3px step exists because three pixels is what fully rounded
means on a bar six wide; it is not a fourth size for anything larger.

borders are hairlines or structure, never both. a `1px` Rule Grey line divides list rows, outlines
the note field and closes the footer. the only thick border in the system is the keycap's `4px`
top edge, which is not decoration but the owner tag.

focus is a `2px` Signal Blue outline at `2px` offset, present on every interactive element and
removed from none. a selected keycap carries the same outline at `1px` offset, so selection and
focus read as the same gesture at two distances.

## Components

### Keycaps
- **Shape:** gently rounded (`6px`), minimum height `46px`, padding `5px 7px`, spanning a whole
  number of the 64 grid columns.
- **Bound:** Cap White with the owning app's colour as a `4px` top edge. the legend and the press
  count share the top line, the count right-aligned in Signal Blue; the action sits on the line
  below in Ink Muted, with the full width to itself. 📌 the count sat in the bottom-right corner
  until both it and the action were raised to 12px: the clearance the count needed there cut 19 of
  22 action labels on the cmd layer down to one character and an ellipsis. moving it up left the
  label a whole line and **13 of 22** truncate instead of the 17 that did at 10.5px — more
  readable, at a larger size.
- **Hover:** the Pressed lip. no tint, no lift, no motion.
- **Free:** Unbound Grey, legend in Ink Faint, no edge, no count.
- **Held modifier:** Held Blue surface with Ink legend, for the modifiers the current layer holds
  down. a modifier not held reads as Ink Faint on its normal surface.
- **Never pressed:** the Cold Ring treatment, over whichever surface applies.
- **Selected:** `2px` Signal Blue outline at `1px` offset. focus is the same outline at `2px`.

### Layer tabs
- **Style:** `1px` Rule Grey border, transparent fill, chord in mono `13px` Ink Muted, with the
  binding count beside it in `12px` tabular Ink Faint.
- **Selected:** Held Blue fill, Signal Blue border, label in Ink.
- **Hover:** border to Signal Blue, label to Ink. the same two properties every bordered control
  moves, which is the whole hover vocabulary of this system — the page links and the window tabs
  on the stats route share it.

### Buttons
- **Shape:** `6px`, padding `6px 12px`, `13px` sans at weight 500.
- **Primary:** Signal Blue fill and border, On Signal label.
- **Ghost:** transparent fill, Rule Grey border, Ink Muted label. used for anything that is not
  the one obvious action. hover moves border and label as the tabs do.
- **Disabled:** Unbound Grey fill, Rule Grey border, Ink Faint label, and no hover. a control that
  cannot act says so rather than acting and reporting success.

### Note field
- **Style:** Cap White on a `1px` Rule Grey border at `6px`, `15px/1.45` sans, `72px` minimum,
  vertically resizable only.
- **Focus:** the standard `2px` Signal Blue outline; the border does not change.

### List rows
- **Style:** a three-column grid — `9px` owner dot, `128px` chord in mono, then the action with
  its app name trailing in `12px` Ink Faint. `1px` Rule Grey rule beneath every row.
- **Empty:** a single row carrying a bare fact in Ink Faint, occupying the same grid.

### Free-key chips
- **Style:** Cap White on a `1px` Rule Grey border at `4px`, mono `13px`, inline-wrapped at a
  `1.9` line height so a dense run stays readable.

### Stat tiles
- **Style:** a Tally number over a Title label, no surface and no border. the numbers carry the
  row; a box around each one would be four boxes saying nothing.
- **Qualified:** a trailing `of N` in Body weight and Ink Faint, inline with the number.

### Notice
- **Style:** Cap White on a `1px` Rule Grey hairline at `6px`, Body text, `10px 12px`. it sits
  **above** the content it is about and never replaces it — data already fetched stays on screen
  when a refresh fails, because it is still true and has only stopped being fresh.
- **Recovery:** a trailing Ghost button where a second attempt could change the answer.
- 📌 a `4px` coloured edge on one side is not available here. that shape is the keycap's owner tag
  and belongs to nothing else.

### Folded lists
- **Style:** a ranked list capped at twenty rows, scrolling inside its own section. every row
  stays in the document; the cap is a window, not a truncation.
- **Scrollbar:** 6px wide, Bar Fill thumb on an Unbound Grey track, both at `3px`. it is drawn at
  rest rather than on scroll, because it is the only standing cue that more rows exist. 📌 declared
  through `::-webkit-scrollbar` alone — a scroller that also sets the standard `scrollbar-width` or
  `scrollbar-color` makes the browser ignore the webkit rules entirely, and the bar vanishes.
- **Control:** a Ghost button beneath the list reading `show all N`, which lifts the cap and the
  inner scroll together.

## Do's and Don'ts

### Do:
- **Do** keep every new surface inside the three-step tonal stack — Desk, Deck, Cap. a fourth
  tone has to displace one of them, not join them.
- **Do** give a number `tabular-nums` whenever it can be compared to the number above it.
- **Do** write the empty state as a bare fact in Ink Faint, in the same grid as the rows it
  replaces, so the column does not jump when data arrives.
- **Do** use mono for a chord and sans for a sentence, without exception.
- **Do** keep the accent to chosen, pressed and annotated. a fourth use has to retire one.
- **Do** answer the pointer with the property the element already owns: a bordered control moves
  its border and label, a keycap moves its lip. every interactive element carries a hover and a
  focus state, and both were counted rather than assumed.
- **Do** put a failure above the content it concerns. data already on screen is still true.

### Don't:
- **Don't** add a `box-shadow` with a blur radius. The Zero Blur Rule has no exceptions,
  including hover, modals and anything that floats.
- **Don't** let an application colour become a fill, a text colour, or a full border. it is a
  `4px` top edge and a `9px` dot, and that is the whole vocabulary.
- **Don't** render a zero count as `0`. it is an em dash in Ink Faint; a blue nought claims a
  measurement that never happened.
- **Don't** reflow the board at narrow widths. it scrolls horizontally inside its container,
  because a rewrapped keyboard is not a keyboard.
- **Don't** introduce a spacing step larger than `22px`. this page is dense on purpose and a wide
  gap reads as a missing section.
- **Don't** tint a keycap on hover, or lift it. the lip is the only depth this system has and it
  is enough; a second depth mechanism would be a second world.
- **Don't** print below 12px. it is the floor for dense data here and two roles sat under it until
  they were measured.
- **Don't** let an error replace what was already fetched, or report success for something that
  did not happen. a control that cannot act is disabled, not silently inert.
- **Don't** animate anything. there is no motion vocabulary here and adding one would be a new
  world, not a refinement.
