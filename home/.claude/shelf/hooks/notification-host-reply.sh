#!/bin/bash
# Stop hook — the HOST's reply finished. NOT Notification: that event means
# "permission needed" or "60s idle", which is where the ~1m lag came from.
#
# Every session fires Stop, background ones included, so this used to sound for
# a bg peer's turn as well as the host's — half of the double Dima heard. The
# payload has no field for it; ~/.claude/sessions/<pid>.json does, keyed by the
# session id the payload carries. Unknown id rings: losing the host's own sound
# is worse than one stray.
payload=$(cat)
session=$(printf '%s' "$payload" | jq -r '.session_id // empty' 2>/dev/null)
kind=$(jq -r --arg s "$session" 'select(.sessionId == $s) | .kind' \
	"$HOME"/.claude/sessions/*.json 2>/dev/null | head -1)
[[ $kind == bg ]] && exit 0

afplay "$HOME/.claude/shelf/sounds/steam-message.wav" 2>/dev/null &
