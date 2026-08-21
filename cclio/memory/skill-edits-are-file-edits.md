---
name: skill-edits-are-file-edits
description: On cclio a skill change is an ordinary file edit — no save_skill, no zip, no drag-and-drop
metadata:
  node_type: memory
  type: feedback
  rewritten-for: cclio
  supersedes: skills-update-yourself-no-dnd (dpatch original kept in memory-dispatch)
---

A skill asked for → **edit the file**. `plugin-x/skills/<name>/SKILL.md` for the `x:*` family, `cclio/.claude/skills/` for `cclio-*`. Commit it like any other change.

**Why this leaf still exists after the tool changed:** the underlying habit is what Dima flagged as one of the most important — *never hand him a package to install by hand when you can make the change yourself*. Dispatch honoured that with `save_skill`; cclio honours it with an ordinary edit. The tool was the accident, the habit is the rule.

**How to apply:** never produce a zip for drag-and-drop, never tell Dima to re-upload something. The one real exception is `skills-cw`, which genuinely has no channel but a manual zip upload — say so plainly when it comes up, and expect drift there until DOT-77 lands.
