# .dotfiles

Personal macOS dotfiles repository with automated symlink-based configuration management.

## Repository Overview

- **Purpose**: Complete macOS development environment setup with automated configuration management.
- **Secondary Purpose**: Development and evolution of efficient agentic workflows (primarily in
  `home/.claude/` scope).
- **Approach**: Symlink-based dotfiles, driven by the mirror rule below.
- **Git Repository**: `git@github.com:dvakatsiienko/.dotfiles.git`.
- **Scripting**: zx (Google's shell scripting utility) for automation.

## Directory Structure

**The mirror rule**: a path under `home/` IS the path under `~`. Everything symlinked into the
home directory lives there at its literal relative path, so the link map is derived by walking
the tree instead of being hand-maintained. Anything imported by hand into an app rather than
symlinked lives in `import/`.

```
.dotfiles/
├── home/                       # mirrors ~ exactly — everything here gets symlinked
│   ├── .config/
│   │   ├── oh-my-zsh-custom/  # Custom zsh aliases and functions
│   │   └── starship.toml      # Starship prompt configuration
│   ├── .ssh/                  # SSH configuration (config, allowed_signers)
│   ├── .zshrc .zprofile .zshenv  # Shell configuration
│   ├── .gitconfig             # Git configuration with 1Password
│   ├── .vimrc                 # Vim configuration
│   └── .claude/               # Claude Code config — see below
├── cc -> home/.claude          # shorthand for the dir edited most
├── import/                     # NOT symlinked — imported by hand into each app
│   ├── iterm2/                # prefs folder, pointed at from iTerm2 preferences
│   ├── raycast/               # script dir, pointed at from Raycast preferences
│   ├── terminal/              # Gruvbox and Treehouse Terminal.app themes
│   ├── vscode/                # Gruvbox VSCode themes
│   └── warp/                  # Warp theme
├── script/
│   ├── symlink.mjs            # The engine — derives the link set from the tree
│   ├── symlink.test.mjs       # vitest suite for the engine
│   ├── dotfiles.mjs           # status / apply / untrack
│   ├── macos.mjs              # Brewfile install + macOS defaults
│   ├── skills-desk-sync.mjs   # Desk skill drift check + zip build
│   └── lib.mjs                # Terminal output vocabulary
├── Brewfile                    # every package this machine is built from
├── docs/                       # ADRs, agent docs, research, audit
└── .claude/                    # THIS repo's project-level Claude config
    └── settings.local.json    # Additional directory permissions
```

`home/.claude/` (the global config) and `.claude/` (this project's config) are deliberately
distinct — that collision is exactly why the global config is nested under `home/` rather than
sitting at the repo root.

## Installation Process

### What the Scripts Do

**symlink.mjs** — the engine. Walks `home/` and derives the expected link set. A directory is
linked wholesale unless the matching path in `~` is already a real directory (meaning it holds
content this repo doesn't own, like `~/.config` or `~/.claude`) — then it descends and links the
leaves. `no_link` names the few dirs stored in `home/` but referenced by absolute path instead.

**dotfiles.mjs** — status / apply / untrack over that manifest. Idempotent, and it refuses to
clobber a real file rather than moving it into a backup directory nobody reads.

**macos.mjs** — runs `brew bundle` against the root `Brewfile`, writes the three macOS defaults
this repo owns, fetches vim-plug. Packages live in the `Brewfile`, never in the script.

## Dotfiles Management

### Available Commands

```bash
pnpm dotfiles                        # status — what's linked, what conflicts
pnpm dotfiles apply                  # link everything not linked yet
pnpm dotfiles untrack ~/.gitconfig   # hand a file back to ~, drop it from the repo

pnpm macos                           # what this machine is missing vs the Brewfile
pnpm macos apply                     # install packages, write defaults

pnpm test                            # vitest — the mirror rule, against a temp fixture
pnpm test:watch
```

Registering a new dotfile is a move, not a command — `mv ~/.foo home/.foo && pnpm dotfiles apply`.
The tree under `home/` is the config; there is nothing else to update.

Git hooks run through **lefthook** (`lefthook.yml`): biome check on staged files at commit,
tests + `pnpm dotfiles` at push. Nothing in a hook writes to your files.

### Safety Features

- **No clobbering**: a real file where a link belongs is reported, never overwritten or hidden
- **Validation checks**: Ensures required binaries are installed
- **Idempotent installation**: Safe to run multiple times
- **Interactive confirmation**: For destructive operations

## Key System Details

### Symlink Architecture

- Uses **symlinks**, not file copies (changes to source files immediately apply)
- Backup system prevents data loss during installation

### Configuration Files

- **Shell**: zsh with oh-my-zsh + custom aliases/functions in `home/.config/oh-my-zsh-custom/`
- **Git**: 1Password SSH signing integration
- **Terminal**: Starship prompt with gruvbox theme
- **Vim**: Gruvbox theme with essential plugins

### Aliases & Functions

Reference actual files for current aliases:

- Git workflows: `home/.config/oh-my-zsh-custom/aliases.zsh`
- Custom functions: `home/.config/oh-my-zsh-custom/functions.zsh`
- Includes both "vibe" theme git aliases and standard shortcuts

## Project Configuration

- **Engine requirements**: Node >=22.17.0, pnpm >=10.14.0
- **Dependencies**: zx for scripting
- **Code quality**: Biome (`pnpm check`) + Prettier for the file types Biome doesn't format

## Claude Config Management (home/.claude)

### System Architecture

**Config Locations:**

- `~/.claude/` = Standard Claude Code config directory (symlink targets)
- `~/.dotfiles/home/.claude/` = Source of truth (original files, git tracked)
- `~/.dotfiles/cc` = symlink to the above, for shorter paths
- `~/.dotfiles/.claude/` = Project-level claude configs for dotfiles project

**Symlink Flow:**

```
~/.claude/CLAUDE.md      → ~/.dotfiles/home/.claude/CLAUDE.md
~/.claude/settings.json  → ~/.dotfiles/home/.claude/settings.json
~/.claude/hooks/         → ~/.dotfiles/home/.claude/hooks/
```

These are no longer hand-made: the mirror rule covers them, so `pnpm dotfiles` reports and
repairs them like any other link.

### Configuration Categories

**Claude Built-in Configs:**

- ✅ `settings.json` - Permissions, hooks, integrations

**Custom Configs:**

- ✅ `sline/` - Sline code and scripts
- ✅ `hooks/` - Hook scripts invoked from settings.json

### Management Rules

**Source of Truth:** `home/.claude/` contains originals

- ✅ Edit files in `home/.claude/` (or via `cc/`) only
- ✅ Changes automatically reflect via symlinks
- ❌ Never edit files in `~/.claude/` directly

**Backup Strategy:**

- ✅ Git tracks `home/.claude/` originals
- ✅ `pnpm dotfiles` manages these links like every other one
- ✅ Symlinks preserve real-time sync

**Cache vs Config:**

- ✅ Conversation history, todos, thinking files stay in `~/.claude/`
- ✅ Only true configuration files stored in `home/.claude/`

### Current Structure

```
home/.claude/
├── settings.json          # Main Claude settings
├── keybindings.json       # CC keyboard shortcuts (symlinked from ~/.claude/)
├── hooks/                 # Hook scripts invoked from settings.json
├── sline/                 # Go sline implementation
├── plugin-x/              # Personal plugin (skills: handoff, handoff-pull, handoff-prune, sweep-issues, commit, cct, …), registered as marketplace "x"; CST-SPEC.md = single definition of the CST format
├── mcp-handoff-desktop/   # Local stdio MCP server giving Claude Desktop handoff tools over the shared ~/.claude/handoffs/ store (build: pnpm mcp:build)
├── skills-desk/           # Thin claude.ai skills, hand-adapted from plugin-x sources (pm; handoff UX lives in the MCP server's tool descriptions + prompts); sync via `pnpm skills-desk` (drift check + zips + Finder) — not CC-loadable, manual zip upload to Claude Desktop
```

## Sline System

Sline (this repo's Claude Code statusline implementation) is documented in
`home/.claude/sline/CLAUDE.md`, which loads automatically when working under that directory.

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
