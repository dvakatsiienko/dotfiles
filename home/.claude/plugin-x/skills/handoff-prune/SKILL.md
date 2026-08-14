---
name: handoff-prune
description: Wipe all pending handoff CST files from the shared store (~/.claude/handoffs/), including -shared ones. Use when the user types /handoff-prune or asks to clear/prune pending handoffs (e.g. sline's 📬 shows an orphan nobody will pull).
---

# Handoff-prune

Pending handoffs are transient by design (see [CST-SPEC.md](../../CST-SPEC.md) — Store); this clears the store outright.

1. List `~/.claude/handoffs/*.md` (filename + age). Nothing there → say "store already clean", done.
2. Delete them all, including `-shared`.
3. Report in one line: `pruned N handoff(s): <slugs>`.

No confirmation dance — the user invoked a deliberately destructive command on disposable files. Do NOT touch anything but `*.md` inside `~/.claude/handoffs/`.
