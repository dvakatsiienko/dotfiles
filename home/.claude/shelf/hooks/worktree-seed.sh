#!/bin/sh
# PostToolUse(EnterWorktree), user scope: make a fresh worktree runnable in any repo.
# A repo that owns a `worktree:seed` script (bytes: env copies, install, port offset)
# runs it; any other pnpm repo gets `CI=1 pnpm install` so lefthook's postinstall
# cannot rewrite the shared .git/hooks (rules/fleet-hazards.md, git hooks).
# Payload: .tool_response.worktreePath (measured 2026-08-30, cc 2.1.251).
input=$(cat)
wt=$(printf '%s' "$input" | jq -r '.tool_response.worktreePath // empty' 2>/dev/null)
if [ -z "$wt" ] || [ ! -d "$wt" ]; then exit 0; fi
[ -f "$wt/package.json" ] || exit 0
if jq -e '.scripts["worktree:seed"]' "$wt/package.json" >/dev/null 2>&1; then
  CI=1 pnpm --dir "$wt" -s worktree:seed "$wt" >/dev/null 2>&1 || true
elif [ -f "$wt/pnpm-lock.yaml" ]; then
  CI=1 pnpm install --dir "$wt" >/dev/null 2>&1 || true
fi
