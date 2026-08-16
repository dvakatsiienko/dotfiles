#!/usr/bin/env bash
# UserPromptSubmit hook — maintains the per-session focus file sline renders.
#
#   clam DOT-23   -> pin (sticky; survives every later id we mention), promoting
#                    it out of the touch list if it was there.
#                    Aliases: claim, pin.
#   touch DOT-9   -> touch list (up to 3, newest first); touching the pinned id
#                    demotes it, giving up the pin
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
	[[ $line =~ ^[[:space:]]*(clam|claim|pin|touch|ticket[[:space:]]+fly)[[:space:]]+((DOT|BYT)-[0-9]+)[[:space:]]*$ ]] || continue
	verb=$(printf '%s' "${BASH_REMATCH[1]}" | tr '[:upper:]' '[:lower:]')
	verb=${verb//[[:space:]]/}
	# claim and pin are aliases for clam — the plain words Dima's hands reach for.
	[[ $verb == claim || $verb == pin ]] && verb=clam
	arg=$(printf '%s' "${BASH_REMATCH[2]}" | tr '[:lower:]' '[:upper:]')

	case "$verb" in
	# An id lives in exactly one slot. Both verbs MOVE it rather than adding a
	# second copy: a duplicate never showed (sline skips a touch equal to the
	# pin) but it still ate one of the three touch slots.
	clam)
		write --arg p "$arg" --argjson t "$now" \
			'.pin = $p | .pin_at = $t
			 | .touch = ((.touch // []) - [$p])
			 | (if (.touch | length) == 0 then del(.touch, .touch_at) else . end)'
		;;
	touch)
		write --arg p "$arg" --argjson t "$now" \
			'(if .pin == $p then del(.pin, .pin_at) else . end)
			 | .touch = ([$p] + ((.touch // []) - [$p]))[0:3] | .touch_at = $t'
		;;
	ticketfly)
		write --arg p "$arg" \
			'(if .pin == $p then del(.pin, .pin_at) else . end)
			 | .touch = ((.touch // []) - [$p])
			 | (if (.touch | length) == 0 then del(.touch, .touch_at) else . end)'
		;;
	esac
done <<<"$prompt"

# --- DOT-81: refresh the Linear status cache -------------------------------
# Fetched here and never at render: sline runs on every prompt and every minute,
# and a linear call costs ~325ms. One query covers every id at once. Backgrounded
# so it cannot slow the prompt down, and TTL-gated so idle typing costs nothing.
cache="$HOME/.claude/focus/status-cache.json"
ttl=900

ids=$(jq -r '[.pin, (.touch // [])[]] | map(select(. != null)) | unique[]' "$file" 2>/dev/null || true)
[[ -n $ids ]] || exit 0

# Fetch when the cache has aged out OR when an id in focus has no entry at all —
# without the second test, a freshly pinned ticket shows no status until the TTL
# happens to expire, which reads as the feature being broken.
stale=$(jq -r --argjson now "$now" --argjson ttl "$ttl" --argjson ids "$(printf '%s\n' "$ids" | jq -R . | jq -s .)" '
	. as $c | if ($ids | map($c[.] // empty | .at) | length) < ($ids | length) then "yes"
	elif ([$c[].at // 0] | if length == 0 then 0 else min end) <= ($now - $ttl) then "yes"
	else "no" end' "$cache" 2>/dev/null || echo yes)
[[ $stale == yes ]] || exit 0

(
	filters=""
	for team in DOT BYT; do
		nums=$(printf '%s\n' "$ids" | sed -n "s/^$team-//p" | paste -sd, -)
		[[ -n $nums ]] || continue
		filters="$filters{and:[{team:{key:{eq:\"$team\"}}},{number:{in:[$nums]}}]},"
	done
	[[ -n $filters ]] || exit 0
	q="query { issues(filter: { or: [${filters%,}] }) { nodes { identifier state { name type } } } }"
	# Merge, never replace: the cache is shared by every session, and each one
	# only knows its own ids. Replacing would have parallel sessions wiping each
	# other. Entries unseen for a day fall out, so it cannot grow without bound.
	fresh=$(linear api "$q" 2>/dev/null |
		jq --argjson t "$now" '[.data.issues.nodes[]
			| {key: .identifier, value: {status: .state.name, type: .state.type, at: $t}}]
			| from_entries')
	[[ -n $fresh ]] || exit 0
	printf '%s' "${fresh}" | jq --argjson now "$now" --slurpfile old \
		<(cat "$cache" 2>/dev/null || printf '{}') \
		'($old[0] // {}) * . | with_entries(select(.value.at > ($now - 86400)))' \
		>"$cache.tmp" 2>/dev/null && mv "$cache.tmp" "$cache"
) >/dev/null 2>&1 &

exit 0
