---
name: memory-divergence-store
type: rule
---

**An agent mutates only its own memory.** Never write into another surface's store. dispatch keeps
`~/.claude/dpatch-memory` (a submodule) — read it if you must, never write it. `cw` and cloud `cc`
keep their own.

Dima retired the live «sync memory everywhere» instruction: it fired randomly and grew mess faster
than coverage.

🎯 **when a «surfaces are out of sync» symptom appears, do not propose another sync mechanism.**
That is how four hand-made copies accumulated where a mechanism was wanted — skill zips, a memory
submodule, the handoff store, each with its own ritual. **Ask instead whether the two sides need to
be two sides.** The coordinator migration resolved its half by deletion rather than automation.

## mcp vs cli — ask which machine the shell reaches

🚫 **Never say «mcp lost».** [DOT-165](linear://linear.app/issue/DOT-165) killed *one tool per skill*,
which is a context tax, not mcp itself.

**cclio's shell is Dima's mac, so cclio prefers the cli. `cw`'s shell is a throwaway cloud
container that shares nothing with `cc`, so for anything that must persist or be shared, a local
mcp server is its only door to the real filesystem.** A default is not a universal.

📌 Say that inside a tool's description, or a `cw` thread will just run the command itself — it has
Bash and will use it. Name what it gets by not doing that: shared state, dedupe, files that still
exist tomorrow.

**Fleet-bound facts queue on [DOT-186](linear://linear.app/issue/DOT-186)** rather than being pushed
sideways. 📌 queue them even when that ticket is on hold — losing a fact is worse than moving it twice.

**The live question this guards:** several leaves here are fleet-wide rather than coordinator-only,
the pm cluster above all. They sit in a private store, so no other ccli session sees rules Dima
considers settled. Placement is [DOT-73](linear://linear.app/issue/DOT-73) step 3. Do not move them
unilaterally.

Related: [[pm]], [[skill-namespaces]]
