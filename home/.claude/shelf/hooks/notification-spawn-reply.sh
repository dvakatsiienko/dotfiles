#!/bin/bash
# SubagentStop / TaskCompleted — spawned work reports back. Stop fires on every
# progress notification too, not just at the end: one 43-minute agent rang it 40
# times on a 31s beat. So this is a heartbeat, not an event — at most one sound
# per COOLDOWN, however many notifications arrive.
COOLDOWN=180
stamp="$HOME/.claude/shelf/sounds/.replied-at"

payload=$(cat)
now=$(date +%s)
last=$(cat "$stamp" 2>/dev/null || echo 0)
printf '%s  %s\n' "$(date +%H:%M:%S)" "${1:-SubagentStop}" >>"$HOME/.claude/hook-trace.log"
# Two shapes count as background work reporting back, and neither is the host:
#
#   a spawned in-process agent — agent_type is set
#   a background session       — agent_type is "", but the registry says its
#                                session is kind:"bg"
#
# The host's own turn end looks like the second one except its session is
# interactive, and that artifact is what made the main reply play both sounds.
# Measured 2026-08-24.
if [[ -z $(printf '%s' "$payload" | jq -r '.agent_type // empty' 2>/dev/null) ]]; then
	session=$(printf '%s' "$payload" | jq -r '.session_id // empty' 2>/dev/null)
	kind=$(jq -r --arg s "$session" 'select(.sessionId == $s) | .kind' \
		"$HOME"/.claude/sessions/*.json 2>/dev/null | head -1)
	[[ $kind == bg ]] || exit 0
fi

((now - last < COOLDOWN)) && exit 0

printf '%s' "$now" >"$stamp"
afplay "$HOME/.claude/shelf/sounds/steam-achievement.wav" >/dev/null 2>&1 &
