#!/usr/bin/env bash
# Refresh the Linear status cache sline renders from. DOT-81.
#
#   sline-status-fetch.sh <focus-file>
#
# Two callers, one implementation: shelf/hooks/sline-focus.sh runs it after a prompt writes
# the focus file, and sline itself fires it detached on render. Neither ever
# waits — a linear call costs ~325ms, and sline redraws every minute.
#
# Safe to run as often as you like: the TTL gate below decides whether anything
# actually goes over the network.
set -euo pipefail

file=${1:-}
[[ -n $file && -f $file ]] || exit 0

cache="$HOME/.claude/focus/status-cache.json"
ttl=60
now=$(date +%s)

ids=$(jq -r '[.pin, (.touch // [])[]] | map(select(. != null)) | unique[]' "$file" 2>/dev/null || true)
[[ -n $ids ]] || exit 0

# Fetch when the cache has aged out OR when an id in focus has no entry at all.
# Both tests look ONLY at ids currently in focus: entries for ids that have since
# left keep their old timestamps, so measuring the whole cache pinned the age in
# the past forever and every single prompt fetched. Without the second test, a
# freshly pinned ticket shows no status until the TTL happens to expire.
idsJson=$(printf '%s\n' "$ids" | jq -R . | jq -s .)
stale=$(jq -r --argjson now "$now" --argjson ttl "$ttl" --argjson ids "$idsJson" '
	. as $c | if ($ids | map($c[.] // empty | .at) | length) < ($ids | length) then "yes"
	elif ($ids | map($c[.].at) | min) <= ($now - $ttl) then "yes"
	else "no" end' "$cache" 2>/dev/null || echo yes)
[[ $stale == yes ]] || exit 0

# One call covers every id, filtered by team key and issue number.
filters=""
for team in DOT BYT; do
	nums=$(printf '%s\n' "$ids" | sed -n "s/^$team-//p" | paste -sd, -)
	[[ -n $nums ]] || continue
	filters="$filters{and:[{team:{key:{eq:\"$team\"}}},{number:{in:[$nums]}}]},"
done
[[ -n $filters ]] || exit 0

q="query { issues(filter: { or: [${filters%,}] }) { nodes { identifier state { name type } } } }"
fresh=$(linear api "$q" 2>/dev/null |
	jq --argjson t "$now" '[.data.issues.nodes[]
		| {key: .identifier, value: {status: .state.name, type: .state.type, at: $t}}]
		| from_entries')
[[ -n $fresh ]] || exit 0

# Merge, never replace: the cache is shared by every session, and each one only
# knows its own ids. Replacing would have parallel sessions wiping each other.
# Entries unseen for a day fall out, so it cannot grow without bound.
printf '%s' "$fresh" | jq --argjson now "$now" --slurpfile old \
	<(cat "$cache" 2>/dev/null || printf '{}') \
	'($old[0] // {}) * . | with_entries(select(.value.at > ($now - 86400)))' \
	>"$cache.tmp" 2>/dev/null && mv "$cache.tmp" "$cache"
