---
name: spawn-timeout-verify-before-retry
description: a spawn that times out may still be alive — verify it is really gone before respawning
metadata:
  node_type: memory
  type: feedback
  rewritten-for: cclio
---

**A spawn timeout is not proof of failure.** Verify before any retry; a blind respawn double-runs
the work.

**Why:** on 2026-08-19 a spawn "timed out" on dpatch but the session was alive. A blind retry would
have double-spawned, with two agents writing the same files.

**How to apply on cclio:** the `Agent` tool reports completion by notification, so a slow agent is
not a dead one — never respawn on silence. Check with `ListAgents` before assuming a spawn died,
and use `TaskStop` to end one deliberately rather than spawning past it.

Related: [[spawn-types]].
