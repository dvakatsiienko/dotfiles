---
name: rl-prompt-review
description: Reviewing a benchmark-task prompt (instruction.md) — before the Task + Prompt Review gate, when checking a draft for over- or under-specification, and when calibrating one against the measured corpus of merged prompts.
version: 1.1.0
---

# Reviewing a task prompt

## Where the rules live

**The prompt rules are not in this skill.** They live in
`x:rl-task-authoring` → `references/prompt-writing.md` — style target, the
specify/don't-specify boundary, scope language, iteration rules, worked reviewer
feedback. Read it before reviewing. This skill owns the *procedure*, the measured
corpus, and the guards that stop a review from producing confident nonsense.

`references/corpus.md` holds the five real prompts with their measured shape. It is the
calibration reference — consult it whenever a finding depends on "prompts usually…".

## Verdict, not score

This skill does not emit a 0–100 score, and reviews that do are miscalibrated in a
specific, reproducible way: they turn **descriptive statistics into prescriptive
thresholds**.

"Half of merged prompts sit between 190 and 470 words" is an interquartile range — half
of merged prompts fall outside it *by construction*. "72% quote real identifiers in
backticks" means 28% of merged prompts do not, and two of the five corpus prompts have
zero backticks. Deducting points for either penalizes the reference corpus.
`references/corpus.md` records what a naive scoring rubric does to these five prompts:
it flags the reference prompts and spreads known-good material across 40–100.

Statistics report **position in a distribution**. They never deduct.

## Mode

Check whether the verifiers exist yet.

- **Pre-verifier** (gate ① — the usual case when a prompt is first posted): run every
  pass except the forward half of Pass 2. Instead, flag each identifier that looks like
  something a test will need to call.
- **Post-verifier**: run everything. Pass 2 is the highest-value check available and it
  is only possible here.

## Pass 1 — the synthesizing test, done blind

The guide's 🟣 check, made into an artifact rather than a thought.

Read **only the prompt**. Before opening the verifiers, the solution, or any notes,
write down what you would build from it — the concrete list of behaviors, names, and
decisions an engineer would commit to. Then diff, in both directions:

- On the check list, missing from the build list → **a requirement the author kept in
  their head.** Under-specification. This is what fails a correct solution.
- On the build list, never asked for → **over-specification.** Their solution was
  written for them.

Order matters. Reading the verifiers first contaminates the build list with what you
now know is expected, and the pass silently becomes worthless.

> If the same session wrote or edited this prompt, it will re-derive its own
> justifications instead of questioning the premise — the same blindness documented for
> solution self-review. Do this pass cold, or hand the prompt to a fresh agent with no
> other context.

## Pass 2 — name coupling, both directions

Verifiers may never assert an internal name. So **every name a test must call has to be
in the prompt.** This is the mechanical link between prompt wording and verifier design,
and it is the single most common way a task fails a correct solution.

- **Forward:** for each identifier the verifiers assert — option values, entry points,
  flags, endpoints, status codes — confirm it appears in the prompt. A missing one means
  a genuinely correct solution fails on **naming rather than behavior**. That is the
  `teleport-ttl` failure mode, and it is always blocking.
- **Backward:** for each identifier in the prompt, confirm a verifier needs it or it is a
  real public-interface anchor. Anything else is prescribed internals.

The worked example, from the shipped `vite-wintertc-middleware` prompt — two edits after
approval, in **opposite directions for the same reason**:

- **Cut** "including duplicates" — the standard already determined the answer, so the
  phrase either said nothing or pushed the implementer past the standard `Headers` class.
- **Added** `server.fetch(request)` — arbitrary, and a verifier depends on it, so it had
  to be stated.

Remove steering when the standard already determines the answer; add it when the answer
is arbitrary and a verifier depends on it.

## Pass 3 — the gate checklist

The ten items reviewers actually apply, from
`the harness docs (reference/checklists.md)`. Evaluate each with judgment —
several cannot be keyword-matched:

- [ ] Written by hand (AI only for grammar/polish)
- [ ] Realistic ticket tone; not vibe, not over-prescriptive
- [ ] States outcomes/contract (endpoints, status codes, error shapes, invariants)
- [ ] No "you are working on X" — assumes codebase knowledge
- [ ] Doesn't ask for tests or docs
- [ ] No pasted rules/skills/harness instructions
- [ ] **Ambiguities pinned** (replay behavior, conflict semantics, boundary resolution)
- [ ] Another engineer could reach a behaviorally-equivalent solution from it
- [ ] No regression-guards like "all previous behavior stays the same" — **unless needed**
- [ ] Only includes details a senior engineer cannot extrapolate from the request

