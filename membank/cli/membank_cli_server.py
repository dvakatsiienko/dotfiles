#!/usr/bin/env python3
"""CLI entry point for lib:server command - Manage RAG search server."""

import sys
import os
import signal
import subprocess
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import SERVER_PORT


def get_server_pid():
    """Get the PID of the running server if it exists."""
    try:
        result = subprocess.run(
            ["lsof", "-i", f":{SERVER_PORT}", "-t"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0 and result.stdout.strip():
            return int(result.stdout.strip())
    except:
        pass
    return None


def start_server():
    """Start the RAG search server."""
    pid = get_server_pid()
    if pid:
        print(f"⚠️  Server already running on port {SERVER_PORT} (PID: {pid})")
        print(f"   Stop it first: pnpm lib:server stop")
        return False
    
    print(f"🚀 Starting RAG Search Server on port {SERVER_PORT}...")
    
    # Path to server module
    server_path = Path(__file__).parent.parent / "rag" / "membank_server.py"
    
    # Start server in background
    process = subprocess.Popen(
        [sys.executable, str(server_path)],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True
    )
    
    # Wait a moment to check if it started
    import time
    time.sleep(2)
    
    pid = get_server_pid()
    if pid:
        print(f"✅ Server started successfully (PID: {pid})")
        print(f"📍 API: http://localhost:{SERVER_PORT}")
        print(f"📚 Docs: http://localhost:{SERVER_PORT}/docs")
        print(f"\n🛑 To stop: pnpm lib:server stop")
        return True
    else:
        print("❌ Failed to start server")
        return False


def stop_server():
    """Stop the RAG search server."""
    pid = get_server_pid()
    if not pid:
        print(f"❌ No server running on port {SERVER_PORT}")
        return False
    
    try:
        os.kill(pid, signal.SIGTERM)
        print(f"✅ Server stopped (PID: {pid})")
        return True
    except ProcessLookupError:
        print(f"⚠️  Server process {pid} not found")
        return False
    except PermissionError:
        print(f"❌ Permission denied to stop server (PID: {pid})")
        return False


def server_status():
    """Check server status."""
    pid = get_server_pid()
    if pid:
        print(f"✅ Server is running (PID: {pid})")
        print(f"📍 API: http://localhost:{SERVER_PORT}")
        print(f"📚 Docs: http://localhost:{SERVER_PORT}/docs")
        
        # Try to get server health
        try:
            import urllib.request
            response = urllib.request.urlopen(f"http://localhost:{SERVER_PORT}/health", timeout=2)
            if response.status == 200:
                print(f"💚 Server is healthy")
        except:
            print(f"⚠️  Server is running but not responding")
    else:
        print("❌ Server is not running")
        print("   Start it with: pnpm lib:server start")


def main():
    """Main entry point for server management."""
    if len(sys.argv) < 2:
        print("Usage: python server.py [start|stop|status|restart]")
        print("\nCommands:")
        print(f"  start   - Start the RAG search server on port {SERVER_PORT}")
        print("  stop    - Stop the running server")
        print("  status  - Check if server is running")
        print("  restart - Restart the server")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "start":
        success = start_server()
        sys.exit(0 if success else 1)
    
    elif command == "stop":
        success = stop_server()
        sys.exit(0 if success else 1)
    
    elif command == "status":
        server_status()
        sys.exit(0)
    
    elif command == "restart":
        print("🔄 Restarting server...")
        stop_server()
        import time
        time.sleep(1)
        success = start_server()
        sys.exit(0 if success else 1)
    
    else:
        print(f"❌ Unknown command: {command}")
        print("   Use: start, stop, status, or restart")
        sys.exit(1)


if __name__ == "__main__":
    main()