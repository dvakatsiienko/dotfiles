---
name: strategy-fleet
description: "fleet branch — the agents themselves: surfaces, memory, skills, the coordinator migration"
metadata: 
  node_type: memory
  type: project
  originSessionId: aab235fd-2057-4364-94ac-624e8431bffc
  modified: 2026-08-21T01:04:12.099Z
---

Branch of [[dima-strategies]]. Linear projects: `fleet`, `mind`, `shelf`.

## the aim

**One mind, many surfaces — with a single source of truth for mental models and responsibilities.**
Dima's words. Not one agent, not synced copies: one set of facts, read from wherever the work is
happening.

## the strategic problem

The fleet grew surface-first — ccli, cwrk, dpatch, cchrome, ccloud — and each grew its own memory,
its own skills, its own boot ritual. The bridge between them was never built; hand-made copies stood
in for it and each copy needed its own maintenance ritual. → [[memory-divergence-store]]

## the current move

🧪 The coordinator migration to ccli → [[cclio-coordinator-trial]], story DOT-188 — **under
trial, not concluded.** dpatch stays live as the fallback until Dima calls it. The design resolves
the problem by deletion rather than automation: one config root, layered by directory, so no bridge is
needed. The four-layer memfile stack is the mechanism.

Two roles emerge from it and should be kept distinct in all thinking: **ccli-coord** (small flat
context, owns planning and the tracker) and **ccli-code** (large disposable context, owns edits).
The coordinator may edit — the peek into a project is what makes pair-review possible.

## the standing values

- **be an expert of yourself.** Every surface knows its own tools, config and vocabulary cold at
  session start. Asking Dima what a label means is a bug.
- memory is index-plus-leaf, and it should get *more* granular as it grows, not longer
- a research verdict never outranks what he observes daily → [[research-vs-lived-evidence]]

## where it is heading

After the migration proves out: the skill-sync program retires, dispatch becomes a reader, and the
membank (DOT-177) becomes the long-term home for accumulated knowledge rather than more memory files.
