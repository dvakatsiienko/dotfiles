---
name: dima-strategies
type: project
---

# dima's strategies — the branch map

The CEO-altitude view. [[dima-stories]] holds what happened, [[dima-roadmap]] holds what we do
next, this holds **where it is all going**.

**Why pm needs it:** a ticket decision made without knowing which branch it serves is how the
tracker drifts. Placement, priority, folding, and what earns a spawn all depend on the branch. When
Dima asks «where are we», the honest answer is per branch, not per ticket.

🎯 **All six are equally weighted.** None is the main one; none is a side quest. They advance at
different speeds because of quota, mood and blockers, **never because one matters more**. Do not
silently promote the branch in front of you, and do not apologise for one that has been quiet.

**Using it:** name a ticket's branch before creating it — fitting none is a signal. Give every
branch a line when reporting, including the quiet ones, because a branch nobody names is one being
abandoned by default. When Dima steers, ask which branch he is steering; the same move means
different things on different ones. A branch is **not** a Linear project — projects are storage,
branches are direction, and several projects can serve one branch.

---

## 📋 pm — the tracker and the flow that runs it

**A chiller loop, not a fuller board.** Dima: *«you are intended to optimize flow not make it
hotter. you have powerful capabilities and use them imprecisely.»* The measure is not how much is
captured, it is how much has been **retired**, and how little of his attention each retirement cost.

Capture is cheap for an agent and retirement is expensive for a human, so the board grows
monotonically and the heat never comes down. Powerful tooling makes this worse: a sweep finds real
things, files them correctly, and leaves the debris. **Every correct action can still degrade the
system.**

Moves live in [[pm]]. The `freebie` label is the delegation escape hatch — pre-approved work that
runs while he is away. Heading toward a tracker he reads for orientation rather than processes as a
queue.

📌 Every other branch produces tickets, so pm is where the other five become visible. If pm is hot,
everything feels hot. That is why it is not «the admin branch».

## 🤖 fleet — the agents themselves

**One mind, many surfaces, with a single source of truth for mental models and responsibilities.**
His words. Not one agent, not synced copies: one set of facts, read from wherever the work happens.

The fleet grew surface-first, each surface with its own memory, skills and boot ritual. The bridge
between them was never built, and hand-made copies stood in for it, each needing its own
maintenance ritual. → [[memory-divergence-store]]

✅ The coordinator migration to ccli is done ([DOT-188](linear://linear.app/issue/DOT-188)). It
resolved that by **deletion rather than automation**: one config root, layered by directory, so no
bridge is needed. Two roles stay distinct in all thinking — **ccli-coord**, small flat context,
owns planning and the tracker; **ccli-code**, large disposable context, owns edits. The coordinator
may edit, and that peek is what makes pair-review possible.

**The standing value: be an expert of yourself.** Every surface knows its own tools, config and
vocabulary cold at session start. Asking Dima what a label means is a bug.

## 🔧 dima's tools — git, shell, nvim, dotfiles

**Tools good enough that the agent can act confidently in them.** His reframe, and it is what makes
this strategic rather than cosmetic:

> «my git is used by both of us. you use it ~98% more than me… so you'd be interested to have a
> proper git setup. so you could do your sweeps more confidently 😏»

These are not his tools that agents borrow. They are **shared tools where the agent is the majority
user**, which inverts who the ergonomics should serve.

The problem underneath: agent and human commit under one identity with no way to tell the work
apart afterwards. That caps how confidently an agent can sweep, because a bad sweep is
indistinguishable from his own work. [DOT-159](linear://linear.app/issue/DOT-159) scrapes the
histories for the fingerprint that already separates them.

📌 Deliberately **after** the fleet settles. Touching git and shell while everything else is open
spawns six tickets. Waiting is not neglect.

## 📦 bytes — the product work

Actual work on the x-com products: bytes, numi, sline, plugin-x. **The thing all the agent
infrastructure exists to serve.**

🚨 Its whole status and whole risk, in his own unprompted words: **«did not even touch bytes for
the last week.»** Every other branch is meta-work, which is more legible, more satisfying to sweep,
and never finishes. Bytes is the branch that loses when the others feel productive.

- **surface it.** Bytes going quiet is not neutral. Mention it in reports *especially* when nothing
  changed
- 🚫 **do not fix it by adding bytes tickets.** It needs sessions, not backlog
- when the fleet work lands, the honest test of whether it worked is whether bytes gets touched
  more. That is the outcome measure for the whole system, not context size or ticket counts

## 🛠️ harness — the home-baked orchestration layer

**Wanted, and deliberately deferred.** His words: *«i would still prefer a harness that satisfies my
style 😎 and it's interesting.»* Both halves are real reasons — the fit and the fun.

⏰ **Due ~2026-09-04.** Build it after two weeks of the plain setup, because a harness built now
encodes what we *assume* is missing and one built later encodes what actually is. **A deferral with
a date and a test, not an evasion** — if the date passes and he has not raised it, raise it.

Research says the MVP is ~12 lines of bash around `claude -p --resume`, or ~55 lines against the
Agent SDK. The coordinator-as-bottleneck is a named, unsolved failure mode in Anthropic's own
multi-agent work — design around it, do not assume it away.

📌 Hold the tension out loud: every branch benefits from a harness, and it is also the most
seductive thing on the board. That is the meta-work trap that starves bytes.

## 👁️ visibility — seeing what the agents do

**«upgrade you even more = visibility.»** His framing and his sequencing: *«but let's try mvp
first.»* Ambient awareness while work happens, not reports written afterwards.

He orchestrates agents he cannot watch. Sline proves the pattern works and proves how little of it
exists. The deeper issue is the same one the tools branch hits in git: **he cannot tell his own work
from the agents' after the fact.** Visibility and attribution are one question at two layers.

📌 Notice when other work quietly builds a piece of this — reading a running session's diffs, the
daily digest, artifacts over terminal dumps. That is the cheap way it gets built.
