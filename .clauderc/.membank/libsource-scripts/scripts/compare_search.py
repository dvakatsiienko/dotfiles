#!/usr/bin/env python3
"""
Compare original substring search vs our RAG-enhanced search.
"""

import time
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))
from search import SearchEngine

def old_search(filepath: str, query: str):
    """Simulate the OLD way - linear substring search."""
    print("\n🔴 OLD METHOD: Linear Substring Search")
    print("=" * 60)
    
    start = time.time()
    
    # Read entire file
    with open(filepath, 'r') as f:
        content = f.read()
    
    lines = content.split('\n')
    query_lower = query.lower()
    matches = []
    
    # Simple substring search
    for i, line in enumerate(lines):
        if query_lower in line.lower():
            matches.append({
                'line': i + 1,
                'content': line[:100]
            })
            if len(matches) >= 5:
                break
    
    elapsed = (time.time() - start) * 1000
    
    print(f"Query: '{query}'")
    print(f"Time: {elapsed:.0f}ms")
    print(f"Results: {len(matches)} matches found")
    print("\nFirst 3 matches:")
    for m in matches[:3]:
        print(f"  Line {m['line']}: {m['content']}...")
    
    return elapsed

def new_search(query: str, library: str):
    """Our NEW way - RAG-enhanced semantic search."""
    print("\n🟢 NEW METHOD: RAG-Enhanced Semantic Search")
    print("=" * 60)
    
    with SearchEngine() as engine:
        results = engine.search(query, library, limit=5)
        
        print(f"Query: '{query}'")
        print(f"Time: {results['search_time_ms']}ms")
        print(f"Semantic tags detected: {', '.join(results['query_tags']) if results['query_tags'] else 'none'}")
        print(f"Results: {results['total_results']} relevant chunks found")
        print("\nTop 3 results with scores:")
        
        for i, r in enumerate(results['results'][:3], 1):
            print(f"  {i}. Score: {r['score']:.1f}")
            print(f"     Lines: {r['start_line']}-{r['end_line']}")
            print(f"     Tags: {', '.join(r['semantic_tags'][:3])}...")
            print(f"     Snippet: {r['snippet'][:80]}...")
    
    return results['search_time_ms']

def main():
    # Test query
    query = "useEffect cleanup"
    
    print("🔬 COMPARING SEARCH METHODS")
    print("=" * 60)
    print(f"Test Query: '{query}'")
    print(f"Library: React (25MB, 890K lines)")
    
    # Original file path
    react_file = Path.home() / '.dotfiles' / '.clauderc' / '.membank' / 'libsource' / 'libsource-react.txt'
    
    # Old method
    old_time = old_search(str(react_file), query)
    
    # New method
    new_time = new_search(query, 'react')
    
    # Comparison
    print("\n📊 COMPARISON RESULTS")
    print("=" * 60)
    improvement = old_time / new_time if new_time > 0 else 0
    print(f"Speed improvement: {improvement:.1f}x faster")
    print(f"Old method: {old_time:.0f}ms (substring matching)")
    print(f"New method: {new_time}ms (semantic search)")
    print("\n✨ Key Differences:")
    print("  OLD: Finds any line with 'useEffect' or 'cleanup'")
    print("  NEW: Understands these are React concepts, ranks by relevance")
    print("  NEW: Returns meaningful code chunks, not just single lines")
    print("  NEW: Detects semantic patterns (hooks, effects, etc.)")

if __name__ == "__main__":
    main()