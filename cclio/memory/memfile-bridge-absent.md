---
name: memfile-bridge-absent
description: "the root flaw behind most fleet friction — no memfile bridge exists between ccli and the desktop app, only ad-hoc copies"
metadata: 
  node_type: memory
  type: project
  originSessionId: aab235fd-2057-4364-94ac-624e8431bffc
  modified: 2026-08-21T00:30:24.379Z
---

🧪 **NOT resolved — reopened 2026-08-21 the same day it was closed.** An earlier version of this
leaf said the problem was gone because the surfaces had collapsed into one. **That was wrong.**
Dima kept dpatch alive: DOT-188 is `vet`, both coordinators run in parallel while he A/Bs them,
and dpatch is being *extended*, not replaced.

**The pattern, still live:** there is no memfile bridge between ccli and the desktop app. What
looks like a bridge is a set of hand-made copies — dispatch memory, the `dpatch-memory`
submodule, `skills-cw` zips, the handoff store — each maintained by a different ritual, none of
them a mechanism. Skill drift, rules re-read at boot, the retired «sync everywhere» rule: all one
missing layer, not separate bugs.

**What the migration actually bought:** cclio loads the same config root every ccli session does,
so **cclio's side** of the divergence is gone. dpatch's side is not. Two live coordinators means
two live stores, and the adoption on 2026-08-21 was a **copy taken at a point in time** — it
starts drifting the moment either side writes.

**How to apply, unchanged and now doubly true:** when a "surfaces are out of sync" symptom appears,
**do not propose another sync mechanism** — that is building a fifth copy. Ask whether the two
sides need to be two sides. 📌 Right now the answer is *deliberately yes, for the duration of the
trial* — so the correct move during `vet` is to **tolerate the drift and name it**, never to
automate it.

Related: [[cclio-coordinator-trial]], [[memory-divergence-store]]
