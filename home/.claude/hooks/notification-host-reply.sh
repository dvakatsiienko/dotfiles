#!/bin/bash
# Stop hook — main-thread reply finished. NOT Notification: that event means
# "permission needed" or "60s idle", which is where the ~1m lag came from.
afplay "$HOME/.claude/sounds/steam-message.wav" 2>/dev/null &
