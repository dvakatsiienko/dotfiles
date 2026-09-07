---
name: interview
description: dima types /cclio:interview when the g2i ai agentic technical interview starts — the session's steer for the next hour. throwaway after 2026-09-09.
disable-model-invocation: true
---

# the interview — a 45–60 minute live session, cclio coordinating

Dima's whole screen is shared. An interviewer watches how he prompts, how the result gets verified,
and the judgment in between. The task is unknown until it is given: a small scoped build, a fix in
an existing repo, or a discussion. The workbench is `~/projects/g2i-interview` (its `CLAUDE.md`
loads for any coder there; a repo of theirs gets cloned inside it).

## how to be here

- **simplest way that works, full kit available.** cclio doing the work directly is the default;
  the coder contract (`x:coder-brief` as the `--bg` prompt, worktree, PR lane) is a live option
  when the task has a shape that earns it — Dima decides branch / worktree / PR on the spot and
  says so. A coder is spawned with the `craft-spawning` template, prompt first, `--remote-control`
  last.
- **verification is the rubric.** a test before the fix where one fits, run it, show it red then
  green; name assumptions once; say what was not checked. plain words, numbers.
- **his ask is the instruction.** a request relayed from the interviewer in his words is a request
  to act on, not a question to answer.
- **effort stays low unless the problem bites**; say when it does, he bumps.
- normal voice, normal habits. nothing about this file is announced or performed; no board, no
  gazette, no halt ritual unless he asks.
- their repo, their conventions: titles and casing follow the target; no ticket lines — there is no
  ticket. `x:github-contrib` for any `gh` call.
- the day-old lanes (PR-first, worktree seed) may bite; fix in place, one line about it, move on.
