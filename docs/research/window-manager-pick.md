---
dies-when: the windows vector of DOT-237 is decided
---

Ticket: DOT-237

# window manager pick — raycast wm vs magnet vs the field

scope: one primary window manager for a keyboard-only, raycast-pro, two-display setup
(AW3225QF 4K + built-in). every claim carries a url; anything not sourced is labelled «inferred».

## raycast wm reliability

- **feature set covers the ask in full** — halves, quarters, sixths, thirds, center, maximize,
  «reasonable size» (60 %, capped 1025×900), exact-coordinate `move window`, `resize window`,
  plus `move to previous/next display` and `move to previous/next space` — [raycast manual](https://manual.raycast.com/window-management)
- **spaces are first-class**, not an afterthought: open / close / rename desktop 1–9 are shipped
  commands — [raycast manual](https://manual.raycast.com/window-management)
- **custom layouts** place up to eight windows per display, each with size/offset/position, and each
  entry can launch an app via quicklink; adjacent tiles get a shared draggable divider — [raycast manual](https://manual.raycast.com/window-management)
- **free tier is enough for halves/thirds/quarters/displays**; pro is needed only for saved
  multi-app layouts — [raycast wm guide 2026](https://raycast-discount-code.com/blog/raycast-window-management) — 📌 moot here, dima is pro
- **update cadence is live in 2026** — custom window-management commands shipped in the 0.51 line,
  layout previews gained auto-size hints, and a recent fix addressed maximized/minimized windows
  landing on the wrong monitor when a layout applies — [raycast changelog](https://www.raycast.com/changelog)
- known bugs, all open or recent:
  - **stage manager conflict** — `maximize` / `left half` covers stage manager's window strip — [#17642](https://github.com/raycast/extensions/issues/17642)
  - **next/previous desktop moved the space but left the window behind** — [#12493](https://github.com/raycast/extensions/issues/12493)
  - **`error: not supported` saving a layout** even with accessibility granted — [#27676](https://github.com/raycast/extensions/issues/27676)
  - **macos full-screen spaces cannot be resized by any manager** — os-level, not a raycast defect — [raycast wm guide](https://raycast-discount-code.com/blog/raycast-window-management)
- **layouts save geometry, not context** — they do not pin apps to spaces and do not survive a
  restart — [shiftplus comparison](https://shiftplus.app/blog/raycast-window-layouts-vs-shiftplus/) (secondary source; the restart limit is repeated in [betterstage's 2026 roundup](https://betterstage.app/best-macos-window-manager))
- 🔎 **verdict on q1: yes, it can be primary** for a keyboard-only user wanting halves/thirds/
  quarters + move-to-display + spaces. the gaps (stage manager, restart persistence) do not touch
  that workflow. inferred: the space-move bug is worth a live retest before retiring the fallback.

## magnet status

- **version 3.0.7, released 2025 (app store prints `04/12/2025`, format ambiguous)** — the only shipped release in the current cycle;
  ~17 months stale as of 2026-09 — [app store](https://apps.apple.com/us/app/magnet/id441258766?mt=12)
- **developer is now `BOOTCODE A.S.`**, not crowd cafe — the listing changed hands or renamed;
  the crowdcafe site carries no version, changelog or news page — [app store](https://apps.apple.com/us/app/magnet/id441258766?mt=12) · [magnet.crowdcafe.com](https://magnet.crowdcafe.com/)
- **minimum macos 13.0**; the listing claims optimisation only up to macos 15 sequoia, with **no
  stated macos 26 / 27 support** — [app store](https://apps.apple.com/us/app/magnet/id441258766?mt=12)
- release notes are generic («performance», «minor bug fixes») — no feature work — [app store](https://apps.apple.com/us/app/magnet/id441258766?mt=12)
- price dropped $8 → $4.99; still editors' choice, 4.9 over ~134k ratings — [app store](https://apps.apple.com/us/app/magnet/id441258766?mt=12)
- 🔎 **verdict on q2: alive but coasting.** it runs on tahoe (no compatibility complaint surfaced
  in the 2026 roundups), and nothing suggests active development. inferred from the absence of
  tahoe-era bug reports rather than from a vendor statement — no vendor statement exists.

## the ranking

- **raycast window management** — ⭐⭐⭐⭐⭐ — one tool, one hotkey namespace, already paid for,
  covers every command dima uses plus spaces and displays — [raycast manual](https://manual.raycast.com/window-management)
- **rectangle pro** — ⭐⭐⭐⭐ — the keyboard-heaviest dedicated manager, more keybinds than loop,
  but it is a second hotkey namespace to maintain — [reddit roundup 2026](https://www.brnsft.com/blog/according-to-reddit-the-best-mac-window-managers-in-2026)
- **moom 4** — ⭐⭐⭐ — richest feature set (named arrangements, arbitrary grid ratios) and the only
  real edge over raycast is grid ratios he has not asked for — [moom alternatives 2026](https://shiftplus.app/blog/moom-alternative-mac/)
- **rectangle (free)** — ⭐⭐⭐ — the safe default for a first-time evaluator; strictly a subset of
  what raycast already does for him — [reddit roundup 2026](https://www.brnsft.com/blog/according-to-reddit-the-best-mac-window-managers-in-2026)
- **magnet** — ⭐⭐ — works, 19 chords of which 7 are dead, no 2026 development, entirely duplicated
  by raycast — [app store](https://apps.apple.com/us/app/magnet/id441258766?mt=12)
- **macos 26/27 native tiling** — ⭐⭐ — halves and fullscreen via globe+ctrl+arrows, no thirds,
  no quarters, no custom arrangements — [tahoe window management guide](https://macos-tahoe.com/blog/macos-tahoe-window-management-complete-guide-2025/)
- **loop** — ⭐⭐ — excellent, but mouse-first radial snapping; the wrong input model for him — [reddit roundup 2026](https://www.brnsft.com/blog/according-to-reddit-the-best-mac-window-managers-in-2026)
- **bettersnaptool** — ⭐⭐ — drag-zone oriented, aging, same duplication problem as magnet — [alternativeto](https://alternativeto.net/software/rectangle-windows-manager-/?platform=mac)
- **swish** — ⭐ — trackpad-gesture manager; zero keyboard story — [alternativeto](https://alternativeto.net/software/rectangle-windows-manager-/?platform=mac)
- **amethyst / yabai** — ⭐ — auto-tiling changes the whole mental model, yabai wants SIP
  disabled, and amethyst has a documented conflict with raycast wm — [amethyst #1593](https://github.com/ianyh/Amethyst/issues/1593)

## verdict

**raycast window management is primary, and magnet retires.** dima already pays for raycast pro,
already drives everything from its hotkeys, and raycast covers the whole ask — halves, thirds,
quarters, move-to-display, move-to-space — in the namespace he already maintains. magnet's only
remaining argument is muscle memory for 12 live chords, and those rebind in raycast in one sitting;
against that it has had no feature work since its 2025 release, no stated macos 26/27 optimisation, and a
changed developer entity. the one-tool preference decides the rest of the field: rectangle pro and
moom are both good and both cost a second hotkey namespace for capability he would not use.

📌 **the migration order:** map the 12 pressed magnet chords onto raycast commands, live with it
for a week with magnet still installed but its hotkeys cleared, then delete magnet. keeping both
bound is the one configuration guaranteed to be worse than either alone.

## what is not answered

- **the space-move bug ([#12493](https://github.com/raycast/extensions/issues/12493)) has no
  confirmed close date** — it needs a live retest on his machine before the fallback goes
- **no primary source states magnet's macos 26/27 status** — the «it works» read is inferred from
  the absence of tahoe-era complaints, not from the vendor
- **raycast wm behaviour on space switch (windows raised on top)** — the specific symptom in the
  brief surfaced in no 2026 source; unverified either way
- **crowd cafe → bootcode a.s.** — whether this is a rename, a sale, or a listing transfer is
  unresolved; the vendor site is silent
- **no source measured raycast wm latency** against rectangle or magnet; the only latency figure
  found was for a third-party bento window extension, not the built-in
