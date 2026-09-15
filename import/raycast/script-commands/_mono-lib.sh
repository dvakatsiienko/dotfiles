#!/bin/bash

# Shared by currency-mono.sh and currency-mono-convert.sh. Deliberately carries no
# @raycast.schemaVersion header — that header is what makes raycast list a file as a
# command, so without it this stays a library and never appears in root search.
#
# Sourcing it leaves usd_buy, usd_sell, eur_buy, eur_sell and age set, or prints
# why it could not and exits non-zero out of the caller.
#
# https://api.monobank.ua/bank/currency — public, no token, and cached five minutes
# server-side: asking more often answers 429. The copy in TMPDIR keeps both commands
# inside that budget however often raycast refreshes, and stands in when the network
# is gone.

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
  # instead of truncating it to an error page. Quiet on purpose: raycast shows
  # stdout only, and the age suffix below already says a refresh did not land.
  if body=$(curl -fs --max-time 10 "$API") && [ -n "$body" ]; then
    printf '%s' "$body" > "$CACHE"
  fi
fi

[ -s "$CACHE" ] || { echo "monobank unreachable, and nothing cached yet"; exit 1; }

# Still stale means the refresh failed and these are yesterday's numbers. A rate
# shown as current when it is not is the one way these commands can mislead.
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
