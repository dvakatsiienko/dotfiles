---
researched: 2026-08-23
sources-current-as-of: 2026-08-23 · cc 2.1.241 · linear board read live
refresh-when: `InstructionsLoaded` gains a decision channel (it is observe-only today), or an agent-memory study publishes a measured delete/prune result
ticket: DOT-167
---

# the memory upkeep loop — can an agent own it

sibling to [`docs/research/context-budget-and-memory-authorship.md`](cursor://file/Users/dima/dotfiles/docs/research/context-budget-and-memory-authorship.md).
that round answered *who writes better* (nobody knows) and located the failures in the **write** and
**manage** stages. this round asks the narrower thing: **of the three upkeep jobs — drift detection,
pruning, eval — which can an agent own today.**

claim tags: **[measured]** run on this machine today · **[read]** stated by a source · **[inferred]** my reasoning.

---

## verdict

| job | owner | why |
| --- | --- | --- |
| **drift detection** | ✅ **agent, fully — for the mechanical subset** | a real subset exists and it fires today. §1 |
| **drift detection, semantic** («is this rule still wise») | 🚫 human | it is a judging task, and §3 says judges hallucinate their evidence |
| **pruning** | 🚫 **human decides. agent may only file the candidate** | sibling round: llm evaluators cluster scores and cannot separate good from bad instructional material. nothing here contradicts it |
| **eval** | ⚠️ **neither, today** | no method exists that fits a single-user memory system. §3. what replaces it is a **regression check**, not an eval |

➡️ **the proposed split survives testing, with one amendment.** «agent drafts, human decides existence,
human decides removal, verification adversarial either way» holds — but the drift half was under-claimed.
a mechanical drift check needs **no judgment at all** and should not wait for a human at any point.

🎯 **the smallest shippable piece: a ticket-state checker.** ~20 lines. it found **11 real defects in
always-resident files** on its first run, today. §1.2.

---

## 1 · is there a mechanical drift signal? — yes, and the precision spread is enormous

i ran five candidate checks over `home/.claude/rules/`, `home/.claude/CLAUDE.md`, `cclio/CLAUDE.md`,
`cclio/memory/` and `docs/agents/`. **[measured]** all five, today.

| check | candidates flagged | real defects | precision | ship it? |
| --- | --- | --- | --- | --- |
| **closed ticket cited as live work** | 12 | **11** | **~92%** | ✅ **yes, now** |
| dead `@import` | 0 | 0 | n/a | ✅ yes — cheap, and it guards the silent-failure hazard |
| dead `cursor://file/` link | 0 of 2 | 0 | n/a | ✅ yes — but only **2 links exist**, see §1.3 |
| barrel omission (leaf on disk, not imported) | 0 of 54 | 0 | n/a | ✅ yes — cheap standing guard |
| **backticked path does not exist** | 94 (57 after anchoring) | ~2 | **~2–3%** | 🚫 **no.** §1.4 |

### 1.1 · the two checks that are already clean

- **the barrel does not lie.** 54 leaves on disk, 54 imported, zero either way. **[measured]**
  `authoring-memory.md` lists «a hand-written barrel can lie» as a live hazard — it is a *real* hazard
  and it is *not currently firing*. worth a standing check precisely because it is currently free.
- **zero dead `@imports`.** the documented silent-failure mode is not present today. **[measured]**

📌 both are worth wiring anyway. a check that costs nothing and returns clean is how you keep it clean —
and both of these fail *silently*, which is the only failure class worth automating against.

### 1.2 · the check that found real damage — ticket state vs prose

for every `DOT-N`/`BYT-N` id named in a resident file, ask linear its state; flag any **Done/Canceled**
id sitting within two lines of open-state language (`tracks it`, `trial`, `awaiting`, `pending`,
`no mechanism yet`, `until he decides`, `holds it`). **[measured]**

- **47** closed-ticket citations across resident files
- **12** survive the co-location filter
- **11** are genuine — the prose asserts work that is finished. one (`claims-carry-their-test.md`, DOT-8)
  is a historical anecdote and a correct false positive

the sharpest three, all in **always-resident** files:

- 🚨 `cclio/memory/MEMORY.md`: «**never close DOT-188**; it is Dima's» — **DOT-188 is Done.** a standing
  instruction contradicted by the board it points at.
- 🚨 `home/.claude/rules/identity.md`: «`cclio` … under the DOT-188 trial», «🧪 **NOT retiring** …
  until he decides» — **Done.** this is the file that defines every surface, in every session.
- `home/.claude/rules/mobile.md`: «that is precisely why this is a rule. DOT-93 tracks it» — **Done.**

eight of the eleven are the same DOT-188 claim, restated in eight files. 📌 **that is the duplication
finding from the sibling round, caught by a different instrument** — one fact written eight times decays
eight times, and closing one ticket falsified all eight at once.

➡️ **this is the smallest shippable piece.** the id is a machine-checkable token, the state comes from an
already-allowed cli, and the co-location filter is a fixed keyword list. no model in the loop.

### 1.3 · drift latency here is under 24 hours

`home/.claude/rules/dispatch.md` was deleted in commit `f70f7a6`, **today**. **[measured]** two documents
written **the same day** still assert it as a live resident cost:

- `docs/agents/authoring-memory.md:260` — «`dispatch.md` costs every bytes coder ~2.1k tokens»
- `docs/research/context-budget-and-memory-authorship.md:92` — lists it as a tier-2 candidate

📌 five other files also name it, correctly, as *retired*. so the naive `grep dispatch.md` is not the
check — **the check is «this path does not exist AND the sentence uses present tense»**, and that second
half needs judgment. [inferred] this is the boundary: file-existence is mechanical, *tense* is not.

⚠️ the honest reading of this: the sweep's own output went stale within hours of being written. a
quarterly upkeep cadence would not have caught it. **the check has to run on commit, or it is theatre.**

### 1.4 · the path check does not work, and it is worth saying why

94 backticked spans that look like paths do not resolve; **~2 are real.** **[measured]** the rest are
slash-commands (`/doctor`), url schemes (`linear://`), prose placeholders (`@memory/slug.md`), obsidian
files outside the repo, and correct relative references (`voice.md` meaning `rules/voice.md`).

📌 **the fix is a convention, not a better regex.** the `cursor://file/` link format from
`text-formatting.md` is *already* an unambiguous, absolute, machine-checkable path reference — and only
**2 of them exist** across the whole instruction set. [inferred] making that format the required shape
for any path a reader might open would convert a 3%-precision check into a 100%-precision one, for free.
that is a **writing rule with a linting payoff**, and it is the one place where the two halves meet.

---

## 2 · prior art — who has actually built this

- ⭐ **[`agents-lint`](https://github.com/giacomo/agents-lint)** — the closest real implementation.
  zero-dependency cli over `AGENTS.md`/`CLAUDE.md`/`.cursorrules`. **[read]** checks: path existence,
  `npm run` scripts against `package.json`, missing/deprecated deps, framework-obsolete patterns
  (removed `ReactDOM.render()`, `@NgModule`), unresolved `TODO`/`FIXME`, files <100 chars or >15,000 chars,
  cross-file package-manager conflicts, and **broken index links in claude memory files**. reports a 0–100
  freshness score; `--fix` is interactive and asks per fix.
  - 📌 **its whole method is static analysis against current repo state** — no git history, no timestamps,
    no model. **[read]** that is the same conclusion §1 reached independently.
  - 🚫 what it cannot do, by its own description: semantics. it never asks whether a rule is *right*.
  - 📌 for us it would find little — our instruction files reference few npm scripts and no framework
    patterns, and our path references are unanchored (§1.4). the **transferable part is the shape**, not
    the tool.
- **[`AgentLinter`](https://agentlinter.com/)** — hosted equivalent, same category. not evaluated.
- **`mem0` ttl / expiration on stored memories, `cognee` memify (prune stale nodes, reweight edges by
  usage frequency)** — **[read]**. both are *retrieval-store* mechanisms with usage telemetry. we have no
  per-leaf usage signal, so neither transfers. [inferred]
- **the `InstructionsLoaded` hook** — fires when a `CLAUDE.md` or `.claude/rules/*.md` is read into
  context; added in **v2.1.64**; **observe-only, no decision channel**. **[read]** ⚠️ it does **not fire on
  `/clear`** despite instructions reloading — a known open bug. **[read]**
  - **[measured]** it is **not configured on this machine.** `settings.json` wires `Notification`,
    `PostToolUse`, `PostToolUseFailure`, `SessionEnd`, `SessionStart`, `Stop`, `UserPromptSubmit`. cc here
    is 2.1.241, so the event is available.
  - ➡️ **verdict on it as an upkeep primitive: weak, and not the priority.** it answers *«did this file
    load»* — a question §1 shows is already answerable statically. it does **not** answer *«did this file
    change anything»*, which is the question §3 needs. wire it if the silent-import hazard ever fires;
    do not build the loop on it.

---

## 3 · what an eval for a memory file looks like — and why we should not build one

**[read]** two 2026 results bound this directly:

- **`Offscript`** (CHIIR 2026) — an auditing agent that opens conversations designed to probe adherence to
  a custom instruction. pilot: **flagged deviations in 84.6% of conversations; 22.2% confirmed material by
  human review.** so ~74% of its flags were noise, and a human closed the loop.
- ⭐ **the «stability trap»** (arXiv 2601.11783) — 4 judge models, 320 outputs, 90 repeated runs,
  **115,200 judgments**. verdict agreement was **>99.88%** (Gwet's AC1 0.9976–0.9998) — while *reasoning*
  stability collapsed to **≈19%** on objective quantitative tasks. the judges agreed on the answer and
  **fabricated different evidence for it every time**.
  - its own recommendation, verbatim in spirit: **delegate all deterministically verifiable logic to code;
    reserve llms for semantic evaluation.**

📌 **that is the sharpest single finding of this round, and it is a warning aimed straight at us.** an
agent auditing its own memory will produce a **confident, stable verdict with invented justification**.
the sibling round's «llm evaluators cluster tightly» result is the same failure from the other side.
🚫 **do not build an llm-judge memory audit.** it will read authoritative and it will be unfalsifiable.

**[inferred]** and the classical eval design does not fit anyway. an A/B of a rule needs: a task set the
rule should change, N runs per arm, and a scorer. here the population is **one user**, the tasks are
unrepeatable, and the sibling round already cites the finding that file size, position, architecture and
even *contradictions in adjacent files* produced **no detectable effect** on adherence in 1,650 sessions
(arXiv 2605.10039). a rule-level A/B is powered to detect nothing.

### what to build instead of an eval

a **regression check on the mechanical claims**, not a measurement of behaviour:

- a rule that names a **command** → run `--help`, confirm the flag exists
- a rule that names a **file** → confirm it exists
- a rule that names a **ticket** → confirm the state matches the tense
- a rule that carries a **probe** (`authoring-memory.md` already ships two) → **rerun the probe**

➡️ 📌 the probes in `authoring-memory.md` are the existing model for this and nobody has framed them as
such: a claim that ships with the command that proves it is **self-testing memory**. [inferred] that is
already `identity.md` tenet 2 («verified or labelled») — the upkeep loop is just *running the tests it
already told us to write*.

---

## 4 · what surprised me

1. **the memory system's freshest documents were the stalest.** `authoring-memory.md` and the sibling
   research doc, both written 2026-08-23, both assert `rules/dispatch.md` as a live cost — it was deleted
   the same day. **[measured]** staleness is not an age problem.
2. **judges agree perfectly and lie about why.** >99.88% verdict agreement, ~19% reasoning stability.
   **[read]** an agent auditing memory would pass every consistency check we could think to apply to it.
3. **the barrel is clean.** 54/54. **[measured]** the hazard everyone writes about is not the one firing.
   the one firing is **ticket state**, which nothing had ever checked.
4. **8 of 11 defects were one sentence written 8 times.** duplication is not merely a context cost — it
   is a **decay multiplier**. one board change falsified eight files.

---

## sources

- [agents-lint](https://github.com/giacomo/agents-lint) — cli linter for AGENTS.md / CLAUDE.md / memory files
- [AgentLinter](https://agentlinter.com/) — hosted equivalent
- [The Stability Trap: Evaluating the Reliability of LLM-Based Instruction Adherence Auditing](https://arxiv.org/html/2601.11783) — 115,200 judgments; verdict vs reasoning stability
- [Offscript: Agentic Auditing of Instruction Adherence in LLMs](https://dl.acm.org/doi/10.1145/3786304.3787891) — CHIIR 2026
- [Hooks reference — Claude Code docs](https://code.claude.com/docs/en/hooks)
- [InstructionsLoaded does not fire on /clear](https://github.com/anthropics/claude-code/issues/31017) — open bug
- [Hooks reference is missing the InstructionsLoaded hook event](https://github.com/anthropics/claude-code/issues/30573)
- [Spring AI AutoMemoryTools](https://spring.io/blog/2026/04/07/spring-ai-agentic-patterns-6-memory-tools/) — consolidation-by-asking-the-agent pattern
