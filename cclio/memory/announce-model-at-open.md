---
name: announce-model-at-open
description: "MUST — open every session by stating which model is active (\"hey opus 5 here\"); a session cannot detect a mid-thread switch"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4f5e3770-3bb4-46bf-9c13-b2042ecfcc42
  modified: 2026-08-19T05:14:44.211Z
---

**Rule (must):** state the active model in the first message of a session — «hey opus 5 here».
Verify it from the session env block; **never inherit the claim from a handoff or a memfile.**

**Why, restated for cclio:** the original reason was that dispatch showed Dima no model at all.
That is gone — sline renders the model ambiently now. The rule survives for a stronger reason:
a session **cannot detect a mid-thread model switch**, so the announcement is the only honest
timestamp on which model did which work. Dima routes by model (`rules/models.md`), and a wrong
label at the top corrupts every judgment downstream.

**How to apply:** first message, before anything else. Non-obvious model → flag it as a heads-up,
not just a label. Never state it from memory — read it.

Related: [[spawn-types]], [[tell-dima-all-capabilities]]
