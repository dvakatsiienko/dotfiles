**An agent mutates only its own memory.** Never write into another surface's store. dispatch keeps
`~/.claude/dpatch-memory` (a submodule) — read it if you must, never write it. `cw` and cloud `cc`
keep their own.

Dima retired the live «sync memory everywhere» instruction: it fired randomly and grew mess faster
than coverage.

🎯 **when a «surfaces are out of sync» symptom appears, do not propose another sync mechanism.**
That is how four hand-made copies accumulated where a mechanism was wanted — skill zips, a memory
submodule, the handoff store, each with its own ritual. **Ask instead whether the two sides need to
be two sides.** The coordinator migration resolved its half by deletion rather than automation.

**Fleet-bound facts queue on [DOT-186](linear://linear.app/issue/DOT-186)** rather than being pushed
sideways. 📌 queue them even when that ticket is on hold — losing a fact is worse than moving it twice.

**The live question this guards:** several leaves here are fleet-wide rather than coordinator-only,
the pm cluster above all. They sit in a private store, so no other ccli session sees rules Dima
considers settled. Placement is [DOT-73](linear://linear.app/issue/DOT-73) step 3. Do not move them
unilaterally.

Related: [[pm]], [[skill-namespaces]]
