#!/bin/bash
# Claude Code hook: Play sound when task is completed

# Debug: log that hook was triggered
echo "$(date): Notification hook triggered" >> ~/.claude/hook-debug.log

# Try terminal bell and system notification
printf '\a'
osascript -e 'display notification "Task completed" with title "Claude Code"'

# Also try to play sound
SOUND_FILE="$HOME/.claude/hooks/notification-steam.mp3"
if [ -f "$SOUND_FILE" ]; then
    echo "$(date): Playing sound file" >> ~/.claude/hook-debug.log
    afplay "$SOUND_FILE" 2>/dev/null &
else
    echo "$(date): Sound file not found: $SOUND_FILE" >> ~/.claude/hook-debug.log
fi
