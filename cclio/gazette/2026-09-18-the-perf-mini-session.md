---
date: 2026-09-18
slug: the-perf-mini-session
tickets: [DOT-218, DOT-215, DOT-187]
posted: {health: yes}
cw: |
  a mini session on where the flow leaks: the coordinator's own context and long sessions came out as the biggest cost, bytes had gone almost untouched for a week, and the fix list got ranked. the verifier role, a separate session whose only job is to prove a coder wrong, was researched across vendors and papers and now has a written contract ready for its first trial.
  live / next: the verifier gets tried on the next bytes coding job, starting with a deliberately broken change it has to reject; the coordinator's context diet comes after the raycast overhaul finishes.
  worth a line: the boot ritual that took four minutes of back and forth is now one script that runs in six seconds and says in plain words which check failed.
---

# 🗞️ cclio's gazette · the perf mini-session — the fleet measured, a verifier gets a spec, and the boot becomes one script

## shipped

- **the flow measured** — dima's ask: where is the flow leaking. numbers from the transcripts: cclio boots at 106–135k, runs 20–25 h sessions to 600k+ context, 8–11 tool rounds per human prompt, 100–240M cache reads a session; bytes 4 commits in 5 days vs 339 dotfiles commits in 21. verdict: the coordinator is the leak, then bytes starvation, then the review gate. dima's frame back: his own ux upgrades (raycast, hotkeys, quicklinks) are fleet upgrades — «you have a more capable operator now» — and root `CLAUDE.md` now says so in one line.
- **the verifier, researched and specced** — [DOT-218](https://linear.app/x-com/issue/DOT-218) un-parked. two research lanes: an opus researcher over 32 primary sources (no product IS the role; anthropic's `claude-security` plugin is the template — refute-not-confirm, a verdict computed in code, «not examined ≠ clean»; openhands' stop threshold 8.0 → 1.35 attempts), then `neuroarxiv` over 25 papers, which changed the design three times: **the verifier's first run is a tamper pr it must refuse** (vacuous pass, 75/112 refusal sites deletable with every check green), the merge stakes stay out of its prompt (14–17 pp drift), the coder gets the failing criterion never the located fix. panel dropped. spec = `x:verifier-brief` (x 0.11.79): exit lines in the ticket, execution first, owns the ci reviewer, one ≤12-line prompt per round, cap 2. `x:coder-brief` step 3b reroutes «final»; `craft-spawning` carries the pair-spawn line and the model trial (pr 1 opus high, pr 2 sonnet high, the ci reviewer as control). research: `docs/research/verifier-identity.md`.
- **the boot is one script** — [DOT-215](https://linear.app/x-com/issue/DOT-215) done: `boot-prefetch.sh` prints every check with a status line in 6 s (handoffs, inbox, x-queue, roadmap, reminders, live sessions + worktrees + coder prs, renovate, repos, symlink, flawlog tail), `🚨 FAIL ·` per check that cannot run, a stamp + a stale re-run from `cclio:init` for the evening-clear / midday-boot case. ~12 rounds → 0–1. proven red then green. cclio 0.3.48.
- **gazette → trail** — five posts resident (30 KB) became `_trail.md`: three lines per day, shipped / open / state, 2.4 KB. every post ends with `## trail`; `gazette-trail.sh` replaces the recent script.
- **jev, read** — typesafe ai's «system one» model: typed questions → calibrated answers, an http classifier, not a specifier or verifier. parked as a reminder (waitlist at console.typesafe.ai); a ci pre-filter probe when it leaves early access.
- **smaller**: `neuroarxiv` installed and moved under `cclio/.claude/skills/` (dima: only this folder searches) — a passed test drive for [DOT-187](https://linear.app/x-com/issue/DOT-187) · leaf editor → `nvim +{$line}`, leaf + glow configs registered into dotfiles · glow completions were already there (brew's `_glow`, one `compinit` rebuild) · the cw plugins in cclio's context traced to the account plugin sync (`~/.claude/plugins/synced/`), disable on the diet · jev + neuroarxiv reminders · DOT-218 body links both research lanes

## tricks gained

- `~/.claude/plugins/synced/<org>_<user>/` mirrors the desktop app's plugins into every cc session on the account; `claude plugin disable <name>@synced` is the door
- the SessionStart hook fires at `/clear` time — an evening clear prints a digest that is stale by midday; a stamp + re-run covers it
- `gh --jq` takes no `--arg`; pipe to `jq` for a parameterised filter
- `sd` with `$x` in a double-quoted replacement expands to nothing, third sighting — the Edit tool for that line
- a research brief for an architecture question names `neuroarxiv` as a lane; a vendor-only research missed the two papers that reshaped the spec

## state

- dotfiles: the halt commit pending, dima's standing word on push; bytes untouched (1 unpushed on a tree 2 behind)
- dima's tools · next overhaul · 22/25 — DOT-237 In Progress, aliases slice next; the raycast CST is the pickup
- no coders, no worktrees; halt16 CST still parked
- next: the verifier trial at the next bytes spawn; the context diet after the raycast story (x-queue carries both)

## trail

- shipped: the flow measured (cclio boots 106–135k, 600k sessions, bytes starving), verifier researched (32 sources + 25 papers) and specced as `x:verifier-brief`, DOT-215 boot digest script, gazette trail, jev read and parked, neuroarxiv adopted under cclio, leaf/glow configs into dotfiles
- open: verifier trial at the next bytes spawn (tamper pr first); context diet after raycast (boot breakdown, synced cw plugins off, memory reshape); 3 inbox questions for the raycast session
- state: halt commit pending; DOT-237 aliases slice next via the raycast CST; no coders
