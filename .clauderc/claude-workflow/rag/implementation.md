# RAG Implementation Guide for Claude Code

## Your Mission
Transform libsource plain text files into semantically-searchable documents with 3-4x better search recall using SQLite + BM25F (no vector database needed).

## Setup with uv (Recommended)
```bash
# Create virtual environment and install dependencies
uv venv
source .venv/bin/activate  # On macOS/Linux
uv pip install sentence-transformers sqlite-vec fastapi uvicorn tree-sitter tree-sitter-languages rank-bm25
```

## Start Here: Phase 1 MVP (2 Days)

### Day 1: Build Core Components

#### 1. Create SQLite Database First
```bash
# Execute this SQL immediately
sqlite3 libsources.db << 'EOF'
CREATE TABLE chunks (
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
);

CREATE INDEX idx_library ON chunks(library);
CREATE INDEX idx_semantic_tags ON chunks(semantic_tags);
EOF
```

#### 2. Implement Smart Chunker
Create `chunker.py` with these exact parameters:
- **Chunk size**: 300 lines (optimal for code context)
- **Overlap**: 20% (60 lines) to preserve context
- **Break points**: Function/class boundaries when possible

```python
# Critical: Use tree-sitter to respect code structure
import tree_sitter_languages as tsl

class LibsourceChunker:
    def __init__(self):
        self.chunk_size = 300  # Lines, NOT characters
        self.overlap = 60      # 20% overlap
        
    def chunk_file(self, content, filepath):
        # Priority: Break at these boundaries
        BREAK_AT = [
            'function_declaration',
            'class_declaration',
            'method_definition',
            'export_statement'
        ]
        # Implementation: Parse AST and chunk smartly
```

#### 3. Build Pattern Tagger (No LLM Needed Yet)
Create `tagger.py` with these high-value patterns:

```python
class SemanticTagger:
    def __init__(self):
        # These patterns give 40-60% recall improvement alone
        self.patterns = {
            'react_hooks': r'\b(use[A-Z]\w+)\b',
            'api_calls': r'(fetch|axios|request)\s*\(',
            'async_ops': r'\b(async|await|Promise)\b',
            'error_handling': r'\b(try|catch|throw)\b',
            'imports': r'^import\s+.*?from',
            'exports': r'^export\s+(default\s+)?'
        }
    
    def tag_chunk(self, content):
        # Apply patterns and boost important tokens
        # Return: semantic_tags list + bm25_tokens with weights
```

**Critical Weights for BM25**:
- Semantic tags: 3x weight (multiply tokens by 3)
- Function names: 2x weight
- Regular code: 1x weight

#### 4. Create Processing Pipeline
Build `processor.py` to orchestrate everything:

```python
def process_libsource(filepath, library_name):
    """
    Process order:
    1. Chunk file (300 lines with 60 line overlap)
    2. Tag each chunk (extract semantic patterns)
    3. Generate BM25 tokens with boost weights
    4. Store in SQLite
    """
    # Process and report: "Processed X chunks in Y seconds"
```

### Day 2: Build Search API

#### 5. Implement BM25F Search
Create `search.py` with these exact BM25 parameters:

```python
from rank_bm25 import BM25Okapi

class SearchEngine:
    def __init__(self):
        # Tuned for code search
        self.bm25_params = {
            'k1': 1.2,  # Term frequency saturation
            'b': 0.75   # Length normalization
        }
    
    def search(self, query, library, limit=5):
        # 1. Tag the query (same patterns as indexing)
        # 2. Load chunks from SQLite
        # 3. Build BM25 index with boosted tokens
        # 4. Score and rank
        # 5. Return top-k with scores
```

#### 6. Create FastAPI Server
Build `server.py` with single endpoint:

```python
@app.post("/api/search")
async def search(request: SearchRequest):
    # Target: <500ms response time
    # Return: top 5 chunks with scores
```

## Testing Protocol

### Validate Each Component

#### Test Chunker:
```python
# Should produce ~100 chunks for 30K line file
chunks = chunker.chunk_file(content, "test.js")
assert all(len(c['content'].split('\n')) <= 360 for c in chunks)  # With overlap
```

#### Test Tagger:
```python
# Should identify 3-5 semantic tags per chunk
tags = tagger.tag_chunk("async function fetchUser() { ... }")
assert 'async_ops' in tags['semantic_tags']
assert 'api_calls' in tags['semantic_tags']
```

