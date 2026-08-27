# procedure — the entity spec

A **procedure** is a repeatable maintenance flow, run from time to time, owned jointly: Dima
owns the research vectors, agents own the execution. Born 2026-08-27 from noticing that the
writing-for-humans research, the memory-nurture flow, the gazette, and the model-kb refresh all
share one skeleton.

## the three phases, always

1. **research** — the vectors are the procedure's heart and DIMA'S property: written as close
   to his wording as possible, re-groomed with him each run before spawning any researcher.
   Stale vectors produce confident answers to yesterday's questions.
2. **synth** — findings land in ONE ref doc, `<name>.ref.md`, colocated next to its procedure,
   refreshed in place (the doc is living, not an artifact of the run that made it).
3. **run** — the procedure's own script: what actually gets updated with the fresh findings
   (skills, copies, configs, tickets).

## file shape

One file per procedure at `docs/procedures/<name>.md`, entity-first name:

- **vectors** — bullet list, Dima's wording, one vector per line
- **ref doc** — the colocated `<name>.ref.md` this procedure feeds
- **run** — numbered steps
- **cadence** — how often, and what reminds us (a ⏰ reminder, a ticket, a trigger event)
- **last run** — date + one line of what changed

## why this exists

Research docs were dead weight: written once, never revisited. A procedure turns a research doc
into a living ref with an owner, a cadence, and a script that consumes it — and saves Dima
re-printing the same asks each time.
