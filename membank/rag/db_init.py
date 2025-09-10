#!/usr/bin/env python3
"""
Database initialization for membank system.
Creates SQLite database with proper schema if it doesn't exist.
"""

import sqlite3
import sys
from pathlib import Path


def create_database_schema(db_path: str) -> bool:
    """
    Create the database schema for membank system.
    
    Args:
        db_path: Path to the SQLite database file
        
    Returns:
        True if database was created, False if it already existed
    """
    db_file = Path(db_path)
    database_existed = db_file.exists()
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Create chunks table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chunks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                library TEXT NOT NULL,
                file_path TEXT NOT NULL,
                content TEXT NOT NULL,
                semantic_tags JSON,
                bm25_tokens JSON,
                start_line INTEGER,
                end_line INTEGER,
                chunk_type TEXT,
                token_count INTEGER
            )
        """)
        
        # Create indexes for better performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_library ON chunks(library)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_semantic_tags ON chunks(semantic_tags)")
        
        conn.commit()
        return not database_existed
        
    except Exception as e:
        print(f"Error creating database schema: {e}")
        return False
    finally:
        conn.close()


def ensure_database_exists(db_path: str, prompt: bool = True) -> bool:
    """
    Ensure database exists, create if missing with optional user prompt.
    
    Args:
        db_path: Path to the SQLite database file
        prompt: If True, prompt user before creating new database
        
    Returns:
        True if database exists/was created, False if user declined creation
    """
    db_file = Path(db_path)
    
    if db_file.exists():
        return True
    
    # Database doesn't exist
    if prompt:
        print(f"⚠️  Database not found: {db_path}")
        print("   This will create an empty database with proper schema.")
        response = input("   Create empty database? (y/n): ").strip().lower()
        
        if response != 'y':
            print("❌ Database creation cancelled.")
            return False
    
    # Create database
    print(f"🗄️  Creating new database: {db_path}")
    was_created = create_database_schema(db_path)
    
    if was_created:
        print("✅ Database created successfully!")
        print("   Add libraries with: pnpm mem:add <github-url>")
    else:
        print("✅ Database schema verified!")
    
    return True


if __name__ == "__main__":
    # Allow running as standalone script
    if len(sys.argv) < 2:
        print("Usage: python3 db_init.py <database-path>")
        sys.exit(1)
    
    db_path = sys.argv[1]
    success = ensure_database_exists(db_path, prompt=True)
    sys.exit(0 if success else 1)