#### Test Search:
```bash
# Should return relevant chunks in <500ms
time curl -X POST http://localhost:8080/api/search \
  -d '{"library":"react","query":"hooks cleanup","limit":5}'
```

## Measure Success

### Required Benchmarks

Run these exact queries and measure improvement:

```python
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
    "ReactDOM.render"
]

def measure_improvement(query):
    baseline = substring_search(query)  # Old method
    enhanced = semantic_search(query)   # Your implementation
    
    improvement = enhanced.recall / baseline.recall
    print(f"{query}: {improvement:.1f}x improvement")
    
    # Target: Average 3x across all queries
```

## Phase 2: Add LLM Enhancement (Optional, +1 Week)

### When to Upgrade

Proceed to Phase 2 only if:
- Phase 1 achieves <60% recall
- You need >75% recall
- Processing time is acceptable

### LLM Integration Steps

#### 1. Install Ollama
```bash
ollama pull qwen2.5-coder:3b  # 2.3GB, fast enough
```

#### 2. Enhance Tagger
```python
def enhance_with_llm(chunk):
    prompt = f"""
    Extract: purpose (5 words), patterns used, complexity.
    Code: {chunk}
    Return only JSON.
    """
    
    response = ollama.generate(prompt)
    return json.loads(response)
```

#### 3. Batch Process
Process 10 chunks per LLM call to optimize speed:
```python
def batch_process(chunks, batch_size=10):
    # Combine chunks → Single LLM call → Parse results
```

## Common Pitfalls to Avoid

### 1. Wrong Chunk Size
❌ Don't use character-based chunking (loses context)
✅ Use line-based chunking (preserves code structure)

### 2. Over-Engineering Patterns
❌ Don't create 50+ regex patterns
✅ Focus on 10 high-value patterns that cover 80% of searches

### 3. Ignoring BM25 Weights
❌ Don't treat all tokens equally
✅ Boost semantic tags 3x, function names 2x

### 4. Processing Everything at Once
❌ Don't process all 15 libsources immediately
✅ Start with smallest (bubbletea, 418KB), validate, then scale

### 5. Not Measuring Improvement
❌ Don't assume it's working
✅ Measure recall on benchmark queries, target 3x improvement

## Production Optimization

### After MVP Works

#### 1. Add Incremental Updates
```python
def update_changed_files(since_timestamp):
    # Only reprocess modified sections
    # Use git diff to identify changes
```

#### 2. Implement Query Cache
```python
@lru_cache(maxsize=1000)
def cached_search(query_hash, library):
    # Cache frequent queries
```

#### 3. Enable Parallel Processing
```python
with ProcessPoolExecutor() as executor:
    # Process multiple libsources simultaneously
```

## Deliverables Checklist

### Phase 1 (Must Have)
- [ ] SQLite database with chunks table
- [ ] Chunker that respects code boundaries
- [ ] Pattern-based tagger (10 patterns)
- [ ] BM25F search with proper weights
- [ ] FastAPI server with /api/search endpoint
- [ ] <500ms search response time
- [ ] 3x improvement on benchmark queries

### Phase 2 (Nice to Have)
- [ ] Ollama integration with Qwen 3B
- [ ] LLM-enhanced semantic tagging
- [ ] Batch processing optimization
- [ ] 4x improvement on complex queries

## Final Validation

Before declaring success, ensure:

1. **Speed**: Search responds in <500ms
2. **Accuracy**: Exact function searches still work (95%+)
3. **Improvement**: Semantic searches show 3x better recall
4. **Storage**: Enhanced DB is <1.4x original size
5. **Usability**: Claude Code can query via simple HTTP POST

## Quick Reference Card

```python
# Complete minimal implementation (<100 lines)
import sqlite3, re
from rank_bm25 import BM25Okapi

# Chunk: 300 lines, 20% overlap
# Tag: 10 patterns, 3x boost for semantic
# Store: SQLite with JSON fields
# Search: BM25 with k1=1.2, b=0.75
# Serve: FastAPI on port 8080

# Test: 3x improvement or retry
```

Remember: Start simple (Phase 1), measure improvement, then enhance if needed. Don't over-engineer the MVP.