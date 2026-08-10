# Writing verifiers

**The verifier is the product.** These tasks are sold as RL environments: a model attempts
the task, the verifier returns a reward number, weights update, repeat millions of times.
The model is never told *how* to solve anything — it discovers what scores well, and the
verifier is the thing handing out that number. It is the training signal itself, not a gate
in front of it.

A task with no verifier is untrainable however good the prompt is. A task with a *bad*
verifier actively teaches the model wrong things. That is why verifiers get the largest
share of the effort (see `process.md`), and why every rule below traces back to a mechanism
rather than to taste.

Verifiers define, permanently, what "correct" means for every future model graded against
the task. A sloppy verifier either lets a broken solution pass or unfairly fails a correct
one.

> ⚠️ **Testing is the most contested and fastest-moving area of this practice.** Nearly
> every rule below exists because a specific failure happened, and several have already
> been softened or qualified in review threads after the docs were written — the
> tests-in-`solution.patch` rule most visibly. The docs' constraints are not arbitrary
> conservatism; each encodes a real grading failure. But they are also **not settled**.
>
> When a testing rule here conflicts with a live instruction, the live instruction wins —
> then surface the conflict and update this skill. Do not silently follow either one.
> Reviewers have said outright: *"this is an ever-evolving thing."*

## The golden rule

**Assert observable behavior only** — HTTP responses, status codes, headers, returned
bodies, database rows reachable through the ORM, public events. **Never** assert a
private class name, method name, table name, file path, or internal call sequence.

Reusable framing for a harness: *"When writing tests, do not focus on individual helper
or private functions unless specified in the prompt. Instead, guarantee behavior by
testing public surfaces and APIs."*

**Public surface** = what a consumer can reach without opening the source: exported
entry points, documented config options, CLI flags, endpoints, return values, observable
behavior. **Not** public: module paths, unexported helpers, class internals, field
names, where code lives.

The operative check: **if a model solved this correctly but organized the code
completely differently, would this test still pass?** If no, it tests structure, not
behavior.

The corollary lives in `prompt-writing.md`: because no internal name may be asserted,
**any name a test must call has to be stated in the prompt.** Verifier design and prompt
wording are decided together, not in sequence.

### What the violation actually looks like

A builder's own account, from the sessions:

> *"My tests were too specific — two of them required a specific file to be modified. I
> had to test the same behavior a different way."*

Worth dwelling on, because this is the shape the mistake takes in practice. It is rarely
an obviously bad assertion on a private helper. It is a test that reaches for a **file
path** — asserting a module exists, importing from a specific location, or checking that
a particular file changed. That feels like behavior, because the feature does live in a
file, while actually grading layout: a model that put the same working code one directory
over fails.

The fix is the one in the quote — **test the same behavior a different way.** Not delete
the test. Whatever the file was meant to prove is reachable from the public surface:
drive the feature through its entry point and assert the result. If it genuinely is not
reachable that way, the behavior was never gradable, and the name belongs in the prompt.

Same trap, other forms: importing a helper by path, snapshotting a directory listing,
asserting where a config key lives rather than what it does, or counting files changed.

## Testing a platform contract without testing implementation

A shim, adapter or driver has to satisfy somebody else's published API — Node's
`ServerResponse`, a database driver's cursor, a framework's plugin hooks. Asserting that
API looks like implementation testing and is not: **it is the contract a third party
depends on**, not a name the solution invented.

Keep the distinction sharp:

- `res.appendHeader(...)`, `writeHead(status, rawArray)` → **Node's** contract. Any
  correct implementation exposes it, because middlewares call it. Fair.
- `adapter.toNodeRequest(...)`, `WebServerResponse` → **this solution's** names. A
  different-but-correct shape would not have them. Unfair.

Drive it through a real consumer rather than reaching into the object: register a
middleware that calls the API and reports what it observed into the response body, then
assert on the response. That keeps the assertion on observable output while still
covering the contract.

This tier is usually the highest-yield thing missing from a suite, because it is the part
a hasty implementation skips and a careful one gets right — exactly the gap a benchmark
should measure.

## Every test must fail at baseline — including the ones that never call the feature

A feature test that passes without the feature is testing nothing, and the failure mode
is subtle: it is never the test *body* that leaks, it is the setup.

Two real examples from one task, both caught only by reading the baseline log:

- A test asserting `close()` is idempotent **never invoked the feature's entry point**,
  so it passed on a server that had no feature at all.
- A test normalising "throws synchronously or rejects" through an async IIFE turned the
  *harness's own* "entry point is not available" error into a rejection — and passed at
  baseline for exactly the wrong reason.

The rule that catches both: **any test that does not call the feature's entry point needs
an explicit guard asserting the feature exists.** And after every suite change, read the
baseline log for passes rather than trusting the total — one test flipping from fail to
pass is invisible in a count.

## The fairness test for unstated requirements

