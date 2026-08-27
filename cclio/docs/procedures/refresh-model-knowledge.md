# refresh-model-knowledge — procedure

Keeps the model knowledge current across the fleet: which model does what best, at what price,
spawned how. Lands what [DOT-130](https://linear.app/x-com/issue/DOT-130) asked for. Procedure
entity per [_spec.md](_spec.md).

## the want (dima's — ❓ pending his words; candidate from DOT-130)

> ❓ awaiting dima's statement. candidate from his ticket asks: model routing decisions (who
> codes, who writes, who researches) must rest on current facts, not vibes from launch week —
> per family track latest + prev gen; a new model shifts the ladder, never silently replaces it.

## research vectors (from DOT-130, dima's wording — re-groom each run)

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
