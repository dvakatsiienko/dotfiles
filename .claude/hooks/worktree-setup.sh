#!/bin/sh
# PostToolUse(EnterWorktree): install deps in the fresh worktree with CI=1 so
# lefthook's postinstall cannot rewrite the shared .git/hooks — the hazard and
# the guard live in rules/fleet-hazards.md (git hooks). Measured 2026-08-30 on
# cc 2.1.251: payload carries .tool_response.worktreePath; a project-settings
# hook edit binds only for sessions spawned AFTER it.
input=$(cat)
wt=$(printf '%s' "$input" | jq -r '.tool_response.worktreePath // empty' 2>/dev/null)
if [ -z "$wt" ] || [ ! -d "$wt" ]; then exit 0; fi
[ -f "$wt/pnpm-lock.yaml" ] || exit 0
CI=1 pnpm install --dir "$wt" >/dev/null 2>&1 || true