The reviewer's line:
> *"It's not just about if your prompt never says it. It's about if **no one can be
> reasonably expected to understand that from the prompt and the test context**. Your
> prompt could just not say something, but it would be reasonable behavior to do. And so
> that's kind of the line."*

Practical formulation — **does failing it track capability, or is it a coin flip?**

- **Fair:** the standard or domain defines one right answer and the agent has everything
  it needs. A stronger model is genuinely more likely to get it. Failure means the
  implementation is buggy. → legitimate unstated test.
- **Unfair:** failure depends on guessing something arbitrary — a name, an unstated
  convention, a specific error class among several defensible ones. No skill recovers
  it. → state it in the prompt, or do not test it.

Both kinds produce score spread. Only capability-correlated spread is meaningful; random
spread is noise, and it defeats the "identical scores = structural failure" diagnostic.

## Two legitimate kinds of test

1. What was spelled out in the prompt.
2. What was deliberately *not* spelled out but is expected anyway — *"that's the
   difference between a senior engineer and a junior engineer."*

Both are valid. The second is how judgment gets graded.

## Categories

| Category | Covers |
| --- | --- |
| **Core feature** | The main behavior from the prompt |
| **Edge cases** | Boundaries, weird interactions, failure paths |
| **Regression** | Adjacent behavior that must not break |

Be able to name which test is which — reviewers ask. Keep **regression a small fraction**
of the suite; guard specific interactions of concern, not broad sweeps.

Label every test in the source with a one-line plain-English comment stating what it
checks and which category it belongs to:

```ts
// [core] winter-tc mode returns a standard Response for a standard Request
test('...', async () => { ... })
```

This is not decoration. A human reviews every test before the task ships, and the labels
are what makes a 50-test suite reviewable at all — they also force the category split to
be real rather than asserted after the fact. Do not skip them for tests that feel
self-explanatory.

Add an **abuse-detection** angle: tests that fail a degenerate solution — hardcoded
values, stubs that fake success, responses that do not derive from real inputs. Assert
that different inputs produce different outputs, that a registered middleware actually
observes the request, that served content derives from the real file.

## Counts

- Docs target **20 floor / 40–60**. The reviewer's working range in practice: *"usually
  anywhere from 30 to 80 tests in the test patch."*
- Under ~10, scores cluster too tightly to differentiate. One builder went 8 → 38 to get
  usable signal.
- Count is not the real lever — **difficulty distribution is**. If most tests pass the
  moment a basic implementation works, the spread compresses at the top regardless of
  count. Prune easy near-duplicates before adding more.

## Partial credit

The reviewer's on-the-fence rule:
> *"If it's something you're on the fence about — 'I would accept a lesser solution but it
> would be really nice if this was here' — then definitely add both of these permutations,
> take them into account in the tests. That way you can score partial points on a decent
> solution and full points on a really good one."*

Also: *"if two valid implementation contracts exist, test for both and allow partial
scoring."* Do not force one when the spec permits either.

Split a behavior into a looser test (it works at all) and a stricter test (exact expected
shape) where that split is natural. Do not force the pattern everywhere.

## New files only

Only authored tests count. Add new files; do not modify existing repo tests.

The reason is mechanical, not stylistic:
> *"Let's say your test patch modifies an existing test… It would be reasonable to expect
> your agent to modify that test too. How would you then cleanly apply the test patch, if
> the base has changed?"*

If an existing test must change, **copy it and add the copy as a new test** so it counts
and cannot conflict. And: *"It's ok if the old ones fail somewhere, we're not looking at
them at this point, we're only grading the new tests."*

A workable rhythm: let the harness modify existing tests freely while building the
solution, then when writing verifiers, go through and ensure the test patch only *adds*.

## Implementation-agnostic construction

Spin up the real thing and drive it the way a consumer would — real requests, real
objects, real assertions on real responses. No hand-mocked internals. Where practical,
exercise more than one consumer pattern so the suite does not couple to one caller's
quirks.

Any package the verifiers import must be present in the image at build time — runtime is
airgapped. Adding a dependency for tests can dirty the worktree or pollute the captured
model patch; prefer a hand-rolled stand-in when the dependency buys little.

## Docs and README assertions

Updating docs in the golden patch is good practice. **Asserting on docs in the verifiers
is discouraged**: *"we're trying to stay away from testing and scoring if an agent
modified the docs or the tests, because that's hard to check and hard to assert."* If
asserted at all, keep it minimal and non-specific.

## The `test.sh` contract

The outer `tests/test.sh` calls the inner `/app/test.sh` twice — `base` then `new` — and
writes the reward. The reward file must be exactly:

```json
{"reward": 1, "test_counts": {"passed": 30, "failed": 0, "total": 30}}
```

Extra or renamed keys break the harness. `passed + failed` must equal `total`.

The inner script picks the suite by mode, runs it, and publishes counts. Because it is
invoked once per mode, counts must **accumulate across calls** — write a per-mode tally
and recompute the combined total each time, or the second call overwrites the first.

