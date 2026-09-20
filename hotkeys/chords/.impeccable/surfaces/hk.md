# Surface brief: hk

**Mode: Operate.** the visitor completes a task; scanability and the real usage scene outrank
expression. brand lives in precise details.

## job and audience

dima, alone, at the moment he suspects a chord is in the wrong place. he arrives from the board,
or out of the muscle memory that used to type `hk` in a terminal.

the terminal version already prints this data and is the reason the route exists: it streams, it
truncates every table at 15 rows, and a `… 189 more` is not something you can read. the web's
advantage here is not decoration — it is that nothing is cut off and nothing scrolls away.

## outcome and proof

he can name, in one glance, three things: the chords earning their position, the ones that are
not, and the apps that deserve a better chord than they currently have.

the last of those is the reason the app tables are in scope at all (dima, 2026-09-20): a
frequently opened app is a candidate for a close, cheap chord; a rarely opened one belongs out
on the edges of the board.

every number is measured on this machine — `~/.local/share/x-monitor-hotkey-stats`. nothing is
estimated, sampled or rounded into a nicer figure.

## selected direction

inside the established world; `DESIGN.md` and "The Keycap" bind unchanged.

**structural thesis: the terminal's own sections, reordered by how much each one answers a
rebind question, and none of them truncated.** most-wanted first, app usage after and quieter,
never-used last:

1. **summary** — presses · chords · switches, as stat tiles
2. **top chords** — the ranked list, since-aware, every row
3. **chords per app** — which app he was in when he pressed something
4. **switches per app** — plain app usage; the candidate list for better chords
5. **never pressed** — the rebind candidates, lifetime always

**no chart library.** the form follows the data's job and four of the five jobs are not charts:
three ranked-magnitude lists (a bar is a div with a width), one identity list with no magnitude,
one set of headline numbers. `@visx` computes scales and axes for continuous data and there is
no continuous data here.

📌 the one job that would earn a library is presses-per-day over time — change-over-time, a real
time axis and crosshair, and the one thing a terminal cannot draw. **deferred by dima's call
(2026-09-20): start simple, revisit when the log holds months rather than days.**

## scope and boundaries

- one route. the board page, the api's four existing routes, `manual.ts` and the daemon's
  watching behaviour are all untouched
- **it needs one new endpoint.** `/api/presses` carries counts keyed by chord alone — no labels,
  no window, no app or switch data — so none of the four sections can be built on it.
  `GET /api/stats?window=all|month|week` computes them daemon-side through `stats.ts`, which
  already owns every aggregation this route needs
- anti-goals: no chart library, no time series, no animation (`DESIGN.md` forbids it outright),
  no second copy of any aggregation that `stats.ts` already performs

## states and ranges

measured 2026-09-20, from a log spanning 2026-09-14 to today:

- top chords — 197 rows, growing. shown in full; the terminal's 15-row cut does not carry over
- chords per app — 82 apps
- switches per app — 103 apps
- never pressed — 13 of 90
- summary — 22693 presses, 197 chords, 9155 switches
- **empty** — the daemon has recorded nothing yet. `top.ts` already has this path and says so
  plainly rather than drawing empty tables

⚠️ **the window control will look broken until October.** the log is 7 days old, so `all`,
`month` and `week` return nearly the same numbers today, and the `since` label-split has nothing
to split yet. this is expected, not a defect, and the route should not be judged on it.

## interaction and layout

- **window control** — one row above the sections, before any data. three states, labelled in
  words: **all** (default), **month**, **week**. never as numbers (dima, 2026-09-20)
- **never pressed ignores the window and always means lifetime.** it is a property of the
  binding, not of a view, and a rebind-candidate list that shrinks when you shorten the window
  is lying in the same words it used when it was true
- **a bar row** carries the terminal's own column order, which he already reads without thinking:
  count, bar, chord, label · app
- **a row returns to the board** — clicking a chord lands on the board with that layer open and
  that key selected. the route is one-way and the return is one click
- hover gives a per-mark tooltip; a truncated label carries its full value there
- works at 390 and 1280. a bar is a full-width element, so narrow shortens rather than reflows

## constraints and open decisions

- the `since` label split is already correct in `stats.ts` (`labelAt`, `byLabelledChord`, both
  tested). this route inherits it by using that key and must not re-implement it
- accessibility: the repo floor binds — dense data no smaller than 12px, 4.5:1 on text, every
  control keyboard-reachable. 📌 the board page currently misses this floor; **this route is new
  code and has no reason to inherit the debt**
- a builder must not invent: the window vocabulary (all/month/week, in words), the section order,
  or any aggregation not already in `stats.ts`
