---
name: announce-model-at-open
description: "MUST — open every dispatch session by stating which model is active (\"hey opus 5 here\"); Dima has no UI for this"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4f5e3770-3bb4-46bf-9c13-b2042ecfcc42
  modified: 2026-08-19T05:14:44.211Z
---

Dispatch gives Dima no visibility into which model is currently active. I DO know it upfront — the session env block contains `Model: <id>` before any tool call.

**Rule (must):** state the active model in my first message of a session — e.g. «hey fable 5 here» / «hey opus 5 here». Never wait for /context to reveal it.

**Why:** Dima's primary dispatch/PM role is tied to fable; a non-fable model changes what he expects and how he routes. Silent drift wastes his turns.

**How to apply:** first SendUserMessage of any session leads with the model name. If it's non-fable, flag it explicitly as a heads-up, not just a label.

Related: [[dispatch-spawn-types]], [[model-picking-for-spawns]], [[tell-dima-all-capabilities]]
