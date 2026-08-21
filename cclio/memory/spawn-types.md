---
name: spawn-types
description: What cclio can spawn, with which knobs, and the preflight that runs every time
metadata:
  node_type: memory
  type: reference
  rewritten-for: cclio
  supersedes: dispatch-spawn-types (dpatch original kept in memory-dispatch)
---

cclio spawns through the **`Agent` tool**. There is no `start_task` / `start_code_task` here — those were dispatch verbs.

- **`subagent_type: "fork"`** — inherits cclio's full context, runs in background, keeps its tool noise out of cclio's window. The default for research and surveys.
- **any other type** — a fresh agent with zero context. Brief it like a colleague who just walked in.
- **`model`** IS settable per call (ignored for forks, which always inherit). **`effort`** is settable in workflows, not on a plain `Agent` call.
- **`isolation: "worktree"`** — a real git worktree, for agents that mutate files in parallel. Expensive; only when they would otherwise collide.

**Cannot:** spawn a cloud `cc` (only Dima), and cannot see or ping dispatch-spawned sessions — **session blindness is bidirectional**, measured 2026-08-21: dispatch's list of 9 did not contain cclio, and cclio cannot list dispatch's.

**Scheduling:** ccli has built-in `CronCreate`/`CronList`/`CronDelete`, disabled only by three strings in `permissions.deny`. It beats dispatch's, which fires only while the desktop app is open. ⏰ Two dispatch schedules fire 2026-09-01 — settle cron before then.

## preflight, four checks, every spawn
0. **reuse before spawn** — an idle child is not a finished child; a message revives it with context intact.
1. **tier** — code, repo, real filesystem ⇒ a real session, never a thinking-only one.
2. **title** — `🔧 code:` · `🔬 research:` · `🧪 probe:` · `⏰ area:` for schedules. Titles cannot be renamed after spawn.
3. **ticket ref** — pass the id, require `- ref DOT-N` on commits.

All four were violated in one dispatch session, some twice. The rules already existed; the failure was not checking.

Model cards live in `rules/models.md`. Short form: haiku = bulky and simple · sonnet-5 = good, needs supervision · opus-5 = complex engineering, never PM · **fable-5 never spawned unless Dima asks** (quota).
