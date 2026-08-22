🚫 **Never say «mcp lost».** That summary is wrong, and it was said once already.

**What [DOT-165](linear://linear.app/issue/DOT-165) actually decided:** mcp is the wrong home for the **bulk skill store** — every
skill would be one permanently-loaded tool description, ccli natively prefers files, and mobile
has no mcp at all. That is a narrow verdict about *storing all skills in tool descriptions*.

**What it did not decide, and what Dima corrected:**

> «wait, but i also use claude desktop, and mcp works well in this approach. without mcp i'll have
> to drag and drop skill which is not good. i want automation, this is what current handoff-mcp
> (to be extended) exists. i still use desktop app on mac.»

**The distinction that keeps both true:**

- ❌ **one tool per skill** — dead. That is the context tax [DOT-165](linear://linear.app/issue/DOT-165) killed.
- ✅ **one tool that delivers skills** — alive, and the only automation desktop has. A `save_skill`
  shaped tool is a single resident description, not one per skill.

**Why this matters more than it looks:** desktop and cwrk **cannot run a shell.** For them mcp is
not the fancy option, it is the *only* channel. The cli-first verdict in [DOT-185](linear://linear.app/issue/DOT-185) is about
surfaces that have a shell — cclio has one, so cclio should prefer the cli. Desktop does not, so
the choice was never offered there. **A default is not a universal.**

📌 [[strategy-fleet]]'s membank ([DOT-177](linear://linear.app/issue/DOT-177)) is also decided as an **mcp server**, precisely because
an mcp tool is deferred until called — zero resting context. So the fleet's two live mcp bets
(handoff, membank) are both tool-shaped, both correct, and neither contradicts cli-first.

**How to apply:** when the mcp-vs-cli question comes up, ask *which surface* before answering.
Shell present ⇒ cli. No shell ⇒ mcp, and `mcp-x-cw` is the thing to **extend**, not retire.

Related: [[dima-roadmap]] step 2, [[links-scheme-per-surface]] (the same shape — the right answer
is per-surface, and a blanket rule is how the wrong one spreads).
