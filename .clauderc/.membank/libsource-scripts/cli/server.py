#!/usr/bin/env python3
"""CLI entry point for lib:server command - Manage RAG search server."""

import sys
import os
import signal
import subprocess
from pathlib import Path


def get_server_pid():
    """Get the PID of the running server if it exists."""
    try:
        result = subprocess.run(
            ["lsof", "-i", ":1408", "-t"],
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
        print(f"⚠️  Server already running on port 1408 (PID: {pid})")
        print(f"   Stop it first: pnpm lib:server stop")
        return False
    
    print("🚀 Starting RAG Search Server on port 1408...")
    
    # Path to server module
    server_path = Path(__file__).parent.parent / "rag" / "server.py"
    
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
        print(f"📍 API: http://localhost:1408")
        print(f"📚 Docs: http://localhost:1408/docs")
        print(f"\n🛑 To stop: pnpm lib:server stop")
        return True
    else:
        print("❌ Failed to start server")
        return False


def stop_server():
    """Stop the RAG search server."""
    pid = get_server_pid()
    if not pid:
        print("❌ No server running on port 1408")
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
        print(f"📍 API: http://localhost:1408")
        print(f"📚 Docs: http://localhost:1408/docs")
        
        # Try to get server health
        try:
            import urllib.request
            response = urllib.request.urlopen("http://localhost:1408/health", timeout=2)
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
        print("  start   - Start the RAG search server on port 1408")
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