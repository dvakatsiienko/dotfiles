#!/bin/bash
# sound audition TUI. picks persist in approved.txt (rewritten on every toggle — quit-safe).
#   ↑/↓ or j/k  navigate · enter/space  play · s  stop · x  keep · f  fav ⭐ · q  quit
# sources: approved.txt (kept files, flat in this dir) + candidates/<slot>/ dirs (raw/ ignored)
cd "$(dirname "$0")" || exit 1
APPROVED=approved.txt; touch "$APPROVED"

ITEMS=() MARK=() FAV=() ORIGIN=()   # ITEMS: "slot|name|path" · MARK 0/1 · FAV 0/1

while IFS='|' read -r slot file fav; do
  [ -f "$file" ] || continue
  ITEMS+=("$slot|$file|$file"); MARK+=(1); ORIGIN+=(approved)
  [ "$fav" = fav ] && FAV+=(1) || FAV+=(0)
done < <(sort "$APPROVED")

for dir in candidates/*/; do
  [ -d "$dir" ] || continue
  slotname="$(basename "$dir")"; [ "$slotname" = raw ] && continue
  slot="${slotname%%-*} ${slotname#*-}"
  for f in "$dir"*; do
    [ -f "$f" ] || continue
    base="$(basename "$f")"
    grep -q "|$base\(|\|$\)" "$APPROVED" && continue
    ITEMS+=("$slot|$base|$f"); MARK+=(0); FAV+=(0); ORIGIN+=(candidate)
  done
done

N=${#ITEMS[@]}
[ "$N" -eq 0 ] && { echo "nothing to audition."; exit 0; }
CUR=0 PLAYPID=""

stop_sound() { [ -n "$PLAYPID" ] && kill "$PLAYPID" 2>/dev/null; PLAYPID=""; }

save() {
  : > "$APPROVED"
  local i
  for i in $(seq 0 $((N-1))); do
    [ "${MARK[$i]}" = 1 ] || continue
    IFS='|' read -r slot base path <<< "${ITEMS[$i]}"
    [ "${ORIGIN[$i]}" = candidate ] && cp -n "$path" "./$base" 2>/dev/null
    if [ "${FAV[$i]}" = 1 ]; then echo "$slot|$base|fav"; else echo "$slot|$base"; fi >> "$APPROVED"
  done
}

draw() {
  local kept=0 i
  for i in $(seq 0 $((N-1))); do [ "${MARK[$i]}" = 1 ] && kept=$((kept+1)); done
  printf '\033[H\033[2J'
  printf "🔊 sound audition — %d sounds · ✅ %d picked · %d unmarked\n" "$N" "$kept" $((N-kept))
  printf "   ↑/↓ move · enter play · s stop · x keep · f fav ⭐ · q quit&save\n\n"
  local prevslot=""
  for i in $(seq 0 $((N-1))); do
    IFS='|' read -r slot base path <<< "${ITEMS[$i]}"
    [ "$slot" != "$prevslot" ] && { printf "  ── slot %s ──\n" "$slot"; prevslot="$slot"; }
    local mark="  "
    [ "${MARK[$i]}" = 1 ] && mark="✅"
    [ "${FAV[$i]}" = 1 ] && mark="⭐"
    local ptr="  "; [ "$i" -eq "$CUR" ] && ptr="👉"
    if [ "$i" -eq "$CUR" ]; then printf "%s %s \033[7m%s\033[0m\n" "$ptr" "$mark" "$base"
    else printf "%s %s %s\n" "$ptr" "$mark" "$base"; fi
  done
}

trap 'stop_sound; printf "\033[?25h"; stty sane' EXIT
printf '\033[?25l'

while true; do
  draw
  IFS= read -rsn1 key </dev/tty
  case "$key" in
    $'\x1b')
      read -rsn2 -t 1 rest </dev/tty
      case "$rest" in '[A') CUR=$(( (CUR-1+N) % N ));; '[B') CUR=$(( (CUR+1) % N ));; esac ;;
    k) CUR=$(( (CUR-1+N) % N )) ;;
    j) CUR=$(( (CUR+1) % N )) ;;
    ''|' ')
      stop_sound
      IFS='|' read -r _ _ path <<< "${ITEMS[$CUR]}"
      afplay "$path" & PLAYPID=$! ;;
    s) stop_sound ;;
    x)
      if [ "${MARK[$CUR]}" = 1 ]; then MARK[$CUR]=0; FAV[$CUR]=0; else MARK[$CUR]=1; fi
      save ;;
    f)
      if [ "${FAV[$CUR]}" = 1 ]; then FAV[$CUR]=0; else FAV[$CUR]=1; MARK[$CUR]=1; fi
      save ;;
    q) break ;;
  esac
done

save; stop_sound
printf '\033[?25h\033[H\033[2J'
echo "━━━━━━━━━━ approved set ━━━━━━━━━━"
sort "$APPROVED" | sed 's/^/  /' | sed 's/\(.*|fav\)/⭐ \1/;t;s/^/✅ /'
