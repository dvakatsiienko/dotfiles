---
name: cclio-coordinator-trial
description: dpatch moves off dispatch-desktop onto ccli as coordinator; four-layer memfile stack; CLAUDE_CONFIG_DIR rejected
metadata: 
  node_type: memory
  type: project
  originSessionId: aab235fd-2057-4364-94ac-624e8431bffc
  modified: 2026-08-21T00:07:37.179Z
---

🧪 **cclio is an A/B of dpatch, NOT an immediate replacement.** Dima's correction, 2026-08-21:
*"the replace decision was rushed by dispatch because of overconfidence. we have to build an mvp at
least, before deleting someone. everyone is on board, dpatch is active fully but vet."*

📌 Read that cause, not just the outcome. **The plan to retire dpatch was written by dpatch**, and
it was wrong in the confident direction. An agent proposing to retire a surface — including itself,
including a peer — is exactly where to slow down and ask for an MVP first. Story
[DOT-188](https://linear.app/x-com/issue/DOT-188) is `standing` + `vet`, **assigned to Dima, not
closable by an agent.** The metric is his own tests of activity: living with both and seeing which
he reaches for.

**Current state, both live:**
- `dpatch` — desktop dispatch, **fully active**, keeps its own memory (`~/.claude/memory-dpatch`).
- `cclio` — a ccli session at `~/dotfiles/cclio`, holding a **snapshot** of that memory
  taken 2026-08-21. The two drift from the moment either writes; that cost is accepted.

**What the migration settled regardless of the verdict:**
- **`CLAUDE_CONFIG_DIR` is REJECTED** — undocumented, leaks four ways: `CLAUDE.md` loads from both
  the custom dir and real `~/.claude/` at once, plugin state stays pinned to `~/.claude/plugins/`,
  a `.claude/` at-or-above cwd overrides the profile, credential paths are inconsistent. Never
  propose it as the isolation mechanism.
- **ccli DOES walk arbitrary ancestor dirs** — tested with a marker, no longer an assumption.
- **The four-layer memfile stack** ([DOT-195](https://linear.app/x-com/issue/DOT-195)):
  `~/.claude/CLAUDE.md` shared → `~/projects/CLAUDE.md` coder-global → project `CLAUDE.md` →
  coordinator-only. ⚠️ cclio currently sits INSIDE `~/projects/`, which is safe **only while
  `~/projects/CLAUDE.md` does not exist.** dotfiles must relocate to `~/dotfiles` BEFORE DOT-195
  creates it, or the coordinator starts inheriting coding conventions. Ordering is blocking.

Related: [[memfile-bridge-absent]], [[memory-divergence-store]], [[session-ends-with-a-halt]]
