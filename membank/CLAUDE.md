# membank system

## Overview

Membank is a unified knowledge base system for RAG-augmented library source code with semantic
search capabilities. Evolution of the libsource system supporting multiple data types and improved
organization.

**Key Features:**

- BM25F scoring with semantic tagging (22.6x search improvement)
- 15 indexed libraries with ~3.9M lines of code
- FastAPI server with REST API
- Centralized configuration management
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
│   ├── membank_search.py   # BM25F search engine
│   └── membank_server.py   # FastAPI REST API
├── cli/                     # Command-line interfaces
│   ├── libsource_add.py    # Add new libraries
│   ├── libsource_list.py   # List libraries
│   ├── libsource_update.py # Update/restore libraries
│   ├── libsource_delete.py # Delete libraries
│   ├── libsource_read.py   # Read raw .txt for analysis
│   ├── libsource_utils.py  # Shared utilities
│   ├── membank_cli_search.py # CLI search tool
│   ├── membank_cli_server.py # Server management
│   ├── membank_db_init.py    # Database initialization
│   └── membank_db_explore.py # Database exploration tool
├── config.py               # Central configuration
└── db.sqlite               # SQLite database (gitignored)
```

## Configuration

All configuration centralized in `config.py`:

```python
DATABASE_NAME = "db.sqlite"
SERVER_PORT = 1408
SERVER_HOST = "0.0.0.0"
CHUNK_SIZE = 300
CHUNK_OVERLAP = 20  # 20% overlap
```

## API Documentation

### Server Management

```bash
# Start server
pnpm mem:server:start
# or
python3 membank/cli/membank_cli_server.py start

# Stop server
pnpm mem:server:stop

# Check status
pnpm mem:server:status

# Server runs on http://localhost:1408
# API docs at http://localhost:1408/docs
```

### REST API Endpoints

#### Health Check

```bash
GET /health
curl http://localhost:1408/health
```

#### Search Library

```bash
POST /api/search
curl -X POST http://localhost:1409/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "useState", "library": "react", "limit": 5}'
```

#### Search All Libraries

```bash
POST /api/search/all
curl -X POST http://localhost:1409/api/search/all \
  -H "Content-Type: application/json" \
  -d '{"query": "build plugins", "limit_per_library": 3}'
```

#### List Libraries

```bash
GET /api/libraries
curl http://localhost:1408/api/libraries
```

#### Get Chunk by ID

```bash
GET /api/chunk/{chunk_id}
curl http://localhost:1408/api/chunk/12345
```

#### Library Statistics

```bash
GET /api/stats/{library}
curl http://localhost:1408/api/stats/react
```

### Request/Response Format

```json
// Search Request
{
  "query": "search terms",
  "library": "vite",  // optional
  "limit": 5
}

// Search Response
{
  "query": "useState",
  "library": "react",
  "query_tags": ["react_hooks"],
  "results": [{
    "id": 12345,
    "score": 27.5,
    "snippet": "code...",
    "file_path": "path",
    "start_line": 100,
    "end_line": 200,
    "semantic_tags": ["hooks", "state"],
    "matching_tags": ["react_hooks"]
  }],
  "total_results": 5,
  "search_time_ms": 45
}
```

## Two-Stage Library Analysis Strategy

**For comprehensive library inspection, always use this intelligent two-stage approach:**

### Stage 1: RAG Search - Targeted Discovery
**Use REST API or CLI for focused searches:**

```bash
# REST API (preferred)
curl -X POST http://localhost:1408/api/search \
  -d '{"query": "hooks patterns state", "library": "react", "limit": 10}'

# CLI alternative
pnpm mem:search "hooks patterns state" react
```

**Purpose:**
- Find specific patterns, examples, implementations
- Get relevant code snippets quickly  
- Target user's specific question efficiently
- Avoid overwhelming with massive code dumps

### Stage 2: Full Source Analysis - Comprehensive Context
**Use mem:read for architectural understanding:**

```bash
pnpm mem:read react "analyze hook architecture and design patterns based on previous findings"
```

**Purpose:**
- Understand overall architecture and design philosophy
- See how patterns connect across entire codebase
- Discover cross-cutting concerns and relationships
- Find patterns that span multiple chunks

### Why Both Stages Are Essential

**RAG Limitations (Stage 1):**
- 300-line chunks with 20% overlap may fragment large patterns
- Keyword-dependent searches miss unknown patterns
- Individual snippets lack broader architectural context
- Returns pieces, not relationships between them

**Full Source Value (Stage 2):**
- Complete architectural understanding
- Design philosophy and decision rationale
- Cross-cutting patterns that span multiple files
- Discovery of unexpected but relevant patterns

**Combined Power:**
- **RAG = Find the trees** 🌲 (specific implementations)
- **Full Source = See the forest** 🌳 (overall architecture)  
- **Together = Complete understanding** 💡

### Example Analysis Workflow

**User Question:** "How does Vite handle module resolution?"

1. **Stage 1 - RAG Search:**
   ```bash
   curl -X POST http://localhost:1408/api/search \
     -d '{"query": "module resolution resolver", "library": "vite", "limit": 10}'
   ```
   → Get specific resolver implementations, configuration options

2. **Stage 2 - Full Source Analysis:**
   ```bash
   pnpm mem:read vite "analyze the complete module resolution architecture and how the specific resolver implementations fit into the overall bundling strategy"
   ```
   → Understand how module resolution fits into Vite's overall architecture

3. **Synthesize:** Combine targeted examples with architectural context for comprehensive answer

**Always prefer this two-stage approach for library analysis questions.**

## CLI Commands

### Library Management

```bash
# Add new library
pnpm mem:add <github-url>

