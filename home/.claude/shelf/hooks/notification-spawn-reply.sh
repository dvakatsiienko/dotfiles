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
# Every session — cclio's interactive one included — emits a SubagentStop of
# its own at turn end, carrying a freshly minted agent_id, an EMPTY agent_type
# and its own session transcript. That is what made the main reply play both
# sounds. A genuinely spawned agent always carries a type ("general-purpose"),
# because the harness fills the field from the agent or leaves "" when there is
# none, so the empty string is the whole difference. Measured 2026-08-24.
[[ -n $(printf '%s' "$payload" | jq -r '.agent_type // empty' 2>/dev/null) ]] || exit 0

((now - last < COOLDOWN)) && exit 0

printf '%s' "$now" >"$stamp"
afplay "$HOME/.claude/shelf/sounds/steam-achievement.wav" >/dev/null 2>&1 &
