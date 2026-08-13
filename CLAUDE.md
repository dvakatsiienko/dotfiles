# .dotfiles

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
~/.claude/CLAUDE.md      → ~/.dotfiles/.clauderc/CLAUDE.md
~/.claude/settings.json  → ~/.dotfiles/.clauderc/settings.json
~/.claude/commands/      → ~/.dotfiles/.clauderc/commands/
```

### Configuration Categories

**Claude Built-in Configs:**

- ✅ `settings.json` - Permissions, hooks, integrations
- ✅ `commands/` - Legacy slash-command dir, now empty — commands live as plugin-x skills

**Custom Configs:**

- ✅ `sline/` - Sline code and scripts
- ✅ `hooks/` - Hook scripts invoked from settings.json

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
├── keybindings.json       # CC keyboard shortcuts (symlinked from ~/.claude/)
├── commands/              # Empty — former slash commands migrated to plugin-x/skills/
├── hooks/                 # Hook scripts invoked from settings.json
├── sline/                 # Go sline implementation
├── plugin-x/              # Personal plugin (skills: handoff, handoff-pull, handoff-prune, sweep-issues, commit, cct, …), registered as marketplace "x"; CST-SPEC.md = single definition of the CST format
├── mcp-handoff-desktop/   # Local stdio MCP server giving Claude Desktop handoff tools over the shared ~/.claude/handoffs/ store (build: pnpm mcp:build)
├── skills-desk/           # Thin claude.ai skills, hand-adapted from plugin-x sources (pm; handoff UX lives in the MCP server's tool descriptions + prompts); sync via `pnpm skills-desk` (drift check + zips + Finder) — not CC-loadable, manual zip upload to Claude Desktop
```

## Sline System

Sline (this repo's Claude Code statusline implementation) is documented in
`.clauderc/sline/CLAUDE.md`, which loads automatically when working under that directory.

## Important Notes

- **1Password required** for SSH signing functionality
- **Vim plugins** require manual `:PlugInstall` after initial setup
- Repository optimized for Claude Code development workflows

## Agent skills

### Issue tracker

Issues live in **Linear** (workspace `x-com`, team `DOT`), managed via the `linear` CLI — never the Linear MCP. GitHub issues are retired (closed history). See `docs/agents/issue-tracker.md`; the `x:pm` skill owns the operating contract.

### Triage labels

Five-role vocabulary mapped onto Linear statuses/labels (Triage inbox, `needs-info`, `agent`, `human`, Canceled). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
