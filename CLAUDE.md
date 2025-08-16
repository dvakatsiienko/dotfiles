# CLAUDE.md

Personal macOS dotfiles repository with automated symlink-based configuration management.

## Repository Overview

- **Purpose**: Complete macOS development environment setup with automated configuration management.
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
~/.claude/agents/        → ~/.dotfiles/.clauderc/agents/
~/.claude/commands/      → ~/.dotfiles/.clauderc/commands/
```

### Configuration Categories

**Claude Built-in Configs:**

- ✅ `settings.json` - Permissions, hooks, integrations
- ✅ `agents/` - Agent definitions (.md files)
- ✅ `commands/` - Command definitions (.md files)

**Custom Configs:**

- ✅ `.membank/` - Documentation, libsources, implementation guides
- ✅ `statusline/` - Statusline code and scripts
- ⚠️ `config/` - Legacy notification configs (needs cleanup)
- ✅ `scripts/` - Python libsource management scripts
- ⚠️ `sounds/` - Audio notifications (needs cleanup)
- ❌ `agents.md` - Legacy subagents config (candidate for removal)

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
│   ├── libsource/         # Standardized libsource collection
│   │   ├── .libsource-config.json # Library tracking config
│   │   ├── libsource-biome.txt    # Biome (1MB, 35K LOC, 88% quality)
│   │   ├── libsource-bubbletea.txt # Bubble Tea (409KB, 16.7K LOC, 92% quality)
│   │   ├── libsource-lipgloss.txt  # Lip Gloss (405KB, 13.9K LOC, 94% quality)
│   │   ├── libsource-lodash.txt    # Lodash (151KB, 5.3K LOC, 79% quality)
│   │   ├── libsource-mobx.txt      # MobX (1.9MB, 68K LOC, 85% quality)
│   │   ├── libsource-react.txt     # React (16.6MB, 610K LOC, 83% quality)
│   │   ├── libsource-vite.txt      # Vite (3.6MB, 124K LOC, 83% quality)
│   │   ├── libsource-webfonts-loader.txt # Webfonts Loader (40KB, 1.4K LOC, 96% quality)
│   │   ├── libsource-webpack.txt   # Webpack (8.6MB, 290K LOC, 78% quality)
│   │   └── libsource-zx.txt        # zx (424KB, 14.6K LOC, unrated)
│   ├── implementation.md   # Project implementation guides
│   ├── migrate-preact-to-react.md # Migration documentation
│   └── typescript.md       # TypeScript conventions
├── agents/                # Agent definitions
├── commands/              # Command definitions
│   ├── libsource.md       # Main libsource command
│   ├── libsource-read.md  # Targeted libsource analysis
│   ├── libsource-add.md   # Add new libraries
│   └── [other commands]
├── scripts/               # Python libsource management scripts
│   ├── libsource.py       # Add libraries to collection
│   ├── libsource-list.py  # List registered libraries
│   ├── libsource-update.py # Update existing libraries
│   └── libsource-delete.py # Remove libraries
├── statusline/            # Statusline implementation
│   ├── statusline-db.json # Shared emoji rotation state
│   ├── statusline.sh      # Bash implementation
│   ├── statusline-go/     # Go implementation directory
│   │   ├── bin            # Compiled Go binary
│   │   ├── main.go        # Go source code
│   │   ├── go.mod         # Go module file
│   │   └── go.sum         # Go dependencies
│   ├── switch-to-go.sh    # Switch to Go version
│   └── switch-to-sh.sh    # Switch to Bash version
├── config/                # ⚠️ Needs cleanup
├── sounds/                # ⚠️ Needs cleanup
└── agents.md              # ❌ Legacy file
```

## Statusline System

### Overview
Dual-implementation statusline system providing rich terminal display with:
- Directory path with ~ shortening
- Dynamic model detection with rotating emoji (hourly rotation)
- Node.js and pnpm version display  
- Comprehensive git status: branch, sync indicators, file counts, line changes
- Stash count when present
- Day/night themed git emojis (🦔/🦦)

