#!/usr/bin/env bash
# UserPromptSubmit hook — maintains the per-session focus file sline renders.
# One slot: the ticket this session is on.
#
#   clam DOT-23   -> that is the ticket now, replacing whatever was there.
#                    Aliases: claim, pin.
#   ticket fly    -> clear the slot. Also: tickets fly.
#
# Two rules keep these from firing on ordinary prose: the keyword must START a
# line, and the line must be the keyword and nothing else. "don't clam DOT-9"
# and "let's fly through this" both stay inert.
set -euo pipefail

payload=$(cat)
session=$(printf '%s' "$payload" | jq -r '.session_id // empty')
[[ -n $session ]] || exit 0
prompt=$(printf '%s' "$payload" | jq -r '.prompt // empty')

dir="$HOME/.claude/focus"
file="$dir/$session.json"
mkdir -p "$dir"
# One file per session accumulates forever otherwise; sline only ever reads the
# live session's, so anything untouched for a week is dead weight.
find "$dir" -maxdepth 1 -name '*.json' -mtime +7 -delete 2>/dev/null || true
[[ -f $file ]] || printf '{}' >"$file"

now=$(date +%s)
shopt -s nocasematch

while IFS= read -r line; do
	if [[ $line =~ ^[[:space:]]*tickets?[[:space:]]+fly[[:space:]]*$ ]]; then
		printf '{}' >"$file"
		continue
	fi
	[[ $line =~ ^[[:space:]]*(clam|claim|pin)[[:space:]]+((DOT|BYT)-[0-9]+)[[:space:]]*$ ]] || continue
	id=$(printf '%s' "${BASH_REMATCH[2]}" | tr '[:lower:]' '[:upper:]')
	# One slot, so the write is a replace — nothing to merge with what was there.
	jq -n --arg p "$id" --argjson t "$now" '{pin: $p, pin_at: $t}' >"$file.tmp" &&
		mv "$file.tmp" "$file"
done <<<"$prompt"

# --- DOT-81 -----------------------------------------------------------------
# The fetch lives in sline-status-fetch.sh so sline can fire the same code on render.
# Backgrounded: it must never slow the prompt down. The script's own TTL gate
# decides whether anything actually goes over the network.
"$(dirname "${BASH_SOURCE[0]}")/sline-status-fetch.sh" "$file" >/dev/null 2>&1 &

exit 0
