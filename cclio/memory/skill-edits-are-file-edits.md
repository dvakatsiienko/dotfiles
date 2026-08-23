---
name: skill-edits-are-file-edits
description: On cclio a skill change is an ordinary file edit — no save_skill, no zip, no drag-and-drop
metadata:
  node_type: memory
  type: feedback
  rewritten-for: cclio
---

A skill asked for → **edit the file**. `plugin-x/skills/<name>/SKILL.md` for the `x:*` family, `cclio/plugin-cclio/commands/<name>.md` for the
`cclio-*` family — they are slash **commands**, not skills, and there is no `cclio/.claude/skills/`. Commit it like any other change.

**Why this leaf still exists after the tool changed:** the underlying habit is what Dima flagged as one of the most important — *never hand him a package to install by hand when you can make the change yourself*. Dispatch honoured that with `save_skill`; cclio honours it with an ordinary edit. The tool was the accident, the habit is the rule.

**How to apply:** never produce a zip for drag-and-drop, never tell Dima to re-upload something. The one real exception is `skills-cw`, which genuinely has no channel but a manual zip upload — say so plainly when it comes up, and expect drift there until DOT-77 lands.

📌 **a command file that contains a query must contain a query that RAN.** A boot step shipped into
`/cclio:init` and only then got tested — it failed on linear's complexity cap (40132 against a
10000 limit) and would have broken every boot until someone noticed. Authoring the snippet in the
file is not authoring it; **write it at the shell first, watch it succeed, then paste what ran.**
For an executable artifact the test IS the write, not a step after it.

🚨 **the `cclio:*` family is the exception — a file edit alone changes NOTHING.** the plugin loads
from a **version-pinned cache copy** under `~/.claude/plugins/cache/cclio/cclio/<version>/`, and
that cache refreshes on a **version bump**, not on a file change. `claude plugin update` against an
unchanged version answers *"already at the latest version"* and leaves the stale copy live. so
every edit under `plugin-cclio/` is three steps:

    # 1. bump "version" in plugin-cclio/.claude-plugin/plugin.json
    claude plugin marketplace update cclio
    claude plugin update cclio@cclio --scope project

and it still binds only at the **next** session — never the one that made the edit. say that
plainly when handing an edit back, or dima will type the new command and find it missing.
