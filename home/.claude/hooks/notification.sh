#!/bin/bash
# Bound to the Stop hook — fires the moment a response finishes.
# NOT Notification: that event means "permission needed" or "60s idle", which is
# where the ~1m lag came from.

afplay "$HOME/.claude/hooks/notification-steam.mp3" 2>/dev/null &
