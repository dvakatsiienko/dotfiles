# The golden solution, and how to review it

## The quality bar

The golden patch is not just "code that passes." It is **fed into the training loop as
the reference for what good looks like**, and it is reviewed by humans at gate ② for
whether a maintainer would merge it. Mergeability *"takes a large percentage"* of the
evaluation.

So the bar is: a diff the repo's own maintainer would happily merge. Idiomatic, complete,
edge cases handled, following the codebase's existing patterns rather than inventing a
parallel path.

Build it with the best tools available — multiple agents, multiple turns, a second agent
to review — but **strip all of that from the task itself**, because the evaluation
measures the raw model in a minimal harness.

## Scale

Secondary heuristic from the idea checklist: **600+ LoC across 7+ files, excluding tests
and docs.** Count production code only — this is easy to get wrong by including the
solution's own tests.

Numbers are indicators, not gates. A 100-line solution may still be hard; a 3,000-line
solution that could have been 200 is simply a bad solution. But real feedback from
review: a task at 224 additions drew *"not looking promising"*; the same task reworked to
~532 net LoC got *"sounds great!"*.

If a task proves under-scoped, look for **natural extensions** — omitted file types,
compatible backends, related commands, end-to-end composition, previously excluded
behavior. Do not stack unrelated requirements into a "feature salad."

## Tests inside `solution.patch`

The docs say production only, zero test files — stated in three places. A reviewer
relaxed this in review threads, then partly walked it back:

> *"You're free to write whatever tests (new or modified) in your solution patch, whatever
> you think is needed for a truly great, complete solution. They just won't be used for
> scoring, but that's ok."*

then, asked whether the solution should mirror the test patch:

> *"We're not necessarily looking to do that. We're usually adding anywhere from 30 to 80
> tests in the test patch, and that would be a bit overkill for a solution… So maybe the
> directive is to **loosen up a bit on the testing side of things in the solution
> patch**."*

**Net:** a handful of focused, idiomatic tests in the golden patch is welcome; mirroring
the verifier suite is not. Some builders exclude tests entirely and are not corrected —
both shapes are currently accepted. Expect this to keep evolving.

The packaging checklist in `environment-and-packaging.md` reflects this: no *verifier*
files in `solution.patch`, but repo-native tests are permitted.

If including tests, **match the target repo's own testing scale and idiom**. Check what
comparable test files in that repo look like — a file three times larger than anything
around it reads as alien regardless of quality.

---

# Reviewing a golden patch

Findings from seven review rounds on a real task. The pattern was stark:

**Every round that used a *new* technique found something. Every round that re-ran an
existing technique found nothing.**

| Technique | Yield |
| --- | --- |
| Read the code critically | 8 issues (first pass only) |
| Run the project's own tooling | 2 issues, one crash-class |
| Re-run the above | nothing |
| **Hostile-input probing** | **2 issues, one process-killing crash** |
| Re-run everything after fixes | nothing |
| Integration + concurrency + malformed input | nothing |
| Real user-facing path | nothing |

Repetition feels like diligence and produces zero information. Value comes entirely from
**changing the angle**.

## Stopping: the loop condition

The rounds above were driven by a *subjective* stopping criterion — "review it again" — and
that is the bug. A model asked to find problems will find problems indefinitely; it is
sampling a noise distribution, not converging. Observed on a real golden patch: ~9 findings,
then 2–3 more, then "green", then more on the next pass, across roughly 6–7 rounds each
needing a manual relaunch.

The obvious fix is to loop on ground truth instead: iterate until `run-oracle` returns
reward 1 **and** `run-baseline` returns reward < 1. Necessary, and objective — but **not
sufficient, and it is important not to over-trust it.** On that same task both conditions
held for the entire time four latent bugs sat in the shipped patch. Calibration proves the
tests are **satisfiable**, not that the code is **correct**; it can only ever tell you about
behavior some test already exercises.

What actually converged it was **writing new verifier tiers** — objective (a test passes on
gold or it does not) *and* terminating (a tier is finite), while driving code paths no
previous round touched. So:

- **Loop on tests, not on opinions.** A new test tier is a stopping criterion; "review it
  again" is not.
- **Reserve self-review for what tests structurally cannot catch** — mergeability, code
  quality, gameability.
- Two consecutive clean passes *on different angles* is a reasonable bar; two identical
  ones prove nothing.

## Ranked by what actually finds bugs

### 1. Hostile-input probing — highest yield by far

Deliberately misuse the API the way a careless caller would, then check the process
survives. Call terminal operations twice, abort mid-stream, cancel the consumer, push
thousands of chunks through a slow reader, send unusual methods and statuses, feed
garbage.

