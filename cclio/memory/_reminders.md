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

⏰ 🦊👁️ coder linear identity vet — on/after 2026-09-16: fetch every comment by the coder app user (`linear api 'query { comments(filter: { user: { id: { eq: "195a6ec0-ed0c-4519-9750-948eac4e5e00" } } }, first: 50) { nodes { issue { identifier } createdAt body } } }'`, channel proven at set time) and eval with dima: did «coder» comments help him see who did what? none or useless → drop the identity (keychain slots `coder` + the script arg). until then every coder brief carries the token and one done-comment; steer the shape as it goes — set 2026-09-02

⏰ 🦊👁️ brew-picks vet — on/after 2026-09-15: measure gron/yq/sd usage across the fleet — `grep -lE '\bgron |yq |sd ' ~/.claude/projects/*/*.jsonl` (channel proven at set time); a tool with no real hits → drop its Brewfile line + its root CLAUDE.md tooling mention. hyperfine already dropped at pick time (occasional-use, dima's bar was regular) — set 2026-09-01

⏰ 🦊📜 spawn-mechanics artifact freshness — `docs/knowledge/spawn-mechanics.md` verified against cc 2.1.258 (2026-09-02, run #2 of `refresh-spawn-mechanics`); re-run the procedure when the cc version changes, or when a spawn behaves against a [verified] row. the subagent stack row is [volatile] — the first thing run #3 probes — set 2026-08-30


⏰ 🦊📜 humanize skill copies freshness — `plugin-x/skills/humanize` + `humanize-audit` are 1:1 copies of github.com/harshaneel/humanize (commit 4ec7973145, 2026-08-27); if still manual after ~2 months (≈2026-10-27) → raise: refresh via the `refresh-writing-for-humans` procedure, or automate the pull — set 2026-08-27


⏰ 🦊👁️ proto-lab vet — on/after 2026-10-04: has one real proto been built in `apps/proto-lab` since 2026-09-04 (`git log --since=2026-09-04 -- apps/proto-lab/src/protos` in bytes)? yes → BYT-55 graduates; no → deleted per lab's rule, frame pattern noted in BYT-56 first, dima's word on the rm — set 2026-09-04

⏰📌 the freshness engine — BUILT 2026-09-08 (renovate + cclio:evergreen, DOT-240 done); raised until dima says drop: he wants daily software freshness back (patches auto-committed, no dangling minors so a major is a straight jump), a cron'd upgrade round run by cclio, a supply-chain «anti virus» layer, and solid ci first (depot · blacksmith · similar) — his words and the vercel fan-out math are the 🥇 item in `.claude/x-queue.md`. he said: «don't forget to remind me what i asked because i can forget». dies only when he says drop it — set 2026-09-08

⏰ 🦊👁️ vercel quota after BYT-84 — once BYT-84 lands (git auto-deploy off, main from ci): watch the daily count for two weeks — `gh api 'repos/dvakatsiienko/bytes/deployments?per_page=100' --jq '[.[] | select(.created_at > "<today>T00:00:00Z")] | length'` (channel proven 2026-09-11, read 100 on the cap day); still hitting 100 → renovate patch automerge moves from daily to the monday window (dima's word, 2026-09-11: «if we still go out of quota — then make renovate patch automerge less often») — set 2026-09-11

⏰ 🦊🔬 ralph loop — first run after gate hole #2 (guard fixture tests, coder-hosted, `--max-iterations 8`, gitignore the state file first): measure iterations to green, context growth, hooks per lap, promise honesty. then: where in our flow does a verifier-driven loop earn its tokens? dima 2026-09-11: «suggest me ralph loop each time, but only when it truly helps because it also burns tokens hard» — after the measurement, one line in `craft-spawning` naming the shape that qualifies — set 2026-09-11
