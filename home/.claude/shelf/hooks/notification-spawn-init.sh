#!/bin/bash
# SubagentStart — but the harness fires it on every subagent TURN, not once per
# spawn: a mid-turn message or a SendMessage resume opens a new turn and fires
# again. Measured 2026-08-24 — 7 firings against 1 real spawn. agent_id is the
# only thing in the payload that tells them apart, so first sighting wins and
# every later turn of the same agent stays quiet.
seen="$HOME/.claude/shelf/sounds/.agents-seen"

id=$(jq -r '.agent_id // empty' 2>/dev/null)
[[ -n $id ]] || exit 0
grep -qxF "$id" "$seen" 2>/dev/null && exit 0

printf '%s\n' "$id" >>"$seen"
# Ids are never revisited once an agent ends, so the file only needs to outlive
# the agents currently running. 200 is far past any real fleet.
if (($(wc -l <"$seen") > 200)); then
	tail -100 "$seen" >"$seen.tmp" && mv "$seen.tmp" "$seen"
fi

printf '%s  SubagentStart  %s\n' "$(date +%H:%M:%S)" "$id" >>"$HOME/.claude/hook-trace.log"
afplay "$HOME/.claude/shelf/sounds/bg-mage-male-evocation.mp3" >/dev/null 2>&1 &
