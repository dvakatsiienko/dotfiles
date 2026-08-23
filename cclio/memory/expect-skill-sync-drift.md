---
name: expect-skill-sync-drift
description: skills-cw is the only surface whose skill copies still drift — note it, never block on it
metadata:
  type: rule
---

**`skills-cw` is the only thing that still drifts.** cclio edits `plugin-x` directly, so there is no
hop to fall behind. `skills-cw` has no channel but a manual zip upload, so its copies fall behind
whenever a `plugin-x` skill changes. [DOT-77](linear://linear.app/issue/DOT-77) owns the sync.

**How to apply:** note the drift, do not alarm, never block on it.

⚠️ **The desktop skill store is a MANAGED CACHE, so writing files cannot automate the upload.**
`~/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/<uuid>/<uuid>/skills/`,
manifest `{"name": "anthropic-skills", …}`. It is uuid-keyed per install and its mtime moves when the
app runs, so it is materialised from the account side rather than being a source of truth.
📌 that «regenerated» read is **inferred from the mtime and the manifest name**, never from an
overwrite test. Dima drags and drops by hand until an account-side channel exists.

Related: [[skill-namespaces]]
