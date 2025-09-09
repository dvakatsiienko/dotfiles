#!/bin/bash
# Start RAG search server on port 1408

PORT=1408
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🚀 Starting RAG Search Server on port $PORT..."

# Check if already running
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Server already running on port $PORT"
    echo "   Kill it first: kill $(lsof -Pi :$PORT -sTCP:LISTEN -t)"
    exit 1
fi

# Activate venv and start server
cd "$SCRIPT_DIR"
source .venv/bin/activate
python src/server.py &

echo "✅ Server starting..."
echo "📍 API: http://localhost:$PORT"
echo "📚 Docs: http://localhost:$PORT/docs"
echo ""
echo "🛑 To stop: kill $(ps aux | grep 'python src/server.py' | grep -v grep | awk '{print $2}')"