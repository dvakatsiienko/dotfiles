#!/bin/bash
# Claude Code hook: Play sound when task is completed

# Try terminal bell and system notification
printf '\a'
osascript -e 'display notification "Task completed" with title "Claude Code"'

# Also try to play sound
SOUND_FILE="$HOME/.claude/sounds/notification-steam.mp3"
if [ -f "$SOUND_FILE" ]; then
    afplay "$SOUND_FILE" 2>/dev/null &
fi
