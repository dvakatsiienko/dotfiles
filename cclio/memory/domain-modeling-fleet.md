---
name: domain-modeling-fleet
description: "decision — apply matt's domain-modeling discipline to BOTH the fleet workflow vocabulary and the linear structure, grown lazily during real work"
metadata: 
  node_type: memory
  type: project
  originSessionId: 30861ba0-43b0-43bf-b3c2-7f62abafe4b4
  modified: 2026-08-19T14:36:14.432Z
---

Decided 2026-08-19 (Dima: «like both, save decision, important»). Matt's domain-modeling shape applies twice:

1. **Fleet workflow vocabulary** — vet, slay, run ids, spawn types, CST, freebie etc. is a bounded-context glossary; it belongs in one CONTEXT.md-shaped file all surfaces read (folds into the mem-revamp / DOT-73 story), not scattered across memory files. Hard-to-reverse fleet decisions get one-paragraph ADRs.
2. **Linear structure** — continue the pass done once already: challenge fuzzy labels/terms during the horizon sweep, record structural decisions as tracker-context ADRs (docs/tracker/adr/, TRK-nnnn).

High-level, for everyone: **we run MULTI-domain** — each code repo carries its own CONTEXT.md + ADRs (matt system, opus-filled in dotfiles + bytes), the tracker has its own context (docs/tracker/, TRK-nnnn), and the fleet vocab is a third bounded context. Never merge them; cross-reference by pointer.

**Why:** shared language is what makes «expert of yourself» (fleet-prios) cheap — vocab amnesia bugs (the «vet» incident) are glossary gaps, not memory gaps.
**How to apply:** grow lazily during real work, never big-bang; challenge conflicting terms on sight; ADR only when hard-to-reverse + surprising + real trade-off.
