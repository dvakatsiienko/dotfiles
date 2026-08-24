#!/bin/bash
# SubagentStart — a spawn begins. Trace log doubles as which-events-fire evidence.
printf '%s  SubagentStart\n' "$(date +%H:%M:%S)" >> "$HOME/.claude/hook-trace.log"
afplay "$HOME/.claude/shelf/sounds/bg-mage-male-evocation.mp3" >/dev/null 2>&1 &
