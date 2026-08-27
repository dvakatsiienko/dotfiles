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

# The focus file holds one id. The shape check is also what makes it safe to
# interpolate into the query below.
id=$(jq -r '.pin // empty' "$file" 2>/dev/null || true)
[[ $id =~ ^(DOT|BYT)-[0-9]+$ ]] || exit 0

# Fetch when this id has no entry at all, or when its entry has aged out. The
# test looks ONLY at this id: entries for ids that have since left keep their
# old timestamps, so measuring the whole cache pinned the age in the past
# forever and every single prompt fetched.
stale=$(jq -r --argjson now "$now" --argjson ttl "$ttl" --arg id "$id" \
	'if (.[$id].at // 0) > ($now - $ttl) then "no" else "yes" end' "$cache" 2>/dev/null || echo yes)
[[ $stale == yes ]] || exit 0

team=${id%%-*}
num=${id##*-}
q="query { issues(filter: { and: [{team:{key:{eq:\"$team\"}}},{number:{eq:$num}}] }) { nodes { identifier state { name type } } } }"
fresh=$(linear api "$q" 2>/dev/null |
	jq --argjson t "$now" '[.data.issues.nodes[]
		| {key: .identifier, value: {status: .state.name, type: .state.type, at: $t}}]
		| from_entries')
[[ -n $fresh ]] || exit 0

# Merge, never replace: the cache is shared by every session, and each one only
# knows its own id. Replacing would have parallel sessions wiping each other.
# Entries unseen for a day fall out, so it cannot grow without bound.
printf '%s' "$fresh" | jq --argjson now "$now" --slurpfile old \
	<(cat "$cache" 2>/dev/null || printf '{}') \
	'($old[0] // {}) * . | with_entries(select(.value.at > ($now - 86400)))' \
	>"$cache.tmp" 2>/dev/null && mv "$cache.tmp" "$cache"
