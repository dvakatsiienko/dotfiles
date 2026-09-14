#!/usr/bin/env bash
# PostToolUse hook — formats a file right after an edit, with the biome that the edited
# file's OWN repo installs.
#
# Why walk up for the config instead of running one global biome: every repo pins its own
# biome version and rule set, so formatting with the wrong one writes a diff that repo's
# `check` would immediately undo. No biome.json(c) above the file, or no biome inside that
# repo's node_modules, means this is not a biome repo — stand down.
#
# Never prints and never fails. A formatter that interrupts the edit loop, or that reports
# a problem the agent did not ask about, costs more than an unformatted file.
set -uo pipefail

path=$(jq -r '.tool_input.file_path // empty' 2>/dev/null) || exit 0
[ -n "$path" ] || exit 0
[ -f "$path" ] || exit 0

case "${path##*.}" in
    ts | tsx | js | jsx | json | jsonc | css) ;;
    *) exit 0 ;;
esac

dir=$(cd "$(dirname "$path")" 2>/dev/null && pwd) || exit 0
root=""
while [ -n "$dir" ]; do
    if [ -f "$dir/biome.json" ] || [ -f "$dir/biome.jsonc" ]; then
        root=$dir
        break
    fi
    [ "$dir" = "/" ] && break
    dir=$(dirname "$dir")
done
[ -n "$root" ] || exit 0

biome="$root/node_modules/.bin/biome"
[ -x "$biome" ] || exit 0

"$biome" check --write --no-errors-on-unmatched --files-ignore-unknown=true "$path" >/dev/null 2>&1
exit 0
