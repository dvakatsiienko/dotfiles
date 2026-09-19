---
date: 2026-09-19
slug: the-schedule-day
tickets: []
posted: {health: no}
cw: |
  the night gave every scheduled job one home. `schedule/` at the repo root now holds each job's plist, source and build output in one directory per job, with an installer that links the plist into launchd AND boots it — something no command did before. both swift jobs were renamed entity-first and moved without losing a byte of history. the raycast `schedule` command learned to show cloud jobs that no launchctl can see, by reading a heartbeat file each cloud run leaves behind, and it now tells a measured row apart from an inferred one. separately the repo moved from CLAUDE.md to AGENTS.md across six files, after an experiment proved the two cannot be mixed.
  live / next: the cowork gazette routine needs one new step pasted into it before its row stops being a placeholder; the tree is deliberately uncommitted for a cowork verification pass.
  worth a line: renaming the global ~/.claude/CLAUDE.md to AGENTS.md silently killed the entire fleet floor — caught by a probe, reverted inside one turn, and it buys nothing anyway since no other provider reads ~/.claude/.
---

# 🗞️ cclio's gazette · the schedule day — schedulers get one home, the fleet moves to AGENTS.md, and four false-greens die

a long headless night driven from cowork: `claude -p`, resumed by session id, read-only for the
first half with every change handed back as a diff for dima to apply by hand, write access from
the midpoint on.

## the asks, and what landed

- **«show the cowork gazette run as a peer row in `schedule`»** — done. a cloud job has no pid,
  no plist and no `launchctl` row, so there is nothing to poll: it writes a json heartbeat and
  the reader derives state from **freshness** — fresh + ok → `waiting`, fresh + not ok →
  `failed`, older than 26 h → `missed`, file absent → no row at all. shipped first as a
  hand-counted unified diff under read-only, applied verbatim, `pnpm typecheck` green.
- **«make the descriptions pretty»** — the detail pane stopped dumping the raw plist comment as
  one run-on wall. a pure `toDetailMarkdown` gives it a heading, an italic schedule + next-fire
  line, rejoined prose paragraphs and real bullets for `key — value` lines. both plists'
  `<!-- -->` blocks were rewritten to the shape that renders best.
- **«schedulers are scattered everywhere, they belong in ONE place»** — `schedule/` at the repo
  root: `jobs/<name>/` (plist + `main.swift` + `bin/`), `state/` (heartbeats, gitignored),
  `README.md` as the authority, and **`pnpm schedule:install`**. the correction that mattered:
  the plists were *already* in the repo via the mirror rule — the real gap was that
  `dotfiles:link apply` linked them and **nothing ever bootstrapped them**. the installer closes
  that.
- **«is putting the state file inside the raycast extension good?»** — no, and said so plainly.
  the extension is a build input and a node package; the reader must never own the data, least
  of all with a personal CLI still on the table. the kernel of the idea was right, one level up:
  `schedule/state/`.
- **«does cc read AGENTS.md?»** — yes, verified from the binary's own option help: the
  `instructionFiles` setting, default `claude-md-or-agents-md`, **either/or, never both**. then
  measured with fresh `claude -p` probes rather than inferred.
- **«finish the AGENTS.md migration»** — 6 files renamed, every live reference swept, `grep` for
  the old names prints nothing. `cclio/CLAUDE.md` moved too, with `skill-cclio-mode-snapshot.ts`
  following it.
- **«entity-first the monitors»** — `x-hotkey-stats-monitor` → **`x-monitor-hotkey-stats`**,
  `x-screenshots-autoclean` → **`x-autoclean-screenshots`**. dir, plist filename, `Label`,
  `ProgramArguments`, both log paths, binary, codesign identifier, data dir, pnpm family, source
  comments, `.gitignore`, docs — including the naming-convention example in root memory that
  cited the old name.
- **«pretty emoji, and how do I tell a launchd job from a cowork one?»** — one rule for both
  sources: the description opens with an emoji, the reader lifts it for the display and strips it
  from the text. every row carries an explicit `source`, badged `🖥️ launchd` (polled, measured)
  vs `☁️ cowork` (inferred, only as true as the last beat).
