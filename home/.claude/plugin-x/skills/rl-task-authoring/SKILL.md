---
name: rl-task-authoring
description: Authoring RL benchmark tasks for coding agents (hidden verifier). Use for any task-package part (instruction.md, solution.patch, verifiers, task.toml, Dockerfile), oracle/baseline calibration, eval harness/Harbor, task-difficulty/verifier-fairness diagnosis, or work inside a golden checkout.
version: 1.1.0
---

# Benchmark task authoring

## What this is

A **benchmark task** is a backend-engineering problem packaged so a coding agent can be
dropped in blind and graded automatically: a hand-written prompt, a production-quality
reference solution, and hidden behavioral tests. Sold to AI labs as RL environments, where
the score becomes a training signal.

**This practice is genuinely new.** There is little public material on it, and the
written spec is actively evolving — review threads and live meetings have already overridden the
docs more than once. Treat the docs as the primary reference and the strongest default,
but not as gospel: a better idea that contradicts a doc is a candidate for both
implementation and a doc update.

## The verifier is the product

These tasks are sold as **RL environments**: a model attempts the task, the verifier
returns a reward number, weights update, repeat millions of times. Nobody tells the model
*how* to solve anything — it discovers what scores well, and the verifier hands out that
number. It is the training signal itself, not a gate in front of it.

Two consequences that decide most judgment calls:

- **A bad verifier is worse than no task.** One that can be satisfied by a shortcut teaches
  the model to identify what a test asserts and satisfy exactly that. See "Reward hacking"
  in `references/verifiers.md`.
- **What is being sold is separation** — that a stronger model scores measurably higher
  than a weaker one. Most rules in this skill trace back to protecting it; `process.md`
  has the mechanism for each.

## The shape of a task

```
tasks/<task-id>/
  task.toml                 metadata + base commit + resource limits
  instruction.md            THE PROMPT — the only thing the model ever sees
  environment/Dockerfile    offline image, repo pinned at base commit
  solution/solution.patch   reference solution (production code)
  solution/solve.sh         applies solution.patch
  tests/test.patch          hidden verifiers + the /app/test.sh entrypoint
  tests/test.sh             outer harness: applies test.patch, writes reward.json
```

## How grading actually works

1. The eval harness builds the Docker image.
2. An agent is dropped in with **only `instruction.md`** — no internet, no sight of the
   solution.
3. The agent works until it stops.
4. `test.patch` is applied and run.
5. **Score = new tests passed / total new tests.**

Binary pass/fail exists only for calibration (oracle must reward `1`, baseline `< 1`).
Beyond that, ignore red/green and read the *rate*. Aim for **~20–60% on a strong model,
differentiated across model tiers**. 100% everywhere means too easy or too prescriptive;
identical scores everywhere means the tests are probably testing implementation.

Pre-existing repo tests never count. Only authored tests score.

## Lifecycle

Ideation → prompt → environment → solution → verifiers → calibration → packaging → PR
→ fine-tuning on the eval harness.

Prompt review happens **first**. Do not build the solution before the prompt *premise* is
approved — but once it is, iterating the prompt and the golden patch in parallel is
explicitly fine, as long as implementation details never leak into the verifiers. Full
detail in `references/process.md`.

## The four things that decide whether a task succeeds

**1. Difficulty.** Target 2+ full days of pre-AI work for a senior engineer with no
prior context in that repo. Secondary heuristic: **600+ LoC across 7+ files, excluding
tests and docs** — count production code only. Under-scoped tasks are the most common
rejection.

**2. Prompt precision.** State the observable contract; leave implementation open. The
single hardest judgment is what to state and what to leave out — see
`references/prompt-writing.md`.

**3. Verifier fairness.** Assert behavior only. A behaviorally-correct solution with a
completely different internal design must pass in full. See `references/verifiers.md`.

**4. Solution mergeability.** The golden patch is training data and is reviewed by
humans for whether a maintainer would merge it. Quality is weighted heavily. See
`references/solution-and-review.md`.

## Hard rules

- **Never push a solution, branch, or commit to the source project's upstream, and
  never open an upstream PR.** Public or private, no exceptions. Contamination destroys
  the dataset's commercial value.
- Models can read git history, **including commits newer than the base commit**. Pin the
  base commit and keep future history out of the image.
