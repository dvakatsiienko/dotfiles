# Claude model strengths & weaknesses — verified knowledge base

Researched 2026-08-17. Tags: [vendor] = Anthropic's own framing · [benchmark] = published benchmark (vendor-run unless noted) · [community] = repeated practitioner pattern · [unverified] = no evidence found either way.

**Timeline matters:** Fable 5 launched **Jun 9, 2026** (suspended Jun 12, redeployed Jul 1) — *before* Sonnet 5 (~Jul 13) and Opus 5 (Jul 24). Most Fable community comparisons are vs **Opus 4.8**, not Opus 5. Direct Fable-5-vs-Opus-5 field experience is scarce.

---

## Claude Fable 5 (`claude-fable-5`)

**Best at**
- Long-horizon, ambitious, multi-step agentic work — vendor's own claim is "the longer the task, the larger the lead" [vendor]; community confirms it stays coherent on long agent runs where Opus 4.8 drifted, and Karpathy called it a "major-version-bump-deserving step change" [community]
- SWE-bench Pro 80.0% (vs Opus 5 79.2%, Sonnet 5 63.2%) [benchmark]
- Vision (rebuild app from screenshots; beat Pokémon FireRed vision-only) [vendor]
- Extremely resourceful/proactive tool use — Simon Willison documented it inventing its own browser-screenshot + CORS-diagnostics harness from a one-line prompt [community, single detailed account]

**Weak at / gotchas**
- Safety-classifier fallback: cyber, bio/chem, and distillation-flagged queries silently route to Opus 4.8 mid-session (<5% of sessions per Anthropic, now flagged on API) [vendor]; Willison hit it mid-debug [community]
- Loses to Opus 5 on Frontier-Bench (33.7% vs 43.3%) — Anthropic's own agentic-coding eval [benchmark]
- Cost: $10/$50 per MTok — 2× Opus 5, burns subscription limits fast; consensus that it's overkill for routine tasks ("Opus 4.8 remains the smarter choice for 80% of daily work" per one review) [community]
- Mandatory 30-day data retention on all Mythos-class traffic [vendor]
- Prose/writing quality vs Opus 5: **[unverified]** — no benchmark or repeated community pattern found
- PM/coordination fitness: **[unverified]**

**Pick when:** hard, long, autonomous tasks — big refactors/migrations, long agent runs, vision-heavy work, tasks other models fail.
**Avoid when:** routine coding, quota pressure, security-adjacent work (fallback risk), strict data-residency needs.

---

## Claude Opus 5 (`claude-opus-5`, launched Jul 24, 2026)

**Best at**
- Software engineering: SWE-bench Verified 96.0% (near-saturated), SWE-bench Pro 79.2% — within 1pt of Fable at half the price [benchmark]
- Leads Frontier-Bench 43.3% (ahead of Fable 33.7% and GPT-5.6 Sol) — long-horizon agent work, self-verification, ill-defined problems [benchmark, vendor-run]
- 1M context window, 128k max output; $5/$25 per MTok [vendor]

**Weak at / gotchas**
- Prose style is a widely-reported problem: "load-bearing"-style invented jargon, elliptical/over-abstract sentences, "Claudisms" — a running joke on HN and r/ClaudeAI [community, strongly repeated]
- Over-production: pages of unrequested documentation and verbose comments; this behavioral issue, not the style, is what costs time [community]
- Commits to bold assumptions instead of asking — the "why does Opus 5 feel worse to work with?" HN thread (778 pts) attributes this to RL training trade-offs [community, one prominent thread]
- Over-engineering complaints on Reddit (Aug 2026) [community]
- PM/coordination fitness: **[unverified]** directly, but the jargon + over-assumption pattern is a plausible bad fit for stakeholder-facing text

**Pick when:** complex/under-specified engineering, multi-repo refactors, long debugging, huge-context work, best coding-per-dollar at the top tier.
**Avoid when:** output is prose humans will read as-is (docs, updates, comms) without a style-constraining prompt.

---

## Claude Sonnet 5 (`claude-sonnet-5`, launched ~Jul 13, 2026)

- SWE-bench Pro 63.2% — a real gap below Opus 5 (79.2%) and Fable (80.0%) [benchmark]
- Positioned for everyday coding: bug fixes, test generation, CI triage — best value at $2/$10 intro (→ $3/$15 from Sep 1, 2026) [vendor] [benchmark-based reviews]
- Little independent community depth found yet — mostly pricing/benchmark comparisons, few field reports [gap]

**Pick when:** routine well-specified tasks, cost/quota pressure, high-volume pipelines.
**Avoid when:** hard multi-step engineering — the benchmark gap to Opus/Fable is large, not marginal.

---

## Claude Haiku 4.5 (`claude-haiku-4-5`, launched Oct 2025)

- SWE-bench Verified 73.3%; ~4–5× faster than Sonnet 4.5 at a fraction of the cost [benchmark]
- Roughly Sonnet-4-class capability; credible primary model for subagents, classification, summarization, retrieval, bulk processing [benchmark] [community]
- Community likes the high usage limits [community]
- Note: benchmarks compare it to the 4.x generation, not Sonnet 5 [gap]

