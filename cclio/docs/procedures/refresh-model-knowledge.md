# refresh-model-knowledge — procedure

Keeps the model knowledge current across the fleet: which model does what best, at what price,
spawned how. Lands what [DOT-130](https://linear.app/x-com/issue/DOT-130) asked for. Procedure
entity per [_spec.md](_spec.md).

## the want (dima's, 2026-08-27)

> i want awareness of picked models (mine and ours, fleet interest — haiku 4.5, sonnet 5,
> opus 5, fable 5) to be up to date. know strengths and weaknesses of each. best types of work
> each model is best at. the outcome lives at models.md. the data is for me, and for you as a
> coord to pick the right model. any other fleet member only peeks there if i ask something
> about which model.

## research vectors (derived from the want + DOT-130's asks — re-groom each run)

- re-validate core capabilities of haiku / sonnet / opus / fable current gen — what each does best
- best-fit per research activity type — which model for which research genre
- bake the model-split reasoning against real data; verify assumptions → fact-based
  model-spawn strategy map per task type
- new models, new benchmarks, price changes since last run

## artifacts (pointed at, never housed)

- `docs/agents/models.md` — THE model reference: cards, spawn defaults, dima's live task→model
  calls. Distill everything here; claim tags ([dima]/[bench]/[vendor]/[community]/[?]) never
  deleted, only updated.
- `cclio/memory/craft-spawning.md` carries the resident distillate — check it agrees after
  every refresh.

## the run

1. re-groom the research vectors with Dima
2. spawn researchers per vector (benchmarks + community patterns + vendor claims, tagged)
3. distill: clever-merge into `models.md`; raw output dies; Dima's [dima]-tagged calls are
   never overwritten by outside evidence — they sit beside it
4. eval + print findings: ladder moved? spawn defaults challenged? craft-spawning drifted?
5. resolve with Dima by outcome; noop is first-class

## cadence

Event-driven: a new Claude model ships, a major benchmark lands, or a spawn decision feels
stale. No timer.

## last run

2026-08-27 — procedure created from the standing docs (models.md already pristine;
`claude-model-strengths.md` research doc retired into it). No fresh research spawned.