# List all libraries  
pnpm mem:list

# Update/restore library (intelligent - handles both missing and existing)
pnpm mem:update <library-name>  # Single library
pnpm mem:update                 # All libraries

# Note: Update command automatically:
#   - Creates missing .txt files from scratch
#   - Refreshes existing .txt files  
#   - Always re-indexes in RAG database

# Delete library
pnpm mem:delete <library-name>
```

### Search Operations

```bash
# Search all libraries
pnpm mem:search "query text"

# Search specific library
pnpm mem:search "useState" react

# Python direct usage
python3 membank/cli/membank_cli_search.py "query" [library]
```

### Database Operations

```bash
# Initialize empty database with schema
pnpm mem:db:init

# Explore database contents and statistics  
pnpm mem:db:explore
```

## Indexed Libraries

| Library             | Description           | LOC  | Chunks |
| ------------------- | --------------------- | ---- | ------ |
| **react**           | Core React library    | 890K | 3,914  |
| **next**            | Next.js framework     | 511K | 2,202  |
| **vite**            | Modern build tool     | 151K | 660    |
| **webpack**         | Module bundler        | 465K | 2,007  |
| **biome**           | Fast formatter/linter | 1.2M | 5,233  |
| **mobx**            | State management      | 130K | 569    |
| **react-query**     | TanStack Query        | 193K | 844    |
| **ai**              | Vercel AI SDK         | 433K | 1,857  |
| **zx**              | Shell scripting       | 14K  | 62     |
| **zod**             | TypeScript validation | 52K  | 246    |
| **motion.dev**      | Framer Motion         | 118K | 516    |
| **bubbletea**       | Go TUI framework      | 16K  | 70     |
| **lipgloss**        | Go styling library    | 15K  | 64     |
| **gitingest**       | Repository extraction | 12K  | 53     |
| **webfonts-loader** | Webpack fonts         | 1K   | 6      |

Total: ~3.9M LOC, 19,303 chunks

## Semantic Tagging System

15 semantic patterns detected automatically:

- `react_hooks` - React hooks patterns (useState, useEffect, etc.)
- `react_components` - React component definitions
- `state_mgmt` - State management patterns
- `async_ops` - Async/await, promises
- `error_handling` - Try/catch, error boundaries
- `effects` - Side effects, subscriptions
- `testing` - Test files and patterns
- `type_defs` - TypeScript definitions
- `config` - Configuration files
- `api_routes` - API endpoints
- `styles` - CSS/styling code
- `build_config` - Build configurations
- `cli` - Command-line interfaces
- `utils` - Utility functions
- `docs` - Documentation

## Database Schema

```sql
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
```

## Troubleshooting

### Server Won't Start

```bash
# Check if port is in use
lsof -i :1409

# Kill existing process
pnpm mem:server:stop

# Start fresh
pnpm mem:server:start
```

### Database Issues

```bash
# Check database exists
ls -la membank/db.sqlite

# Rebuild database
rm membank/db.sqlite
python3 membank/scripts/reindex.py
```

### Search Not Working

```bash
# Check server health
curl http://localhost:1408/health

# Verify library is indexed
curl http://localhost:1408/api/libraries
```

## Development Guide

### Adding New Libraries

1. Add library source:

```bash
pnpm mem:add https://github.com/owner/repo
```

2. Library is automatically:
    - Downloaded via gitingest
    - Chunked into 300-line segments
    - Tagged with semantic patterns
    - Indexed in database

3. To update libraries (handles both missing and existing):

```bash
pnpm mem:update              # Update/restore all libraries
pnpm mem:update react        # Update/restore specific library
```

The update command intelligently:
- Creates missing .txt files from scratch if deleted/lost
- Refreshes existing .txt files with latest source  
- Always re-indexes updated content in database

### Customizing Search

Edit `membank/rag/membank_search.py` to modify:

- BM25F parameters (k1, b, field weights)
- Semantic tag boosting
- Result ranking algorithm

### Adding New Semantic Tags

Edit `membank/rag/tagger.py`:

1. Add pattern to `SEMANTIC_PATTERNS`
2. Update tag detection logic
3. Re-index: `python3 membank/scripts/reindex.py`

### Performance Tuning

- Chunk size: `config.CHUNK_SIZE` (default: 300 lines)
- Overlap: `config.CHUNK_OVERLAP` (default: 20%)
- Database indexes: See schema above
- Server workers: Edit `membank/rag/membank_server.py`

## Implementation Notes

- Location: `~/.dotfiles/membank/`
- Port: 1408 (production)
- Database: `db.sqlite` (SQLite with JSON fields)
- Config: Centralized in `config.py`
- Old system: Removed (was in `.clauderc/.membank/`)
