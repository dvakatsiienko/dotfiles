#!/bin/bash

# Switch Claude Code statusline to bash version

SETTINGS_FILE="$HOME/.claude/settings.json"
STATUSLINE_SCRIPT="$HOME/.claude/statusline/statusline-sh/statusline.sh"

# Check if settings file exists
if [ ! -f "$SETTINGS_FILE" ]; then
    echo "Error: Claude Code settings file not found at $SETTINGS_FILE"
    exit 1
fi

# Check if bash statusline exists
if [ ! -f "$STATUSLINE_SCRIPT" ]; then
    echo "Error: Bash statusline script not found at $STATUSLINE_SCRIPT"
    exit 1
fi

# Update settings.json to use bash statusline
# Using sed to replace the statusline command
sed -i.bak 's|"statusline": "[^"]*"|"statusline": "'$STATUSLINE_SCRIPT'"|' "$SETTINGS_FILE"

echo "✅ Switched to bash statusline: $STATUSLINE_SCRIPT"
echo "🔄 Restart your terminal or run 'cc' to see changes"