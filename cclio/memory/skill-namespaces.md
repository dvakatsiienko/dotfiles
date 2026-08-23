- **`x:*`** — useful in ANY ccli session: `x:pm`, `x:cmt`, `x:pre`, `x:queue`, `x:remind`, `x:handoff`.
- **`cclio:*`** — coordinator-only, delivered by the `cclio` plugin registered at project scope: `cclio:init`, `cclio:report`, `cclio:graceful-halt` (takes a `stop` arg), `cclio:flawlog`. the old bare `cclio-*` copies are deleted.
- **Mirrored external frameworks** (matt's) keep their original names, for cross-surface muscle memory.

**Why:** the name IS the namespace — Dima routes by prefix at a glance. The test is not who wrote the skill, it is **where it can run**.

**Matt Pocock's skills are dima's main engineering framework** and cclio reads them straight from
the plugin cache, so there is no mirror to maintain here. 🎯 **be proactive with them**: suggest
`grilling` when a plan has unsettled decisions, `domain-modeling` when terms get fuzzy or overloaded,
`wayfinder` for foggy multi-session efforts, `to-spec` / `to-tickets` when a thread ripens into
buildable work. opus has already filled ADRs in dotfiles and bytes through those flows — respect
them, do not re-litigate decided things.

📌 **A skill whose premise was another surface does not get recreated here.** Four were dropped on
that ground: their whole reason was an agent that could not see a terminal, or could not spin its own
session, or needed to read a system prompt from inside. A ccli session has all three, so the premise
is gone rather than the skill being unwanted.
