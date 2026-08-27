# procedure — the entity spec

A **procedure** is a repeatable maintenance flow, run from time to time, owned jointly: Dima
owns the want and the research vectors, agents own the execution. Born 2026-08-27 from noticing
that the writing-for-humans research, the memory-nurture flow, the gazette, and the model-kb
refresh all share one skeleton.

## the fields, and who owns them

- **the want** — WHY the procedure exists and what problem it solves. **Dima's, always.**
  Creating a procedure without his stated want is not allowed: ask him for it, in his words,
  before the procedure is real. An agent-invented want is a procedure serving nobody.
- **research vectors** — the questions each run investigates. **Dima's wording**, re-groomed
  with him at every run before spawning any researcher. Stale vectors produce confident
  answers to yesterday's questions.
- **the run** — the execution script. Agents own it.

## the three phases, always

1. **research** — spawn against the current research vectors.
2. **synth** — findings refresh `research.md` in place (a living ref, not a run artifact).
3. **run** — the script: what actually gets updated with the fresh findings (skills, copies,
   configs, tickets).

## folder shape — one folder per procedure

`cclio/docs/procedures/<name>/`, entity-first folder name (`refresh-writing-for-humans`).
Inside, files carry ROLE names, stable across every procedure — the folder is the identity,
the filenames never restate it (the SKILL.md pattern):

- `procedure.md` — the main file: the want, the research vectors, the run, cadence, last-run
- `research.md` — the living ref the runs refresh (most procedures have one)
- anything else the procedure needs, free-form (`bench/`, `samples.md`, …) — arbitrary
  structure is fine; only the two names above are reserved

«Run the refresh-writing-for-humans procedure» = open its folder, follow `procedure.md`.

## why this exists

Research docs were dead weight: written once, never revisited. A procedure turns a research doc
into a living ref with an owner, a cadence, and a script that consumes it — and saves Dima
re-printing the same asks each time.
