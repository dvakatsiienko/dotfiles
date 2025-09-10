#!/usr/bin/env python3
"""
Membank Database Explorer - Quick database exploration tool for membank RAG database.

Usage: python3 membank_db_explore.py
       pnpm mem:db:explore
"""

import sqlite3
import sys
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import DATABASE_PATH


def format_bytes(size_bytes):
    """Convert bytes to human readable format."""
    if size_bytes == 0:
        return "0 B"
    
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"


def main():
    """Main exploration function."""
    print("📊 MEMBANK DATABASE OVERVIEW")
    print("=" * 40)
    
    db_path = DATABASE_PATH
    
    print(f"\n📁 Database location:")
    print(f"  {db_path}")
    
    if not db_path.exists():
        print("❌ Database not found! Run 'pnpm mem:init' to create it.")
        sys.exit(1)
    
    # Show database size
    size_bytes = db_path.stat().st_size
    print(f"\n📁 Database size:")
    print(f"  {format_bytes(size_bytes)}")
    
    # Connect to database
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Show tables
        print(f"\n📋 Tables:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        for table in tables:
            print(f"  • {table[0]}")
        
        # Show chunk statistics
        print(f"\n📈 Chunk Statistics:")
        cursor.execute("""
            SELECT 
                library,
                COUNT(*) as chunks,
                ROUND(AVG(LENGTH(content))) as avg_size,
                SUM(json_array_length(semantic_tags)) as total_tags
            FROM chunks 
            GROUP BY library
            ORDER BY chunks DESC
        """)
        
        rows = cursor.fetchall()
        if rows:
            print(f"{'Library':<15} {'Chunks':<8} {'Avg Size':<10} {'Total Tags'}")
            print("-" * 45)
            for row in rows:
                library, chunks, avg_size, total_tags = row
                avg_size = int(avg_size) if avg_size else 0
                total_tags = int(total_tags) if total_tags else 0
                print(f"{library:<15} {chunks:<8} {avg_size:<10} {total_tags}")
        else:
            print("  No chunks found in database")
        
        # Show most common semantic tags
        print(f"\n🏷️  Most Common Semantic Tags:")
        cursor.execute("""
            SELECT semantic_tags, COUNT(*) as occurrences 
            FROM chunks 
            WHERE semantic_tags != '[]' AND semantic_tags IS NOT NULL
            GROUP BY semantic_tags 
            ORDER BY COUNT(*) DESC 
            LIMIT 5
        """)
        
        tag_rows = cursor.fetchall()
        if tag_rows:
            for i, (tags, count) in enumerate(tag_rows[:5], 1):
                # Parse JSON tags for better display
                try:
                    import json
                    parsed_tags = json.loads(tags)
                    tag_str = ", ".join(parsed_tags[:3])  # Show first 3 tags
                    if len(parsed_tags) > 3:
                        tag_str += "..."
                except:
                    tag_str = tags[:50] + "..." if len(tags) > 50 else tags
                
                print(f"  {i}. [{tag_str}] ({count} chunks)")
        else:
            print("  No semantic tags found")
        
        # Show sample chunk with react_hooks tag
        print(f"\n🔍 Sample Chunk (first with react_hooks tag):")
        cursor.execute("""
            SELECT 
                library,
                start_line,
                end_line,
                semantic_tags,
                SUBSTR(content, 1, 150) as preview
            FROM chunks 
            WHERE semantic_tags LIKE '%react_hooks%' 
            LIMIT 1
        """)
        
        sample = cursor.fetchone()
        if sample:
            library, start_line, end_line, tags, preview = sample
            print(f"  Library: {library}")
            print(f"  Lines: {start_line}-{end_line}")
            print(f"  Tags: {tags}")
            print(f"  Preview: {preview.strip()}...")
        else:
            # Show any sample chunk
            cursor.execute("""
                SELECT 
                    library,
                    start_line,
                    end_line,
                    semantic_tags,
                    SUBSTR(content, 1, 150) as preview
                FROM chunks 
                LIMIT 1
            """)
            
            sample = cursor.fetchone()
            if sample:
                library, start_line, end_line, tags, preview = sample
                print(f"  Library: {library}")
                print(f"  Lines: {start_line}-{end_line}")
                print(f"  Tags: {tags}")
                print(f"  Preview: {preview.strip()}...")
            else:
                print("  No chunks available")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()