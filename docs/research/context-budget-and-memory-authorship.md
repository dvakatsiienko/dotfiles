---
researched: 2026-08-23
sources-current-as-of: 2026-08-23
refresh-when: a long-context degradation study is published that measures Claude 5-family models specifically, or claude code changes how `rules/` and memory barrels load
ticket: DOT-216
---

# context budget and memory authorship

phase 0 of the memory-and-skills sweep. two questions, both dima's:

1. what context size should we hunt, and **what do we do wrong** to boot at 115k and reach 200k after one turn?
2. can agents be taught to write and maintain their own skills and memory — and who is better at it, a human or an agent?

📌 the *principles* half (attention budget, right altitude, jit retrieval, compaction/notes/subagents) is
already written up in [`docs/research/context-engineering-memory.md`](cursor://file/Users/dima/dotfiles/docs/research/context-engineering-memory.md) (DOT-189).
this doc does **not** repeat it. this doc is the number, the diagnosis, and the authorship question.

claim tags: **[measured]** = counted on this machine today · **[read]** = stated by a source, tag names it ·
**[inferred]** = my reasoning from the two above, not stated anywhere.

---

## 1 · the number — verdict

🚫 **there is no number. do not adopt one.** the ~120k figure was never a property of the model.
it was a property of a *task* that someone measured once.

the current primary evidence is chroma's [context rot](https://www.trychroma.com/research/context-rot)
study — 18 models across anthropic, openai, google and alibaba families. its own conclusion, verbatim:
«model performance degrades as input length increases, **often in surprising and non-uniform ways**». [read]

what that means concretely, from the same study: [read]

- degradation is **not a cliff**. it is a gradient that is measurable from small inputs upward. there is no
  length below which you are safe and above which you are not.
- **a single distractor measurably lowers accuracy**, at any length. more distractors compound.
  individual distractors are not equal — some hurt far more than others under identical conditions.
- **semantic similarity is the dominant variable.** when what you need closely matches what was asked,
  accuracy holds far longer. when it does not, degradation accelerates with length.
- ⚠️ **models scored better on *shuffled* haystacks than on logically structured ones.** coherent prose
  was *worse* for retrieval than the same content jumbled.
- claude models had the **lowest hallucination rate** of the four families; sonnet 4 and opus 4 abstained
  rather than invent when uncertain. that is a real advantage and it is the reason a bloated window here
  fails as *vagueness*, not as confident nonsense. [read]

📌 the one length figure worth carrying: for 1M-window models a clearly observable effect is commonly
placed around **300–400k tokens**. [read] — from secondary summaries of the chroma work, **not** from a
measurement of a claude 5-family model. treat it as a horizon, never as a target.

⚠️ **what the headline numbers hide.** `LoCoMo`, the most-cited agent-memory benchmark, is near-saturated —
and agents with near-saturated LoCoMo scores still perform poorly in real agentic settings. [read]
LoCoMo measures *recall*; production needs memory that **changes behaviour**. a benchmark can average to
96% while the one thing you need scores zero. the same trap applies to any single context-length number.

### what to hunt instead

not tokens. **resident tokens this turn will not use**, and **duplicate statements**. both are countable.

| proxy | today | why it is the right proxy |
| --- | --- | --- |
| the same rule written more than once | ≥ 3 known cases, named in `mem-run.md` | a divergent duplicate **is** a distractor in the measured sense above |
| chars per token in memory text | **2.89** [measured] | see §2.2 — the prettiness has a price nobody counted |
| memory loaded eagerly vs on demand | ~100% eager | see §2.1 — the opposite of what anthropic's own guidance says |

---

## 2 · «what do we do wrong» — verdict

**115k at boot is not wrong in size. it is wrong in *kind*.** three findings, ranked.

### 2.1 · everything is eager, and the lazy mechanism already exists and works

measured today, cold boot of the coordinator: memory files **71.7k** of **115.1k** — 62%.
skills are **5.7k**. [measured, from dima's `/context` readout]

skills are cheap **because they are lazy-loaded**. memory is expensive because nothing about it is.
both of the loaders say so in their own words:

- `rules/voice.md`: «every `.md` here is auto-loaded into every session — no import, no hook. adding a
  file is the whole wiring, and **it costs resident tokens in sessions that never need it**».
- `cclio/CLAUDE.md`: «memory is a barrel that AUTOLOADS … **every leaf is in context from the first turn**».

so the system already names its own flaw twice, in the files that cause it. anthropic's guidance is the
opposite policy — «the smallest possible set of high-signal tokens», with just-in-time retrieval as the
default and pre-loading as the exception. [read, [effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)]

📌 **the fix shape this implies** — not a trim, a *tier*. three tiers, and the question for every leaf is
which tier it belongs to, never how short it can be made:

1. **always resident** — changes what you do on a turn you cannot predict. identity, refusals, voice.
2. **loadable** — a skill, or a pointer line the agent follows when the topic comes up. `dispatch.md`,
   `models.md`, `linear-fetch-contract.md` are shaped like this and are resident.
3. **archive** — `docs/`. true, worth keeping, not needed in a window.

[inferred] — the tiering is my proposal, not a finding. what *is* a finding is that tier 2 currently has
no members among memory files while skills prove the mechanism works.

### 2.2 · the tokenizer tax — the lever nobody counted

**[measured]**, on this machine, today:

| file set | bytes |
| --- | --- |
| `home/.claude/rules/*.md` | 43,691 |
| `home/.claude/CLAUDE.md` | 14,237 |
| `cclio/memory/*.md` (barrel + 30 leaves) | 135,547 |
| `cclio/CLAUDE.md` | 2,550 |
| `dotfiles/CLAUDE.md` | 11,022 |
| **total** | **207,047** |

207,047 bytes reported as 71.7k tokens ⇒ **2.89 chars per token**. ordinary english prose runs ~4.0.

**this text is ~38% more expensive per character than plain prose.** [measured for the ratio,
[inferred] for the cause] the cause is visible on any page of it: emoji line-prefixes, table pipes,
backticked identifiers, `linear://` and `cursor://` urls, box-drawing, ticket ids. each fragments into
several tokens.

📌 this does **not** mean stop being pretty. it means the formatting rules have a measurable context
price that has never appeared in any budget discussion, and «trim the words» is not the only lever
available. a table that could be three bullets costs more than its word count suggests.

### 2.3 · the 200k-after-one-turn part is normal; the risk in it is not length

reaching ~200k after a real first turn is **ordinary for coordinator-class work** — tool results,
file reads and a linear fetch are large. [inferred] nothing in the evidence says 200k of a 1M window
is a degraded place to be.

what *is* a live risk at 200k is §1's distractor finding, and the memory system has confirmed distractors
in it. `mem-run.md` names one itself: the entity-first naming rule is **recorded three times under three
names** — subject-first, family-first, entity-first. three statements of one rule, worded differently,
all resident. that is the exact failure chroma measured, and it needs no threshold to be crossed.

➡️ **so the diagnosis is: eager loading and duplication, not size.** a sweep that only shortens files and
leaves them all resident and all triplicated will move the number and not the behaviour.

### 2.4 · the `permissions.deny` lever — assessed, and it is not the first move

🚫 **the widely-repeated «25k → 8k» figure has no primary measurement behind it that i could find.**

- the upstream request is [claude-code issue #66073](https://github.com/anthropics/claude-code/issues/66073),
  **closed as not planned**, stale-labelled, with **no maintainer reply and no measured before/after**.
  its numbers («~30 tools, 16k+ tokens, 2–4k saved per turn») are the author's own estimates, stated as
  estimates. [read]
- the mechanism claim — a **bare** deny (`"NotebookEdit"`) drops the tool's schema from the system prompt,
  while a **scoped** deny (`"Bash(rm *)"`) keeps the tool and blocks the call — is repeated by practitioner
  write-ups. [read] i found no anthropic documentation confirming it.
- 📌 **this machine already uses it.** `NotebookEdit`, `CronCreate/Delete/List`, `AskUserQuestion`,
  `EnterPlanMode/ExitPlanMode` are already denied in user settings. so whatever it saves, we have already
  banked. the 24.9k measured today is the figure **after** those denies. [measured + [inferred]]

**the arithmetic that settles it:** system tools are 24.9k of 115.1k — 22%. a perfect, capability-free trim
would return ~17k, i.e. **~15% of boot**. memory is 62%. and the cost is not tokens: a denied tool is
*invisible* to the session, not merely blocked — dima's own `CLAUDE.md` already documents that pain
(«a disabled server is invisible to a session … no way to turn it on from inside»).

➡️ smaller lever, real capability cost, unverified savings. **do memory first.** if this is ever pulled,
pull it as a measured experiment — `/context` before, `/context` after — not on a blog post's number.

---

## 3 · can agents maintain their own memory? — verdict

**nobody knows yet.** there is no study measuring who writes better memory or skill files, a human or an
agent. what exists is adjacent, and it points one direction consistently:

> ✅ agents are competent at **producing** memory text.
> 🚫 the failures are in **deciding what should exist, and what should stop existing.**

### the weak evidence, and exactly how weak

- **most production memory failures originate in the *write* and *manage* stages, not the *read* stage
  that benchmarks cover.** [read] this is the single most load-bearing finding for DOT-216: the sweep is a
  manage-stage intervention, and that is where the evidence says the failures live. it is also why a
  read-side improvement (a better index, better retrieval) would not have fixed this system.
- **memory hallucination dominates non-timeout failures — 58.9% on average.** [read] measured on
  `MemGUI-Bench` (mobile GUI agents), so the *number* does not transfer here. [inferred] the *class* does:
  an agent confidently acting on a memory that is stale or was never true. the memory system here already
  has a name for this shape — a claim asserted instead of attributed.
- ⚠️ **`STATE-Bench` (microsoft, 2026-05) does not answer the question, and should not be cited as if it
  does.** its announcement reports a *baseline without memory* — GPT-5.1 completing «fewer than half of
  tasks reliably», ~30% pass^5 in the travel domain — and explicitly does **not** report whether
  memory-equipped agents did better. it is a framework for asking the question, not an answer to it. [read]
- **llm evaluators cluster their scores tightly and fail to separate high-quality from low-quality
  instructional material, where human evaluators spread their scores widely.** [read] that study is about
  *judging*, not writing — but the self-maintenance loop dima is asking about **is a judging loop**. an
  agent grading its own memory is the exact capability the study found weak.
- **humans remain the only ground-truth oracle for whether an agent action matches actual intent** —
  automated verification alone does not close the intent-alignment gap. [read]

### the answer to «who is better»

[inferred], and stated as inference: **the split is not human-vs-agent, it is write-vs-delete.**

| step | who | why |
| --- | --- | --- |
| drafting a file from a decision that was made | agent | it was there, it is fast, and the evidence shows no weakness here |
| deciding a file should exist at all | human | agents over-produce; the tight-clustering result says they cannot grade their own output |
| deciding a file should **stop** existing | human | no evidence any agent does this well; every incentive runs the other way |
| checking a claim carries its test | either, adversarially | this is verification, and it is the one judging task with a mechanical answer |

this matches the finding the run exists for, already in `mem-run.md`: opus writes long by default, and asked
who the long version served, answered «the user» — wrongly. **~70% of written text was not needed.**
that is a measurement of exactly the weakness the outside evidence predicts. [measured, by dima]

### so how do you teach it

you do not teach taste. you **constrain the write**, and you keep the delete decision out of the loop.

- a **write contract** (what a file may contain, what it may not) beats a style instruction. an agent
  follows a contract; it drifts from an adjective.
- **attribution over assertion** for anything an agent sourced — the rule already exists here twice and
  the evidence above is the reason to generalise it, not shrink it.
- an **index that is generated, never hand-written.** `mem-run.md` already names this: a hand-written
  barrel can silently lie by omission. that is a manage-stage failure, the class the evidence says
  dominates.
- ⚠️ what a generator cannot fix is **hook quality** — a one-line pointer that undersells a leaf makes the
  index fail to surface it, and nothing detects that. stays human.

---

## 4 · the three things that surprised me

1. **shuffled beat coherent.** models retrieved *better* from a jumbled haystack than from logically
   structured text. [read] the instinct to write memory as beautiful connected prose is not supported —
   and may be actively wrong. flat, separable, repetitive-looking statements may retrieve better than
   an elegant narrative.
2. **the prettiness has a price and it is 38%.** 2.89 chars per token vs ~4.0 for prose. [measured]
   nobody had counted the emoji, tables and backticks as a context cost.
3. **the `permissions.deny` savings figure everyone repeats traces back to a github issue that was closed
   as not planned, with the numbers labelled as estimates by their own author.** [read] and the denies
   are already applied here anyway, so the 24.9k is the *post-trim* figure.

---

## sources

- [Context Rot: How Increasing Input Tokens Impacts LLM Performance](https://www.trychroma.com/research/context-rot) — chroma research, 18 models
- [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — anthropic engineering
- [Feature: Allow disabling specific built-in tools to reduce context overhead](https://github.com/anthropics/claude-code/issues/66073) — closed as not planned
- [Introducing STATE-Bench](https://opensource.microsoft.com/blog/2026/05/19/introducing-state-bench-a-benchmark-for-ai-agent-memory/) — microsoft open source
- [AI Memory Benchmarks 2026: LoCoMo, LongMemEval & BEAM](https://mem0.ai/blog/ai-memory-benchmarks-in-2026) — the write/manage-vs-read finding
- [MemGUI-Bench](https://arxiv.org/pdf/2602.06075) — memory hallucination failure share
- [Instructional Agents](https://arxiv.org/pdf/2508.19611) — llm evaluators cluster scores, humans spread them
- [Reframing LLM Agent Security as an Agent–Human Interaction Problem](https://arxiv.org/html/2605.24309v1) — humans as intent oracle
- [Reduce System Prompts by Disabling Built-in Claude Code Tools](https://zenn.dev/sqer/articles/5c52615eeabce0?locale=en) — the bare-vs-scoped deny mechanism
