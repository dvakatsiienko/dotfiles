# membank system

## Overview

Unified knowledge base for RAG-augmented library source code with semantic search capabilities.

**Key Features:**
- BM25F scoring with semantic tagging (22.6x search improvement)
- 15 indexed libraries with ~3.9M lines of code
- FastAPI server with REST API on port 1408
- SQLite database with JSON fields for flexibility

## Architecture

```
membank/
├── libsource/                # Library source management
│   ├── libsource-*.txt      # Generated .txt files (gitignored)
│   └── .libsource-config.json
├── rag/                     # RAG augmentation system
│   ├── chunker.py          # 300-line chunks with 20% overlap
│   ├── tagger.py           # Semantic pattern detection
│   ├── processor.py        # Pipeline orchestration
│   ├── indexer.py          # Auto-indexing integration
│   ├── search.py           # BM25F search engine
│   └── server.py           # FastAPI REST API
├── cli/                     # Command-line interfaces
│   ├── libsource_*.py      # Library management
│   ├── membank_*.py        # Search and server CLI
│   └── membank_db_*.py     # Database tools
├── config.py               # Central configuration
└── db.sqlite               # SQLite database (gitignored)
```

## Quick Start

### Server Management

```bash
pnpm mem:server:start   # Start server on port 1408
pnpm mem:server:stop    # Stop server
pnpm mem:server:status  # Check status

# API docs at http://localhost:1408/docs
```

### Library Management

```bash
pnpm mem:add <github-url>       # Add new library
pnpm mem:list                   # List all libraries  
pnpm mem:update [library-name]  # Update/restore library
pnpm mem:delete <library-name>  # Delete library
pnpm mem:search "query" [lib]   # CLI search
```

### REST API

```bash
# Search specific library
curl -X POST http://localhost:1408/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "useState", "library": "react", "limit": 5}'

# Search all libraries
curl -X POST http://localhost:1408/api/search/all \
  -H "Content-Type: application/json" \
  -d '{"query": "build plugins", "limit_per_library": 3}'

# List libraries
curl http://localhost:1408/api/libraries
```

## Two-Stage Library Analysis Strategy

**Stage 1: RAG Search (Port 1408)**
- Fast targeted discovery via semantic search
- Get specific code snippets quickly
- Efficient for focused questions

**Stage 2: Full Source Analysis**
```bash
pnpm mem:read <library> "analysis prompt"
```
- Complete architectural understanding
- Cross-cutting patterns discovery
- Design philosophy insights

**Why Both:** RAG finds the trees 🌲, Full source sees the forest 🌳

## Indexed Libraries

15 libraries (~3.9M LOC): react, next, vite, webpack, biome, mobx, react-query, ai, zx, zod, motion.dev, bubbletea, lipgloss, gitingest, webfonts-loader

## Semantic Tags

15 patterns: react_hooks, react_components, state_mgmt, async_ops, error_handling, effects, testing, type_defs, config, api_routes, styles, build_config, cli, utils, docs

## Configuration

All settings in `config.py`:
- DATABASE_NAME = "db.sqlite"
- SERVER_PORT = 1408
- CHUNK_SIZE = 300
- CHUNK_OVERLAP = 20