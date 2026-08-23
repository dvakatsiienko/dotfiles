---
researched: 2026-08-23
sources-current-as-of: cc 2.1.241 · arXiv 2601.11783 · Offscript CHIIR 2026 · measured on this corpus
refresh-when: a mechanical check is added or falsified, or the drift-latency finding stops holding
ticket: DOT-216
---

# memory checkup — the reusable inventory loop

**run this instead of re-planning an inventory.** it is the procedure that came out of the first
full sweep; the sweep itself was one execution of it.

📌 **a skill candidate, not a skill yet.** it earns a trigger once it has run twice and the steps
stop changing. until then it is a doc, reached by a pointer.

### step 0 · the mechanical pass — code only, no judgment, no model

runs first because it is free, exact, and it shortens every later step. **never an llm judge here**
(see the guard below).

| check | how | today's precision |
| -- | -- | -- |
| **closed-ticket citations** | every `DOT-N`/`BYT-N` in a resident file → ask linear its state → flag Done/Canceled ids sitting within 2 lines of open-state language (`tracks it`, `trial`, `awaiting`, `pending`, `until he decides`) | **~92%** — 12 flagged, 11 genuine |
| **dead `@import`** | every `@slug` in a barrel resolves to a file | clean |
| **barrel omission** | every leaf on disk is imported; every import exists | clean, 54/54 both ways |
| **dead `cursor://` link** | the absolute path in each link exists | clean |
| **dead file reference** | a named `rules/x.md` / skill / doc that is gone | this is what caught `dispatch.md` |

🚫 **the naive path-existence regex does not work — 94 flagged, ~2 real.** the fix is a convention,
not a better pattern: `cursor://file/` is already an absolute machine-checkable format, so
**requiring it for any openable path turns a 3% check into a 100% one for free.**

### step 1 · the inventory — what exists and what it costs

- every memfile, every rule, every skill, every project `CLAUDE.md`
- for each: bytes, est. tokens at **2.89 chars/token** (measured on this corpus — `/4` undercounts
  by ~38%), and whether it is resident or deferred
- 🎯 **the number that matters is not total size. it is `resident × never-used`.**

### step 2 · the duplication pass

**the highest-value single check**, because duplication is a *decay multiplier*, not just a cost:
one board change falsified **twelve** files at once here.

- find the same claim stated in more than one place
- pick the one authoritative home, delete the rest, leave a pointer only if the reader would
  otherwise not find it
- 📌 measured today: 8 of 11 real defects were **one sentence written eight times**

### step 3 · the placement pass

each surviving item through the bucket test (see phase 2's table). the question is never «is this
true» — step 0 settled that — it is **«who pays for this, and do they need it».**

### step 4 · the deferral pass

- 🧪 **`paths:` — PROBE IT BEFORE PLANNING ANYTHING ON IT.** it is used **zero times** here today,
  and none of the nine rules files even has frontmatter. two things are unverified, and the whole
  deferral step rests on them:
  1. the measurement was on **project-level** `.claude/rules/*.md`. these rules are **user-level**
     `~/.claude/rules/`. **does user scope honour `paths:` at all?** unknown.
  2. `globs:` is a **silent no-op typo** — a mistyped key downgrades a scoped rule to always-on
     with no error, so a failed probe and a working one look identical from outside.

  **the probe:** put `paths:` on one low-stakes rule, boot a session, confirm its absence in
  `/context`, then read a matching file and confirm it appears. one rule, one session, both
  directions.

  🚫 **convert nothing else until that comes back**, and never adopt it just because it exists —
  every conversion is a weighted call about whether a glob really is the trigger.
- what else can take `paths:` once proven? (code-shaped conventions tied to a glob)
- what should become a **doc reached by a pointer** instead of a resident rule?
- what should become a **skill** — a procedure with a name someone would invoke?
- ⚠️ what genuinely cannot defer: anything whose trigger is an **intention** rather than a file

### step 5 · the human gate

**pruning is not delegated.** an agent files the candidate with its evidence; dima decides a file
should exist and decides a file should stop existing. that split is not caution — it is what the
evidence supports.

### 🚫 the one thing not to build

**do not build an llm-judge memory audit.** measured, arXiv 2601.11783, 115,200 judgments: judges
reach **>99.88% verdict agreement** while their *reasoning* stability collapses to **≈19%** — they
agree on the answer and fabricate different evidence for it each time. `Offscript` (CHIIR 2026) is
the same shape: 84.6% of conversations flagged, **22.2% material after human review**.

📌 that paper's own recommendation is this procedure, stated in its words: *«delegate all
deterministically verifiable logic to code, reserve llms for semantic evaluation.»* step 0 is code,
step 5 is human, and no step scores a rule's quality with a model.

### ⏱️ cadence — and this is the finding that sets it

🚨 **drift latency here is under 24 hours**, measured: `rules/dispatch.md` was deleted in the
morning and two docs still described it in the present tense by the afternoon. **so a monthly or
quarterly checkup cannot be the mechanism.**

- **step 0 runs on commit** — it is code, it takes seconds, and it is the only thing fast enough
- **steps 1–5 run when dima calls an inventory** — no timer, no scheduler, just a fact that it is
  needed periodically

---

