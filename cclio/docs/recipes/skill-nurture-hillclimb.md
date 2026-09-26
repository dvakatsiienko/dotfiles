# skill-nurture-hillclimb — recipe (parked)

⏸️ **parked, not a recipe yet.** written when there is a real run to do — until then this is the
shape, nothing more. the `_spec.md` fields (the want, vectors, cadence, last run) are filled at
that first run, the want in dima's words.

sibling of [memory-nurture](memory-nurture.md): that one grooms what a skill says, this one
measures whether a skill fires and is followed, and improves it against the measurement.

## the proposed shape

- **trigger** — a skill miss shows up: a flawlog «skill not loaded» line, or a `jev` router
  near-miss (0.30–0.70) on a prompt that should have loaded it.
- **cases** — dima's real prompts for that skill as `plugin-x/evals/<skill>-*` cases, split into a
  train set and a held-out test set (the existing `cmt`/`notes`/`pm` cases are the pattern).
- **baseline** — `claude plugin eval` on both sets before any edit.
- **the loop** — change ONE thing (usually the description's trigger words), rerun train; keep the
  change only if train rises and test does not drop; log each round in `docs/vet/`.
- **stop** — a round count or a spend cap set before the first run.
- the same loop runs in small at every halt for jev (`memory/sys-jev.md`, the sharpening loop) —
  point there, never restate it.

## prior art here

- the cmt trigger went 1/12 → 12/12 and notes 2/9 → 9/9 on description edits alone (2026-09-12) —
  memory-nurture step 4.5 carries the measured eval mechanics (~$5 a skill, `--runs 3`).
- `/claude-api hillclimb` is the api-app version of this loop; its train/test split and
  one-change-per-round discipline are what is borrowed, not the tool.
