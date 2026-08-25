---
name: sweep-issues
argument-hint: "[scope] [cap] [review only] [focus on <angle>] [skip <angle>]"
description: Invoke for an occasional deep-clean of shipping, inherited, or vibe-coded work (30-60 min, heavy tokens) — NOT everyday review; "review only" in the argument skips fixes.
disable-model-invocation: true
---

# sweep-issues

A defect sweep that ends on a stated rule, not a sense of being finished: rounds rotate through
an angle catalogue, adversarial verifiers filter findings, a **clean counter** decides
convergence, and the close is a **coverage ledger** — every angle accounted for, so partial
coverage never reads as completeness. You are the orchestrator; state stays in this session and
mirrors to a file, so a killed run resumes without repeating rounds.

**Evergreen** — every run is also an observation about where this skill is slow or blind (§10).

## 1. State the mode

**fix** unless the invocation plainly rejects changes ("review only", "no fixes", "just
report") → **report-only**. "only"/"just" binding to a scope word keeps mode fix. Print before
anything else: `Mode: fix | report-only — scope: <scope>`.

## 2. Derive scope, emphasis, skips, cap

- **scope** — what the invocation names; nothing named → the uncommitted diff, else ask.
- **emphasis** — "focus on concurrency" weights angle ranking and reviewer attention; every
  qualifying defect still counts wherever it sits.
- **skips** — named angles ruled out enter the ledger as `skipped (user)` and never run.
- **cap** — a bare number or "cap at N". Default **6**: each angle once plus one re-run round.
  The cap is a budget, not a verdict — hitting it reports as capped, never as success.

## 3. Open or resume the state file

`~/.claude/sweep-issues/runs/<slug>.json`, slug = scope's absolute path with `/` → `-`. It
mirrors the whole orchestrator state: version, scope, mode, emphasis, cap, fingerprint (git
HEAD + hash of `git status --porcelain`), counter, terminal, ledger, and per-round records
(angle, class, findings with file:line/claim/severity/verdict/fixed, outcome, counterAfter).

- no file, or `terminal` set → fresh run; first write after planning.
- file with `terminal: null` → announce `Resuming: round <N+1>, counter <K>, angles used: <…>`
  and adopt the state wholesale. Fingerprint mismatch = code changed outside the loop: counter
  to 0, used angles re-arm, say so.
- "fresh" / "start over" discards the old file; state that you discarded it.

**Checkpoint at three moments** — after planning, after a round's verification (findings
recorded before any fix), after fixes land and the counter updates. A killed session loses at
most the round in flight.

**Cleanup** — closing the ledger deletes the file. On any fresh run, sweep the runs dir:
delete files with `terminal` set and files untouched 30+ days.

## 4. Plan the angles

Six angles, two classes. **Probes** execute the target yourself; evidence is execution output.
**Judgment** angles get a fresh reviewer subagent that never saw the work produced.

- `tooling` · probe — when the project defines any check. Run the project's own gates
  (typecheck, lint, tests) exactly as its scripts define them — never invent flags. Each
  in-scope failure is a finding.
- `hostile-input` · probe — when scope accepts external input. Scratchpad scripts feed entry
  points malformed encodings, `__proto__` keys, empty/huge/negative/NaN/unicode boundaries.
  Crash or corrupt state = finding.
- `user-path` · probe — when a documented runnable entry exists. Exercise the target exactly
  as its docs tell a user to; divergence = finding.
- `critical-reading` · judgment — always. Reviewer mandate: logic wrong under some reachable
  condition.
- `different-model` · judgment — always. Same mandate, model no earlier judgment round used
  (§ model policy).
- `integration-concurrency` · judgment — when scope has cross-module seams, shared state, or
  async ordering. Reviewer mandate: call contracts, interleavings, partial-failure states.

Open the ledger before round 1: judge applicability (inapplicable → `skipped (not applicable:
<reason>)`; clean is reserved for an angle that RAN and found nothing) · rank by expected yield
(default: tooling, critical-reading, hostile-input, user-path, integration-concurrency,
different-model; re-rank for the target and emphasis) · print ranked angles + skips with
reasons · write the first checkpoint.

## 5. Run rounds

Each round takes the highest-yield **eligible** angle; unused angles outrank re-armed ones; an
angle never runs twice on the same code state. Announce `Round N — angle: <name>` (re-armed:
add `(re-run: code changed in round M)`).

**Pairing — the wall-clock lever.** While 2+ unused judgment angles remain, run the top two
concurrently against the same code state: verify the union once, fix once, count qualifying
cleans as 2. Pair judgment with judgment only; probes are near-free and run serially.

Three gates before each round, in order:

1. **cap** — exceeding it → terminate `capped`.
2. **stuck detector** — any of these terminates `stuck`, naming the pattern:
   - *fix didn't take* — same file:line+claim survives verification after its fix. Once:
     re-fix by a genuinely different approach. Twice: stuck.
   - *repeating error* — a probe command fails the same way twice (environment, not defect):
     record the angle `skipped (environment: <error>)`, move on. Two angles lost this way: stuck.
   - *monologue* — a round returns the same finding set as an earlier round on unchanged code.
   - *ping-pong* — a fix reverts or contradicts an earlier fix on the same lines.
3. **eligibility** — no eligible angle → terminate `exhausted`.

