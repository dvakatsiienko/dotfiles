---
name: handoff-ask-here-or-fresh
description: "before saving a CST, ask Dima «continue here or fresh thread?» — saving then continuing in-session wastes the handoff"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5e1b8add-1aa9-4f59-87dd-324c3cb6b0b7
  modified: 2026-08-19T08:25:07.508Z
---

Before writing a CST, ask Dima whether the work continues here or in a fresh thread.

📌 `/x:handoff` writes and `/x:handoff-pull` reads, against the shared store at
`~/.claude/shelf/handoffs/`.

**Why:** in cw·20260819·batch1 a full CST was saved and then work proceeded in-session — wasted tokens, stale CST.
**How to apply:** the here-or-fresh question comes BEFORE composing the CST, not after. Related: [[halt-rituals-pair]].
