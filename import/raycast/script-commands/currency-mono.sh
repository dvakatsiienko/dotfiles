#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Monobank rates
# @raycast.mode inline
# @raycast.refreshTime 5m

# Optional parameters:
# @raycast.packageName Currency
# @raycast.icon 🏦
# @raycast.argument1 { "type": "text", "placeholder": "amount", "optional": true }
# @raycast.description USD and EUR against the hryvnia, monobank's own buy · sell. An amount converts it at the sell rate.

# https://api.monobank.ua/bank/currency — public, no token, and cached five minutes
# server-side: asking more often answers 429. The copy in TMPDIR keeps this inside
# that budget whatever raycast's refresh does, and stands in when the network is gone.
#
# Inline mode renders the FIRST line of stdout and nothing else, so both pairs share
# one line rather than taking one each.

set -u

JQ=/opt/homebrew/bin/jq
API=https://api.monobank.ua/bank/currency
CACHE="${TMPDIR:-/tmp}/raycast-currency-mono.json"
MAX_AGE=300

stale() {
  [ -s "$CACHE" ] || return 0
  [ $(( $(date +%s) - $(stat -f %m "$CACHE") )) -ge "$MAX_AGE" ]
}

if stale; then
  # -f turns a 429 into a failure, so a throttled fetch leaves the old copy whole
  # instead of truncating it to an error page. Quiet on purpose: inline mode shows
  # stdout only, and the age suffix below already says a refresh did not land.
  if body=$(curl -fs --max-time 10 "$API") && [ -n "$body" ]; then
    printf '%s' "$body" > "$CACHE"
  fi
fi

[ -s "$CACHE" ] || { echo "monobank unreachable, and nothing cached yet"; exit 1; }

# Still stale means the refresh failed and these are yesterday's numbers. A rate
# shown as current when it is not is the one way this script can mislead.
age=""
if stale; then
  old=$(( $(date +%s) - $(stat -f %m "$CACHE") ))
  if [ "$old" -lt 5400 ]; then age=$(printf '  (%dm old)' $(( old / 60 )))
  elif [ "$old" -lt 172800 ]; then age=$(printf '  (%dh old)' $(( old / 3600 )))
  else age=$(printf '  (%dd old)' $(( old / 86400 )))
  fi
fi

rates=$("$JQ" -r '
  def pick($code):
    map(select(.currencyCodeB == 980 and .currencyCodeA == $code)) | first;
  [pick(840), pick(978)]
  | if any(.[]; . == null) then empty
    else [.[0].rateBuy, .[0].rateSell, .[1].rateBuy, .[1].rateSell] | @tsv
    end' "$CACHE") || rates=""

[ -n "$rates" ] || { echo "monobank sent no usd/uah or eur/uah pair"; exit 1; }

IFS=$'\t' read -r usd_buy usd_sell eur_buy eur_sell <<< "$rates"

amount="${1:-}"

if [ -z "$amount" ]; then
  printf 'USD %.2f · %.2f   EUR %.2f · %.2f%s\n' \
    "$usd_buy" "$usd_sell" "$eur_buy" "$eur_sell" "$age"
  exit 0
fi

if ! [[ "$amount" =~ ^[0-9]+([.][0-9]+)?$ ]]; then
  echo "amount wants a number, got \"$amount\""
  exit 1
fi

converted=$("$JQ" -rn --argjson n "$amount" --argjson u "$usd_sell" --argjson e "$eur_sell" \
  '[$n * $u, $n * $e] | @tsv')
IFS=$'\t' read -r in_usd in_eur <<< "$converted"

printf '%s USD = %.2f ₴   %s EUR = %.2f ₴%s\n' \
  "$amount" "$in_usd" "$amount" "$in_eur" "$age"
