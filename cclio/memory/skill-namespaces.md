---
name: skill-namespaces
description: Two families — x:* works in any ccli session, cclio-* is coordinator-only
metadata:
  node_type: memory
  type: feedback
  rewritten-for: cclio
---

Dima's cut, 2026-08-21. The old `dpatch-*` prefix is retired.

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

**Dropped, do not re-create:** `dpatch-proto` (spinning an opus session is just *working* once you are ccli), `dpatch-walkthrough` (its premise was an agent that could not see the terminal), `x:vikar` (opus deputising for dpatch *on dispatch*; cclio is its own surface, so the premise is gone — **not** because dpatch retired, it did not), `x:dpatch-refresh-cclio-sysprompt` (scans the dispatch prompt from inside; no ccli session can).
