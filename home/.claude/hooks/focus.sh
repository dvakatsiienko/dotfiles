#!/usr/bin/env bash
# UserPromptSubmit hook — maintains the per-session focus file sline renders.
#
#   clam DOT-23   -> pin (sticky; survives every later id we mention)
#   touch DOT-9   -> touch list (up to 3, newest first)
#   ticket fly DOT-9 -> unset that id from whichever slot holds it
#   tickets fly      -> clear both
#
# Two rules keep these from firing on ordinary prose: the keyword must START a
# line, and an argument is mandatory. "don't touch DOT-9" and "let's fly through
# this" both stay inert — the first is not line-initial, the second has no arg.
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

write() {
	jq "$@" "$file" >"$file.tmp" && mv "$file.tmp" "$file"
}

while IFS= read -r line; do
	if [[ $line =~ ^[[:space:]]*tickets[[:space:]]+fly[[:space:]]*$ ]]; then
		printf '{}' >"$file"
		continue
	fi
	[[ $line =~ ^[[:space:]]*(clam|touch|ticket[[:space:]]+fly)[[:space:]]+((DOT|BYT)-[0-9]+)[[:space:]]*$ ]] || continue
	verb=$(printf '%s' "${BASH_REMATCH[1]}" | tr '[:upper:]' '[:lower:]')
	verb=${verb//[[:space:]]/}
	arg=$(printf '%s' "${BASH_REMATCH[2]}" | tr '[:lower:]' '[:upper:]')

	case "$verb" in
	clam)
		write --arg p "$arg" --argjson t "$now" '.pin = $p | .pin_at = $t'
		;;
	touch)
		write --arg p "$arg" --argjson t "$now" \
			'.touch = ([$p] + ((.touch // []) - [$p]))[0:3] | .touch_at = $t'
		;;
	ticketfly)
		write --arg p "$arg" \
			'(if .pin == $p then del(.pin, .pin_at) else . end)
			 | .touch = ((.touch // []) - [$p])
			 | (if (.touch | length) == 0 then del(.touch, .touch_at) else . end)'
		;;
	esac
done <<<"$prompt"

exit 0
