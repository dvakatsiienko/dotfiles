---
name: sweep-issues
argument-hint: "[scope] [cap] [review only] [focus on <angle>] [skip <angle>]"
description: Heavy multi-round defect sweep over a target scope (dir, module, diff, branch) — find-prove-fix until two independent passes come back clean; findings adversarially verified; state survives interrupts. Occasional deep-clean (30-60 min, heavy tokens) for shipping/inherited/vibe-coded work, NOT everyday review. Fixes in place unless wording plainly rejects changes ("review only", "no fixes").
intended-models: opus
---

# sweep-issues

A defect sweep that ends on a stated rule, not a sense of being finished: rounds rotate through an angle catalogue, adversarial verifiers filter what each round finds, a **clean counter** decides when the loop has converged, and the closing report is a **coverage ledger** — every angle accounted for as used, skipped, or never reached, so partial coverage never reads as completeness. You are the orchestrator; the finding history, the counter, every probe, and every edit stay in this session — and the state file mirrors them, so a killed run resumes without paying for any round twice.

**This skill is evergreen.** Its current shape is not fixed — it is the best known shape so far, and every run is also an observation about where it is slow, redundant, or blind. The self-evaluation step (§10) is part of every run.

## 1. State the mode

Mode is **fix** unless the invocation plainly rejects changes — "review only", "no fixes", "just report", "don't touch the code" — in which case it is **report-only**. "only"/"just" binding to a scope word keeps mode fix: "only review the auth module" means scope = auth module, mode = fix.

Print one line before doing anything else, so a misread is visible before any file changes:

```
Mode: fix | report-only — scope: <scope>
```

## 2. Derive scope, emphasis, angle skips, and cap

- **Scope** — whatever the invocation names. Nothing named: the uncommitted diff if there is one, else ask.
- **Emphasis** — "focus on concurrency", "security angle". Emphasis weights angle ranking and reviewer attention; every qualifying defect in scope still counts wherever it sits.
- **Skips** — the invocation may rule out named angles ("skip hostile input", "no tooling round"). A skipped angle enters the ledger as `skipped (user)` and never runs.
- **Cap** — the invocation may set the round cap: a bare number as the argument (`/sweep-issues 10 <scope>`) or wording like "cap at 5 rounds". Default **6**: the distinct angles run once each, plus one re-run round — the first round whose input includes every fix the loop itself made (earlier rounds each land fixes the rounds before them never saw). The cap is a budget, not a verdict — hitting it reports as capped, never as success.

## 3. Open or resume the state file

State lives at `~/.claude/sweep-issues/runs/<slug>.json`, slug = the scope's absolute path with `/` replaced by `-`. The file mirrors the orchestrator's whole state:

```json
{
  "version": 1, "scope": "/abs/path", "mode": "fix", "emphasis": null, "cap": 6,
  "fingerprint": "<git HEAD + hash of git status --porcelain, or null if not a repo>",
  "counter": 0, "terminal": null,
  "ledger": {"tooling": "used (round 1)", "hostile-input": null, "user-path": "skipped (not applicable: no documented entry)", "critical-reading": null, "different-model": null, "integration-concurrency": null},
  "rounds": [{"n": 1, "angle": "tooling", "class": "probe", "effort": null,
    "findings": [{"file": "src/index.ts", "line": 32, "claim": "…", "severity": "medium", "verdict": "reproduced (by execution)", "fixed": false}],
    "outcome": "findings-fixed", "counterAfter": 0}]
}
```

- **No file for this scope, or its `terminal` is set** → fresh run; the first write happens after planning (§4).
- **File exists with `terminal: null`** → an interrupted run. Announce `Resuming: round <N+1>, counter <K>, angles used: <…>`, adopt the state — used angles stay used, recorded findings stand, the counter stands — and continue at the round gates (§5). If the fingerprint no longer matches the scope, the code changed outside the loop: apply the qualifying-fix rule — counter to 0, used angles re-arm — and say so.
- "fresh" / "start over" in the invocation discards the old file; state that you discarded it.

**Checkpoint writes** — rewrite the whole file at three moments, never only at the end: after planning (ledger, skips, ranking), after a round's verification (findings recorded before any fix is attempted), and after fixes land and the counter updates (`terminal` is set here when a terminal status fires). A killed session loses at most the round in flight.

