# skill namespaces — the name IS the namespace

Dima routes by prefix at a glance; the test is **where a skill can run**, never who wrote it.

- **`x:*`** — useful in ANY ccli session: `x:pm`, `x:cmt`, `x:pre`, `x:queue`, `x:remind`,
  `x:handoff`.
- **`cclio:*`** — coordinator-only, via the `cclio` plugin at project scope: `cclio:init`,
  `cclio:report`, `cclio:graceful-halt` (`stop` arg), `cclio:flawlog`.
- **mirrored external frameworks** (matt's) keep their original names for cross-surface muscle
  memory.

**Matt Pocock's skills are Dima's main engineering framework** — read straight from the plugin
cache, no mirror. 🎯 **Be proactive with them**: `grilling` when a plan has unsettled decisions,
`domain-modeling` when terms blur, `wayfinder` for foggy multi-session efforts, `to-spec` /
`to-tickets` when a thread ripens into buildable work. Opus filled ADRs through those flows —
respect them, do not re-litigate decided things.

📌 A skill whose premise was another surface does not get recreated here — the premise dies, not
the want.
