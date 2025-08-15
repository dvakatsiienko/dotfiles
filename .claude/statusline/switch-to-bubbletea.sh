#!/bin/bash

# Switch Claude Code statusline to Bubble Tea version

SETTINGS_FILE="$HOME/.claude/settings.json"
STATUSLINE_BINARY="$HOME/.claude/statusline/statusline-go/statusline-bubbletea"
STATUSLINE_SOURCE="$HOME/.claude/statusline/statusline-go/main.go"

# Check if settings file exists
if [ ! -f "$SETTINGS_FILE" ]; then
    echo "Error: Claude Code settings file not found at $SETTINGS_FILE"
    exit 1
fi

# Check if Go source exists
if [ ! -f "$STATUSLINE_SOURCE" ]; then
    echo "Error: Bubble Tea statusline source not found at $STATUSLINE_SOURCE"
    exit 1
fi

# Check if Go is installed (handle alias issue)
if ! command -v go >/dev/null 2>&1 && ! unalias go 2>/dev/null || ! command -v go >/dev/null 2>&1; then
    echo "❌ Go is not installed or not in PATH"
    echo "📥 Please install Go from https://golang.org/dl/"
    echo "🍺 Or use Homebrew: brew install go"
    exit 1
fi

# Compile the Go program if binary doesn't exist or source is newer
if [ ! -f "$STATUSLINE_BINARY" ] || [ "$STATUSLINE_SOURCE" -nt "$STATUSLINE_BINARY" ]; then
    echo "🔨 Compiling Bubble Tea statusline..."
    cd "$HOME/.claude/statusline/statusline-go"
    
    # Initialize go module if it doesn't exist
    if [ ! -f "go.mod" ]; then
        echo "📦 Initializing Go module..."
        unalias go 2>/dev/null || true
        go mod init statusline-bubbletea
        go mod tidy
    fi
    
    # Compile the binary
    unalias go 2>/dev/null || true
    go build -o statusline-bubbletea main.go
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to compile Bubble Tea statusline"
        exit 1
    fi
    
    echo "✅ Compilation successful"
fi

# Update settings.json to use Bubble Tea statusline
# Using sed to replace the statusline command
sed -i.bak 's|"statusline": "[^"]*"|"statusline": "'$STATUSLINE_BINARY'"|' "$SETTINGS_FILE"

echo "✅ Switched to Bubble Tea statusline: $STATUSLINE_BINARY"
echo "🔄 Restart your terminal or run 'cc' to see changes"
echo "💡 Use '--watch' flag to see live updates: $STATUSLINE_BINARY --watch"