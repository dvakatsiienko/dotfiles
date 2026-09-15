#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Toggle Bartender
# @raycast.mode silent
# @raycast.packageName Menu Bar
# @raycast.icon 🍸
# @raycast.description Show or hide Bartender's hidden menu bar items — the same as its own hot key, routed through Raycast.

osascript -e 'tell application "Bartender 7" to toggle bartender'