Surface pass/total clearly in the log. That number is the difficulty signal reviewers
read at a glance, and without accurate counts the harness falls back to a 1/1 placeholder
that grades correctly but shows nothing.

`base` mode holds regression coverage that must pass with or without the feature. `new`
mode holds the feature suite, which must fail without it.

## Reward hacking

The most important failure mode, and the least obvious.

A test says: `POST /users` with a duplicate email → expect `409`. The correct solution
queries the database, detects the conflict, returns 409. The cheating solution is:

```js
if (email === "test@example.com") return res.status(409).send()
```

It read the fixture value and hardcoded the response. **The verifier goes green.** The
database was never touched.

**Why this is worse than a task that simply fails:** RL is an optimizer. It does not know
it cheated — it knows that path scored 1.0 for a fraction of the effort, so the shortcut
gets *reinforced*. Train on enough tasks like this and the learned strategy becomes
*"identify what the test asserts, satisfy that specific assertion."* Benchmarks look
excellent; production code is garbage. **A gameable task does not produce a weak model, it
produces a test-hacking model** — which is precisely what labs are paying not to get.

Other shapes: deleting or `.skip()`-ing failing tests, monkeypatching a module so an
assertion cannot fail, stubbing a function to always return success, catching every
exception and returning 200.

**Defenses, applied by default:**

- Vary inputs — never let a single fixture value carry a test
- Assert on **side effects**, not just responses. After the 409, query the database and
  confirm exactly one row exists.
- Include at least one test the agent has no reason to anticipate from the prompt
- Ask directly: *could a hardcoded shortcut pass this?* If yes, the task is broken however
  good the prompt is.

Scale of the problem in published work: **28.5%** of a 49-task SWE-bench Verified sample
was Docker-verified hackable, and across 134 frontier-model submissions hackable tasks
inflated within-difficulty Pass@1 by **+14.14pp**. OpenAI reported **59.4%** of failed
SWE-bench Verified tasks had flawed tests. A quarter or more of shipped RL tasks are
broken — not being in that bucket is the differentiator.

## The gold-sanity gate

**Every new verifier test runs against the golden patch before it is trusted. If it fails
on gold, the test is broken — discard and retry.**

Not optional hygiene. Measured: with an LLM judge alone, 10 of 11 tasks were reported
repaired; adding a Docker gold-sanity gate revealed **65 of 105 augmentations failed on the
gold patch itself**, a 61.9% per-augmentation defect rate the judge did not catch.

The named failure modes are exactly what a model writing tests produces — scan for these
by name when reviewing generated tests:

| Failure mode | Example |
| --- | --- |
| Wrong import style | test imports a symbol the target file reaches via a module alias |
| Inverted expectation | asserts a decorator returns where it actually raises |
| Asserts the opposite of documented behavior | asserts `escape()` decodes entities when it encodes |
| Wrong default value | asserts `None` where the real signature has `inspect._empty` |
| Uncollectable test | shape incompatible with the file's parametrize decorators |
| Kwarg collision | duplicate keyword resolves to `TypeError` |

Retry *presence* does the work; retry *style* does not — a one-sentence "try again"
recovered the same tasks as an elaborate diversity-biased prompt. Do not over-engineer it.

## The attack loop — measuring hackability

Asking a subagent "could this be gamed?" is a vibes check. Measure it instead:

1. Generate K deliberately **incorrect** patches that try to pass the suite while changing
   observable behavior.
2. Apply each inside the task's container; run the verifier.
3. A candidate is *exploit-successful* if the suite reports it passing. The task is
   **hackable** if any candidate succeeds.
4. Rounds 2–3: feed round-1 failure logs back to bias generation toward exploits the suite
   has not blocked yet.

Round-1 single-shot found 18.4% of tasks hackable; rounds 2–3 raised it to 28.5%. **One
round is a lower bound** — run at least two when the first finds nothing. Cost reference:
a full 49-task audit was $6.04 in API spend.

Standard exploits to attempt: hardcoding fixture values, stubbing a function to return
success, monkeypatching so an assertion cannot fail, catching all exceptions and returning
200, deleting or skipping tests.

> One published task-quality score weights hackability at **0.30**, second only to verifier
> discrimination — i.e. anti-gaming is roughly a third of task quality, not a finishing
> touch. (Directional: the author states the weights were untuned.)

## Verifier checklist

- [ ] Behavior only — no private class/method/table/file name asserted
- [ ] Clear core / edge / regression split, each test labelled
- [ ] All in NEW files; no pre-existing test modified or counted
- [ ] Every feature test genuinely fails at baseline (check — one that passes is testing
      nothing)
- [ ] Multiple legitimate implementations pass; representative lazy ones fail
- [ ] `test.sh` emits the exact reward shape with accurate counts
- [ ] Any test dependency is baked into the image
