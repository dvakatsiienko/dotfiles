#!/usr/bin/env python3
"""
Benchmark script to measure RAG search improvement over baseline substring search.
"""

import sys
import time
import re
from pathlib import Path
from typing import List, Dict, Any

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from search import SearchEngine


def substring_search(content: str, query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Baseline substring search (simulating old method).
    Returns chunks containing the query terms.
    """
    lines = content.split('\n')
    query_terms = query.lower().split()
    results = []
    
    # Simple sliding window search
    window_size = 300
    for i in range(0, len(lines), window_size // 2):
        chunk_lines = lines[i:i+window_size]
        chunk_text = '\n'.join(chunk_lines).lower()
        
        # Count matching terms
        matches = sum(1 for term in query_terms if term in chunk_text)
        
        if matches > 0:
            results.append({
                'start_line': i + 1,
                'end_line': min(i + window_size, len(lines)),
                'score': matches / len(query_terms),  # Simple relevance score
                'content': '\n'.join(chunk_lines[:5])  # Preview
            })
    
    # Sort by score and limit
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:limit]


def calculate_recall(baseline_results: List, enhanced_results: List) -> float:
    """
    Calculate recall improvement.
    Measures how many relevant results the enhanced search found.
    """
    if not baseline_results:
        return 0.0
    
    # Simple recall: how many of the top baseline results appear in enhanced results
    baseline_lines = set((r['start_line'], r['end_line']) for r in baseline_results[:3])
    enhanced_lines = set((r['start_line'], r['end_line']) for r in enhanced_results[:3])
    
    overlap = len(baseline_lines & enhanced_lines)
    recall = overlap / len(baseline_lines) if baseline_lines else 0
    
    return recall


def run_benchmarks():
    """Run benchmark queries and measure improvement."""
    
    # Benchmark queries from implementation.md
    BENCHMARK_QUERIES = [
        # Concept searches (expect 3-4x improvement)
        "state management patterns",
        "error boundary implementation", 
        "memory leak prevention",
        
        # Pattern searches (expect 2-3x improvement)
        "useEffect cleanup",
        "async data fetching",
        "event handler optimization",
        
        # Exact searches (should maintain 95%+ accuracy)
        "useState",
        "componentDidMount",
        "ReactDOM.render",
        
        # AI-specific queries
        "streaming completion",
        "prompt engineering",
        "token limits"
    ]
    
    print("🔬 Running RAG Search Benchmarks")
    print("=" * 60)
    
    # Load original libsource for baseline comparison
    react_path = Path.home() / '.dotfiles' / '.clauderc' / '.membank' / 'libsource' / 'libsource-react.txt'
    ai_path = Path.home() / '.dotfiles' / '.clauderc' / '.membank' / 'libsource' / 'libsource-ai.txt'
    
    print("Loading libsource files for baseline comparison...")
    with open(react_path, 'r', encoding='utf-8') as f:
        react_content = f.read()
    with open(ai_path, 'r', encoding='utf-8') as f:
        ai_content = f.read()
    
    # Initialize enhanced search
    with SearchEngine() as engine:
        results_comparison = []
        
        for query in BENCHMARK_QUERIES:
            print(f"\n📝 Query: '{query}'")
            print("-" * 40)
            
            # Determine which library to search
            if any(term in query.lower() for term in ['prompt', 'token', 'completion', 'streaming']):
                library = 'ai'
                content = ai_content
            else:
                library = 'react'
                content = react_content
            
            # Baseline substring search
            start = time.time()
            baseline_results = substring_search(content, query, limit=5)
            baseline_time = (time.time() - start) * 1000
            
            # Enhanced RAG search
            enhanced_results = engine.search(query, library, limit=5)
            
            # Calculate improvements
            baseline_score = sum(r['score'] for r in baseline_results[:3]) / 3 if baseline_results else 0
            enhanced_score = sum(r['score'] for r in enhanced_results['results'][:3]) / 3 if enhanced_results['results'] else 0
            
            improvement = enhanced_score / baseline_score if baseline_score > 0 else 0
            
            # Speed comparison
            speed_improvement = baseline_time / enhanced_results['search_time_ms'] if enhanced_results['search_time_ms'] > 0 else 0
            
            result = {
                'query': query,
                'library': library,
                'baseline_results': len(baseline_results),
                'enhanced_results': enhanced_results['total_results'],
                'baseline_time_ms': int(baseline_time),
                'enhanced_time_ms': enhanced_results['search_time_ms'],
                'score_improvement': improvement,
                'speed_improvement': speed_improvement,
                'tags_detected': enhanced_results['query_tags']
            }
            
            results_comparison.append(result)
            
            print(f"  Baseline: {len(baseline_results)} results in {baseline_time:.0f}ms")
            print(f"  Enhanced: {enhanced_results['total_results']} results in {enhanced_results['search_time_ms']}ms")
            print(f"  Score improvement: {improvement:.1f}x")
            print(f"  Speed improvement: {speed_improvement:.1f}x")
            print(f"  Semantic tags: {', '.join(enhanced_results['query_tags']) if enhanced_results['query_tags'] else 'none'}")
    
    # Summary statistics
    print("\n" + "=" * 60)
    print("📊 BENCHMARK SUMMARY")
    print("=" * 60)
    
    avg_score_improvement = sum(r['score_improvement'] for r in results_comparison) / len(results_comparison)
    avg_speed_improvement = sum(r['speed_improvement'] for r in results_comparison) / len(results_comparison)
    
    concept_queries = results_comparison[:3]
    pattern_queries = results_comparison[3:6]
    exact_queries = results_comparison[6:9]
    
    print(f"\n🎯 Overall Performance:")
    print(f"  Average score improvement: {avg_score_improvement:.1f}x")
    print(f"  Average speed improvement: {avg_speed_improvement:.1f}x")
    
    print(f"\n📈 By Query Type:")
    print(f"  Concept searches: {sum(r['score_improvement'] for r in concept_queries) / len(concept_queries):.1f}x improvement")
    print(f"  Pattern searches: {sum(r['score_improvement'] for r in pattern_queries) / len(pattern_queries):.1f}x improvement")
    print(f"  Exact searches: {sum(r['score_improvement'] for r in exact_queries) / len(exact_queries):.1f}x improvement")
    
    print(f"\n⚡ Response Times:")
    all_times = [r['enhanced_time_ms'] for r in results_comparison]
    print(f"  Average: {sum(all_times) / len(all_times):.0f}ms")
    print(f"  Min: {min(all_times)}ms")
    print(f"  Max: {max(all_times)}ms")
    print(f"  <500ms: {sum(1 for t in all_times if t < 500)}/{len(all_times)} queries")
    
    # Success criteria check
    print(f"\n✅ Success Criteria:")
    print(f"  {'✓' if avg_score_improvement >= 3.0 else '✗'} 3x+ average improvement: {avg_score_improvement:.1f}x")
    print(f"  {'✓' if all(t < 500 for t in all_times) else '✗'} All queries <500ms: {max(all_times)}ms max")
    print(f"  {'✓' if sum(r['enhanced_results'] > 0 for r in results_comparison) == len(results_comparison) else '✗'} All queries return results")
    
    return results_comparison


if __name__ == "__main__":
    results = run_benchmarks()