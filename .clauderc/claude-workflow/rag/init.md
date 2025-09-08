# Libsource RAG Search MVP

## Workflow Documentation

This workflow contains the following documents:

- **[init.md](./init.md)** - Requirements and objectives for RAG search MVP
- **[implementation.md](./implementation.md)** - Structured implementation guide with copy-paste ready code for Phase 1 MVP
- **[plan.md](./plan.md)** - Detailed implementation plan with 3-phase approach (150-500% improvement targets)
- **[qa.md](./qa.md)** - Critical implementation Q&A: model sizing (7B vs 14B), processing order, metadata format, priority patterns
- **[rag-effectiveness.md](./rag-effectiveness.md)** - Testing framework to measure RAG enhancement effectiveness (recall, speed, accuracy)

## Objective

Build the simplest possible but fast and reliable RAG search server for Claude Code to query libsources semantically instead of linearly scanning 26MB+ text files.

## Current Problem

- **Libsources**: 15 libraries, ~4M+ LOC stored as massive `.txt` files
- **Current Search**: Linear text scanning, keyword matching only
- **Efficiency**: ~5-10% of optimal (lots of irrelevant content returned)
- **Need**: Semantic search that returns targeted, relevant code chunks

## Requirements

### Core Features
- Transform libsource plain text files into semantically-searchable documents
- Achieve 3-4x better search recall using SQLite + BM25F (no vector DB needed)
- HTTP API that Claude Code can query
- Sub-500ms response times

### Technical Constraints
- Use existing libsource `.txt` files from `.clauderc/.membank/libsource/`
- Start with smallest libsource (bubbletea) for validation
- Maintain human-readable enhanced format
- Storage overhead < 40%

## Success Metrics

### MVP Requirements
- [ ] Process at least 3 libsources (Bubbletea, Vite, React)
- [ ] < 500ms response time for searches
- [ ] Returns actually relevant code chunks (not just keyword matches)
- [ ] Claude Code can query via HTTP
- [ ] 3x+ efficiency improvement over linear search

### Quality Indicators
- Semantic understanding (finds conceptually similar code)
- Chunk boundaries preserve code context
- Relevance scores accurately rank results
- Low false positive rate

## Development Timeline

- **Phase 1 MVP**: 2 days (pattern-based tagging, BM25F)
- **Phase 2 Enhancement**: +1 week (LLM integration with Qwen 3B)
- **Phase 3 Production**: +1 week (all 15 libsources, optimization)