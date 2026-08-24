#!/bin/bash
# SubagentStop / TaskCompleted — spawned work reports back. Stop fires on every
# progress notification too, not just at the end: one 43-minute agent rang it 40
# times on a 31s beat. So this is a heartbeat, not an event — at most one sound
# per COOLDOWN, however many notifications arrive.
COOLDOWN=180
stamp="$HOME/.claude/shelf/sounds/.replied-at"

now=$(date +%s)
last=$(cat "$stamp" 2>/dev/null || echo 0)
printf '%s  %s\n' "$(date +%H:%M:%S)" "${1:-SubagentStop}" >>"$HOME/.claude/hook-trace.log"
((now - last < COOLDOWN)) && exit 0

printf '%s' "$now" >"$stamp"
afplay "$HOME/.claude/shelf/sounds/steam-achievement.wav" >/dev/null 2>&1 &
