#!/usr/bin/env python3
"""CLI entry point to initialize membank database manually."""

import sys
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import DATABASE_PATH
from rag.db_init import ensure_database_exists


def main():
    """Initialize membank database with user confirmation."""
    print("🗄️  Membank Database Initialization")
    print("-" * 40)
    
    db_path = str(DATABASE_PATH)
    
    if Path(db_path).exists():
        print(f"✅ Database already exists: {db_path}")
        
        # Show basic stats
        try:
            import sqlite3
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM chunks")
            chunk_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(DISTINCT library) FROM chunks")
            library_count = cursor.fetchone()[0]
            
            print(f"📊 Current stats: {library_count} libraries, {chunk_count:,} chunks")
            conn.close()
            
        except Exception as e:
            print(f"⚠️  Could not read database stats: {e}")
        
        sys.exit(0)
    
    # Create database
    success = ensure_database_exists(db_path, prompt=True)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()