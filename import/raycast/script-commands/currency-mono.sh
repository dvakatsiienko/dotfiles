#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Monobank rates
# @raycast.mode inline
# @raycast.refreshTime 5m

# Optional parameters:
# @raycast.packageName Currency
# @raycast.icon 🏦
# @raycast.description USD and EUR against the hryvnia, monobank's own buy · sell. Converting an amount is its own command.

# Inline mode renders the FIRST line of stdout and nothing else, so both pairs share
# one line rather than taking one each. It also takes no argument: root search reads
# anything typed after the title as search text, never as input. That is what
# currency-mono-convert.sh exists for.

set -u

source "$(dirname "${BASH_SOURCE[0]}")/_mono-lib.sh"

printf 'USD %.2f · %.2f   EUR %.2f · %.2f%s\n' \
  "$usd_buy" "$usd_sell" "$eur_buy" "$eur_sell" "$age"
