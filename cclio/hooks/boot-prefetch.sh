#!/bin/bash
# cclio SessionStart prefetch — cheap always-wanted reads, injected into boot context.
# list-only: never ingests, never deletes.

echo "=== cclio boot prefetch ==="

echo "-- pending handoffs (list-only; ingest via /x:handoff-pull) --"
found=0
for f in "$HOME"/.claude/shelf/handoffs/*.md; do
  [ -e "$f" ] || continue
  base=$(basename "$f")
  audience=$(echo "$base" | cut -d- -f2)
  case "$audience" in
    cclio|any) tag="" ;;
    *) tag=" [addressed to: $audience — leave it]" ;;
  esac
  age_min=$(( ( $(date +%s) - $(stat -f %m "$f") ) / 60 ))
  echo "$base (${age_min}m old)$tag"
  found=1
done
[ "$found" = 0 ] && echo "none"

echo "-- x-queue head --"
awk '/^## queue/{flag=1; next} flag && NF {print; count++} count==3{exit}' \
  "$HOME/dotfiles/cclio/.claude/x-queue.md" 2>/dev/null || echo "no queue file"

echo "-- stuck reminders (raise every one in the opening board) --"
grep '^⏰📌' "$HOME/dotfiles/cclio/memory/reminders.md" 2>/dev/null || echo "none"

echo "-- settings.json symlink --"
if [ -L "$HOME/.claude/settings.json" ]; then
  echo "symlink OK"
else
  echo "🚨 REAL FILE where the symlink belongs — silent divergence, flag it"
fi
