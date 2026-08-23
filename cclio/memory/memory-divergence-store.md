---
name: memory-divergence-store
description: "«sync everywhere» is retired — mutate only your own memory, queue fleet-relevant facts on DOT-186"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: af91cdb2-f865-4212-9dc8-4734e9a8bf66
  modified: 2026-08-20T17:52:03.094Z
---

Dima retired the live «sync memory everywhere» instruction — it fired randomly and grew mess
faster than coverage.

**The contract as of 2026-08-21:**

- **an agent mutates only its own memory.** This is the rule, and under the DOT-188 `vet` trial it
  matters more than before, not less.
- 🧪 **two coordinators are live.** cclio adopted dpatch's store on 2026-08-21, but dpatch did NOT
  retire — it is being extended while Dima A/Bs them. So that adoption was a **snapshot, not a
  merge**, and the two stores drift from the moment either writes. Expect divergence; it is the
  cost of the trial, deliberately accepted.
- **never push into another surface's memory directly.** dpatch's store is
  `~/.claude/memory-dpatch` (a submodule) — cclio reads it, never writes it. `cw` and cloud `cc`
  keep their own.
- fleet-bound facts queue on [DOT-186](https://linear.app/x-com/issue/DOT-186). 📌 that ticket goes
  on-hold once [DOT-194](https://linear.app/x-com/issue/DOT-194) gates — queue anyway, because
  losing a fact is worse than moving it twice.

**The live question this leaf guards:** several leaves here are **fleet-wide, not
coordinator-only** — the PM cluster above all. They sat in a private store, so no other ccli
session ever saw rules Dima considers settled. Placement is
[DOT-73](https://linear.app/x-com/issue/DOT-73) step 3. Do not move them unilaterally.

Related: [[linear-fetch-contract]], [[no-timestamps-in-prose]], [[skill-namespaces]], [[memfile-bridge-absent]]
