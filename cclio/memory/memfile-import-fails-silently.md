---
name: memfile-import-fails-silently
description: "❗ a broken @import loads nothing and reports nothing — a memfile can be disconnected while looking perfectly healthy on disk"
metadata:
  node_type: memory
  type: feedback
  rewritten-for: cclio
---

❗ **A `@import` that resolves to nothing fails SILENTLY.** No error, no warning, no missing-file
line. The file sits on disk, reads fine in the editor, appears in the barrel — and is simply not
in context. **Presence on disk is not evidence of being loaded.**

**The rule that makes it happen:** import paths resolve relative to the **importing file**, never
to the cwd. Inside `memory/MEMORY.md` a leaf is `@slug.md`. Writing `@memory/slug.md` there
resolves to `memory/memory/slug.md`, which does not exist, and loads nothing quietly.

**Why this is the costly failure and not a small one:** every other memory bug is visible — a
wrong fact can be read and argued with. This one produces an agent that is *confidently missing a
rule it believes it holds*, and Dima cannot see it either. The store looks complete from both
sides. It was found only because a probe asked for a leaf-only fact and got nothing back.

**How to apply — the check is cheap, run it, never assume:**
- ❗ **Never claim memory is loaded from the barrel's contents.** Name a fact that lives ONLY in a
  leaf body. the commit hash `d03f3da` in `settings-json-drifts-when-unlinked` is the standard probe — it is in no barrel line. Cannot name one → the chain
  is broken; say so 🚨 and read `memory/MEMORY.md` by hand for that session.
- `/cclio:init` step 2 carries this check. It is not ceremony; it is the only detector that exists.
- After ANY rename, move, or barrel edit: re-probe. A rename that misses one pointer disconnects
  exactly one leaf, which is the hardest case to notice.
- Auditing the store on disk (`ls`, counting files, matching pointers to filenames) proves the
  files exist. It proves **nothing** about what loaded. Two different questions.

📌 The same shape generalises past imports: **when a mechanism returns nothing, suspect your own
inputs before the mechanism.** Two probes here read as «nested imports are unsupported» when the
real cause was a path base. Related: [[research-vs-lived-evidence]], [[memfile-trim-comes-last]].
