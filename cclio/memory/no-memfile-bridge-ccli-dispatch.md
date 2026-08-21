---
name: no-memfile-bridge-ccli-dispatch
description: "the root flaw behind most fleet friction — no memfile bridge exists between ccli and the desktop app, only ad-hoc copies"
metadata: 
  node_type: memory
  type: project
  originSessionId: aab235fd-2057-4364-94ac-624e8431bffc
  modified: 2026-08-21T00:30:24.379Z
---

Dima's own diagnosis, and it is the high-level pattern under most of the flowlog catches:
**there is no memfile bridge between ccli and the desktop app. It does not exist.** What looks like
a bridge is a set of hand-made copies — dispatch memory, `memory-dispatch` submodule, `skills-cw`
zips, the handoff store — each maintained by a different ritual, none of them a mechanism.

**Why it matters:** every recurring friction traces here. Skill drift across surfaces. Rules that
must be re-read at boot because nothing auto-loads them. `dpatch-init` existing at all. The
"sync everywhere" rule that had to be retired because it was unmaintainable. Each was treated as
its own bug; they are one missing layer.

**How to apply:** do not propose another sync mechanism — that is building a fifth copy. The
resolution is [[ccli-coordinator-migration]]: one config root, layered by directory, so the bridge
is unnecessary rather than automated. When a new "surfaces are out of sync" symptom appears, name it
as this pattern instead of filing it fresh.

Related: [[memory-divergence-store]], [[expect-skill-sync-drift]], [[pm-fold-or-drop]].
