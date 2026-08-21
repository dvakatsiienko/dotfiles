---
name: memory-divergence-store
description: "«sync everywhere» is retired — mutate only your own memory, queue fleet-relevant facts on DOT-186"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: af91cdb2-f865-4212-9dc8-4734e9a8bf66
  modified: 2026-08-20T17:52:03.094Z
---

Dima retired the live «sync memory everywhere» instruction — it fired randomly and grew mess faster than coverage. New contract: **an agent mutates only its own memory.** Anything that should reach the fleet gets queued on [DOT-186 memory divergence store](https://linear.app/x-com/issue/DOT-186/memory-divergence-store) instead.

**Standing habits, unprompted:**
- write a new memory that clearly belongs to the whole fleet → append it to DOT-186's queue the same turn
- mutate an existing memory in a fleet-relevant way → append the delta there too
- never push into another surface's memory directly

Blocked on the open question in that ticket: what the reuse mechanism actually is (shared git folder, promoted submodule, or generated per-surface copies).

Related: [[linear-fetch-contract]], [[no-timestamps-in-prose]] (both queued there), [[skill-naming-pattern]].
