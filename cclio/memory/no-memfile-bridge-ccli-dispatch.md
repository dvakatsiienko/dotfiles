---
name: no-memfile-bridge-ccli-dispatch
description: "the root flaw behind most fleet friction — no memfile bridge exists between ccli and the desktop app, only ad-hoc copies"
metadata: 
  node_type: memory
  type: project
  originSessionId: aab235fd-2057-4364-94ac-624e8431bffc
  modified: 2026-08-21T00:30:24.379Z
---

📌 **RESOLVED 2026-08-21 — kept as the lesson, not as a live problem.**

Dima's diagnosis: **there was never a memfile bridge between ccli and the desktop app.** What
looked like a bridge was a set of hand-made copies — dispatch memory, the `memory-dispatch`
submodule, `skills-cw` zips, the handoff store — each maintained by a different ritual, none of
them a mechanism. Every recurring friction traced back here: skill drift, rules that had to be
re-read at boot, `dpatch-init` existing at all, «sync everywhere» being unmaintainable.

**How it was resolved:** not by automating the bridge — by making it unnecessary. cclio is a ccli
session, so it loads the same config root every other ccli session does, and on 2026-08-21 it
adopted dpatch's memory outright. There is nothing left on the far side to sync with.

**The lesson that outlives it, and the reason this leaf still exists:** when a new
"surfaces are out of sync" symptom appears, **do not propose another sync mechanism** — that is
building a fifth copy. Ask instead whether the two sides need to be two sides at all. Collapsing
the surfaces beat every sync design considered.

Related: [[ccli-coordinator-migration]], [[memory-divergence-store]]
