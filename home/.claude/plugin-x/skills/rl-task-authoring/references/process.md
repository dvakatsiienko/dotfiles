# Lifecycle, gates, and fine-tuning

## Lifecycle

1. **Ideation** — find a task, check it against the idea checklist, post it for review.
2. **Prompt** — write `instruction.md` by hand; get it approved *before* building.
3. **Environment** — scaffold, pin the base commit, build the offline image, clone a
   golden checkout.
4. **Solution** — build the golden patch to merge quality in the golden checkout.
5. **Verifiers** — write the hidden tests.
6. **Calibration** — oracle passes, baseline fails.
7. **Packaging** — the two-patch split, metadata validation.
8. **PR** — open against `dev` early, even unfinished.
9. **Fine-tuning** — run on the eval harness, read scores and trajectories, tune.

Steps overlap in practice. Iterating the prompt and solution in parallel is fine. What
does not overlap: **do not build the solution before the prompt premise is approved.**

## Effort distribution

Follows from the verifier being the product (see `SKILL.md`):

- **Verifier ~40%** — the actual deliverable
- **Prompt ~25%** — hand-written, near-zero AI
- **Solution ~20%** — but not 20% of *standards*, see below
- **Environment + calibration ~15%**

The solution is partly just a validity proof — oracle green ⇒ the environment is solvable
and the tests are satisfiable. But buyers weight maintainer-mergeability heavily, which
suggests it also serves as demonstration data. So: a fifth of the effort, none of the
leeway.

## Why the rules exist

Knowing the mechanism makes ambiguous cases decidable. Every rule below traces to
**separation** — whether the score distinguishes a strong model from a weak one, which is
the thing labs actually buy.

| Rule | Surface reason | Mechanism |
| --- | --- | --- |
| **20–60 tests, not 10** | "better coverage" | **Resolution.** With N tests the finest observable score difference is 1/N. Ten tests cannot resolve a 5% capability gap; forty can. You need enough tests to *sample* the separation you are selling. |
| **Score spread across models** | "calibrates difficulty" | This *is* the product. All models at 0, or all at 100, means zero separation and no gradient to train on. |
| **Aim 20–60%** | a target band | Not a separate rule — it is **where separation has room to exist**. At 94% the whole ladder is compressed into the top 6% of the range, so ordering becomes noise. |
| **Partial credit** | "fairness" | Reward shaping: a slope to climb instead of a cliff. |
| **Behavior, not implementation** | "don't be too strict" | An implementation-coupled test grades the author's taste, which every model passes or fails roughly equally — **separation collapses**. It also trains imitation of naming over reasoning about behavior. |
| **Reward hacking defenses** | "catch lazy solutions" | Most important, least obvious — see `verifiers.md`. |
| **Never push solutions upstream** | "keeps data sellable" | A memorized solution produces zero learning signal and silently invalidates any eval built on it. |
| **Long horizon / 600+ LoC / 2+ senior-days** | "we want hard tasks" | Short tasks are **saturated** — frontier models already ace them, so separation is zero before you start. |
| **Don't pick heavy repos; keep tests fast** | "convenience" | Run cost is a direct multiplier — every task executes thousands of times across rollouts. |

## What makes a task valuable

> **SPECULATIVE.** A reverse-engineering of what labs buy, never validated against an
> actual buyer. **Do not present it to a client as established.** Use it as a decision
> heuristic, not a fact.

**Gates first.** Each is binary; any failure makes the task worth ~zero regardless of
everything else, so these are never traded against the gradient below.

| Gate | Measured by |
| --- | --- |
| Solvable | `run-oracle` → reward 1 |
| Discriminating at all | `run-baseline` → reward < 1 |
| Not hackable | the attack loop in `verifiers.md` — any successful exploit ⇒ fail |
| Not contaminated | the solution is not public |

**Then one gradient, and it is observable:**

```
value ≈ separation ÷ run cost
```

