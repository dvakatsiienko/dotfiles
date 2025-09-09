#!/bin/bash
# Hook script to re-index after libsource updates
# Add this to your libsource-update workflow

LIBRARY_NAME=$1

if [ -z "$LIBRARY_NAME" ]; then
    echo "Usage: ./update-hook.sh [library_name]"
    exit 1
fi

echo "📚 Updating libsource for $LIBRARY_NAME..."
cd ~/.dotfiles/.clauderc/scripts
python libsource-update.py $LIBRARY_NAME

if [ $? -eq 0 ]; then
    echo "🔄 Re-indexing for search..."
    cd ~/.dotfiles/.clauderc/rag
    source .venv/bin/activate
    python reindex.py $LIBRARY_NAME
    
    if [ $? -eq 0 ]; then
        echo "✅ Update and re-index complete!"
    else
        echo "❌ Re-indexing failed"
        exit 1
    fi
else
    echo "❌ Libsource update failed"
    exit 1
fi