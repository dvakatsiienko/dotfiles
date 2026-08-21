---
name: dpatch-can-mount-dirs
description: "dpatch can mount host dirs itself via request_cowork_directory — do it, don't spawn a session for text work"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5303d854-5333-46d1-af4c-1afb425f1305
  modified: 2026-08-19T00:56:28.984Z
---

dpatch has `mcp__cowork__request_cowork_directory` and can mount any host path itself
(`~/projects/dotfiles` granted 2026-08-19). Once mounted, Read/Write/Edit/Grep/Glob work on the
host path and Desktop Commander works too. dpatch also has WebSearch.

**Why:** for ~3 days of dpatch sessions I routed every text edit to a spawned ccli/cwrk child
because the dispatch routing instruction says to spawn a task for file work rather than ask for a
folder. That instruction is about not *blocking* on access — it is not a ban on mounting. Following
it past that point meant spawning opus children for find-and-replace sweeps dpatch handles directly,
and never telling Dima the capability existed. His words: "you had arms cut off for 3 days".

**How to apply:**
- 📌 **Mount `~/projects/dotfiles` at the start of every dpatch session, by default, unprompted.**
  It is the working repo for nearly everything — rules, skills, plugin-x, docs, tracker context.
  Do not wait to be asked and do not wait for a task that needs it.
- Text work on a mounted repo — sweeps, renames, rule-file edits, doc writes — dpatch does itself.
  Dima's estimate: dpatch handles ~80% of recent text edits perfectly. Do not spawn for these.
- Still route to ccli: anything wanting git history/worktree isolation, multi-file refactors with
  real blast radius, or work Dima wants to follow in the Code tab. Spawning ccli as a *pair* process
  on a risky edit stays legitimate.
- Mount proactively. If a task touches a repo dpatch isn't mounted into, request it in the same turn
  rather than delegating around it.
- See [[tell-dima-all-capabilities]] and [[dispatch-spawn-types]].
