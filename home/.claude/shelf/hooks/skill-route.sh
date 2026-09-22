#!/bin/bash
# UserPromptSubmit: jev ranks the x:* skills for this prompt; loads ≥ 0.6 print into context with their score.
# fail-soft: no key, no network, no node → silent, the built-in router still runs.
[ -f "$HOME/.claude/shelf/jev/router.off" ] && exit 0   # pnpm jev:router off — the kill switch, nothing runs
input=$(cat)
prompt=$(printf '%s' "$input" | jq -r '.prompt // empty' 2>/dev/null)
export JEV_SESSION=$(printf '%s' "$input" | jq -r '(.session_id // "-")[0:8]' 2>/dev/null)
[ -z "$prompt" ] && exit 0
case "$prompt" in \<*) exit 0;; esac   # a <task-notification> is the harness talking, not dima
# a slash command routes itself, but its argument body is dima's text — route that part
case "$prompt" in /*) prompt=$(printf '%s' "$prompt" | sed '1s#^/[^ ]*##');; esac
prompt=$(printf '%s' "$prompt" | sed -e 's/^[[:space:]]*//' -e '/./,$!d')
[ -z "$prompt" ] && exit 0
timeout 8 ~/dotfiles/script/op-run.sh node ~/dotfiles/script/skill-route.ts "$prompt" 2>/dev/null || true
