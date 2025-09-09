# CLAUDE.md

Personal macOS dotfiles repository with automated symlink-based configuration management.


## Repository Overview

- **Purpose**: Complete macOS development environment setup with automated configuration management.
- **Secondary Purpose**: Development and evolution of efficient agentic workflows (primarily in
  `.clauderc/` scope).
- **Approach**: Symlink-based dotfiles with backup system.
- **Git Repository**: `git@github.com:dvakatsiienko/.dotfiles.git`.
- **Scripting**: zx (Google's shell scripting utility) for automation.

## Directory Structure

```
.dotfiles/
├── source/                     # Configuration files to be symlinked
│   ├── .config/
│   │   ├── oh-my-zsh-custom/  # Custom zsh aliases and functions
│   │   └── starship.toml      # Starship prompt configuration
│   ├── .ssh/                  # SSH configuration (config, allowed_signers)
│   ├── iTerm2/                # iTerm2 configuration
│   ├── .zshrc .zprofile .zshenv  # Shell configuration
│   ├── .gitconfig             # Git configuration with 1Password
│   └── .vimrc                 # Vim configuration
├── script/                    # Installation automation
│   ├── install-macos.mjs      # macOS defaults + Homebrew setup
│   ├── install-dotfiles.mjs   # Backup + symlink creation
│   ├── list-symlinks.mjs      # List current symlinks status
│   ├── untrack-dotfile.mjs    # Convert symlink to real file
│   └── lib.mjs               # Colored terminal output utilities
├── themes/                    # Terminal and editor themes
│   ├── terminal/             # Gruvbox and Treehouse terminal themes
│   └── VSCode/               # Gruvbox VSCode themes
└── .claude/                  # Claude Code configuration
    └── settings.local.json   # Additional directory permissions
```

## Installation Process

### What the Scripts Do

**install-macos.mjs:**

- Sets macOS defaults (show hidden files, fast key repeat)
- Installs/verifies Homebrew and core CLI tools
- Sets up vim-plug plugin manager

**install-dotfiles.mjs:**

- Creates backup directories (`~/.dotfiles_backup`)
- Backs up existing dotfiles to prevent data loss
- Creates symlinks from `source/` to home directory and config locations

## Dotfiles Management

### Available Commands

```bash
pnpm list-symlinks           # List all current dotfiles symlinks with status
pnpm untrack-dotfile <file>  # Convert symlink to real file and remove from repo
```

### Safety Features

- **Backup system**: Original files backed up to `~/.dotfiles_backup/`
- **Validation checks**: Ensures required binaries are installed
- **Idempotent installation**: Safe to run multiple times
- **Interactive confirmation**: For destructive operations

## Key System Details

### Symlink Architecture

- Uses **symlinks**, not file copies (changes to source files immediately apply)
- Backup system prevents data loss during installation

### Configuration Files

- **Shell**: zsh with oh-my-zsh + custom aliases/functions in `source/.config/oh-my-zsh-custom/`
- **Git**: 1Password SSH signing integration
- **Terminal**: Starship prompt with gruvbox theme
- **Vim**: Gruvbox theme with essential plugins

### Aliases & Functions

Reference actual files for current aliases:

- Git workflows: `source/.config/oh-my-zsh-custom/aliases.zsh`
- Custom functions: `source/.config/oh-my-zsh-custom/functions.zsh`
- Includes both "vibe" theme git aliases and standard shortcuts

## Project Configuration

- **Engine requirements**: Node >=18.12.0, pnpm >=8.5.0
- **Dependencies**: zx for scripting
- **Code quality**: ESLint + Prettier with polished configs

## Claude Config Management (.clauderc)

### System Architecture

**Config Locations:**

- `~/.claude/` = Standard Claude Code config directory (symlink targets)
- `~/.dotfiles/.clauderc/` = Source of truth (original files, git tracked)
- `~/.dotfiles/.claude/` = Project-level claude configs for dotfiles project

**Symlink Flow:**

```
~/.claude/settings.json  → ~/.dotfiles/.clauderc/settings.json
~/.claude/.membank/      → ~/.dotfiles/.clauderc/.membank/
~/.claude/commands/      → ~/.dotfiles/.clauderc/commands/
```

### Configuration Categories

**Claude Built-in Configs:**

- ✅ `settings.json` - Permissions, hooks, integrations
- ✅ `commands/` - Command definitions (.md files)

**Custom Configs:**

- ✅ `.membank/` - Documentation, libsources, implementation guides
- ✅ `sline/` - Sline code and scripts
- ✅ `scripts/` - Python libsource management scripts

### Management Rules

**Source of Truth:** `.clauderc/` contains originals

- ✅ Edit files in `.clauderc/` only
- ✅ Changes automatically reflect via symlinks
- ❌ Never edit files in `~/.claude/` directly

**Backup Strategy:**

- ✅ Git tracks `.clauderc/` originals
- ❌ No automated dotfile scripts (manual management only)
- ✅ Symlinks preserve real-time sync

**Cache vs Config:**

- ✅ Conversation history, todos, thinking files stay in `~/.claude/`
- ✅ Only true configuration files stored in `.clauderc/`

### Current Structure

```
.clauderc/
├── settings.json          # Main Claude settings
├── .membank/              # Knowledge base system
│   ├── libsource/         # Library source collection (11 libraries)
│   ├── implementation.md  # Project guides
│   └── typescript.md      # Type conventions
├── claude-workflow/       # Cluade Desktop and Claude Code Collaborative workflow
│   ├── CLAUDE.md          # Workflow specification
│   └── feature-name/      # Per-feature research directories
├── commands/              # Command definitions
├── scripts/               # Python libsource management
├── sline/                 # Go sline implementation
```

## Sline System

### Overview

note: sline — is our local shortcut name for an official claude code «statusline» feature.

Go-based statusline system providing rich terminal display with:

- Directory path with ~ shortening
- Dynamic model detection with rotating emoji (hourly rotation)
- Node.js and pnpm version display
- Comprehensive git status: branch, sync indicators, file counts, line changes
- Stash count when present
- Day/night themed git emojis (🦔/🦦)
- Claude Code v1.0.85+ native cost API integration
- Anthropic 5-hour usage reset time windows

### Architecture

- **Single Implementation**: Go binary at `sline/bin`
- **Shared State**: `sline-db.json` tracks emoji rotation
- **Native API**: Supports Claude Code v1.0.85+ cost data
- **ccusage Integration**: Fallback for daily/monthly cost totals

### Features

- **Emoji Rotation**: 64 unique emojis rotate every hour
- **Git Sync Status**: Superscript ahead/behind indicators (↑¹ ↓²)
- **Cost Display**: Session cost, burn rate, and proper reset timers
- **Reset Time Windows**: 5-hour Anthropic cycles (03:00, 08:00, 13:00, 18:00, 22:00)
- **Multi-line Output**: ccusage data + native API data when available
- **Error Handling**: Graceful fallbacks for missing tools

### Usage

- **Build sline**: `pnpm sline:build`
- **Current**: Points to `sline/bin` in settings.json

## Libsource System (RAG-Integrated)

**RAG-augmented library source collection with semantic search capabilities.**

### Architecture

- **Core Technology**: BM25F scoring with semantic pattern tagging (22.6x search improvement)
- **Storage**: SQLite database with JSON fields for chunks and semantic tags
- **Chunking**: 300-line chunks with 20% overlap for context preservation
- **Auto-Integration**: RAG indexing happens automatically on add/update/delete operations
- **Server**: FastAPI on port 1408 with REST API and OpenAPI docs

### Directory Structure

```
.clauderc/.membank/libsource-scripts/
├── core/                      # Core libsource operations
│   ├── libsource_add.py      # Add new libraries (auto-indexes RAG)
│   ├── libsource_update.py   # Update existing (auto-reindexes RAG)
│   ├── libsource_delete.py   # Delete libraries (auto-removes from RAG)
│   ├── libsource_list.py     # List available libraries
│   └── libsource_restore.py  # Restore from backups
├── rag/                       # RAG augmentation modules
│   ├── indexer.py            # Auto-indexing integration
│   ├── database.py           # SQLite operations
│   ├── chunker.py            # Text chunking logic
│   ├── tagger.py             # Semantic pattern tagging
│   ├── search.py             # BM25F search engine
│   └── server.py             # FastAPI server
├── cli/                       # CLI entry points
│   ├── search.py             # Search RAG index
│   └── server.py             # Manage RAG server
└── utils/                     # Shared utilities
```

### Key Files

- **Config**: `.clauderc/.membank/libsource/.libsource-config.json`
- **Text Sources**: `.clauderc/.membank/libsource/libsource-*.txt` (git-ignored)
- **RAG Database**: `.clauderc/.membank/libsource-scripts/data/libsources.db` (git-ignored)
- **Scripts**: `.clauderc/.membank/libsource-scripts/` (all Python modules)

### Commands

```bash
# Library management (with auto-RAG)
pnpm lib:add <github-url>      # Add library + auto-index RAG
pnpm lib:update <lib-name>     # Update library + auto-reindex RAG
pnpm lib:delete <lib-name>     # Delete library + auto-remove from RAG
pnpm lib:list                  # List all libraries with stats
pnpm lib:restore               # Restore from backups

# RAG search operations
pnpm lib:search "query" [lib]  # Search RAG index (CLI)
pnpm lib:server start          # Start RAG server on port 1408
pnpm lib:server stop           # Stop RAG server
pnpm lib:server status         # Check server status
pnpm lib:server restart        # Restart server

# API access (when server running)
curl http://localhost:1408/search?q=useState&library=react
curl http://localhost:1408/health
```

### RAG Features

- **Semantic Tagging**: 15 patterns (hooks, state, async, error handling, etc.)
- **Multi-Library Search**: Query across all libraries or specific ones
- **Context Preservation**: Returns surrounding code for better understanding
- **Visual CLI**: Emoji indicators for operation status
- **Auto-Integration**: No manual indexing required

## Claude Desktop & Claude Code Collaboration Workflow

**Structured research and implementation system for complex feature development.**

4-phase process (Research → Clarification → Planning → Implementation) with dual approval gates,
fast-track exceptions, and checkpoint-based tracking for complex features requiring architectural
research.

**Use for**: Complex features, unknown patterns, multi-library integrations **Skip for**: Simple
fixes, well-understood patterns


## Important Notes

- **1Password required** for SSH signing functionality
- **Vim plugins** require manual `:PlugInstall` after initial setup
- Repository optimized for Claude Code development workflows
