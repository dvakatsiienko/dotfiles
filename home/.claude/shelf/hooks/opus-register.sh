#!/usr/bin/env bash
# UserPromptSubmit: inject the opus register line — opus sessions only.
# Model comes from /tmp/cc-model-<session_id>, written by opus-register-capture.sh at SessionStart.
# Known limit: a mid-session /model switch is invisible here.
# revisit on next opus release — if opus output calms down natively, delete this pair.
input=$(cat)
sid=$(jq -r '.session_id // empty' <<<"$input")
model=$(cat "/tmp/cc-model-$sid" 2>/dev/null)
case "$model" in
  *opus*)
    echo "(opus register) verdict first, plain words, simple technical english. keep the important bits — calmer and cleaner, not shorter on substance. voice, emojis, formatting rules all stay."
    ;;
esac
exit 0
