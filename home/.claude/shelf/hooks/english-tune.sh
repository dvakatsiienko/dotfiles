#!/usr/bin/env bash
# english-tune — runs claude-english-buddy's prompt hook quietly.
# the plugin's own hook is silenced by the global config (auto_correct: false);
# this one re-enables it through the project config in english-tune/, keeps the
# hidden corrected prompt for the model (the 🎙️ tune-up source), drops the
# systemMessage the desktop app would print raw, and skips prompts no human typed.
set -euo pipefail
input=$(cat)
prompt=$(printf '%s' "$input" | jq -r '.prompt // ""')
case "$prompt" in
  '<cross-session'*|'[Cross-session'*|'<task-notification'*|'<system-reminder'*|'<local-command'*) exit 0 ;;
esac
dir=$(ls -d "$HOME"/.claude/plugins/cache/xiaolai/claude-english-buddy/*/ 2>/dev/null | sort -V | tail -1)
[ -n "$dir" ] || exit 0
printf '%s' "$input" \
  | jq --arg cwd "$HOME/.claude/shelf/hooks/english-tune" '.cwd = $cwd' \
  | node "$dir/scripts/prompt-coach-hook.mjs" 2>/dev/null \
  | jq -c 'del(.systemMessage)' 2>/dev/null || true
