---
name: skill-naming-pattern
description: "interim skill naming — dpatch-* for dpatch-internal skills, x:* on ccli; mirrored externals keep original names"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 30861ba0-43b0-43bf-b3c2-7f62abafe4b4
  modified: 2026-08-19T13:46:48.351Z
---

Interim convention (2026-08-19, until the skill-system revamp settles): skills internal to dpatch/cwrk are named `dpatch-*` (dpatch-init, -wrap, -report, -proto, -flowlog, -walkthrough, -pre, -queue, -remind). ccli-side personal skills are `x:*` (x-pm, x-compose-message, x-notion-writing on this surface). Mirrored external frameworks (matt's) keep their original invocation names for cross-surface muscle-memory parity.

**Why:** name = namespace; Dima routes by prefix at a glance.
**How to apply:** new dpatch-internal skill → name it dpatch-<thing>; when touching an old unprefixed copy, save the dpatch-* version and tell Dima to delete the stale one (agents can't delete skills). See [[skills-update-yourself-no-dnd]], [[matt-skills-mirrored]].

⏰ interim habit until [DOT-115]: snapshot-sync memory → ~/.claude/memory-dispatch (cp + commit + push) at every /wrap.
