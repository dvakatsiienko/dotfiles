Branch of [[dima-strategies]]. Linear projects: `fleet`, `mind`, `shelf`.

## the aim

**One mind, many surfaces — with a single source of truth for mental models and responsibilities.**
Dima's words. Not one agent, not synced copies: one set of facts, read from wherever the work is
happening.

## the strategic problem

The fleet grew surface-first — one memory, one skill set and one boot ritual per surface —
its own skills, its own boot ritual. The bridge between them was never built; hand-made copies stood
in for it and each copy needed its own maintenance ritual. → [[memory-divergence-store]]

## the current move

✅ **The coordinator migration to ccli is done** ([DOT-188](linear://linear.app/issue/DOT-188)).
It resolved the problem by deletion rather than automation: one config root, layered by directory,
so no bridge is needed. The four-layer memfile stack is the mechanism.

Two roles emerge from it and should be kept distinct in all thinking: **ccli-coord** (small flat
context, owns planning and the tracker) and **ccli-code** (large disposable context, owns edits).
The coordinator may edit — the peek into a project is what makes pair-review possible.

## the standing values

- **be an expert of yourself.** Every surface knows its own tools, config and vocabulary cold at
  session start. Asking Dima what a label means is a bug.
- memory is index-plus-leaf, and it should get *more* granular as it grows, not longer
- a research verdict never outranks what he observes daily → [[research-vs-lived-evidence]]

## where it is heading

The skill-sync program retires, and the membank ([DOT-177](linear://linear.app/issue/DOT-177))
becomes the long-term home for accumulated knowledge rather than more memory files.