- Prefer genuinely new work — unmerged, unsolved, or never-going-to-be-fixed. Not a
  reproduction of a merged PR.
- Runtime is airgapped. Everything the task needs is baked in at image build time,
  including any package the verifiers import.
- The base commit must match exactly across `task.toml`, `environment/Dockerfile`, and
  `tests/test.sh`.
- `solution.patch` = production code. `test.patch` = verifiers + `/app/test.sh`. Mixing
  them is the single most common way a task silently scores 0.
- **`instruction.md` is written by hand by the task author** — near-zero AI authorship.
  Assist freely everywhere else. Never edit `instruction.md` unprompted; propose wording
  and let the author decide.

## Working method

**Verify, do not reason, about runtime behavior.** A four-line script settles in seconds
what an argument cannot settle at all. This applies to header semantics, streaming,
abort handling, and anything else where the platform's actual behavior matters.

**Grep the target repo before designing.** Establish how the option, API, or subsystem
is used today — every call site, every existing test — before writing code that extends
it.

**Read the target repo's merged *and rejected* PRs.** Rejected ones reveal what
maintainers will not accept, which is what the solution-quality gate judges.

**Run the target repo's own tooling** — formatter, linter, type-check, full suite —
before considering a solution done. Not the tools of habit; theirs.

**Design the verifier while writing the prompt, not after.** If a requirement cannot be
tested behaviorally, either pin it explicitly in the prompt or drop it. Deciding this late
is what produces a prompt whose tests need names it never stated.

## Key commands

Run from the dataset repo root. Full usage, flags and surrounding context in
`references/environment-and-packaging.md`.

```bash
scripts/scaffold-task.py <task-id> --repo org/repo --base-commit <40-char-sha>
scripts/run-baseline.py  <task-id>          # must give reward < 1
scripts/run-oracle.py    <task-id>          # must give reward 1
python3 scripts/validate-task.toml --task <task-id>

export OPENAI_API_KEY=<key>                 # gauge difficulty without the eval harness
uv run scripts/mini-task-runner.py tasks/<task-id>
```

## Where to go for what

| Situation | Read |
| --- | --- |
| Picking or sizing a task; ideation checklist | `references/process.md` |
| Why a rule exists; what makes a task valuable | `references/process.md` |
| Model scored 0 or 100%; reading a multi-model run; trajectories | `references/process.md` |
| Writing or reviewing a prompt | `references/prompt-writing.md` + `examples/instruction-annotated.md` |
| Writing verifiers; "are my tests fair?" | `references/verifiers.md` |
| Reward hacking; gold-sanity gate; measuring hackability | `references/verifiers.md` |
| Building or reviewing the golden patch; when to stop reviewing | `references/solution-and-review.md` |
| Dockerfile, patches, calibration, packaging | `references/environment-and-packaging.md` + `examples/` |
| Running a task locally under Harbor | `references/environment-and-packaging.md` |
| Wanting a full concrete case study | `references/worked-example.md` |

## Keeping this skill current

This skill reflects the practice as of **August 2026**, drawn from a harness spec, four
recorded training sessions, reviewer feedback, and one task carried end to end. The
practice is young and moving — reviewer guidance has already overridden written spec more
than once, and **testing guidance is the fastest-moving part**.

**Treat this file as living. Propose an update whenever new durable guidance appears —
without waiting to be asked.** Concretely, propose an edit on any of:

- A reviewer states a rule, corrects one, or answers a question in a review thread
- New meeting notes land (a shared transcript)
- Something here turns out to be **wrong**, or contradicts a live instruction
- A decision gets made with reasoning worth preserving — especially one that departs
  from the docs
- A technique demonstrably works or fails during real task work
- The docs tree itself changes

What belongs here versus elsewhere:

| Goes in this skill | Goes in project notes |
| --- | --- |
| Rules, heuristics, reviewer quotes, techniques | Current task status and open items |
| Anything that generalizes to the *next* task | Anything true only of *this* task |
| Traps found the hard way | Meeting IDs, links, run logs |

Propose the edit with the source attached (who said it, where), and let the user decide.
Preserve provenance — the reasoning outlives the rule, and rules here get overridden.

When a rule in this skill conflicts with a live instruction, **the live instruction
wins** — then flag the conflict and offer to update the skill.
