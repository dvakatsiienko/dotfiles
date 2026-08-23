---
name: domain-modeling-fleet
type: project
---

**We run MULTI-domain, and the contexts never merge.** Each code repo carries its own `CONTEXT.md`
plus ADRs; the tracker has its own (`docs/tracker/`, TRK-nnnn); the fleet vocabulary is a third.
Cross-reference by pointer, never fold one into another.

**The fleet vocabulary is a bounded-context glossary** — vet, slay, run id, spawn type, CST,
freebie. It belongs in one `CONTEXT.md`-shaped file every surface reads, not scattered across memory
files. [DOT-73](linear://linear.app/issue/DOT-73) holds it.

**Why:** shared language is what makes «be an expert of yourself» cheap. A vocab-amnesia bug — the
«vet» incident — is a glossary gap, not a memory gap.

**How to apply:** grow it lazily during real work, never big-bang. Challenge conflicting terms on
sight. Write an ADR only when the decision is hard to reverse, surprising, and carries a real
trade-off.
