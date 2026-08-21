---
name: spawn-timeout-verify-before-retry
description: start_code_task can 180s-timeout while the spawn actually succeeded — check list_sessions before any retry
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5e1b8add-1aa9-4f59-87dd-324c3cb6b0b7
  modified: 2026-08-19T08:25:10.288Z
---

A start_code_task timeout is not proof of failure.

**Why:** on 2026-08-19 a spawn "timed out" but the session was alive; a blind retry would have double-spawned.
**How to apply:** on timeout, call list_sessions first; only respawn if the session truly isn't there. Related: [[spawn-types]].
