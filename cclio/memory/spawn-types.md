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

🚨 **session blindness is OVER — the old claim here is falsified.** it was measured before
`"remoteControlAtStartup": true` was switched on. with RC on, `ListAgents` shows peers cclio never
spawned: another interactive session, a dispatch conversation, a cloud session. cclio can message
them, and messaging a session **Dima** started himself works both ways.

**Still cannot:** spawn a cloud `cc` — only Dima. And ⚠️ **cloud is receive-only**: it accepts a
message and cannot answer. Its reply lands in its own transcript. cli → cloud delivery is itself
**unverified** — a send returned success while the cloud reported nothing arrived. Treat cloud as a
one-way pipe plus a shared store (linear, a commit, a PR), never a handshake.

## measured, not read from a schema
- **`--effort` is HONOURED.** a `--effort medium` probe from a `high` coordinator rendered
  `Opus 5 with medium effort`. it is the flag, not inheritance.
- **remote control is inherited from settings** — no flag needed on the spawn.
- 🚨 **remote control has ONE owner per session, and the loser prints code 4090** («another
  connection took over»). Dima's rule, adopted: **start in the terminal, and treat the desktop code
  tab as join-only** — never enable RC from both. 📌 why terminal→tab worked and tab→terminal did
  not is unexplained; the handover direction was never tested, so do not assert a cause.
- **background sessions survive a coordinator reset** — detached daemon, registered in
  `~/.claude/sessions/<pid>.json`, re-attachable by name.
- ⚠️ **`claude --bg <prompt>` does NOT run the prompt.** the session comes up **idle**; deliver the
  brief afterwards with `SendMessage`, which also lets you attach `notify_when_idle: true`.
- ⚠️ **a subagent does NOT start in the parent's cwd** — it gets the **git repo root**, and the
  parent cannot choose. **every path in a brief must be absolute.**
- ⚠️ **a peer answering in plain prose reaches nobody.** only a `SendMessage` call travels. every
  brief expecting an answer must say so.
- ⭐ **`SendMessage` takes `notify_when_idle: true`** — a one-shot completion event, no polling.
- `ListAgents` and `Workflow` are **absent from subagent toolsets** — only the coordinator surveys
  the fleet.

**Scheduling:** ccli has built-in `CronCreate`/`CronList`/`CronDelete`, disabled only by three strings in `permissions.deny`. It beats dispatch's, which fires only while the desktop app is open. ⏰ Two dpatch schedules fire 2026-09-01 — the decision has its own leaf now, [[reminder-cron-handover]].

## preflight, four checks, every spawn
0. **reuse before spawn** — an idle child is not a finished child; a message revives it with context intact.
1. **tier** — code, repo, real filesystem ⇒ a real session, never a thinking-only one.
2. **title** — `🔧 code:` · `🔬 research:` · `🧪 probe:` · `⏰ area:` for schedules. Titles cannot be renamed after spawn.
3. **ticket ref** — pass the id, require `- ref DOT-N` on commits.

All four were violated in one dispatch session, some twice. The rules already existed; the failure was not checking.

Model cards live in `rules/models.md`. Short form: haiku = bulky and simple · sonnet-5 = good, needs supervision · opus-5 = complex engineering, never PM · **fable-5 never spawned unless Dima asks** (quota).
