#!/bin/bash
# UserPromptSubmit: jev ranks the x:* skills for this prompt; loads ≥ 0.6 print into context.
# fail-soft: no key, no network, no node → silent, the built-in router still runs.
prompt=$(jq -r '.prompt // empty' 2>/dev/null)
[ -z "$prompt" ] && exit 0
case "$prompt" in \<*) exit 0;; esac   # a <task-notification> is the harness talking, not dima
# a slash command routes itself, but its argument body is dima's text — route that part
case "$prompt" in /*) prompt=$(printf '%s' "$prompt" | sed '1s#^/[^ ]*##');; esac
prompt=$(printf '%s' "$prompt" | sed -e 's/^[[:space:]]*//' -e '/./,$!d')
[ -z "$prompt" ] && exit 0
timeout 8 ~/dotfiles/script/op-run.sh node ~/dotfiles/script/skill-route.ts "$prompt" 2>/dev/null || true
