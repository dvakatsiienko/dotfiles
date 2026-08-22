---
name: expect-skill-sync-drift
description: skill/rules sync drift across surfaces is expected turbulence until DOT-73 lands — treat as normal
metadata: 
  node_type: memory
  type: project
  originSessionId: b475afdf-7a57-4bba-9261-ddfc9b284f60
  modified: 2026-08-19T15:28:57.463Z
---

**Narrowed 2026-08-21.** Drift used to span ccli, cwrk mirrors and dpatch copies. cclio edits
`plugin-x` directly, so that hop is gone.

⚠️ **dpatch still keeps its own set, and its own memory.** It is a live fallback under the DOT-188
trial, not a retired surface — see [[memory-divergence-store]]. That drift is deliberate and
accepted for the duration; naming it is correct, automating it is not.

**What still drifts:** `skills-cw` only. It has no channel but a manual zip upload, so its copies
fall behind whenever a `plugin-x` skill changes. DOT-77 owns the sync; the matt mirror
([[matt-skills-mirrored]]) drifts the same way because the ccli plugin auto-updates and the
mirror does not.

**How to apply:** note the drift, do not alarm, do not file it as a bug. Never block on it.

📌 **`save_skill` is dpatch's tool, not a fleet capability — do not read repo docs as if it were.**
`docs/research/skills-sync-via-mcp.md` and dpatch's own memory say `save_skill` «replaces the manual
zip drag», and that is true **on dpatch**. cclio has no such tool; neither does a plain ccli session.
So on this surface the zip path is still the only channel to `cw`, and a doc written from dpatch's
viewpoint will read like the problem is solved when it is not.

⚠️ **The desktop skill store is a MANAGED CACHE, so writing files cannot automate the upload.**
Located at
`~/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/<uuid>/<uuid>/skills/`,
manifest `{"name": "anthropic-skills", "description": "Anthropic-managed skills for Claude Desktop"}`.
It is uuid-keyed per install and its mtime moves when the app runs — so it is materialised from the
account side, not the source of truth. 📌 that «regenerated» read is **inferred from the mtime and
the manifest name**, not from an overwrite test. Dima drags and drops by hand until an account-side
channel exists.
