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

🚨 **CORRECTED: `cw` DOES have a shell.** Measured — a `cw` thread ran `yt-dlp` itself and said so:
*«I ran `yt-dlp` via the cloud container's `Bash` tool»*. It is not shell-less and it does not need
Desktop Commander to run commands.

📌 **But the shell is in a CLOUD CONTAINER, not on the mac.** That is the distinction that keeps
mcp valuable rather than killing the argument: whatever `cw`'s Bash writes lands in a container and
is gone. The mcp server runs **locally**, spawned by the desktop app, so a tool call touches Dima's
real filesystem — the shelf, the handoff store, the repo.

**So the reason mcp earns its place changed, and the conclusion did not:**

- ❌ old reason: «desktop has no shell, so mcp is its only channel» — **false.**
- ✅ real reason: **mcp is `cw`'s only route to the mac's filesystem.** Its own shell reaches a
  container that shares nothing with `cc`.
- 📌 practical consequence for tool descriptions: say so. A `cw` thread will happily run the
  command itself unless the tool states what it gets by not doing that — shared state with `cc`,
  dedupe against what is already stored, files that still exist tomorrow.

**The cli-first verdict in [DOT-185](linear://linear.app/issue/DOT-185) survives this, re-stated
correctly.** It is not about *having* a shell — both surfaces do. It is about **which machine the
shell reaches.** cclio's shell is Dima's mac, so cclio prefers the cli. `cw`'s shell is a throwaway
container, so for anything that must persist or be shared, mcp is its only door.
**A default is not a universal.**

📌 [[strategy-fleet]]'s membank ([DOT-177](linear://linear.app/issue/DOT-177)) is also decided as an **mcp server**, precisely because
an mcp tool is deferred until called — zero resting context. So the fleet's two live mcp bets
(handoff, membank) are both tool-shaped, both correct, and neither contradicts cli-first.

**How to apply:** when the mcp-vs-cli question comes up, ask *which surface* before answering.
Shell present ⇒ cli. No shell ⇒ mcp, and `mcp-x-cw` is the thing to **extend**, not retire.

Related: [[dima-roadmap]] step 2, [[pm]] (the same shape — the right answer
is per-surface, and a blanket rule is how the wrong one spreads).
