---
name: skills-update-yourself-no-dnd
description: "MOST IMPORTANT — when Dima asks for a cwrk skill change, update it directly via save_skill (overwrite: true); NEVER produce a zip for him to drag-and-drop"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5e1b8add-1aa9-4f59-87dd-324c3cb6b0b7
  modified: 2026-08-19T08:49:13.197Z
---

cwrk skills are account-saved and editable in place via the save_skill tool.

**Why:** dpatch previously zipped skills for manual dnd upload; on 2026-08-19 the direct path was proven (dpatch-proto fixed same turn) and Dima flagged it as one of the most important habits.
**How to apply:** any skill change request → save_skill with overwrite: true, done. Note the dotfiles source copy (skills-cw / plugin-x) drifts behind — expected until [[expect-skill-sync-drift]] (DOT-77) lands; mention drift, don't block on it.
