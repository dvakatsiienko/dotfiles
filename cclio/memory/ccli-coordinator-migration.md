---
name: ccli-coordinator-migration
description: dpatch moves off dispatch-desktop onto ccli as coordinator; four-layer memfile stack; CLAUDE_CONFIG_DIR rejected
metadata: 
  node_type: memory
  type: project
  originSessionId: aab235fd-2057-4364-94ac-624e8431bffc
  modified: 2026-08-21T00:07:37.179Z
---

Direction change: **dpatch stops being a dispatch-desktop brain and becomes a Claude Code
coordinator session.** Dispatch degrades to a remote window holding no memory of its own. Story
[DOT-188](https://linear.app/x-com/issue/DOT-188), spec `docs/spec/ccli-coordinator-mvp.md`.

Drivers: dispatch has no model knob (kebab→ghost is undocumented UI that can vanish), no auto-load
layer (dpatch-init hand-simulates one), and is the only surface holding a second memory store.

**`CLAUDE_CONFIG_DIR` is REJECTED** — undocumented, and leaks four ways: CLAUDE.md loads from both
the custom dir and real `~/.claude/` at once, plugin state stays pinned to `~/.claude/plugins/`, a
`.claude/` at-or-above cwd overrides the profile, credential paths are inconsistent. Never propose
it as the isolation mechanism.

**Four-layer memfile stack instead** (Dima's design, [DOT-195](https://linear.app/x-com/issue/DOT-195)):
`~/.claude/CLAUDE.md` shared → `~/projects/CLAUDE.md` coder-global → project CLAUDE.md →
`~/dpatch/CLAUDE.md` coordinator-only. The coordinator lives at `~/dpatch`, NOT under `~/projects/`,
or it inherits the coder-global.

UNVERIFIED and blocking: whether ccli walks up to an arbitrary ancestor like `~/projects/`. Test
with a marker line before building on it.

Deletes the surface-sync problem: DOT-165 / DOT-168 / DOT-186 become on-hold candidates once
[DOT-194](https://linear.app/x-com/issue/DOT-194) (the proof loop) passes. Do not flip them early.

Related: [[research-vs-lived-evidence]], [[memory-divergence-store]], [[dpatch-spawn-types]].
