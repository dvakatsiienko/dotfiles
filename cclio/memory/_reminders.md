# reminders — dima's standing hooks

Store contract: the `remind` skill. Both tiers die only when Dima drops them.

## legend

- ⏰ — ordinary, raised at a natural moment
- ⏰📌 — stuck, raised at every boot
- 🦊 — set by the agent for itself; no 🦊 = Dima's ask
  - 👁️ watching a metric
  - 📜 keeping a doc alive
  - 🔬 a probe to run


⏰ 🦊🔬 github native stacked PRs — public preview since 2026-07-30 (`gh extension install github/gh-stack`, roadmap #1218); try on the first multi-layer coder assignment, not before — dima 2026-09-07: «too many novelties today». retire graphite from the list when it works. +3 (dima +2 on 2026-09-08 after the coder retro: three merges raced unpushed commits, a stack would have held them) · the BYT-56 coder's job 2 branched from job 1's tip on its own — that is a stack — set 2026-09-07

⏰ 🦊👁️ initiatives vet — on/after 2026-09-17: did the linear initiative «roadmap» answer «what's next» at every boot for two weeks, without the md file? measure: the flawlog + CSTs of the window name no «re-read the roadmap» moment, and the step named at boot matched what dima did. yes → the vault copy `prompts/dima-roadmap.md` retires on his word. no → revert: `ln -s "…/prompts/dima-roadmap.md" cclio/memory/dima-roadmap.md` + the one barrel import line back, the strategy section stays — set 2026-09-03

⏰ 🦊👁️ brew-picks vet — on/after 2026-09-15: measure gron/yq/sd usage across the fleet — `grep -lE '\bgron |yq |sd ' ~/.claude/projects/*/*.jsonl` (channel proven at set time); a tool with no real hits → drop its Brewfile line + its root CLAUDE.md tooling mention. hyperfine already dropped at pick time (occasional-use, dima's bar was regular) — set 2026-09-01

⏰ 🦊📜 spawn-mechanics artifact freshness — `docs/knowledge/spawn-mechanics.md` verified against cc 2.1.258 (2026-09-02, run #2 of `refresh-spawn-mechanics`); re-run the procedure when the cc version changes, or when a spawn behaves against a [verified] row. the subagent stack row is [volatile] — the first thing run #3 probes — set 2026-08-30


⏰ 🦊📜 humanize skill copies freshness — `plugin-x/skills/humanize` + `humanize-audit` are 1:1 copies of github.com/harshaneel/humanize (commit 4ec7973145, 2026-08-27); if still manual after ~2 months (≈2026-10-27) → raise: refresh via the `refresh-writing-for-humans` procedure, or automate the pull — set 2026-08-27


⏰ 🦊👁️ proto-lab vet — on/after 2026-10-04: has one real proto been built in `apps/proto-lab` since 2026-09-04 (`git log --since=2026-09-04 -- apps/proto-lab/src/protos` in bytes)? yes → BYT-55 graduates; no → deleted per lab's rule, frame pattern noted in BYT-56 first, dima's word on the rm — set 2026-09-04

⏰📌 the freshness engine — BUILT 2026-09-08 (renovate + cclio:evergreen, DOT-240 done); raised until dima says drop: he wants daily software freshness back (patches auto-committed, no dangling minors so a major is a straight jump), a cron'd upgrade round run by cclio, a supply-chain «anti virus» layer, and solid ci first (depot · blacksmith · similar) — his words and the vercel fan-out math are the 🥇 item in `.claude/x-queue.md`. he said: «don't forget to remind me what i asked because i can forget». dies only when he says drop it — set 2026-09-08

⏰ 🦊👁️ vercel quota after BYT-84 — once BYT-84 lands (git auto-deploy off, main from ci): watch the daily count for two weeks — `gh api 'repos/dvakatsiienko/bytes/deployments?per_page=100' --jq '[.[] | select(.created_at > "<today>T00:00:00Z")] | length'` (channel proven 2026-09-11, read 100 on the cap day); still hitting 100 → renovate patch automerge moves from daily to the monday window (dima's word, 2026-09-11: «if we still go out of quota — then make renovate patch automerge less often») — set 2026-09-11

⏰ 🦊🔬 `/goal` on the next long spec-driven build — [DOT-1](linear://linear.app/issue/DOT-1) is the trial; the ralph plan retired 2026-09-12 (plugin uninstalled: stale since 03-28, 11 open stop-hook bugs, `/goal` is the native loop; a loop earns tokens only when the task outlives one context — ii.inc zenith, huntley's own scope). raise when a coder gets a multi-hour greenfield spec — set 2026-09-12

⏰ 🦊🔬 greptile-ci decision + the gate revisit — on/after 2026-09-16 (greptile app trial ends ~09-16, flowlog carry-over): decide greptile on ci — app off, cli stays on the coder side (measured 3 unique over #79/#80 vs the ci reviewer's 6) — then open [BYT-94](linear://linear.app/issue/BYT-94) the same session: redraw the gate around one reviewer, dima's words «not optimal, i don't like it, i want a simpler setup». inputs for the decision: the ctx burn (two adversaries double the coder's read-respond loop, `cclio/docs/ctx-burn-log.md`) and 📌 **dima likes greptile's diagrams** (2026-09-13: «if we eject it we lose that») — if greptile goes, a workaround comes with it: the ci reviewer's prompt asks for one mermaid diagram of the change in its summary (github renders mermaid; claude draws it fine), or `x:coder-brief` has the coder attach one to the pr body. not decided yet — set 2026-09-12

⏰ 🦊🔬 ci + pr gates — the full-picture review, once the basic shape works end to end: raise when BYT-95 (workflow_run lane + pinned actions), BYT-96 (preview lane by label), BYT-100 (guard argv + pr-body marker check) and the greptile-ci decision (09-16, BYT-94) are all closed. then, one session: cclio reviews the whole flow itself — ci matrix, deploy job, the review gate, the owner-approval lane, the adversarial reviewers and how they interact — finds the optimization places, and explains the full picture to dima in plain words (his ask, 2026-09-12: «explain the full picture to me too»). channel: the linear states of the four ids, `linear api` — set 2026-09-12

⏰ apple intelligence — re-check after the next macos release ships (dima's word for it: «golden gate»), then decide. still nothing useful → turn it off on mac, iphone and ipad. carried facts, measured 2026-09-13: it holds only ~50 MB resident (generativeexperiencesd 23 MB, modelmanagerd 18 MB, the safety inference provider 9 MB) and the GenerativeModels assets were never downloaded, so the memory argument for flipping it is weak. the 1.2 GB VM that looked like apple intelligence was claude desktop's own linux sandbox (`~/Library/Application Support/Claude/vm_bundles/`), unrelated. 📌 read-aloud is NOT affected — `SiriAUSP` is `com.apple.texttospeech.SiriAUSP` under Accessibility, the Siri Nora voice on option+escape, a subsystem that predates apple intelligence — set 2026-09-13

⏰ hotkey refresh before the meta phase of DOT-237 — the moment the settings walkthrough ends and phase 4/5 (quicklinks, aliases, snippets, hotkeys) starts: ask dima for his current hotkey list — the scan cannot read raycast or cleanshot, and he changed bindings the map does not know. also: mention the checkpoint at that boundary, skippable (dima, 2026-09-15: «remind me, we may skip it») — set 2026-09-15

⏰ cleanshotx raycast ext — revisit once the `cleanshot://capture-area` quicklink + hotkey exists (DOT-237 phase 5): if the quicklink covers «capture area» (99 % of dima's captures), delete the ext. also mind the chord depth: cleanshot native = `cmd+shift+4`, raycast = modifier+key only — set 2026-09-16

⏰ github raycast ext — at the next open pr (a coder's or renovate's): dima tests `My Pull Requests` (open only, by category) vs `Search Pull Requests` (all states, query-driven) and keeps ONE; the other command gets disabled. dima 2026-09-16: «i don't need two very similar commands at once» — set 2026-09-16
