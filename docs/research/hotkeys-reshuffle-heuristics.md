---
dies-when: session B of DOT-237 has applied or declined each move; the kept map lives in hotkeys/manual.ts
---

Ticket: DOT-237

# hotkey reshuffle — his 14 days against the published heuristics

28,439 chord events, 2026-09-08 → 09-22. the map of intent is `hotkeys/manual.ts`; the bound
set is the raycast export. this doc scores one against the other.

## the heuristics that survived scrutiny

- **frequency ↔ cost, inverted.** the most-pressed symbol gets the cheapest chord; the mapping
  is an explicit correlation of a frequency index against a motor-constraint index. the oldest
  and best-stated version is in the chordic-keyboard patents —
  [US5493654](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5493654) ("composite
  chord-difficulty index").
- **keep the right hand on the mouse.** ⌘C/⌘V are left-hand-only by design so the mouse hand
  never moves — the canonical statement of one-hand chording is in
  [the UX of keyboard shortcuts](https://medium.com/design-bootcamp/the-art-of-keyboard-shortcuts-designing-for-speed-and-efficiency-9afd717fc7ed).
  📌 the inverse applies to a **left-held hyper**: the cheap side flips to the right hand, and
  the mouse hand pays instead. cost is per-layer, not global.
- **the pinky column is the expensive one.** bottom-left ctrl forces ulnar deviation; caps-lock
  sits on the home row precisely because it saves the pinky ~2.5 cm of travel
  ([attackshark, multi-modifier ergonomics](https://attackshark.com/blogs/knowledges/ergonomic-multi-modifier-key-layout-macro-strategies)).
  a held caps means that pinky is **busy**, so every other left-pinky key is same-finger.
- **home row first, layers for the rest** — [precondition's home-row-mods guide](https://precondition.github.io/home-row-mods):
  modifiers belong in the most accessible positions, and a layer's payload should follow.
- **one grammar per layer: mnemonic OR positional, not both** —
  [knock, how to design great keyboard shortcuts](https://knock.app/blog/how-to-design-great-keyboard-shortcuts):
  memorability comes from familiarity, key-to-verb mnemonics, or positional mirroring. mixing two
  inside one layer costs recall on every press.
- **conflict-free by construction.** the whole point of hyper (⌃⌥⌘⇧) is that no app claims it —
  [raycast manual, hyper key](https://manual.raycast.com/hyper-key). a binding outside hyper is
  gambling against an app default.
- **relearning cost is small but real.** ~50 s of deliberate practice per *new* shortcut
  ([tkainrad, 50 shortcuts in 42 minutes](https://tkainrad.dev/posts/how-i-learned-50-new-keyboard-shortcuts-in-42-minutes/)),
  short daily reps beating long sessions. **replacing an overlearned chord is the hard case** —
  retraining a familiar motion to different fingers is harder than learning a fresh one
  ([sacha chua, relearning qwerty](https://sachachua.com/blog/2012/06/relearning-qwerty/);
  [overlearning](https://en.wikipedia.org/wiki/Overlearning)). so: cost scales with the chord's
  own press count, not with how many chords move.

## the cost tiers, for a left-held caps hyper

- **t1 — cheapest:** right hand, home or one row off — `j k l u i o n m y h`
- **t2 — cheap:** left hand, away from the pinky column — `t g b v f d c r e w s x`
- **t3 — reach:** the number row, either hand
- **t4 — same-finger:** left pinky column — `a q z 1` (the finger holding caps)
- **t5 — hand leaves the mouse:** `pageup pagedown home end` nav cluster

## what his data says, top chords by count

- `opt+esc` 2633 — read-aloud. one hand, t2-equivalent, no modifier stack. **best-placed chord he owns.**
- `hyper+a` 2409 — Claude. **t4.** the #1 hyper chord sits on the one key that shares a finger
  with the hold. 172 presses/day on the worst position in the layer.
- `hyper+1` 600 — Chrome. **t3 + pinky column.** #2 hyper chord, second-worst position.
- `hyper+b` 316 · `hyper+t` 276 — bartender, warp. t2, left index. well placed.
- `hyper+2` 218 — Cursor. t3. moderate.
- `hyper+y` 212 — raycast notes. **t1.** correctly cheap.
- `hyper+d` 141 · `hyper+space` 110 — obsidian, emoji. t2. fine.
- `hyper+pageup` 107 — linear-query-tickets. **t5** — and it outranks `hyper+e` (76), the Linear
  *app* on a t2 key. the layer's cheapest-key rule is inverted here.
- `hyper+w` 89 · `hyper+c` 73 · `hyper+s` 71 · `hyper+r` 70 · `hyper+f` 69 — t2, counts match cost.
- `hyper+n` 35 · `hyper+m` 19 · `hyper+k` 11 · `hyper+v` 11 · `hyper+pagedown` 12 · `hyper+u` 4 —
  **cheap positions holding rare commands.** `k` and `n` are t1; `u` is t1 and the coldest row in
  the whole layer.
- `ctrl` held 1273 + `rcmd` 327 — two bare-modifier dictation-shaped holds. near-duplicate; only
  he can say whether they are two different things.
- `opt+1/2/3` 345/43/30 — language switch. t3 but digit-positional and correct; the opt layer
  carries word-nav in letters and languages in digits, which do not collide. keep.

## the near-misses — evidence the `a` position is real

pressed, bound to nothing: `hyper+q` 4 (all Chrome), `hyper+home` 14, `hyper+tab` 10,
`hyper+return` 9. `q` is directly above `a`, and all four of its presses landed in the app
`hyper+1` opens. that is a slip off a strained key, not a stray press.

## 🚫 what is too young to judge

- **every `ctrl+opt` window-management binding is 1–3 days old** (`since: 2026-09-19` / `09-21`).
  the halves and maximize already carry the layer (159 + 137 + 84 of ~300), the quarters look
  cold — but a 3-day count is not a verdict. 📌 **session B should not touch the wm layer.**
- **`⇧⌘6 7 8 9` and `⇧⌘\`` are 5 days old** (`since: 2026-09-17`). counts of 5, 7, 0, 0, 15 mean
  nothing yet. the standing reminder already sets the read for **2026-10-01** — keep it.

## the reshuffle

### keep

- `opt+esc` (2633), `hyper+y` (212), `hyper+b`/`hyper+t`/`hyper+d` — frequency matches cost.
- `opt+1/2/3` languages — positional grammar, self-consistent, heavy on `1` where the heavy
  language is.
- the whole `ctrl+opt` wm layer — untouched this session, too young.
- **the CleanShot family, as it stands.** ⇧⌘4 (423) and ⇧⌘1 (146) are the two heavy ones and sit
  on the two digits macOS itself trained him on — that is the *familiarity* heuristic, the
  strongest one knock lists, and it beats any reach argument. the tail is young. **prior verdict
  confirmed, with a correction: the reason is familiarity, not reach — ⇧⌘1 is a left-pinky
  digit under two left-hand modifiers, which is t3+pinky, and it stays only because relearning
  a macOS-native motion costs more than the reach.**

### move

- **`hyper+a` → a t1 letter (proposed `hyper+j`).** 2409 presses off the caps-hold finger onto
  the right index home key. gain: the layer's heaviest chord stops competing with its own
  modifier. relearning cost: **highest on the board** — the most overlearned chord he has,
  expect misfires for several days and a `hyper+a`-shaped slip long after. 📌 **this move needs
  his hands to confirm the premise** — the data cannot see whether he presses `a` with the pinky
  or rolls to the ring finger. if he rolls, the move is not worth its cost.
- **`hyper+pageup` (linear-query-tickets, 107) → `hyper+l`.** t5 → t1, and `l` is mnemonic for
  linear. gain: the right hand stops leaving the mouse for the most-used linear command, and
  `pageup` frees. relearning cost: **low** — 7.6 presses/day, a week-old-grade habit at most,
  and the mnemonic carries it. ⚠️ `hyper+l` is also where a "lock" binding would naturally go —
  confirm nothing claims it.
- **`hyper+1` Chrome (600) → a t1 letter, optional.** gain: #2 chord off the pinky column.
  cost: **breaks the layer's one positional pair** (`1` Chrome / `2` Cursor) and no free letter
  is mnemonic for Chrome — `c` is Slack. ➡️ recommend **defer**: do `hyper+a` first, and only
  consider this once that move has settled, so two overlearned chords are not in flight at once.

### free

six bound hyper slots under 40 presses in 14 days — all t1 or t2, i.e. cheap real estate held by
cold commands:

- `hyper+n` Notion — 35
- `hyper+m` Telegram — 19
- `hyper+pagedown` translate selection — 12
- `hyper+k` Calendar — 11 · **t1, the cheapest key in the layer**
- `hyper+v` Things3 — 11
- `hyper+u` Toggle Focus Session — 4 · **t1**

plus four rows that are dead outright:

- `⇧⌘0` open-from-clipboard — 0 presses, and old enough to count (no `since`)
- `⇧⌘L` Lock 1Password — 0 presses
- `opt+tab` "Switch Windows (disabled)" — the row is already disabled and still logged 8 presses;
  delete the row so those presses stop being credited to it
- raycast's `linear-query-wide` ghost row on `hyper+pageup` — a settings row that outlived its
  command; it is also the thing that makes the pageup move cleaner

**freeing costs nothing to relearn** — an unbound chord produces no wrong action, only a no-op.

## if only three moves

do the `hyper+a` relocation, the `hyper+pageup` → `hyper+l` relocation, and the six-slot free —
in that order of value, reverse order of cost. the free is cost-free and reclaims both t1 keys
(`k`, `u`) the layer is wasting; the pageup move is a cheap, mnemonic win on the one command
that currently makes the mouse hand travel; the `hyper+a` move is the only one worth real pain,
because 2409 presses on a same-finger chord is the single largest frequency↔cost inversion in
his whole map — and it is also the one move that should not start until he confirms with his own
hand that the pinky conflict is real. touch nothing in `ctrl+opt` or `⇧⌘6–9` before 2026-10-01;
those layers have not lived long enough to have an opinion about themselves.

## what the data could not judge

- **app attribution is the frontmost app at press time, not the receiver.** `⇧⌘4` shows
  `macos 167, claude 61, cleanshot 53` — that is where he was standing, not who handled it. every
  global-hotkey count in this doc inherits that blur.
- **in-app shortcuts are indistinguishable from global ones.** `opt+-` (282), `opt+9` (233),
  `opt+,` (83), `opt+.` (80), `opt+w` (37), `cmd+esc` (200) are heavy, unowned by `manual.ts`,
  and almost certainly Claude Desktop's own bindings. they are not reshuffleable by us and were
  excluded from every verdict. 📌 `cmd+esc` is separately mislabelled in `manual.ts` as the
  read-aloud chord; the real one is `opt+esc`.
- **whether `hyper+a` actually strains.** stated above; it is the premise of the top move.
- **whether `ctrl`-held (1273) and `rcmd` (327) are one function or two.** the daemon sees two
  holds, not two intents.
- **the macOS audit's five NEW symbolichotkey ids (233, 235, 237, 238, 239)** — the audit reports
  them as absent from the snapshot and does not name what they bind. unresolved; approve or
  investigate before the rebind, since a system chord could silently claim a freed slot.

## outcome — session B, 2026-09-22 (dima's hands)

- the heuristic that decided: dima's right hand is on the mouse, so a LEFT-hand chord is the cheap one — the research assumed both hands on the keys and got move 1 backwards. `hyper+a` (pinky + ring roll) stays.
- moved: `hyper+pageup` → `hyper+g` for linear-query-tickets (left index, home row). the ghost row keeps `pageup` alone now, harmless.
- kept by his word: `hyper+n` notion, `hyper+m` telegram, `hyper+k` calendar, `hyper+v` things, `⇧⌘L` lock (6 presses, all his test), cleanshot layout unchanged.
- dropped: `hyper+u` toggle focus (focus disabled, nothing owned the chord), `opt+tab` switch windows (disabled row), the false `cmd+esc` read-aloud row (the real chord is `opt+esc`).
- found: the board names page keys `pgup`/`pgdn` while the daemon says `pageup`/`pagedown`, so those caps never showed a row or a press (DOT-255). `hyper+q` cannot be recorded by raycast and fires nothing — owner unknown, probe on 10-01.
- deferred to 10-01: the `^⌥` wm layer and `⇧⌘6–9` (1–5 days of counts), `hyper+q`, the `⇧⌘0` cleanshot clipboard slot (1 press).
