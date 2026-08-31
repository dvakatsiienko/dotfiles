#!/usr/bin/env bash
# PreToolUse hook — fires the guide trigger on WRITING TypeScript, not just reading it.
#
# The gap this closes: rules/guide-skill-trigger.md carries `paths:` frontmatter,
# which fires on Read. Authoring a NEW .ts file reads nothing, so a from-scratch
# build got no guides at all (measured 2026-08-31, DOT-233: lib, cli and tests all
# written before any guide loaded).
#
# ⚠️ WHY THIS BLOCKS RATHER THAN WHISPERS. `additionalContext` — the field that
# injects text without interrupting — is supported only on UserPromptSubmit and
# SessionStart, never on PreToolUse (verified against the hooks reference,
# 2026-08-31). The one channel that reaches the model here is a denial's reason
# string. So the hook denies the FIRST TypeScript write of a session, hands over
# the trigger text, and stands down for the rest of it. One redone tool call per
# session buys guides that cannot be missed.
#
# Fails open on every unexpected path: a hook that blocks writes when its own
# plumbing breaks is worse than the miss it exists to prevent.
set -uo pipefail

payload=$(cat 2>/dev/null) || exit 0
[[ -n $payload ]] || exit 0

tool=$(printf '%s' "$payload" | jq -r '.tool_name // empty' 2>/dev/null) || exit 0
[[ $tool == Write || $tool == Edit || $tool == MultiEdit ]] || exit 0

path=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty' 2>/dev/null) || exit 0
[[ $path == *.ts || $path == *.tsx ]] || exit 0

session=$(printf '%s' "$payload" | jq -r '.session_id // empty' 2>/dev/null) || exit 0
[[ -n $session ]] || exit 0

# Once per session PER EXTENSION CLASS. A .ts fire is satisfied by either marker
# (a tsx fire already delivered the ts guidance), but a .tsx write after a
# ts-only fire triggers once more — otherwise guide-react rides on habit again.
# Markers live in TMPDIR because "once per session" and "once per boot" are
# close enough, and nothing here is worth persisting.
marker_dir="${TMPDIR:-/tmp}/cc-guide-trigger"
class=ts
[[ $path == *.tsx ]] && class=tsx
marker="$marker_dir/$session-$class"
mkdir -p "$marker_dir" 2>/dev/null || exit 0
if [[ $class == ts ]]; then
	[[ -e $marker_dir/$session-ts || -e $marker_dir/$session-tsx ]] && exit 0
else
	[[ -e $marker ]] && exit 0
fi
: >"$marker" 2>/dev/null || exit 0

# The rule file is the single source of truth; this hook only delivers it. Its
# YAML frontmatter is for the `paths:` lever and means nothing here, so it goes.
rule="$HOME/.claude/rules/guide-skill-trigger.md"
[[ -f $rule ]] || exit 0
body=$(awk 'BEGIN{n=0} /^---$/{n++; next} n>=2 || (n==0 && NR==1 && $0!="---")' "$rule" 2>/dev/null) || exit 0
[[ -n $body ]] || exit 0

reason="about to author TypeScript, and no guide is loaded yet.

$body

Load them, then repeat this exact tool call. This hook fires once per session and is now silent."

jq -n --arg reason "$reason" \
	'{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $reason}}' \
	2>/dev/null || exit 0

exit 0
