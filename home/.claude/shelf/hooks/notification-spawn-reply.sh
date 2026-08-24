#!/bin/bash
# SubagentStop / TaskCompleted — spawned work reports back.
printf '%s  %s\n' "$(date +%H:%M:%S)" "${1:-SubagentStop}" >> "$HOME/.claude/hook-trace.log"
afplay "$HOME/.claude/shelf/sounds/steam-desktop_toast_default.wav" >/dev/null 2>&1 &
