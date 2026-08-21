---
name: expect-skill-sync-drift
description: skill/rules sync drift across surfaces is expected turbulence until DOT-73 lands — treat as normal
metadata: 
  node_type: memory
  type: project
  originSessionId: b475afdf-7a57-4bba-9261-ddfc9b284f60
  modified: 2026-08-19T15:28:57.463Z
---

**Narrowed 2026-08-21.** Drift used to span ccli, cwrk mirrors and dpatch copies. Two of those
three are gone — cclio edits `plugin-x` directly, and dpatch no longer keeps its own set.

**What still drifts:** `skills-cw` only. It has no channel but a manual zip upload, so its copies
fall behind whenever a `plugin-x` skill changes. DOT-77 owns the sync; the matt mirror
([[matt-skills-mirrored]]) drifts the same way because the ccli plugin auto-updates and the
mirror does not.

**How to apply:** note the drift, do not alarm, do not file it as a bug. Never block on it.