**Separation** = the spread across the model ladder from an actual multi-model run
(`strongest_rate − weakest_rate`), valid only when the ladder is monotonic. One number,
computed from a run, not judged.

Everything else is a gate, a *cause* of separation, or a constraint on measuring it —
which is why they are not multiplied together as independent factors. Test count is
resolution, not a co-factor. Horizon length causes separation rather than adding to it.

**Using it.** When two design choices compete: does either break a gate → does either
raise expected separation → prefer the cheaper to run.

**It makes checkable predictions**, which is the point. Broadening verifier coverage
without touching the golden patch should *raise* separation on the next multi-model run.
If it does not, the model is wrong and that is worth knowing.

**A published alternative**, for triangulation — an Environment Quality Score:

```
EQS = 0.35·V + 0.30·(1−H) + 0.20·F₁ + 0.15·D      KEEP > 0.70 · FIX 0.40–0.70 · DROP < 0.40
```

where V is verifier discrimination over candidate patches, H empirical hackability, F₁
judge-vs-execution agreement, D cross-model learnability. Its author states the weights
were untuned and the KEEP/FIX/DROP split is a policy choice, so treat the numbers as
directional. It agrees with the model above on the two things that matter: discrimination
dominates, and hackability is the second-largest term rather than a finishing touch.

## The idea checklist

- [ ] Long-horizon: 2+ days of pre-AI work for a context-free engineer
- [ ] Expressible as functional requirements without hand-waving
- [ ] From real engineering work in a real, preferably active codebase
- [ ] Difficulty from investigation and system depth, not artificial constraints
- [ ] Touches real code in several places: **600+ LoC across 7+ files, excluding tests
      and docs** (secondary heuristic)
- [ ] NEW / uncontaminated — an open gap, not already merged upstream
- [ ] The author knows the codebase well enough to judge maintainer acceptance
- [ ] Repo, tests, logs, docs and fixtures provide enough evidence — no hidden niche
      knowledge required
- [ ] Popular language (TypeScript/Python first, Go fine, Java acceptable; avoid PHP)
- [ ] No live network needed to solve or verify
- [ ] The environment is proportional — one container, not an orchestra

**Repo selection:** the *task* should be the hard part, not the repository. Avoid setups
that need many services or extremely slow compilation. Inventing a feature is fully
valid — an open issue is an easier discovery path, not a requirement. Once a repo yields
one good task, look for more in it: less setup overhead, easier review, and the golden
solutions get better as the codebase becomes familiar.

**If it feels easy during ideation, it is.** Reviewers will ask what evidence suggests
otherwise. Maintainer comments, abandoned attempts, cross-cutting changes, or a concrete
functional breakdown support the case. A long, complex solution supports it more.

## Review gates, in order

1. **Task + prompt review** — is the idea long-horizon, and the prompt realistic and
   gradable? Happens first, before the solution exists.
2. **Solution code quality *and* verifier coverage** — do the verifiers cover the prompt,
   test behavior, reject shortcuts, and accept materially different correct solutions? Is
   the golden patch mergeable?
3. **Agent run scores and trajectories** — after fine-tuning.

Address feedback with technical rigor rather than performative agreement. If a suggestion
seems off, verify it against the behavior and the harness before implementing.

## What to submit with a task

- The full package: `solution.patch`, `test.patch`, and the task folder.
- **Red/green proof** — baseline and oracle numbers. This is the first thing a reviewer
  looks for.
- A **breakdown**: surfaces the solution touches → broad steps to pull it off → a time
  estimate. This is what reviewers ask for when judging feasibility.
- Anything that preempts an obvious question — a known limitation, a scope decision, a
  deviation from the docs and why.

## The eval harness

The flow: build the container → drop an agent in with only `instruction.md` → the agent
works → hidden tests applied → score. No internet, no sight of the golden patch. The
harness is deliberately **bare-bones, bash-only**, identical across models so scores are
comparable.

