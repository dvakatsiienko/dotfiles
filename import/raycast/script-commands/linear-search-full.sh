#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Linear Search (full text)
# @raycast.mode fullOutput
# @raycast.packageName Linear
# @raycast.icon 🔎
# @raycast.argument1 { "type": "text", "placeholder": "query" }
# @raycast.description Search linear across titles, bodies AND comments — the app's own search reads titles only. Lists every hit; a single hit also opens in the app.

# linear's search box and its search?q= url match titles only (probed 2026-09-18: a word sitting
# in a body or a comment returned nothing). the graphql issue filter does read all three.

LINEAR=/opt/homebrew/bin/linear
JQ=/opt/homebrew/bin/jq
q="${1//\"/\\\"}"

json=$("$LINEAR" api "query { issues(first: 10, filter: { or: [ { title: { containsIgnoreCase: \"$q\" } }, { description: { containsIgnoreCase: \"$q\" } }, { comments: { body: { containsIgnoreCase: \"$q\" } } } ] }) { nodes { identifier title url } } }")

count=$(echo "$json" | "$JQ" '.data.issues.nodes | length')

case "$count" in
  0) echo "nothing for: $1" ;;
  1) echo "$json" | "$JQ" -r '.data.issues.nodes[0] | "\(.identifier)  \(.title)"'
     url=$(echo "$json" | "$JQ" -r '.data.issues.nodes[0].url'); open "${url/https:\/\//linear://}" ;;
  *) echo "$count hits for: $1"; echo
     echo "$json" | "$JQ" -r '.data.issues.nodes[] | "\(.identifier)  https://linear.app/x-com/issue/\(.identifier)  —  \(.title)"' ;;
esac
