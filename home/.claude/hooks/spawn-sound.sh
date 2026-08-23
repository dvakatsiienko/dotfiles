#!/bin/bash
# Sounds for spawned work, plus a trace of which events actually fire.
# Event name is passed as $1 from settings.json; the payload arrives on stdin.
# Distinct from the Stop hook's steam sound, which means "the reply is finished".

event="$1"
printf '%s  %s\n' "$(date +%H:%M:%S)" "$event" >> "$HOME/.claude/hook-trace.log"

case "$event" in
  SubagentStart) afplay /System/Library/Sounds/Glass.aiff     >/dev/null 2>&1 & ;;
  SubagentStop)  afplay /System/Library/Sounds/Submarine.aiff >/dev/null 2>&1 & ;;
  # TaskCompleted stays silent on purpose: we do not yet know whether it fires for
  # `claude --bg` sessions, and a third sound would muddy what the other two mean.
esac
