---
name: chords
description: the keyboard drawn as a keyboard — what is bound, and what is actually pressed
colors:
  signal-blue: "#2f6df6"
  held-blue: "#cfe0ff"
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
    fontSize: "13.5px"
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
    fontSize: "9.5px"
    fontWeight: 500
    lineHeight: 1
rounded:
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
    textColor: "#ffffff"
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
- **Signal Blue** (`#2f6df6`): the one accent. it marks the selected layer tab, a press count
  above zero, the dot on a chord carrying a note, and the primary button. in dark it lightens to
  `#6b9bff` rather than shifting hue.
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
- **Display** (600, 22px, 1.2): the app name, once, top left. nothing else is ever this size.
- **Title** (600, 13px, `0.06em`, uppercase, Ink Faint): the four panel labels. deliberately
  smaller than the body it introduces — it is a signpost, not a headline.
- **Body** (400, 15px, 1.5): the page default, carrying the footer and prose.
- **Label** (400, 13.5px): a list row — an action and the app that owns it.
- **Keycap** (500, 12px, 1.15, mono): the legend on a key; the action beneath it drops to 10.5px.
- **Chord** (500, 13px, mono): a chord string anywhere it appears — tabs, list rows, free keys.
- **Count** (500, 9.5px, 1, tabular): the press count in a keycap's bottom-right corner.

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

### Named Rules

**The Zero Blur Rule.** no `box-shadow` in this system carries a blur radius. not on hover, not
on a dialog, not on a dropdown that does not exist yet. a blurred shadow is atmospheric and this
board is physical; the moment one appears the keyboard becomes a dashboard.

**The Cold Ring Rule.** a bound key nobody has pressed is outlined, not greyed. it is not
disabled and it is not an error — it is a question about why the binding exists, and it has to
stay legible enough to read while asking it.

## Shapes

radius rises with the size of the thing it is rounding: `4px` on a free-key chip, `6px` on
everything interactive (keycaps, tabs, buttons, the note field), `14px` on the board that holds
them. nothing is a circle except two dots — the 9px list marker and the 7px note indicator.

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
- **Bound:** Cap White with the owning app's colour as a `4px` top edge; legend in Ink, action
  beneath in Ink Muted at 10.5px, count bottom-right.
- **Free:** Unbound Grey, legend in Ink Faint, no edge, no count.
- **Held modifier:** Held Blue surface with Ink legend, for the modifiers the current layer holds
  down. a modifier not held reads as Ink Faint on its normal surface.
- **Never pressed:** the Cold Ring treatment, over whichever surface applies.
- **Selected:** `2px` Signal Blue outline at `1px` offset. focus is the same outline at `2px`.

### Layer tabs
- **Style:** `1px` Rule Grey border, transparent fill, chord in mono `13px` Ink Muted, with the
  binding count beside it in `12px` tabular Ink Faint.
- **Selected:** Held Blue fill, Signal Blue border, label in Ink.

### Buttons
- **Shape:** `6px`, padding `6px 12px`, `13px` sans at weight 500.
- **Primary:** Signal Blue fill and border, white label.
- **Ghost:** transparent fill, Rule Grey border, Ink Muted label. used for anything that is not
  the one obvious action.

### Note field
- **Style:** Cap White on a `1px` Rule Grey border at `6px`, `14px/1.45` sans, `72px` minimum,
  vertically resizable only.
- **Focus:** the standard `2px` Signal Blue outline; the border does not change.

### List rows
- **Style:** a three-column grid — `9px` owner dot, `128px` chord in mono, then the action with
  its app name trailing in `12px` Ink Faint. `1px` Rule Grey rule beneath every row.
- **Empty:** a single row carrying a bare fact in Ink Faint, occupying the same grid.

### Free-key chips
- **Style:** Cap White on a `1px` Rule Grey border at `4px`, mono `13px`, inline-wrapped at a
  `1.9` line height so a dense run stays readable.

## Do's and Don'ts

### Do:
- **Do** keep every new surface inside the three-step tonal stack — Desk, Deck, Cap. a fourth
  tone has to displace one of them, not join them.
- **Do** give a number `tabular-nums` whenever it can be compared to the number above it.
- **Do** write the empty state as a bare fact in Ink Faint, in the same grid as the rows it
  replaces, so the column does not jump when data arrives.
- **Do** use mono for a chord and sans for a sentence, without exception.
- **Do** keep the accent to chosen, pressed and annotated. a fourth use has to retire one.

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
- **Don't** animate anything. there is no motion vocabulary here and adding one would be a new
  world, not a refinement.
