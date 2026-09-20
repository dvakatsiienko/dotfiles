#!/bin/bash
# cclio boot digest — every check the boot ritual needs, one run, one status line per check.
# fires as the SessionStart hook AND by hand from /cclio:init when the last digest is stale.
# list-only: never ingests, never deletes. a check that cannot run prints FAIL, never silence —
# an agent reading a digest cannot tell a skipped check from a passed one.
# BOOT_STRICT=1 → exit 1 on any FAIL (the by-hand mode); the hook mode always exits 0.

fails=0
fail() { echo "🚨 FAIL · $1"; fails=$((fails + 1)); }
STAMP="$HOME/.claude/shelf/boot-digest.stamp"
VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Dima's Vault/prompts"

echo "=== cclio boot digest · $(date '+%Y-%m-%d %H:%M') ==="

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

echo "-- inbox --"
if [ -r "$VAULT/inbox.md" ]; then
  n=$(grep -vc '^## \|^---$\|^> \|^\s*$' "$VAULT/inbox.md")
  [ "$n" = 0 ] && echo "clean" || echo "$n content lines — parse into flowlog before any work"
  grep -q 'FROZEN' "$VAULT/inbox.md" && echo "FROZEN marker present — do not touch"
  echo "-- inbox, laned by jev (script/lib/jev-questions.ts; ⏳ = band 0.30–0.70, dima's call) --"
  timeout 25 ~/dotfiles/script/op-run.sh node ~/dotfiles/script/inbox-triage.ts 2>/dev/null || echo "jev triage unavailable — lane by hand"
else
  fail "inbox unreadable (icloud not mounted?)"
fi

echo "-- jev vet (pnpm jev:vet ok|miss <flow> <note> records a verdict; a miss restarts the window) --"
node "$HOME/dotfiles/script/jev-vet.ts" 2>/dev/null || fail "jev vet registry unreadable"

echo "-- x-queue head --"
awk '/^## queue/{flag=1; next} flag && NF {print; count++} count==3{exit}' \
  "$HOME/dotfiles/cclio/.claude/x-queue.md" 2>/dev/null || fail "no x-queue file"

"$HOME/dotfiles/cclio/.claude/hooks/gazette-trail.sh"   # gazette rides the memory import, not stdout

roadmap=$("$HOME/dotfiles/cclio/.claude/hooks/roadmap-prefetch.sh")
if echo "$roadmap" | grep -q '^-- scope'; then
  echo "$roadmap"
else
  fail "tracker unreachable — roadmap prefetch returned nothing (linear auth or network)"
fi

echo "-- stuck reminders (raise every one in the opening board) --"
grep '^⏰📌' "$HOME/dotfiles/cclio/memory/_reminders.md" 2>/dev/null || echo "none"

echo "-- fleet: live sessions · worktrees · coder prs --"
live=$(jq -r '.cwd // empty' "$HOME"/.claude/sessions/*.json 2>/dev/null | sort | uniq -c | sed 's/^ *//')
[ -n "$live" ] && echo "$live" || echo "no live sessions registered"
wt=$(git -C "$HOME/projects/bytes" worktree list 2>/dev/null | grep -v '^/Users/dima/projects/bytes ' )
[ -n "$wt" ] && echo "$wt" || echo "no bytes worktrees"
for repo in bytes dotfiles; do
  prs=$(gh pr list -R "dvakatsiienko/$repo" --search 'head:coder/' --json number,title,headRefName --jq '.[] | "#\(.number) \(.headRefName) — \(.title)"' 2>/dev/null) || { fail "gh unreachable for $repo"; continue; }
  [ -n "$prs" ] && echo "$repo coder prs: $prs" || echo "$repo: no open coder prs"
done

echo "-- renovate (digest is /cclio:evergreen, on his word) --"
for repo in bytes dotfiles; do
  gh pr list -R "dvakatsiienko/$repo" --search 'author:app/renovate' --json number,createdAt 2>/dev/null \
    | jq -r --arg r "$repo" 'if length == 0 then "\($r): 0" else "\($r): \(length) open · oldest \(min_by(.createdAt).createdAt[:10])" end' \
    || fail "gh unreachable for renovate/$repo"
done
jq -r --arg today "$(date +%Y-%m-%d)" '(map(.markedAt) | max) as $m
  | ($today | strptime("%Y-%m-%d") | mktime) as $t
  | ($t - (($t | strftime("%u") | tonumber) - 1) * 86400 | strftime("%Y-%m-%d")) as $monday
  | "apps lane: \(length) apps · last marked \($m) · " + (if $m < $monday then "DUE (a monday passed) — pnpm skill:evergreen-apps" else "next monday" end)' \
  "$HOME/dotfiles/cclio/evergreen/sources.json" || fail "apps lane index unreadable"

echo "-- repos vs origin (behind-only → loot as a freebie; ahead+behind → propose the rebase) --"
for repo in "$HOME/dotfiles" "$HOME/projects/bytes"; do
  git -C "$repo" fetch -q 2>/dev/null || fail "fetch failed in $(basename "$repo")"
  counts=$(git -C "$repo" rev-list --left-right --count HEAD...@{upstream} 2>/dev/null)
  echo "$(basename "$repo"): ahead ${counts%%	*} · behind ${counts##*	}"
done

echo "-- ci + vercel reds, 48 h (ci-watch.sh --boot; --watch is the in-session monitor) --"
"$(dirname "$0")/ci-watch.sh" --boot || fail "ci-watch could not query gh or vercel"

echo "-- settings.json symlink --"
if [ -L "$HOME/.claude/settings.json" ]; then
  echo "symlink OK"
else
  fail "REAL FILE where the symlink belongs — silent divergence"
fi

echo "-- flawlog (self-grill reads the last two) --"
ls -t "$HOME/.claude/shelf/flawlog/"*.md 2>/dev/null | head -2 | xargs -n1 basename
today="$HOME/.claude/shelf/flawlog/$(date +%Y-%m-%d)"
ls "$today"-*.md >/dev/null 2>&1 && echo "today's file exists" || echo "no file for today yet — open one at step 8"

date +%s > "$STAMP"
if [ "$fails" -gt 0 ]; then
  echo "=== $fails check(s) FAILED — report them first, before any work ==="
  [ -n "$BOOT_STRICT" ] && exit 1
else
  echo "=== all checks green ==="
fi
exit 0