Re-uploading a pack **replaces it and resets calibration** — re-validate before model
runs count again.

## Reading the numbers

Calibration proves the task *grades*. Model runs prove it **separates** — a different
question needing different evidence. Full detail in `docs/09-running-and-fine-tuning.md`.

**Score = new tests passed / total new tests.** Binary pass/fail teaches nothing; beyond
calibration, red/green should not even be looked at — *"the binary pass/fail metrics don't
teach us anything… beyond the calibration phase, pass/fail and red/green shouldn't even be
looked at."* Chasing green and fleeing red is named as a pitfall.

**Aim ~20–60% on a strong model, with *different* numbers below it.** A reference range,
not a quota — separation matters more than any particular number, and lower is better as
long as the task is clean and the verifiers are honest. On a 51-test suite that puts the
strongest model around 10–30 passing, not 45+. A model at 94% is not a hard task with a
strong model on it; it is an easy task.

| Shape | Reading |
| --- | --- |
| ~20–60% on the strong model, clear gaps below | healthy — the target |
| 100% across models | too easy, or the prompt is over-prescriptive |
| **Identical scores across all models** | tests too narrow or testing implementation — everyone fails the same tests for the same non-behavioral reason. **Investigate those specific tests.** |
| 0% across all models | far-fetched, *or* the prompt is insufficiently specified, *or* the tests assert implementation |
| Weaker model consistently ≥ stronger | the verifiers reward guessing over engineering |

Note the asymmetry: a low score does **not** by itself mean a hard task. *"Asserting a
function name you came up with is sure to result in a low score, but that doesn't mean the
task is hard."* A good score means nothing either if the prompt or tests are bad. The
number is only interpretable once the verifiers are known-honest.

### Before drawing conclusions

- **Check effort levels are uniform.** A mixed-effort run is not a capability ladder. One
  real review reported sol 48/51 (medium), terra 50/51 (medium), luna 49/51 (**high**) —
  the bottom was lifted by effort, not capability, so the apparent flatness was partly
  artifact. *Flat-and-high* still held as a verdict; conclusions about *ordering* did not.
- **Run a spread of models** — strong and weak. Never judge difficulty from one run.
  Prefer cheaper models for test runs; there is owned budget there.
- **Repeat trials.** Reliability is a distribution across rollouts, not one lucky success.
- **Separate a failed run from an errored one.** Gateway errors and reasoning-arg quirks
  are tooling-side, not task difficulty. So is a model exhausting the ~100-step budget by
  looping — check the trajectory before blaming the task.

## Trajectories

Download as JSONL. Reading them is the core of fine-tuning. Classify each failure:

- **Structural** — cannot build, cannot run tests, fighting the environment, missing
  infrastructure. This is a task bug. Fix the environment or clarify the prompt.
- **Behavioral** — the model genuinely failed the engineering. This is the useful signal.

An AI-generated failure analysis appears on failed runs — a useful pointer, to be taken
with a grain of salt.

## Tuning levers, in priority order

1. **Verifiers** — the usual culprit. Too strict (implementation testing) → re-test the
   same behavior a different way. Too shallow → add edge and regression coverage.
2. **Prompt** — if a good solution needs a detail the prompt never stated, add it. If
   every model aces it, the prompt is probably over-specified.
3. **Environment** — if a model burns its step budget fighting dependencies, state that
   something is already installed, or fix the setup.

Step budget is a max (~100 steps typical); a model looping on tool calls can exhaust it —
check the trajectory. Prefer cheaper models for test runs before spending on others.

## When a task proves too easy

Look for **natural extensions** first — omitted file types, compatible backends, related
commands, end-to-end composition, previously excluded behavior. Removing a scope-limiting
line from the prompt is a clean lever. Do not stack unrelated requirements.

See also the scale discussion in `solution-and-review.md`.

Dropping a task is legitimate and common. Drop or backlog weak ideas early — cheaper to
abandon after a prompt than after hours of verifier work.
