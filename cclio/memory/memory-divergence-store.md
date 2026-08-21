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

**The contract as of 2026-08-21, after cclio adopted dpatch's store:**

- **an agent mutates only its own memory.** Still the rule, and it is why the adoption was a
  one-time hand-over rather than a sync — dpatch handed its memory to its successor and stopped
  being the coordinator, so there are no longer two live stores to reconcile.
- **never push into another surface's memory directly.** `cw` and cloud `cc` still have their own,
  and they are theirs.
- fleet-bound facts queue on [DOT-186](https://linear.app/x-com/issue/DOT-186). 📌 that ticket goes
  on-hold once [DOT-194](https://linear.app/x-com/issue/DOT-194) gates — queue anyway, because
  losing a fact is worse than moving it twice.

**The live question this leaf now guards:** several leaves here are **fleet-wide, not
coordinator-only** — the PM cluster above all. They sat in a private store, so no other ccli
session ever saw rules Dima considers settled. Where they belong is [DOT-73](https://linear.app/x-com/issue/DOT-73)
step 3 (colocation). Do not move them unilaterally.

Related: [[linear-fetch-contract]], [[no-timestamps-in-prose]], [[skill-namespaces]]
