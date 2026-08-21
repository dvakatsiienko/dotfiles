---
name: pm-scrape-strategy
description: "PM data strategy — conventions live in memory, board state always queried fresh from linear CLI, never cached"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 30861ba0-43b0-43bf-b3c2-7f62abafe4b4
  modified: 2026-08-19T14:19:12.042Z
---

Decided 2026-08-19: hybrid. Memory holds the invariants — label vocabulary, priority contract, team split (DOT/BYT), title/body conventions ([[pm-label-proactively]], [[tickets-must-be-pretty]]). Linear CLI is the sole source of truth for state — statuses, assignees, priorities, counts — queried fresh every time.

**Why:** board state mutates hourly; a stale cached picture read with confidence is worse than a 2-second query. Conventions barely change; state always does.
**How to apply:** never answer a "what's the state of X" question from memory; run the query. Never re-derive conventions from the board; they're in memory/rules. Sline's status cache is render-only, not a data source.

📌 **the boot half is wired.** `/cclio-init` step 4.5 fetches the skeleton — teams, projects,
descriptions, open counts — with one query, every session. so «be an expert of yourself» holds for
the board too: a session knows what projects exist and what each is for from turn one, without
remembering any of it. the skeleton orients; details are still fetched on demand.
