# RAG Search MVP - Execution Plan

## Phase 1: MVP Implementation (2 Days)

### Day 1: Core Components
- [ ] Set up project structure
  - [ ] Create `.clauderc/rag/{src,tests,output}` directories
  - [ ] Set up uv environment: `uv venv && source .venv/bin/activate`
  - [ ] Install dependencies: `uv pip install sentence-transformers sqlite-vec fastapi uvicorn tree-sitter tree-sitter-languages rank-bm25`
  
- [ ] Build database foundation
  - [ ] Create SQLite database with chunks table (see implementation.md Day 1, Step 1)
  - [ ] Set up indexes for performance
  
- [ ] Implement chunker
  - [ ] Create `chunker.py` following implementation.md specifications (300 lines, 20% overlap)
  - [ ] Test with small sample to verify chunk boundaries
  
- [ ] Build pattern tagger
  - [ ] Create `tagger.py` with 10 high-value patterns from implementation.md
  - [ ] Implement BM25 token weighting (3x semantic, 2x functions, 1x code)
  
- [ ] Create processing pipeline
  - [ ] Build `processor.py` to orchestrate chunking → tagging → storage
  - [ ] Test end-to-end with bubbletea libsource (smallest, 418KB)

### Day 2: Search API
- [ ] Implement search engine
  - [ ] Create `search.py` with BM25F implementation (k1=1.2, b=0.75)
  - [ ] Add query tagging for semantic boost
  
- [ ] Build FastAPI server
  - [ ] Create `server.py` with `/api/search` endpoint
  - [ ] Test response time (<500ms target)
  
- [ ] Integration testing
  - [ ] Run benchmark queries from implementation.md
  - [ ] Measure improvement over baseline substring search
  - [ ] Document results in rag-effectiveness.md

## Phase 2: Validation & Optimization (Optional, +1 Day)

### Performance Testing
- [ ] Process 3 libsources (bubbletea, vite, react)
- [ ] Run full benchmark suite
- [ ] Verify 3x improvement average

### Optimization (if needed)
- [ ] Add query caching for common searches
- [ ] Implement parallel chunk processing
- [ ] Fine-tune BM25 parameters

## Phase 3: LLM Enhancement (Optional, +1 Week)

*Only proceed if Phase 1 achieves <60% recall*

- [ ] Install Ollama and Qwen 2.5 Coder 3B
- [ ] Enhance tagger with LLM semantic extraction
- [ ] Batch process for efficiency (10 chunks per call)
- [ ] Re-run benchmarks to validate 4x improvement

## Success Checkpoints

### After Phase 1 (Must Have)
- [ ] SQLite database operational
- [ ] Pattern-based tagging working
- [ ] API endpoint responding <500ms
- [ ] 3x improvement on benchmark queries

### After Phase 2 (Nice to Have)
- [ ] All 15 libsources processable
- [ ] Consistent 3x+ improvements
- [ ] Production-ready error handling

### After Phase 3 (Optional)
- [ ] LLM integration stable
- [ ] 4x+ improvement on complex queries
- [ ] Batch processing optimized

## Notes
- Refer to implementation.md for all code examples and detailed specifications
- Start with smallest libsource (bubbletea) for rapid iteration
- Keep original files untouched, create enhanced versions with `-enhanced` suffix
- Measure and document every improvement in rag-effectiveness.md