- **«how do I get columns that don't shift?»** — straight answer: you cannot, and the type proves
  it — `ItemAccessory` is `text | date | tag` with no width or alignment field. what *was*
  possible got done: the two rightmost accessories are now fixed-width glyphs, which pins every
  schedule pill to the same column.

## four false-greens, found and killed

the day's theme, and all four are the same shape — **a status that answers «did this fail»
instead of «did this run»**:

- **an always-on daemon reading healthy while dead.** `not running` is health for a daily job and
  death for one launchd is meant to keep alive. same word from launchctl, opposite meaning. now
  red, proved across all seven branches of the predicate.
- **`exit 0` shown as a measurement on cloud rows**, where it was fabricated from the heartbeat's
  `ok` field. the exit code now appears only on a real failure.
- **`0 run(s) this boot`** on jobs that have no boot.
- **the hotkey monitor running blind for two minutes** after its rename: TCC granted, process
  alive, stderr empty, still logging app switches — and capturing nothing. see below.

## tricks gained

- **a TCC grant keys on the codesign identifier, not the path.** moving both jobs to a new
  directory and rebuilding kept both grants; **renaming them broke both**, because the identifier
  carries the name.
- **a grant alone is not enough — the job must be restarted.** a tap created before the grant
  stays dead; macOS does not retro-authorise a live one.
- **`state = running` does not prove a monitor is capturing.** it kept logging app switches,
  which need no permission, while chord capture was silently dead. the only honest check was a
  fresh `chord` line in the jsonl.
- **macOS never prunes a stale TCC row** — every rename leaves one behind. dima's Input
  Monitoring list held `hotkey-stats` from a name dead for months.
- **`launchctl bootout` returns before teardown finishes**, and a bootstrap racing it is refused.
  the installer polls until the service actually leaves the domain — a real signal, never a sleep.
- **the AGENTS.md either/or is project-wide, not per-directory.** with a root `AGENTS.md` and any
  nested `CLAUDE.md`, the ancestor walk finds the `CLAUDE.md`, skips the AGENTS scan entirely, and
  **the repo root goes silently unread**. a mixed tree is broken, not degraded.
- ⚠️ **`~/.claude/CLAUDE.md` cannot become `AGENTS.md`.** renamed it, probed from a neutral dir,
  got `NONE LOADED` — user memory uses a different loader from project instructions. reverted in
  full. it buys nothing regardless: no other provider reads `~/.claude/`.
- **raycast templates an emoji passed as `icon`** and drains its colour; `text` and titles leave
  it alone. though the greyscale dima was actually seeing turned out to be simpler — 📰, 📷 and
  ⌨️ are just grey glyphs. settled by rendering a 🍅.
- **raycast gives no hover affordance at all** — an accessory with a tooltip is pixel-identical to
  one without.
- **arrow consts are not hoisted**: an entrypoint calling its helpers from the top of the file
  crashes on the first run.

## state

- `schedule/` built; both jobs loaded at new paths under new labels; monitor `running` and
  recording, autoclean grant tested (`scanned 106 file(s)`, a guaranteed no-op — nothing was 30
  days old).
- repo is **AGENTS.md** throughout, except `~/.claude/CLAUDE.md` (cannot move) and
  `~/projects/CLAUDE.md` + `~/projects/bytes/CLAUDE.md` (other repos, left alone).
- `pnpm typecheck` clean · `pnpm test` 131 passed · biome clean.
- **nothing committed, by dima's instruction** — ~25 paths dirty for a cowork verification pass.
- `schedule/state/gazette-sync.json` is a **placeholder** and flips red `missed` after 26 h. the
  real beat arrives when the cowork routine runs its new step 5.

## trail

- shipped: `schedule/` collocation + `pnpm schedule:install` (links AND bootstraps), cowork
  heartbeat rows scanned from `state/*.json` (one file per job, next cloud job needs no code),
  AGENTS.md migration across 6 files, entity-first rename of both swift jobs, x-ray `schedule`
  detail-pane rewrite + per-job emoji + source badges + glyph states, x-ray `AGENTS.md`, four
  false-greens fixed
- open: paste step 5 into the cowork gazette routine; commit + verify from cowork; stale TCC rows
  to sweep by hand; optional brighter glyphs (📷 → 📸, ⌨️ → ⚡)
- state: 0 commits by design, tree dirty; no coders; bytes untouched
