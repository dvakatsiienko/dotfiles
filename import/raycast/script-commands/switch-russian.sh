#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Switch to Russian (Birman)
# @raycast.mode silent
# @raycast.packageName Language Switcher
# @raycast.keyword rus

# a lib to switch keyboard layouts — https://github.com/Lutzifer/keyboardSwitcher
# selects by display NAME on purpose: with TSMLanguageIndicatorEnabled=0 macos derives different ids for custom layouts and select-by-id fails
/opt/homebrew/bin/keyboardSwitcher select "Russian – Ilya Birman Typography" >/dev/null 2>&1 && echo "🇷🇺 russian"