**Cleanup** — the state file is scaffolding, not the record: closing the ledger (§9) deletes it, so only interrupted runs leave a file behind. When opening any fresh run, sweep `~/.claude/sweep-issues/runs/`: delete files whose `terminal` is set (a close that crashed before its delete) and files untouched for 30 days (interrupted runs nobody came back for).

## 4. Plan the angles

The catalogue — six angles, two classes. **Probe angles** execute the target: you run them yourself, in this session, and the evidence is execution output. **Judgment angles** read the target: each gets a fresh reviewer subagent that never saw the work produced.

| Angle | Class | Applies when | Procedure |
| --- | --- | --- | --- |
| `tooling` | probe | the project defines any check | Run the project's own gates — typecheck, lint, tests — exactly as its scripts/config define them (read package.json, Makefile, CI config; never invent flags). Each failure inside scope is a finding; the tool output is its evidence. |
| `hostile-input` | probe | scope accepts external input | Throwaway scripts in the scratchpad import the target's entry points and feed hostile input: malformed encodings, `__proto__`/`constructor` keys, empty, huge, negative, NaN, unicode boundaries. A crash or corrupt state is a finding; the failing input is its evidence. |
| `user-path` | probe | a documented, runnable entry exists | Exercise the target exactly as its docs tell a user to — CLI invocation, README example, app route. Divergence from documented behavior is a finding. |
| `critical-reading` | judgment | always | The reviewer's default mandate: logic wrong under some reachable condition. |
| `different-model` | judgment | always | Same mandate, reviewer forced to an eligible model no earlier judgment round used (model policy below). |
| `integration-concurrency` | judgment | scope has cross-module seams, shared state, or async ordering | Reviewer mandate: the boundaries between units — call contracts, shared mutable state, interleavings, partial-failure states. |

Open the ledger before round 1:

1. Judge each angle's applicability against the target. Inapplicable → `skipped (not applicable: <reason>)`. Clean is reserved for an angle that ran and found nothing; a skipped angle is recorded as skipped, whatever the code's quality.
2. Rank the remaining angles by expected yield for this target. Default order: tooling, critical-reading, hostile-input, user-path, integration-concurrency, different-model. Re-rank for the target in front of you — parser or input-handling code promotes hostile-input; user emphasis promotes the angles bearing on it.
3. Print the plan: ranked angles on one line, skips with reasons on the next. Write the first checkpoint.

## 5. Run rounds

Each round takes the highest-yield **eligible** angle. Unused angles always outrank re-armed ones (re-arming: §8); an angle never runs twice on the same code state. Re-rank between rounds if findings changed the picture. Announce `Round N — angle: <name>`, or for a re-armed angle `Round N — angle: <name> (re-run: code changed in round M)`.

**Pairing — the wall-clock lever.** While at least two unused judgment angles remain, run the top two concurrently against the same code state: with no fixes between them, two serial rounds would have read identical code anyway, so the evidence is equivalent and the reviewer wall-clock halves. Verify the union of both rounds' findings in one pass, fix once, and update the counter as if the rounds ran back-to-back — two qualifying cleans from a pair count as 2 (independent cleans of the same state on different angles). Known cost, accepted: when the first half of a pair alone would have converged the loop, the second reviewer's tokens are spent anyway — wall-clock is the scarcer budget. Pair judgment with judgment only; probes are near-free and run serially whenever they're up.

Three gates before each round, in order:

1. **Cap** — round N would exceed the cap → terminate `capped`.
2. **Stuck detector** — four patterns; any firing terminates `stuck`, naming the pattern:
   - **Fix didn't take** — a finding with the same file:line and claim survives verification again after its fix was applied. Once: re-fix by a genuinely different approach. Twice: stuck.
   - **Repeating error** — a probe or tooling command fails the same way twice (an environment failure, not a defect): record that angle `skipped (environment: <error>)` and move on. Two angles lost this way: stuck.
   - **Monologue** — a round returns the same finding set as an earlier round on unchanged code.
   - **Ping-pong** — a fix reverts or contradicts an earlier fix on the same lines.
3. **Eligibility** — no eligible angle remains → terminate `exhausted`.

Then run the angle's procedure:

