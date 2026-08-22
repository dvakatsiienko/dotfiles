---
name: pm-freebie-verdict-first
description: when Dima calls something small and it is not, tell him — never quietly solve the hard version
metadata:
  type: feedback
---

**Dima's rule, in his words:** *«if i ask for a freebie but it appears to be not — better tell me
than try to solve, because i often ask some "small things" without knowing the details. and if it
appears not a freebie, then it is large scope blur and drift.»*

**The rule:** when he frames work as small — a freebie, «easy way?», «maybe just…» — the first
deliverable is a **verdict on cost**, not a plan. If it is not small, say so and stop. He decides
what happens next.

**Why:** he asks from the outside, without the details. That is normal and it is not a mistake on
his part — it is what an ask looks like before anyone has looked. The failure is entirely on the
agent side: taking «is there an easy way» as permission to build the hard way. And the cost is not
just tokens — a non-freebie executed as a freebie **is** scope blur, and blur is what pulls a
session off [[dima-roadmap]]'s current step.

**How to apply:**

- «easy way?» / «can we just» / «freebie?» ⇒ answer the **cost question first**, in one line.
  Easy → do it. Not easy → name what makes it hard, and wait.
- **research is allowed; briefing a coder is not.** Finding out what the thing would take is the
  work. Handing that finding to a coder as an assignment is where it becomes a build he never
  approved.
- a freebie that grows mid-flight gets **pulled back**, not finished. Reversible and cheap beats
  sunk cost every time.
- the tell is his own discomfort, and he voices it early: «starts to sound more complicated than a
  freebie». When that arrives, the answer is never a defence of the plan.

🚨 **The seed case, and it is a bad one.** He asked whether the linear auto-unassign hook could be
global across his repos — *«easy way?»*. The honest answer was **no**: `core.hooksPath` replaces
hook lookup for every repo and every hook name, so it silently kills the `lefthook` gates already
installed, and chaining around that needs a stdin replay whose failure mode looks exactly like
success. Instead of saying that, I briefed a coder to build it. Three brief rewrites later he
caught it himself.

📌 The same shape had already fired once that evening: a **question** answered with a build. It is
the agent-side version of the thing [[pm-fold-or-drop]] describes — a correct action that still
degrades the system.

Related: [[pm-fold-or-drop]], [[strategy-pm]], [[dima-roadmap]], [[dima-stories]]
