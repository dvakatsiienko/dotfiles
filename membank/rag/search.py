"""
BM25F search engine for semantic code search.
"""

import sqlite3
import json
import re
import time
from typing import List, Dict, Any, Optional, Tuple
from rank_bm25 import BM25Okapi
from collections import Counter


class SearchEngine:
    def __init__(self, db_path: str = "db.sqlite"):  # Default matches config.DATABASE_NAME
        self.db_path = db_path
        self.bm25_params = {
            'k1': 1.2,  # Term frequency saturation (tuned for code)
            'b': 0.75   # Length normalization
        }
        self.conn = None
        self.cursor = None
        
        # Cache for BM25 indices per library
        self.index_cache = {}
        self.chunk_cache = {}
    
    def __enter__(self):
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.conn:
            self.conn.close()
    
    def _load_chunks(self, library: str) -> List[Dict[str, Any]]:
        """Load chunks for a library from database."""
        if library in self.chunk_cache:
            return self.chunk_cache[library]
        
        self.cursor.execute("""
            SELECT id, content, semantic_tags, bm25_tokens, 
                   file_path, start_line, end_line
            FROM chunks
            WHERE library = ?
            ORDER BY id
        """, (library,))
        
        chunks = []
        for row in self.cursor.fetchall():
            chunks.append({
                'id': row[0],
                'content': row[1],
                'semantic_tags': json.loads(row[2]) if row[2] else [],
                'bm25_tokens': json.loads(row[3]) if row[3] else [],
                'file_path': row[4],
                'start_line': row[5],
                'end_line': row[6]
            })
        
        self.chunk_cache[library] = chunks
        return chunks
    
    def _build_bm25_index(self, chunks: List[Dict[str, Any]]) -> BM25Okapi:
        """Build BM25 index from chunks."""
        # Extract token lists for each chunk
        corpus = []
        for chunk in chunks:
            # Use pre-computed BM25 tokens if available
            if chunk.get('bm25_tokens'):
                corpus.append(chunk['bm25_tokens'])
            else:
                # Fallback to simple tokenization
                tokens = re.findall(r'\b\w+\b', chunk['content'].lower())
                corpus.append(tokens)
        
        # Create BM25 index
        return BM25Okapi(corpus, k1=self.bm25_params['k1'], b=self.bm25_params['b'])
    
    def _tag_query(self, query: str) -> Tuple[List[str], List[str]]:
        """
        Tag the query with semantic patterns and extract tokens.
        Returns (semantic_tags, query_tokens)
        """
        semantic_tags = []
        
        # Check for semantic patterns in query
        patterns = {
            'react_hooks': r'\b(use[A-Z]\w+|hooks?)\b',
            'react_components': r'\b(component|render|jsx)\b',
            'api_calls': r'\b(fetch|api|request|endpoint)\b',
            'async_ops': r'\b(async|await|promise)\b',
            'error_handling': r'\b(error|exception|catch|handle)\b',
            'state_mgmt': r'\b(state|redux|store|dispatch)\b',
            'effects': r'\b(effect|lifecycle|mount)\b',
            'event_handlers': r'\b(click|change|submit|event|handler)\b',
            'ai_patterns': r'\b(ai|llm|gpt|claude|stream|completion|embedding|prompt|model|token)\b',
            'testing': r'\b(test|jest|vitest|mock)\b'
        }
        
        query_lower = query.lower()
        for tag, pattern in patterns.items():
            if re.search(pattern, query_lower, re.IGNORECASE):
                semantic_tags.append(tag)
        
        # Tokenize query with semantic boost
        base_tokens = re.findall(r'\b\w+\b', query_lower)
        query_tokens = base_tokens.copy()
        
        # Boost semantic tag tokens (3x weight)
        for tag in semantic_tags:
            tag_tokens = tag.replace('_', ' ').split()
            query_tokens.extend(tag_tokens * 2)  # Add 2 more copies for 3x total
        
        return semantic_tags, query_tokens
    
    def search(self, query: str, library: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Search for chunks matching the query.
        
        Args:
            query: Search query string
            library: Library name to search in
            limit: Maximum number of results to return
        
        Returns:
            List of matching chunks with scores
        """
        start_time = time.time()
        
        # Load chunks for library
        chunks = self._load_chunks(library)
        if not chunks:
            return []
        
        # Tag the query
        query_tags, query_tokens = self._tag_query(query)
        
        # Get or build BM25 index
        cache_key = f"{library}_bm25"
        if cache_key not in self.index_cache:
            self.index_cache[cache_key] = self._build_bm25_index(chunks)
        
        bm25 = self.index_cache[cache_key]
        
        # Score all chunks
        scores = bm25.get_scores(query_tokens)
        
        # Apply semantic tag boost
        for i, chunk in enumerate(chunks):
            # Boost score if chunk has matching semantic tags
            matching_tags = set(query_tags) & set(chunk.get('semantic_tags', []))
            if matching_tags:
                # 20% boost per matching tag
                boost = 1.0 + (0.2 * len(matching_tags))
                scores[i] *= boost
        
        # Get top results
        top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:limit]
        
        results = []
        for idx in top_indices:
            if scores[idx] > 0:  # Only include chunks with positive scores
                chunk = chunks[idx].copy()
                chunk['score'] = float(scores[idx])
                chunk['matching_tags'] = list(set(query_tags) & set(chunk.get('semantic_tags', [])))
                
                # Add snippet (first 200 chars)
                content_preview = chunk['content'][:200].replace('\n', ' ')
                if len(chunk['content']) > 200:
                    content_preview += '...'
                chunk['snippet'] = content_preview
                
                # Remove full content from response to save space
                del chunk['content']
                del chunk['bm25_tokens']  # Don't send tokens to client
                
                results.append(chunk)
        
        search_time = time.time() - start_time
        
        return {
            'query': query,
            'library': library,
            'query_tags': query_tags,
            'results': results,
            'total_results': len(results),
            'search_time_ms': int(search_time * 1000)
        }
    
    def search_all_libraries(self, query: str, limit_per_library: int = 3) -> Dict[str, Any]:
        """Search across all libraries."""
        # Get all libraries
        self.cursor.execute("SELECT DISTINCT library FROM chunks")
        libraries = [row[0] for row in self.cursor.fetchall()]
        
        all_results = []
        for library in libraries:
            lib_results = self.search(query, library, limit_per_library)
            if lib_results['results']:
                all_results.append({
                    'library': library,
                    'results': lib_results['results'],
                    'query_tags': lib_results['query_tags']
                })
        
        return {
            'query': query,
            'libraries_searched': libraries,
            'results_by_library': all_results,
            'total_results': sum(len(r['results']) for r in all_results)
        }
    
    def get_chunk_content(self, chunk_id: int) -> Optional[str]:
        """Get full content of a specific chunk."""
        self.cursor.execute("SELECT content FROM chunks WHERE id = ?", (chunk_id,))
        result = self.cursor.fetchone()
        return result[0] if result else None


def test_search():
    """Test the search engine with sample queries."""
    with SearchEngine() as engine:
        test_queries = [
            "hooks cleanup useEffect",
            "async data fetching",
            "error boundary implementation",
            "ai streaming completion",
            "state management patterns"
        ]
        
        print("🔍 Testing Search Engine")
        print("=" * 60)
        
        for query in test_queries:
            print(f"\nQuery: '{query}'")
            print("-" * 40)
            
            # Search in React library
            results = engine.search(query, "react", limit=3)
            
            print(f"Found {results['total_results']} results in {results['search_time_ms']}ms")
            print(f"Query tags: {', '.join(results['query_tags']) if results['query_tags'] else 'none'}")
            
            for i, result in enumerate(results['results'], 1):
                print(f"\n  {i}. Score: {result['score']:.2f}")
                print(f"     File: {result['file_path']}")
                print(f"     Lines: {result['start_line']}-{result['end_line']}")
                print(f"     Tags: {', '.join(result['matching_tags']) if result['matching_tags'] else 'none'}")
                print(f"     Snippet: {result['snippet'][:100]}...")


if __name__ == "__main__":
    test_search()