#!/usr/bin/env python3
"""CLI entry point for lib:search command - Search RAG-augmented libsources."""

import sys
import json
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import DATABASE_PATH
from rag.search import SearchEngine
from rag.db_init import ensure_database_exists


def main():
    """Search across RAG-augmented libsources."""
    if len(sys.argv) < 2:
        print("Usage: python search.py \"search query\" [library-name]")
        print("\nExamples:")
        print('  python search.py "react hooks"           # Search all libraries')
        print('  python search.py "useEffect" react       # Search in React only')
        sys.exit(1)
    
    query = sys.argv[1]
    library = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Database path from config
    db_path = str(DATABASE_PATH)
    
    # Ensure database exists, prompt if missing
    if not ensure_database_exists(db_path, prompt=True):
        sys.exit(1)
    
    print(f"🔍 Searching for: '{query}'")
    if library:
        print(f"📚 Library: {library}")
    else:
        print(f"📚 Searching all libraries")
    print("-" * 50)
    
    with SearchEngine(db_path) as engine:
        if library:
            # Search specific library
            results = engine.search(query, library, limit=5)
            
            if results['results']:
                print(f"\n✅ Found {results['total_results']} results in {results['search_time_ms']}ms")
                print(f"🏷️  Query tags: {', '.join(results['query_tags']) if results['query_tags'] else 'none'}")
                
                for i, result in enumerate(results['results'], 1):
                    print(f"\n{i}. Score: {result['score']:.2f}")
                    print(f"   📁 File: {result['file_path']}")
                    print(f"   📍 Lines: {result['start_line']}-{result['end_line']}")
                    print(f"   🏷️  Tags: {', '.join(result['semantic_tags'][:3]) if result['semantic_tags'] else 'none'}")
                    print(f"   📝 Preview: {result['snippet'][:150]}...")
            else:
                print(f"❌ No results found for '{query}' in {library}")
        else:
            # Search all libraries
            results = engine.search_all_libraries(query, limit_per_library=3)
            
            if results['total_results'] > 0:
                print(f"\n✅ Found {results['total_results']} total results across {len(results['results_by_library'])} libraries")
                
                for lib_result in results['results_by_library']:
                    print(f"\n📚 {lib_result['library']} ({len(lib_result['results'])} results):")
                    
                    for i, result in enumerate(lib_result['results'], 1):
                        print(f"  {i}. Score: {result['score']:.2f} | Lines: {result['start_line']}-{result['end_line']}")
                        print(f"     {result['snippet'][:100]}...")
            else:
                print(f"❌ No results found for '{query}' in any library")
    
    print("\n💡 Tip: Use the RAG server (pnpm mem:server:start) for API access on port 1408")


if __name__ == "__main__":
    main()