On the real task this found the worst defect in the whole exercise: a middleware calling
`res.end()` twice **killed the entire dev server** via an unhandled stream `'error'`
event. It survived 60 passing tests, three earlier review rounds, and two full Docker
calibrations — because nothing in any of them ever misused the API.

Tests encode what was expected. Bugs live in what was not thought of. Hostile probing is
the only technique that systematically explores that space.

### 2. Run the target repo's own tooling

Before reviewing logic, run everything the repository runs in CI or a pre-commit hook.
Not the tools of habit — **theirs**.

On the real task, ESLint had been run from round one but the repo's **formatter never
had**, and it was enforced by a pre-commit hook. Four of five files failed. The patch was
un-mergeable by construction while looking perfectly fine. The linter also surfaced a
runtime-compatibility question no amount of reading would have raised — with an
established in-repo answer.

Checklist: formatter, linter, type-check, full test suite, metadata validator.

**Run every one of them, and confirm each actually ran.** On a later iteration of the
same task, `tsc` turned out never to have been run at all: the golden patch carried two
type errors and was **un-mergeable by construction** in a repo whose CI type-checks —
while the notes recorded "tsc clean". Partial tooling gives a false all-clear that is
worse than no check, because it stops anyone looking again. When a note claims a gate
passed, re-run it rather than trusting the note.

### Writing the tests is itself a review technique

Broadening a verifier suite is usually framed as difficulty tuning, but it doubles as the
cheapest hostile-input probe available: each new test drives the code the way a real
consumer would, on a path nobody exercised before.

On a real task, adding three verifier tiers to already-shipped, calibrated, twice-reviewed
code surfaced **three latent bugs in the first run** — a missing `req.socket` that crashed
the server through a dependency's error path, a header API that silently produced garbage
in one of its documented call forms, and a cancellation path that hung forever. None were
found by seven rounds of review, because every round tested the same surface.

So when a task is "too easy", write the missing tests before extending the feature. The
score moves *and* the solution gets better, and the extra lines the reviewer called bloat
turn out to be the part that was right.

### 3. Critical reading — good yield, first time only

The first careful read produced eight findings including a genuine hang. Reading is
strongest at spotting what is *absent* — a missing value in a set, an unhandled path, a
comment describing the wrong field. It is weakest at dynamic behavior. Re-reading the
same code finds essentially nothing.

### 3.5. A different model as adversarial reviewer

Explicitly recommended:
> *"If you do your solution using Claude, maybe GPT can find flaws with it. You can do some
> adversarial checks with your agents — where is this going wrong? Is this in line with my
> prompt? Are there things that are too out there that are unfair? … use us, use yourself
> and your agents as multiple perspectives."*

It works: on the real task a second model reviewing the packaged zip flagged something
every self-review had walked past, because the author had a reason for it and kept
re-deriving that reason instead of questioning the premise.

**A fresh reviewer has no investment in the reasoning.** Expect it to be wrong sometimes
— treat findings as leads to verify, not verdicts.

### 4–5. Integration/concurrency, and the real user path

Real consumer library, concurrent requests checked for cross-talk, unicode and very long
inputs, idempotent teardown. Then drive the actual thing a user touches. Both found
nothing on the real task, but they are the passes that would catch response bleed, leaked
handles, or a defect living outside the code under review — cheap insurance, one pass
each.

## Practical rules

- **Stop when a genuinely new technique finds nothing.** Two consecutive *different*
  clean passes is a reasonable bar; two identical ones prove nothing.
- **A fix is unreviewed code.** On the real task, abort handling added in round 1 caused
  the hang found in round 4. Every fix restarts the clock — re-probe what changed.
- **A bug found deserves a test**, placed by cost. Crash-safety and abort cases went into
  the solution's native tests and were kept *out* of the verifier suite, because a
  hanging test burns the full timeout on every baseline run for every model, forever.
- **Automate the check, not the judgement.** A regex trim of a test suite corrupted a
  file by matching a nested closing brace; lint caught it. Prefer line-anchored or
  parser-based edits, and always re-lint after a scripted rewrite.
- **Verify, do not reason, about runtime behavior.** "The stream should settle on abort"
  was wrong; a four-line script proved it hung, in seconds.

## Ordering for a review pass

1. Green baseline: formatter, linter, type-check, full suite, metadata validator.
2. One critical read of the whole diff.
3. Hostile-input probing — budget the most time here.
4. Fix, then re-probe *only what changed*.
5. One integration/concurrency pass.
6. One real-user-path pass.
7. Stop when step 3 or later comes back clean on a new angle.
