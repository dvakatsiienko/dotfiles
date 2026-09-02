# reminders — dima's standing hooks

Store contract: the `remind` skill. Both tiers die only when Dima drops them.

## legend

- ⏰ — ordinary, raised at a natural moment
- ⏰📌 — stuck, raised at every boot
- 🦊 — set by the agent for itself; no 🦊 = Dima's ask
  - 👁️ watching a metric
  - 📜 keeping a doc alive
  - 🔬 a probe to run

⏰ gazette → cw memory — leaf `/areas/fleet-cclio-gazette.md` live, dry run + noop proven by cw 2026-09-02, 09:00 kyiv task set for 2026-09-03. after the first scheduled run is confirmed: drop this line, fold `cclio/docs/gazette-cw-sync.md` into `docs/procedures/memory-bridge-refresh-cw.md`, delete the doc — set 2026-08-28



⏰ 🦊👁️ coder linear identity vet — on/after 2026-09-16: fetch every comment by the coder app user (`linear api 'query { comments(filter: { user: { id: { eq: "195a6ec0-ed0c-4519-9750-948eac4e5e00" } } }, first: 50) { nodes { issue { identifier } createdAt body } } }'`, channel proven at set time) and eval with dima: did «cclio's pet» comments help him see who did what? none or useless → drop the identity (keychain slots `coder` + the script arg). until then every coder brief carries the token and one done-comment; steer the shape as it goes — set 2026-09-02

⏰ 🦊👁️ brew-picks vet — on/after 2026-09-15: measure gron/yq/sd usage across the fleet — `grep -lE '\bgron |yq |sd ' ~/.claude/projects/*/*.jsonl` (channel proven at set time); a tool with no real hits → drop its Brewfile line + its root CLAUDE.md tooling mention. hyperfine already dropped at pick time (occasional-use, dima's bar was regular) — set 2026-09-01

⏰ 🦊📜 spawn-mechanics artifact freshness — `docs/knowledge/spawn-mechanics.md` verified against cc 2.1.258 (2026-09-02, run #2 of `refresh-spawn-mechanics`); re-run the procedure when the cc version changes, or when a spawn behaves against a [verified] row. the subagent stack row is [volatile] — the first thing run #3 probes — set 2026-08-30





⏰ 🦊📜 humanize skill copies freshness — `plugin-x/skills/humanize` + `humanize-audit` are 1:1 copies of github.com/harshaneel/humanize (commit 4ec7973145, 2026-08-27); if still manual after ~2 months (≈2026-10-27) → raise: refresh via the `refresh-writing-for-humans` procedure, or automate the pull — set 2026-08-27

⏰ 🦊 keep [DOT-159](linear://linear.app/issue/DOT-159) (git overhaul) at priority 1 through the fleet package milestone — no milestone in dima's tools, prio is the mechanism — set 2026-08-25

