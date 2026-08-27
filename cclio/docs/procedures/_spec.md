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
- **artifacts** — the pristine distilled docs this procedure maintains, listed by path.
  📌 **The procedure points at its artifacts; it never houses them.** Artifacts live where
  their READERS expect them (`docs/agents/models.md` beside its consumers, skills in their
  plugins). Raw research is transient: distilled into the artifacts, then deleted — a research
  doc kept beside its pristine version is sediment.
- **the run** — the execution script. Agents own it.

## the four phases, always

1. **research** — spawn against the current research vectors.
2. **distill** — CLEVER-MERGE findings into the artifacts: keep the useful existing data,
   merge in only the useful new; two runs back-to-back may both yield keepers — all good stuff
   goes in. Avoid bloat, but completeness outranks thinness. Raw researcher output dies here.
3. **eval + findings** — self-eval the merged picture and print Dima the delta: anything new
   worth trying? does a downstream artifact need a refresh? A run that ends without this
   printout did not finish.
4. **resolve** — with Dima, by outcome: what the findings say gets done, folded, or dropped.
   **Noop is a first-class outcome** — a run that found nothing new applies nothing; tweaking
   afterward is never a must.

## file shape — one flat file per procedure

`cclio/docs/procedures/<name>.md`, entity-first name. Sections: the want · research vectors ·
artifacts · the run · cadence · last run. A folder appears only when a procedure needs its own
assets (a bench corpus, samples) — then `<name>/procedure.md` plus the assets.

«Run the refresh-writing-for-humans procedure» = open the file, follow it.

## why this exists

Research docs were dead weight: written once, never revisited. A procedure turns research into
pristine, maintained artifacts with an owner, a cadence, and a script that consumes them — and
saves Dima re-printing the same asks each time.
