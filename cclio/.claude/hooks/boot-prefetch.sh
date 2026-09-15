#!/bin/bash
# cclio SessionStart prefetch — cheap always-wanted reads, injected into boot context.
# list-only: never ingests, never deletes.

echo "=== cclio boot prefetch ==="

echo "-- pending handoffs (list-only; ingest via /x:handoff-ingest) --"
found=0
for f in "$HOME"/.claude/shelf/handoffs/*.md; do
  [ -e "$f" ] || continue
  base=$(basename "$f")
  stem=${base%.md}; stem=${stem%-shared}
  # `<for>--<lane>--<topic>--by-<author>--<stamp>`; a legacy name has no `--` at
  # all, and only its first field ever meant an audience.
  if [[ "$stem" == *--*--*--*--* ]]; then
    rest="$stem"
    audience=${rest%%--*}; rest=${rest#*--}
    lane=${rest%%--*};     rest=${rest#*--}
    topic=${rest%%--*};    rest=${rest#*--}
    author=${rest%%--*};   author=${author#by-}
    line="$lane lane · by $author · $topic"
  else
    audience=${stem%%-*}
    line="$base (legacy name — no lane, no author)"
  fi
  # A whitelist, so an unparsed field can never wrongly claim a file is someone
  # else's and get it left behind forever.
  case "$audience" in
    cw|ccli|dpatch) tag=" [for $audience — leave it]" ;;
    *) tag="" ;;
  esac
  age_min=$(( ( $(date +%s) - $(stat -f %m "$f") ) / 60 ))
  echo "$line (${age_min}m old)$tag"
  found=1
done
[ "$found" = 0 ] && echo "none"

echo "-- x-queue head --"
awk '/^## queue/{flag=1; next} flag && NF {print; count++} count==3{exit}' \
  "$HOME/dotfiles/cclio/.claude/x-queue.md" 2>/dev/null || echo "no queue file"

"$HOME/dotfiles/cclio/.claude/hooks/gazette-recent.sh"   # gazette rides the memory import, not stdout

"$HOME/dotfiles/cclio/.claude/hooks/roadmap-prefetch.sh"   # the linear initiative: step, scope, timeline, mil tail in order

echo "-- stuck reminders (raise every one in the opening board) --"
grep '^⏰📌' "$HOME/dotfiles/cclio/memory/_reminders.md" 2>/dev/null || echo "none"

echo "-- repos vs origin (behind-only → loot as a freebie; ahead+behind → propose the rebase) --"
for repo in "$HOME/dotfiles" "$HOME/projects/bytes"; do
  git -C "$repo" fetch -q 2>/dev/null
  counts=$(git -C "$repo" rev-list --left-right --count HEAD...@{upstream} 2>/dev/null)
  echo "$(basename "$repo"): ahead ${counts%%	*} · behind ${counts##*	}"
done

echo "-- settings.json symlink --"
if [ -L "$HOME/.claude/settings.json" ]; then
  echo "symlink OK"
else
  echo "🚨 REAL FILE where the symlink belongs — silent divergence, flag it"
fi
