---
dies-when: both measurement prs are scored and the two decisions (local order; greptile cli / ci / both) are written into `x:coder-brief`'s «final» chain — then the sheets fold into gh-stack-adoption's decision log and this file is deleted
---

# review stack — the measurement run

split out of `gh-stack-adoption.md` step 3b on 2026-09-10 so the stack plan stays a plan and the measurement stays a sheet. the pre-run on trophy-sys (overnight 2026-09-10, sequence-biased) is `adversary-lane-greptile-vs-coderabbit.md`.

## the plan (dima, 2026-09-09) — binding until both prs are scored

**what is decided by it:** (1) which local cli goes first in the coder's fallback chain, coderabbit or
greptile; (2) whether greptile runs locally (cli), on ci (`@greptile review`), or both.

**the target shape after the run — dima's sequence, verbatim in spirit:** when the coder is done,
before asking the ci action: **one** local adversary review from the available set. first the winner
cli (one review, fix what it decides is worth fixing); off quota → the other cli; off quota too →
matt's `code-review` (free floor). the coder always gets one local review, whichever quota is alive.
then push, then the ci adversaries.

**the run — two real coder prs, not synthetic, medium size with real logic (docs-only diffs draw
only nits):**

- on the **same final commit, before any fix**, the coder runs all three local tools: `coderabbit
  review --agent --base main -c CLAUDE.md`, `greptile review --agent` (via greploop, cap 1),
  `mattpocock-skills:code-review`. all three see identical code — tool 2 never gets credit for
  tool 1's cleanup.
- records per tool, then fixes what it accepts, pushes, comments `@claude review` and
  `@greptile review` in the same minute.
- the sheet, per pr, per tool (5 local/ci entries): **true findings** (real defects) · **noise**
  (wrong, trivial, lint restatement) · **time to result** · **unique** (caught by nobody else) ·
  **credits spent** (greptile: read the counter before/after; coderabbit: rate-limit hit y/n).
  the coder fills it in its retro; cclio copies it into the ticket comment.
- **decision 1, local order:** most unique + true per minute goes first; the other is the quota
  fallback; matt's the floor. tie → coderabbit first (hourly quota refills, greptile's monthly
  does not).
- **decision 2, greptile env:** ci pass finds nothing unique vs the cli pass → greptile becomes
  **cli-only**, `@greptile review` leaves the brief, the empty-open credit question dies. ci finds
  unique things (pr context, comments, full repo index) → **ci-only**, the local slot goes to
  coderabbit. both unique → keep both.
- also read on pr 1: did the automatic first review on the empty-commit pr open run and cost a
  credit (filters: `renovate/*` excluded, auto-review-on-commits off)? yes → a `review-ready`
  label rule is the fix, dima's word first («no labels spam yet»).
- after pr 2: `x:coder-brief` switches to the fallback chain with the winner first; this
  section folds into the decision log.

**measurement 0 — the overnight pre-run (dima, 2026-09-10, `bytes-b1`):** greptile vs coderabbit on
trophy-sys, ~2900 lines, full write-up in [adversary-lane-greptile-vs-coderabbit.md](adversary-lane-greptile-vs-coderabbit.md).
counts as a data point, **not a decision** — dima's caveats: it ran after the deploy, and coderabbit
started after greptile's fixes (the doc's own sequence-bias section; the worktree re-run patched it
partially). what it does settle for pr 1 and 2: 1-in-5 overlap, zero false positives from either,
greptile anchors lines + flags security + gives a verdict, coderabbit covers the frontend + ships
patches + carries injection hygiene, and **re-review after every fix** is tool-independent. so the
sheet keeps its five columns; the tie-break stays coderabbit-first; greptile's latency is the one
number nobody has yet — time it on pr 1.

**pr 1 — bytes #67 (BYT-83, trophy-sys follow-ups + cn), scored 2026-09-10 on commit `dcb6d892` before any fix:**
- coderabbit — true 1 · noise 0 · 85 s · unique 0 · rate limit not hit
- greptile — true 0 · noise 1 (`rel=noreferrer noopener`, spec-wrong) · 198 s + one 151 s server-side failure · unique 0 · 2 review ids spent (the cli exposes no counter)
- matt's `code-review` — true 5 · noise 0 · ~40 s · unique 4
- ci `@greptile` — round 1: 0 unique (same as its cli finding) · round 2 on `7370b683`: 5/5 confidence, 0 findings
- ci `@claude` — round 1: clean, 0 findings · round 2: **failed, `Reached maximum number of turns (30)`, nothing posted** — a 9-commit diff exhausts the cap and the reviewer drops out silently; the cap in `.github/workflows/claude.yml` is the fix, dima's call (ci config)
- greptile's one cli finding was withdrawn by greptile itself when challenged
- coder's read: decision 1 → matt first, coderabbit second, greptile last or dropped; decision 2 → ci found nothing the cli did not, both rounds, and the cli found nothing true either. one pr, flagged not called; BYT-81 = pr 2 decides
- the one real defect (`monthTicks` floor of 2) found by coderabbit AND matt independently
- empty-open credit question: **no** — greptile did not auto-review on open; no credit on the empty commit
- coder's read, flagged not decided: on this pr greptile does not earn the local slot; matt's is strongest and free; coderabbit fast and precise. one pr; pr 2 decides.

**candidates (real, medium):** space-explorer-ui error boundary + api `cancelTrip` without
`validateAuth` + `bookTrips` validate-before-auth (one pr); `.cursor/rules` delete + root
`AGENTS.md` pointer is too docs-shaped for pr 1, fine as a third. dima picks; 2026-09-10 after
DOT-26.

---