Then run it. Probes live in the scratchpad and never modify the target. Judgment rounds spawn
one reviewer: `Agent` tool, `subagent_type: general-purpose`, model per policy, prompt = the
verbatim text of [references/reviewer-mandate.md](references/reviewer-mandate.md) plus scope,
emphasis, and the angle's mandate — nothing else. The reviewer never sees the conversation,
earlier findings, or who wrote the code.

Both classes return the same currency: file:line, claim, concrete failure scenario. Discard
anything without one — that bar is the contract.

## 6. Verify every finding

Raw LLM review precision is roughly 1-in-5; unverified findings poison the decision.

- **probe findings** arrived already executed: map to file:line (kill what doesn't map), record
  `reproduced (by execution)`, skip adversarial verification.
- **judgment findings**, two tiers before anything is reported:
  - *tier 0, mechanical* — the cited file:line exists and contains the code claimed (grep,
    free). Kill what fails.
  - *tier 1, adversarial* — per survivor, one verifier in parallel (`general-purpose`, model
    per policy, prompt = verbatim [references/verifier-mandate.md](references/verifier-mandate.md)),
    given ONLY file, line, claim — never the reviewer's narrative or the other findings. Its
    contract: a `strongest-counter` line, closing `claim-holds: yes|no|undecided`.

A finding survives only as `reproduced`. `refuted` kills it. `indeterminate` is its own
reported class — neither survivor nor discarded. A malformed verdict (label contradicts its own
`claim-holds` or evidence): re-spawn once; malformed twice → `indeterminate`. Checkpoint.

## 7. Decide: the clean counter

**Clean = zero surviving findings — zero `reproduced` AND zero `indeterminate`.** The loop
does not converge past open questions. Exception: findings recorded `surfaced (user decision)`
(§8) are open by the user's choice and don't count against cleanliness.

A clean round **qualifies** only when its evidence could have found something: probes qualify
on objective output; judgment rounds qualify only at high effort — low/medium cleans consume
the angle and leave the counter unchanged.

After each round (fixes land first):

- qualifying clean → **+1**
- clean but non-qualifying → unchanged
- survivors incl. high/medium severity, fixed → **reset to 0**, used angles re-arm
- survivors all low severity, fixed → unchanged, no re-arm

**Stop at 2** — two consecutive qualifying cleans on different angles (rotation guarantees the
difference; two cleans from one angle never qualify).

Per round, report: surviving-findings list (file:line, claim, severity, verdict evidence),
indeterminates, refuted count, then `continue — <K> qualifying clean, need 2; next angle:
<name>` or the terminal status:

- `converged` — counter reached 2
- `exhausted` — no eligible angle, counter < 2 → "exhausted, not converged"
- `capped` — cap reached → "capped, not converged"
- `stuck` — detector fired → "stuck, not converged — <pattern>"

`capped`/`stuck`/`exhausted` are never worded as success or a clean bill. Checkpoint.

## 8. Fix — fix mode only

You apply fixes in this session, where edits are visible and rewindable — reviewers and
verifiers never edit. Minimal fix per finding; after fixing a probe finding, re-run its probe
and show the failure gone.

**Surface rather than apply** anything destructive, out of scope, or hinging on a
product/architecture decision → recorded `surfaced (user decision)`, stays in the report as
open, stops blocking convergence. Later reviewer prompts list surfaced findings as explicit
exclusions — the one sanctioned exception to the reviewer's no-context rule; a re-report of one
is discarded as a duplicate.

**Severity gates the reset**: high/medium fixes materially changed the code — counter 0, used
angles re-arm (once no unused angle remains, ranked by bearing on what changed). Low-severity
fixes: no reset, no re-arm. Report-only mode never resets or re-arms.

## 9. Close: coverage ledger + rounds list

First line: the terminal status in its mandated wording. Then all six angles, one line each,
exactly one state — `used (round N)` · `skipped (user)` · `skipped (not applicable: <reason>)`
· `skipped (environment: <error>)` · `never reached` (cite the terminal status). A re-armed
angle lists each run. The ledger is the honesty mechanism: a skipped angle worded as clean
turns partial coverage into false completeness.

Then one line per round, in order: round № · angle · class (+ reviewer model, re-run marker) ·
found · fixed · note (severity split, refuted/indeterminate counts). Close with the totals
line — `<N> raised → <F> fixed, <R> refuted, <I> indeterminate, <S> surfaced, <U> unfixed` —
plus reviewer/verifier wall-clock and token spend when available, and any limit that applies
(fixes in the round before a non-converged stop are unreviewed code).

Then delete the state file — the printed close is the record.

## 10. Evergreen self-evaluation

After the close, a few sentences, no subagents: **what would have made this run better, faster,
or more fluent?** Ground every observation in the run's own data (yield per round, wall-clock
concentration, verifier refute rate, stuck near-misses). No evidence → "no observations". At
most 2–3 bullets, each an observation or a concrete proposed SKILL.md change. **Propose, never
apply** — edits happen only on the user's approval, preferably backed by a cross-run pattern.

## Model policy

- **eligible reviewers**: Opus 5 (default — measured high precision and recall), Opus 4.8,
  Sonnet 5. Haiku and smaller are ineligible: against a ~20% precision baseline a weak reviewer
  produces confident noise.
- **cost dial is `effort`, never model tier** — a cheap pass is a capable model at low/medium.
- **`different-model`** rotates within the eligible set: must differ from every model a
  judgment round already used this loop (paired rounds included).
- **verifier**: different tier from the finder (Sonnet when the finder is Opus), low effort —
  the high-confidence-only bias is right for a filter, wrong for a finder.
- a clean round at low effort never counts toward the stop rule (§7).
