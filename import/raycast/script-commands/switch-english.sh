#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Switch to English (Birman)
# @raycast.mode silent
# @raycast.packageName Language Switcher
# @raycast.keyword eng

# a lib to switch keyboard layouts — https://github.com/Lutzifer/keyboardSwitcher
# selects by display NAME on purpose: with TSMLanguageIndicatorEnabled=0 macos derives different ids for custom layouts and select-by-id fails
/opt/homebrew/bin/keyboardSwitcher select "English – Ilya Birman Typography" >/dev/null 2>&1 && echo "🇺🇸 english"
