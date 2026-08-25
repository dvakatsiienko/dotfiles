#!/usr/bin/env bash
# SessionStart: capture the session model for opus-register.sh.
# Only SessionStart hooks receive a model field (hooks docs); UserPromptSubmit does not.
# revisit on next opus release — if opus output calms down natively, delete this pair.
input=$(cat)
sid=$(jq -r '.session_id // empty' <<<"$input")
model=$(jq -r '.model // empty' <<<"$input")
[ -n "$sid" ] && [ -n "$model" ] && printf '%s' "$model" > "/tmp/cc-model-$sid"
exit 0
