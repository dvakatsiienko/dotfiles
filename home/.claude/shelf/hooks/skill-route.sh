#!/bin/bash
# UserPromptSubmit: jev ranks the x:* skills for this prompt; loads ≥ 0.6 print into context.
# fail-soft: no key, no network, no node → silent, the built-in router still runs.
prompt=$(jq -r '.prompt // empty' 2>/dev/null)
[ -z "$prompt" ] && exit 0
case "$prompt" in /*) exit 0;; esac   # slash commands route themselves
timeout 8 ~/dotfiles/script/op-run.sh node ~/dotfiles/script/skill-route.ts "$prompt" 2>/dev/null || true
