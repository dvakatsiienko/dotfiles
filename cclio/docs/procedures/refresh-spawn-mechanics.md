# refresh-spawn-mechanics — procedure

Keeps the spawn evidence base true against the current claude code build. Procedure entity per
[_spec.md](_spec.md).

## the want (dima's, 2026-08-27)

> i want you, coordinator, to coordinate with spawns (subagents) efficiently and precisely.
> should work for now, with only you occasionally spawning a coder. the wants for this will
> grow when we add verifiers and the rest of the zoo.

## research vectors (re-groom each run)

- re-verify the corrected spawn table against the current cc version — every [verified] row is
  only as old as its last run
- the standing open questions (the evidence base's own «could not determine» list): `--bg` +
  `--effort` on an effort-capable model · worktree isolation end to end · workflow per-call
  effort · the cloud row · `notify_when_idle` from the main conversation
- new spawn surfaces or flags in the cc changelog since last run
- freshest best practices of building an agent orchestrator — best approaches, accompanying
  tools, tips and tricks, gotchas, pitfalls

## artifacts (pointed at, never housed)

- `cclio/docs/spawn-mechanics-research.md` — the pristine evidence base: claim-tagged, its
  «tests i actually ran» section doubles as this procedure's test suite
- `cclio/memory/craft-spawning.md` — the resident distillate; check it still agrees after
  every refresh

## the run

1. re-groom the research vectors with Dima
2. execute the evidence base's own command list against the current build (a probe run while a
   human edits the system is not controlled — the doc's own lesson; say so and re-run if the
   environment moved)
3. distill: update claim tags and rows in place; a falsified row is corrected, never deleted
   silently — the retraction pattern in the doc shows the shape
4. eval + print findings: any row flipped? craft-spawning drifted? new lever worth adopting?
5. resolve with Dima by outcome; noop is first-class

## cadence

Event-driven: a cc minor version change (the doc's own `refresh-when`), or a spawn behaving
against a [verified] row.

## last run

2026-08-27 — procedure created around the 2026-08-22 research (cc 2.1.239). 📌 already due:
cc has bumped past 2.1.239 — run #1 is a fresh session's job.
