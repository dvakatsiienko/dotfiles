---
researched: 2026-08-23
refresh-when: a new model ships, a benchmark is published, or Dima's lived read changes
ticket: DOT-130
---

# Models — the full reference

**Read on demand when a model-selection question opens.** Moved out of `rules/`, where every coder
session paid for it; the distilled version cclio actually acts on lives in `cclio/memory/spawning.md`.

📌 This file is meant to stay evergreen — [DOT-130](linear://linear.app/issue/DOT-130) owns that.
Add measurements and Dima's live calls; never delete a claim tag.

Claim tags: **[dima]** his own assessment, assert it · **[bench]** published benchmark · **[vendor]**
Anthropic's framing · **[community]** repeated practitioner pattern · **[?]** no evidence either way.

📌 A session knows its model from startup and **cannot detect a mid-thread switch.** Never claim
to notice one.

## fable-5 — `claude-fable-5`

Mythos-class. $10/$50 per MTok. Launched 2026-06-09; suspended 06-12, redeployed 07-01.

- **Best at** — all-round work: writing, PM, coordination, comprehensive-but-sane replies. Codes
  no worse than opus, differently. **[dima]**
- Long-horizon autonomous tasks and vision. SWE-bench Pro **80.0%**, the highest of the four. **[bench]**
- **Weak at** — loses Frontier-Bench to opus-5, 33.7 vs 43.3 (Anthropic-run). **[bench]**
- ⚠️ Safety classifiers route cyber / bio-chem / distillation-flagged queries to Opus 4.8 in <5% of
  sessions, and the fallback can happen **mid-session**. 30-day data retention is mandatory. **[vendor]**
- **Pick it for** — anything Dima reads, anything coordinating other work.
- Prose quality and PM fitness vs opus-5 are **[?]** — nobody has published a comparison. Dima's
  read is the only evidence, and it is enough here.

## opus-5 — `claude-opus-5`

Launched 2026-07-24. $5/$25 per MTok, 1M context, 128k output.

- **Best at** — under-the-hood engineering: features, CI, ssh debugging. **[dima]**
- SWE-bench Verified **96.0%** (near-saturated), SWE-bench Pro 79.2%, **leads Frontier-Bench 43.3%** —
  long-horizon agent work, self-verification, ill-defined problems. **[bench]**
- ⚠️ **Weak at** — prose. Overlong and over-clever; invents jargon, writes documentation nobody
  asked for, commits to assumptions instead of asking. **Not a PM.** **[dima]** **[community]**
- Correctable by explicit prompt constraints, not by hoping. **[community]**
- **Pick it for** — hard multi-step engineering where the output is code, not text.

## sonnet-5 — `claude-sonnet-5`

Launched ~2026-07-13. $2/$10 until 2026-08-31, then $3/$15.

- **Weaker fallback** — quota pressure or simple ops. **[dima]**
- SWE-bench Pro 63.2%, a **16-point gap** below opus-5. Real, not marginal. **[bench]**
- **Pick it for** — routine, well-specified coding and high-volume work. **Avoid** for hard
  multi-step engineering.
- Field reports still sparse as of 2026-08. **[?]**

## haiku-4.5 — `claude-haiku-4-5`

Launched 2025-10. The light and fast tier. **[dima]**

- SWE-bench Verified 73.3%; ~4–5× faster than Sonnet 4.5 at much lower cost. **[bench]**
- **Pick it for** — subagents, classification, summarization, retrieval, bulk processing.
- 📌 Its benchmarks compare it to the 4.x generation, never to the 5s. Do not read 73.3% as
  comparable to the numbers above.

Maintained by the `refresh-model-knowledge` procedure (`cclio/docs/procedures/`) — raw research
is transient; this file is the pristine result.

## spawn defaults — set by Dima, binding on every surface that spawns

| model | spawned? | effort |
| --- | --- | --- |
| **opus-5** | the default coder | **always `high`** |
| **fable-5** | 🚫 never, unless Dima asks by name | `low`, even when he asks |
| sonnet-5 | quota pressure, simple specified work | inherit |
| haiku-4.5 | bulk, classification, retrieval | inherit |

📌 **opus moved from `low` to `high` on measured evidence**, not taste: a full day of `high` raised
weekly usage by only **~10%**. The cost argument for `low` is dead. Do not revert it on a hunch.

📌 `--effort` is a flag on `claude --bg` and is honoured; it is never inherited, so pass it every
time.

## conv picks 2026-08-19 — task→model data (Dima's live calls, keep growing)

- overhaul-audits with taste (git, zsh configs): **fable** — «opus picks pragmatically, fable = flavour; i want best picks»
- public-facing pretty output (gh profile opener): **fable** — «opus prints pretty, fable prettier; must be even prettier»
- server/scripting builds with locked specs (mcp mvp, sync script): **opus** — self-descriptive lane
- research rounds + debugging investigations (skill-maintenance research, cloud-spawn bug): **opus** — bull food
- verdict-shaped deliverables (harness one-pager): opus researches upfront, **fable verdicts** — split the ticket's phases across models
- marker on the board: model labels (`fable 5`/`opus 5`) ARE the assignment mechanism — self-descriptive, no extra vocab
