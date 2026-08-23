---
name: cclio-coordinator-trial
description: what the coordinator migration settled — CLAUDE_CONFIG_DIR rejected, ancestor dirs walked, the four-layer memfile stack
metadata:
  type: reference
---

✅ **the migration is done.** [DOT-188](linear://linear.app/issue/DOT-188) closed. cclio is the
coordinator; dispatch is a minor fleet member whose influence keeps decreasing. its capability
facts live in `docs/agents/claude-fleet-capabilities.md` and are not repeated here.

**what the migration settled, and these are still binding:**

- 🚫 **`CLAUDE_CONFIG_DIR` is REJECTED** — undocumented, and it leaks four ways: `CLAUDE.md` loads
  from both the custom dir and real `~/.claude/` at once, plugin state stays pinned to
  `~/.claude/plugins/`, a `.claude/` at or above cwd overrides the profile, and credential paths
  are inconsistent. never propose it as the isolation mechanism.
- **ccli walks arbitrary ancestor dirs** — tested with a marker, not assumed.
- **the four-layer memfile stack** ([DOT-195](linear://linear.app/issue/DOT-195)):
  `~/.claude/CLAUDE.md` shared → `~/projects/CLAUDE.md` coder-global → project `CLAUDE.md` →
  coordinator-only. the precedence chain lives in root `CLAUDE.md`.

📌 **the lesson that outlives the migration:** the plan to retire a surface was written *by that
surface*, and it was wrong in the confident direction. an agent proposing to retire something —
itself, a peer, a tool — is exactly where to slow down and ask for an mvp first.

Related: [[memory-divergence-store]]