- **Probe rounds** — probes live in the scratchpad and never modify the target.
- **Judgment rounds** — spawn one reviewer: `Agent` tool, `subagent_type: general-purpose`, `model: opus`, its prompt being the verbatim text of `references/reviewer-mandate.md` plus the scope (concrete paths or diff ref), emphasis, and the angle's mandate — nothing else. The reviewer never sees the conversation, the work's history, earlier rounds' findings, or who wrote the code: its value is that it never saw the work produced.

Both classes return the same currency: findings with file:line, claim, and a concrete failure scenario. Discard anything without one — that bar is the contract, and a finding that misses it is noise, not signal.

## 6. Verify every finding

Raw LLM review precision is roughly 1-in-5; unverified findings poison the decision.

- **Probe findings** arrive already executed — the failure ran in front of you. Map each to file:line (kill what doesn't map), record the verdict as `reproduced (by execution)`, and skip adversarial verification: a reader cannot refute an observed crash.
- **Judgment findings** get two tiers, both before anything is reported:
  - **Tier 0 — mechanical.** The cited file and line exist and contain the code the claim is about (shell + grep, free). Kill what fails.
  - **Tier 1 — adversarial.** For each survivor, spawn one verifier (`subagent_type: general-purpose`, `model: sonnet`, prompt = the verbatim text of `references/verifier-mandate.md`), all in parallel, each given **only** the file, line, and claim — never the reviewer's narrative, severity, or the other findings. Its mandate is to refute, and its output contract requires a `strongest-counter` line (the best argument against the claim, found before deciding) and closes with `claim-holds: yes|no|undecided`.

A finding **survives** only with verdict `reproduced`. `refuted` kills it. `indeterminate` is reported to the human as its own class — neither a survivor nor discarded. A verdict whose label contradicts its own `claim-holds` line or evidence is **malformed**: re-spawn that one verifier once; malformed twice → record the finding `indeterminate`.

Checkpoint the state file: verified findings are recorded before any fix is attempted.

## 7. Decide: the clean counter

**Clean means zero findings surviving verification — zero `reproduced` and zero `indeterminate` — not zero reported.** An indeterminate verdict is an open question, and the loop does not converge past open questions. Findings already recorded `surfaced (user decision)` (§8) are the exception: they are open by the user's choice, not the loop's, and do not count against any later round's cleanliness.

A clean round **qualifies** only when its evidence could have found something: probe rounds qualify on their objective output (the gate ran and passed); judgment rounds qualify only at high effort — low/medium-effort cleans under-report by design, consume their angle, and leave the counter unchanged.

Update the counter after each round (fixes from §8 land first):

| Round outcome | Counter |
| --- | --- |
| Qualifying clean | +1 |
| Clean, non-qualifying (low/medium-effort judgment) | unchanged |
| Survivors including high or medium severity → fixed | reset to 0; used angles re-arm |
| Survivors all low severity → fixed | unchanged; no re-arm |

The loop **stops at 2** — two consecutive qualifying clean rounds, on different angles. Rotation guarantees the angles differ; two cleans from the same angle never qualify.

Per round, report the surviving findings table (file:line, claim, severity, verdict evidence), an indeterminate section if any, the refuted count, then the decision line: `continue — <K> qualifying clean, need 2; next angle: <name>`, or a terminal status:

| Status | Trigger | Report as |
| --- | --- | --- |
| `converged` | counter reaches 2 | converged — 2 consecutive qualifying clean rounds |
| `exhausted` | no eligible angle, counter < 2 | exhausted, not converged |
| `capped` | round cap reached | capped, not converged — the cap is a budget, not a verdict |
| `stuck` | stuck detector fired | stuck, not converged — <pattern> |

`capped`, `stuck`, and `exhausted` are never worded as success, completion, or a clean bill.

Checkpoint the state file: counter, ledger, and — when a terminal status fired — `terminal`.

## 8. Fix — fix mode only

You apply the fixes, in this session, where edits are visible and rewindable — the reviewer and verifiers cannot edit and must stay that way. For each surviving finding, apply the minimal fix that removes the failure scenario. After fixing a probe finding, re-run its probe and show the failure gone. Surface rather than apply anything destructive (deleting files, dropping data, rewriting a public interface) or outside the stated scope.

**Surfaced findings.** A finding you surface instead of fix — destructive, out of scope, or hinging on a product/architecture decision — is recorded as `surfaced (user decision)` (state file: `"surfaced": true`). It stays in the report as open, but stops counting against cleanliness: without this, a deliberately-unfixed finding gets re-found by every later judgment round and blocks convergence forever. Later reviewer prompts list surfaced findings as explicit exclusions ("already recorded, awaiting a decision — do not re-report") — the one sanctioned exception to the reviewer's no-context rule. A re-report of a surfaced finding is discarded as a duplicate, not re-verified.

**Severity gates the reset.** Fixes for high or medium findings mean the code materially changed: the counter resets to 0 and used angles **re-arm** — eligible again against the new code, ranked by how much they bear on what changed, once no unused angle remains. Low-severity fixes change too little to send the loop back to round one: no reset, no re-arm. Report-only mode applies no fixes, so nothing resets or re-arms and the catalogue bounds the loop.

## 9. Close with the coverage ledger and rounds table

The ledger's first line is the terminal status in its mandated wording. Then all six angles, each on exactly one line, each in exactly one state — an angle that ran more than once (re-armed) lists each run.

| State | Meaning |
| --- | --- |
| `used (round N)` | ran — findings count, or clean (effort noted) |
| `skipped (user)` | ruled out in the invocation |
| `skipped (not applicable: <reason>)` | judged inapplicable at planning |
| `skipped (environment: <error>)` | its command failed the same way twice |
| `never reached` | the loop ended first — cite the terminal status |

The ledger is the honesty mechanism: an angle missing from it, or a skipped angle worded as clean, turns partial coverage into false completeness.

After the ledger, print the **rounds table** — one row per round, in order, so the run's shape is readable at a glance:

| Round | Angle | Kind | Found | Fixed | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | tooling | probe | 0 | — | clean |
| 2 | critical-reading | reviewer (opus) | 7 | 7 | 1 high, 3 medium, 3 low |
| 6 | integration-concurrency | reviewer (opus), re-run | 1 | 1 | regression in round-5 fix |

Kind names the class and, for judgment rounds, the reviewer model; re-run rounds say so. Notes carries severity split, refuted/indeterminate counts, or the one-line reason a round mattered. Below the table, print the totals line: `<N> findings raised → <F> fixed, <R> refuted, <I> indeterminate, <S> surfaced (user decision), <U> unfixed` — and, when duration data is available from subagent results, the total reviewer/verifier wall-clock and token spend.

Close by stating any limit that applies — fixes applied in the round before a `capped`, `stuck`, or `exhausted` stop are unreviewed code.

Then delete the run's state file: the printed ledger and rounds table are the record, and a lingering file would read as an interrupted run.

## 10. Evergreen self-evaluation

After the close, spend a small, bounded effort — a few sentences, no subagents, no new analysis — answering one question against the run's own data: **what would have made this run better, faster, or more fluent?**

Ground every observation in evidence the run already produced: which rounds found nothing per minute spent, where wall-clock concentrated, verifier refute rate (near-100% reproduced suggests verifiers aren't refuting hard enough), stuck-detector near-misses, angles that consistently skip, report sections nobody needed. No evidence from this run → say "no observations" and stop; do not manufacture insight.

Output at most 2–3 bullets, each either an observation or a concrete proposed change to this SKILL.md. **Propose, never apply**: skill edits happen only when the user approves, and prefer proposals backed by a pattern across runs over a single-run anecdote. This step costs ~1 minute against a multi-round run; if it ever grows beyond that, it has failed its own test.

## Model policy

- **Eligible reviewers:** Opus 5 (default finder — measured high precision and recall), Opus 4.8, Sonnet 5. Haiku and smaller models are ineligible: against a ~20% precision baseline a weak reviewer produces confident noise, worse than no round.
- **Cost dial is `effort`, never model tier.** A cheap pass is a capable model at low/medium effort.
- **The `different-model` angle** rotates within the eligible set: its reviewer must differ from every model a judgment round already used this loop — including the model of a concurrently running paired round — Sonnet 5 when Opus 5 ran the earlier rounds, Opus 4.8 as the alternate. Model rotation is a diversity heuristic, not a proven control: the disjoint-family evidence comes from QA/chat, not code defects.
- **Verifier:** different tier from the finder (Sonnet when the finder is Opus), low effort — the documented bias toward high-confidence-only reporting is exactly right for a filter and wrong for a finder.
- A clean round at low effort never counts toward the stop rule (see the counter table).
