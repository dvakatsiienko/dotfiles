#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Convert via monobank
# @raycast.mode compact

# Optional parameters:
# @raycast.packageName Currency
# @raycast.icon 💱
# @raycast.argument1 { "type": "text", "placeholder": "amount" }
# @raycast.description An amount in USD and in EUR, priced in hryvnia at monobank's sell rate.

# compact rather than inline: an inline command takes no argument in root search, so
# the amount field only exists on a command raycast opens for input.

set -u

source "$(dirname "${BASH_SOURCE[0]}")/_mono-lib.sh"

amount="${1:-}"

if ! [[ "$amount" =~ ^[0-9]+([.][0-9]+)?$ ]]; then
  echo "convert wants an amount — a number like 250, got \"$amount\""
  exit 1
fi

converted=$("$JQ" -rn --argjson n "$amount" --argjson u "$usd_sell" --argjson e "$eur_sell" \
  '[$n * $u, $n * $e] | @tsv')
IFS=$'\t' read -r in_usd in_eur <<< "$converted"

printf '%s USD = %.2f ₴   %s EUR = %.2f ₴%s\n' \
  "$amount" "$in_usd" "$amount" "$in_eur" "$age"