**Pick when:** speed/cost dominate — subagent fleets, simple ops, triage.
**Avoid when:** deep reasoning or long-horizon autonomy needed.

---

## Your hypothesis vs the evidence

| Claim | Verdict |
|---|---|
| Opus 5 strong at under-the-hood engineering | **Holds** — 96% SWE-bench Verified, Frontier-Bench lead [benchmark] |
| Opus 5 prose: overlong, exotic vocabulary | **Strongly holds** — the single most repeated community complaint [community] |
| Opus 5 poor for PM/coordination | **Plausible but unverified** — inferred from prose+assumption issues, no direct reports |
| Fable 5 better all-round, readable writing | **Partly breaks** — Fable leads SWE-bench Pro but *loses* Frontier-Bench to Opus 5 [benchmark]; writing quality comparison is [unverified] — nobody has published Fable-vs-Opus-5 prose comparisons |
| Fable codes "not worse, but differently" | **Supported directionally** — distinct style: relentlessly proactive, strong long-horizon coherence [community], but the direct comparison target in most reports is Opus 4.8 |
| Sonnet 5 = weaker version of both, quota fallback | **Holds** [benchmark] |
| Haiku 4.5 = light/fast tier | **Holds** [benchmark] |

**Honest gaps:** (1) Fable 5 prose/PM quality — no data. (2) Fable 5 vs Opus 5 head-to-head field experience — almost none; Opus 5 is 3 weeks old, Fable's press cycle predates it. (3) Sonnet 5 community experience — thin. Revisit in ~1 month.

---

## Memory-file snippets (verified facts only)

**fable-5**
```
claude-fable-5: Mythos-class, same underlying model as Mythos 5. $10/$50 per MTok.
Launched 2026-06-09; suspended 06-12, redeployed 07-01. SWE-bench Pro 80.0%.
Best measured strength: long-horizon autonomous tasks and vision. Safety classifiers
route cyber/bio-chem/distillation-flagged queries to Opus 4.8 (<5% of sessions);
fallback can occur mid-session. 30-day data retention is mandatory. Scores below
Opus 5 on Frontier-Bench (33.7 vs 43.3, Anthropic-run). No published data on its
prose quality or PM-task performance vs Opus 5.
```

**opus-5**
```
claude-opus-5: launched 2026-07-24. $5/$25 per MTok, 1M context, 128k output.
SWE-bench Verified 96.0%, SWE-bench Pro 79.2%, leads Frontier-Bench 43.3%.
Repeated community pattern: prose uses invented jargon and abstraction
("load-bearing" etc.), generates unrequested documentation, and commits to
assumptions rather than asking. Style is correctable via prompt constraints.
```

**sonnet-5**
```
claude-sonnet-5: launched ~2026-07-13. $2/$10 intro until 2026-08-31, then $3/$15.
SWE-bench Pro 63.2% — a 16pt gap below Opus 5. Suited to routine, well-specified
coding and high-volume work. Community field reports still sparse as of 2026-08.
```

**haiku-4.5**
```
claude-haiku-4-5: launched 2025-10. SWE-bench Verified 73.3%; ~4-5x faster than
Sonnet 4.5 at much lower cost. Appropriate for subagents, classification,
summarization, bulk processing. Not benchmarked against the 5-generation models
for reasoning depth.
```

---

### Sources
- [Anthropic: Claude Fable 5 and Claude Mythos 5](https://www.anthropic.com/news/claude-fable-5-mythos-5) (Jun 9, 2026)
- [Simon Willison: Claude Fable is relentlessly proactive](https://simonwillison.net/2026/Jun/11/fable-is-relentlessly-proactive/) (Jun 11, 2026)
- [Claude Opus 5 benchmarks analysis](https://claude5.ai/news/claude-opus-5-benchmark-results-analysis) · [SitePoint Opus 5 performance](https://www.sitepoint.com/claude-opus-5-performance/)
- [HN: "Why does Opus 5 feel worse to work with?"](https://news.ycombinator.com/item?id=49296740) · [Opus 5 "Claudisms"](https://www.explainx.ai/blog/claude-opus-5-load-bearing-claudisms-writing-tells-2026) · [dev.to: Opus 5 jargon fix](https://dev.to/altryne/its-not-just-you-opus-5-is-a-jargon-douche-but-theres-a-fix-3d8m)
- [Sonnet 5 vs Opus 5 (DataCamp)](https://www.datacamp.com/blog/claude-opus-5-vs-claude-sonnet-5) · [coursiv.io comparison](https://coursiv.io/blog/claude-opus-5-vs-sonnet-5)
- [Anthropic: Claude Haiku 4.5](https://www.anthropic.com/news/claude-haiku-4-5) · [DataCamp Haiku 4.5](https://www.datacamp.com/blog/anthropic-claude-haiku-4-5)
- [Fable 5 review roundups: atlascloud](https://www.atlascloud.ai/blog/guides/claude-fable-5-review) · [tosea.ai developer reactions](https://tosea.ai/blog/claude-fable-5-review-developer-reactions)