### Architecture
- **Shared State**: `statusline-db.json` tracks emoji rotation across implementations
- **Go Version**: High-performance compiled binary in `statusline-go/bin`
- **Bash Version**: Portable shell script `statusline.sh`
- **Switch Scripts**: Toggle between implementations seamlessly

### Features
- **Emoji Rotation**: 66 unique emojis rotate every hour
- **Git Sync Status**: Superscript ahead/behind indicators (↑¹ ↓²)
- **Error Handling**: Graceful fallbacks for missing tools
- **Dynamic Model**: Reads current model from settings.json
- **Rich Git Stats**: Staged/unstaged/untracked files with line counts

### Usage
- **Switch to Go**: `./switch-to-go.sh` (compiles if needed)
- **Switch to Bash**: `./switch-to-sh.sh`
- **Current**: Points to `statusline-go/bin` in settings.json

## Libsource System

### Overview

Standardized library source code collection optimized for AI consumption. The libsource system provides comprehensive source code snapshots of key libraries, enabling detailed implementation analysis and code generation assistance.

### Architecture

**Core Directory**: `.clauderc/.membank/libsource/`
- **Config File**: `.libsource-config.json` - Tracks library metadata, quality ratings, and update history
- **Source Files**: `libsource-[name].txt` - Optimized library source code snapshots
- **Management**: Python scripts for adding, listing, updating, and removing libraries

### Current Library Collection

**High Quality Sources** (85%+ rating):
- **webfonts-loader** (96% quality) - Font generation system (40KB, 1.4K LOC)
- **lipgloss** (94% quality) - Terminal styling library (405KB, 13.9K LOC)
- **bubbletea** (92% quality) - TUI framework (409KB, 16.7K LOC)
- **biome** (88% quality) - Modern linter/formatter (1MB, 35K LOC)
- **mobx** (85% quality) - State management (1.9MB, 68K LOC)

**Core Libraries**:
- **react** (83% quality) - UI framework (16.6MB, 610K LOC)
- **vite** (83% quality) - Build tool (3.6MB, 124K LOC)
- **lodash** (79% quality) - Utility functions (151KB, 5.3K LOC)
- **webpack** (78% quality) - Build system (8.6MB, 290K LOC)

**Recent Additions**:
- **zx** (unrated) - Google's shell scripting utility (424KB, 14.6K LOC)

### Commands

**Primary Commands**:
- `/libsource-read [lib-name] "targeted prompt"` - Extract specific implementation details
- `/libsource [lib-name] [optional-url]` - Add new library to collection
- `/libsource-list` - Display all registered libraries with metrics

**Management Scripts**:
- `libsource.py` - Add libraries with automatic quality detection
- `libsource-list.py` - List registered libraries with human-readable metrics
- `libsource-update.py` - Update existing library sources
- `libsource-delete.py` - Remove libraries from collection

### Usage Patterns

**Implementation Research**:
```bash
/libsource-read react "hooks patterns for state management"
/libsource-read mobx "observable decorators vs makeObservable"
/libsource-read vite "plugin development API"
```

**Configuration Examples**:
```bash
/libsource-read webpack "code splitting configuration"
/libsource-read biome "ESLint migration rules mapping"
```

**Performance Analysis**:
```bash
/libsource-read react "rendering optimization techniques"
/libsource-read vite "build performance optimizations"
```

### Quality Metrics

Quality ratings (0-100%) indicate:
- **Code completeness** and accuracy
- **Documentation coverage**
- **Implementation pattern** consistency
- **API surface coverage**

Libraries with 85%+ ratings are considered authoritative sources for implementation guidance.

### Research Priority

The libsource system serves as the **primary source** for library-related questions:
1. **First**: Query libsource collection via `/libsource-read`
2. **Second**: Web search only when libsource lacks needed information
3. **Prioritize**: High-quality rated libraries (85%+) as authoritative

## Important Notes

- **1Password required** for SSH signing functionality
- **Vim plugins** require manual `:PlugInstall` after initial setup
- Repository optimized for Claude Code development workflows