Two carry escape hatches that a matcher will get wrong. **"Ambiguities pinned"** is the
most under-weighted item in the whole gate: if the prompt leaves a fork that two
competent engineers resolve differently, the verifiers must then adjudicate between two
defensible answers, and one correct solution loses. **"Unless needed"** on regression
guards is real — a guard is needed when the task changes the shape of the thing being
guarded (`openclaw` and `typeorm` both carry one and both were accepted).

## Pass 4 — the senior-engineer line

Per sentence: *is this reasonable to expect without saying?*

The reviewer's speed heuristic settles most cases — see `prompt-writing.md`. If the author
worked something out quickly, from the repo, without deep prior knowledge, the agent gets
there too: **test it, do not prompt it.**

Reviewer's default question for any line that survives: *"Is this reasonable to expect
without saying? Could it be removed?"*

## Pass 5 — style calibration

Report position against `references/corpus.md`: words, paragraphs, headings, backticks,
scope line, concrete numbers. This pass produces **calibration lines, not findings**. It
escalates only where a position coincides with a real problem found in Passes 1–4 —
"short" is not a finding, but "short *and* three behaviors the verifiers assert are
unstated" is one finding with supporting context.

## Discriminations

Each guard exists because a naive review gets it backwards on a real reference prompt.

**Public API surface ≠ edge-case enumeration.** A bulleted list of endpoints, flags, and
their exact parameters is the 🟢 category — mandatory, in whatever shape reads clearly.
`medusa` enumerates eleven endpoints with request fields and status codes and was
accepted. What is over-specification is enumerating every *edge case* in a tidy grid so
the model transcribes instead of thinking, or dictating internal design. The test:
**would a verifier assert this name?** If yes it belongs. Flagging an API surface as
over-specification is actively dangerous — acting on it deletes the names the tests
require.

**Spec-level "should" ≠ hedging.** Hedging is "should ideally", "may want to consider",
"try to" — the model cannot tell what is graded. RFC-style requirement levels are not:
`typeorm` uses "must" and "should" with consistent discipline across five sentences.
Check whether must/should carry a stable distinction before calling it ambiguity.

**Permissive "may" ≠ hedging.** `openclaw`'s "occurrences missed while it was down *may*
catch up after restart only while…" grants permission and bounds it. That is a precise
requirement, not vagueness.

**Negative-space requirement ≠ scope exclusion.** `nextjs` says cold loads and hard
navigations "expose no client state" — that is a *tested behavior on the other side of a
boundary*, not a statement of what is out of the job. Do not credit it as a scope line,
and do not treat its absence as a missing one.

**First-person framing is not preamble.** `openclaw` opens "I rely on OpenClaw's
scheduled jobs…" — a user-story voice stating the present-tense problem directly.
Preamble is "This task involves implementing a robust and comprehensive solution for…":
words before the problem starts. Judge whether the first sentence carries the problem,
not whether it is written in third person.

## Severity

- **Blocking** — fails a gate checklist item, or breaks grading. A name a verifier needs
  is absent; an unpinned ambiguity the verifiers would have to adjudicate; asks for tests
  or docs; pasted harness rules; over-specification dictating internal design; a broad
  verb with no observable contract.
- **Judgment call** — deviates from convention or distribution but has a defensible
  reading. Give **FOR and AGAINST**, then let the author decide. Do not resolve it.
- **Calibration** — position only, no verdict.

**The calibration guard, applied before emitting any blocking finding:** if a trait is
shared by a reference prompt in the corpus, **it cannot be blocking.** Missing backticks
is the canonical case — `openclaw` and `vite` both have zero and both were accepted, so
it is at most a judgment call. Word count outside the middle-half band is never blocking
on its own. When a finding would block a corpus prompt, the rule is wrong, not the
corpus.

## What to hand back

The prompt stays **hand-written by the author** — near-zero AI authorship is the one
firm rule in `prompt-writing.md`, because generated prose reads as slop and biases the
task.

So: quote the offending span, and **show deletions verbatim** — a cut is unambiguous and
carries no new authorship. For anything missing, describe *what it must pin down* and
why a verifier needs it. Do not hand over drop-in replacement prose.

## Output format

```
VERDICT: ship | fix-first | rework

BLOCKING
- <finding>. <why it breaks grading or which gate item it fails>
  CUT: "<verbatim span>"          (when the fix is a deletion)
  NEEDS: <what must be pinned>    (when something is missing)

JUDGMENT CALL
- <observation>
  FOR:     <the case for leaving it>
  AGAINST: <the case for changing it>

CALIBRATION
  words       <n>  vs corpus 66–263 (median 236)
  paragraphs  <n>  vs corpus 1–6
  backticks   <n>  vs corpus 0–47 (2 of 5 have none)
  scope line  <y/n> (1 of 5 in corpus)
```

`ship` = no blocking findings. `fix-first` = blocking findings, all locally fixable.
`rework` = the prompt's contract is not gradable as written.
