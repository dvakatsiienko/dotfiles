# Worked example: `vite-wintertc-middleware`

A complete task, end to end, including the mistakes and how they surfaced. Useful as a
concrete model of what each phase actually looks like.

## The task

Vite's dev server middlewares only work through Node's Connect-style `(req, res, next)`
signature, so WinterTC-style runtimes (Hono-like) must write their own adapters. The task:
extend `server.middlewareMode` to accept `"winter-tc"`, exposing `server.fetch(request)`
that runs the middleware stack against a standard `Request` and returns a standard
`Response`.

Repo: `vitejs/vite`, pinned at the `v8.2.0` commit. Additive only — the existing `true`
value untouched.

## Two lessons from the screening exercise that shaped everything

The qualifying exercise (`teleport-ttl`) was a *review* task: judge whether a Teleport
TTL-cache task's hidden tests matched its prompt. They did not.

The hidden test called an **unexported constructor by exact name** — `newFnCache(ttl)` —
never mentioned in the prompt or interface summary. The agent built a behaviorally
correct cache, named it `fallbackMemo`, and failed with `undefined: newFnCache`. All 8
rollouts scored 0.

**It was a verifier bug, not a model failure.** The fix is never "add the internal name
to the prompt" — it is "do not write a test that requires guessing a name." But the
mirror image *is* real: **any name the tests must call has to be stated in the prompt.**

Second lesson from the same exercise: the tests never covered a whole documented
requirement (deep-copy semantics). Narrow *and* shallow at once.

## Recon before design

Established before writing any code:

- Every call site of the option being extended — **~20, all testing truthiness
  (`!!middlewareMode`)**. A new string value would silently collapse into the existing
  path and *appear* to work while doing nothing. This single finding determined the whole
  approach.
- The exact Node API surface the middleware stack touches, by sweeping all 13 middleware
  files: `res.end`(22), `statusCode`(13), `setHeader`(9), `writableEnded`(8),
  `writeHead`(4), plus `req.url`(55), `headers`(14), `method`(9).
- **A third-party static server piped into the response** —
  `createReadStream().pipe(res)`. That one fact fixed the design: the fake `res` had to
  be a genuine `Writable` stream, not a plain object.
- Whether an equivalent already existed in the repo (it did, for a different layer — a
  `dispatchFetch` on environments), and whether the feature existed upstream (**zero
  commits mentioning it** — clean, uncontaminated).

**Recon is where the design gets decided.** Every one of those facts changed the
implementation.

## The header question — a real design fork

The approved prompt said *"Headers, including duplicates, must be preserved."* Tested
empirically rather than reasoned about:

- Node's `Headers`/`Response` only preserve true multi-value duplicates for
  `Set-Cookie`; every other repeated name collapses to a comma-joined string.
- Per RFC 9110 §5.3, **comma-joining duplicate field lines does not change message
  semantics** — so it is not data loss. Vite's own stack relies on this.
- `Set-Cookie` is the sole genuine exception, and the loss there is **unrecoverable**: a
  realistic cookie contains a comma inside `Expires`, so a joined value cannot be split
  back apart.
- `Object.fromEntries(headers)` **silently drops all but the last cookie**.

So the clause was over-broad: it either said nothing, or pushed the implementer *off*
standard. It was cut to `Headers must be preserved across the conversion.`, and
`Set-Cookie` correctness was covered in the verifiers **unstated** — it passes the
fairness test, since the standard defines exactly one right answer and the agent has
everything needed.

**Generalizable:** when a prompt clause describes platform behavior, test the platform
before trusting the clause.

## Prompt edits after approval

Three, all pre-feedback, all from building the solution:

1. **Cut "including duplicates"** — over-broad, per above.
2. **Added `server.fetch(request)`** — the verifiers call it by name, so it had to be
   stated, or a correct solution exposing it differently would fail on naming rather than
   behavior. This is the `teleport-ttl` trap, avoided.
3. **Added a scope line** excluding WebSocket proxying.

Edits 1 and 2 pull in opposite directions for the same reason: **remove steering when the
standard already determines the answer; add steering when the answer is arbitrary and a
verifier depends on it.**

## The solution

~400 LoC of production code across 2 files: a new adapter module plus wiring. Design
points worth reusing:

- The fake `res` extends a real `Writable` — required by the piping static server, and it
  yields proper backpressure for free.
- **The `Response` resolves as soon as the head is known**, with the body streaming
  behind it. Collecting first would satisfy "buffering" and fail "streaming."
- `Headers.append` in a loop is what makes `Set-Cookie` correct — no special-casing
  needed. `Object.fromEntries` or `set` is the bug.
- One behavioral difference beyond the new API: the error middleware owns the response in
  the new mode, because there is no parent server to delegate to.

## Verifiers

51 tests: 43 feature (core + edge + abuse-detection) and 8 Connect-mode regression, in
two new files plus fixtures and the inner `test.sh`. Every test carries a
`// [core|edge|regression]` comment for human review.

Two calibration findings worth repeating:

- One test **passed at baseline** — it asserted `httpServer` was null, which is already
  true of *any* middleware mode. It looked like a feature test and required nothing.
  Strengthened to also require a served response.
- One test asserted `unknown asset → not 200`, which was **simply wrong about the
  framework** — the SPA fallback legitimately serves the index page. Rewritten to use a
  config where a 404 genuinely applies.

Deliberately kept **out** of the verifier suite: abort-handling and write-after-end
tests. Both are valuable, but a hanging test burns the full timeout on every baseline run
for every model, forever. They went into the solution's own tests instead.

## Review — what each round found

Seven rounds. See `solution-and-review.md` for the full ranking; the headline is that
**hostile-input probing found the worst bug**, a middleware calling `res.end()` twice
crashing the entire dev server via an unhandled stream error — after 60 passing tests,
three review rounds and two Docker calibrations.

Fixing it exposed a second issue: the body stream was being *errored* even when the
content was complete. The final rule — settle the stream on what actually happened:
**close if the body finished, error only if genuinely truncated.**

Also caught: the repo's **formatter had never been run** (enforced by a pre-commit hook,
so the patch was un-mergeable while looking fine), and 28 pre-existing lint errors in the
verifier specs, because linting had been applied to source files but never to tests.

## Final state

```
solution.patch   ~400 LoC production across 2 files, + 10 native tests
test.patch       51 verifier tests + fixtures + inner test.sh

Docker baseline  reward 0   (8/51)    expected failure confirmed
Docker oracle    reward 1   (51/51)   reference solution passed every test
```

## What was under-scoped

Measured against the idea checklist — **600+ LoC across 7+ files, excluding tests and
docs** — this task came in at ~400 LoC across 2 files. Under on both axes, and the file
count is the worse miss.

That is structural, not padding-fixable: the change is concentrated because the adapter
is self-contained. It was measured wrong at first by counting the solution's own tests
toward the heuristic — **count production only.**

The honest lesson: **check the scale heuristic during ideation, not after the solution is
built.** A self-contained feature will not spread across seven files no matter how well
it is implemented.
