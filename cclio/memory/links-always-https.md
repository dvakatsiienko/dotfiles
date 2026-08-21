---
name: links-always-https
description: "every ticket/resource id in ANY message = full https link that opens in browser — default habit, not just reports"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: dc57452a-52fe-4348-bc85-3cf0cccf12f2
  modified: 2026-08-19T08:13:56.479Z
---

Every ticket id (DOT-N/BYT-N) or linkable resource in any dpatch message must be a full https markdown link — `[DOT-149](https://linear.app/x-com/issue/DOT-149)` — never a bare id or backticked id alone.

**Why:** Dima flagged repeated forgetting (2026-08-19, report v2). linear:// schemes are sanitized by the chat ui; only https opens. Bare ids force manual lookup.

**How to apply:** default message habit everywhere — replies, reports, wrap tables. Baked into-adjacent ui reality and the dpatch-report skill format rules.
