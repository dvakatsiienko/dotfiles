# .dotfiles

Personal macOS dotfiles repository with automated symlink-based configuration management.

## Repository Overview

- **Purpose**: Complete macOS development environment setup with automated configuration management.
- **Secondary Purpose**: Development and evolution of efficient agentic workflows (primarily in
  `home/.claude/` scope).
- **Approach**: Symlink-based dotfiles, driven by the mirror rule below.
- **Git Repository**: `git@github.com:dvakatsiienko/dotfiles.git`.
- **Scripting**: zx (Google's shell scripting utility) for automation.

## Directory Structure

**The mirror rule**: a path under `home/` IS the path under `~`. Everything symlinked into the
home directory lives there at its literal relative path, so the link map is derived by walking
the tree instead of being hand-maintained. Anything imported by hand into an app rather than
symlinked lives in `import/`.

```
dotfiles/
├── home/                       # mirrors ~ exactly — everything here gets symlinked
│   ├── .config/
│   │   ├── nvim/              # LazyVim config — was a standalone repo, folded in 2026-08-16
│   │   ├── oh-my-zsh-custom/  # Custom zsh aliases and functions
│   │   └── starship.toml      # Starship prompt configuration
│   ├── .ssh/                  # SSH configuration (config, allowed_signers)
│   ├── .zshrc .zprofile .zshenv  # Shell configuration
│   ├── .gitconfig             # Git configuration with 1Password
│   ├── .vimrc                 # Vim configuration
│   ├── .warp/                 # Warp settings, keybindings, theme
│   └── .claude/               # Claude Code config — see below
├── cc -> home/.claude          # shorthand for the dir edited most
├── import/                     # NOT symlinked — imported by hand into each app
│   ├── iterm2/                # prefs folder, pointed at from iTerm2 preferences
│   ├── raycast/               # script dir, pointed at from Raycast preferences
│   ├── terminal/              # Gruvbox and Treehouse Terminal.app themes
│   └── vscode/                # Gruvbox VSCode themes
├── script/                     # top level = runnable; lib/ = never invoked directly
│   ├── dotfiles-link.ts       # status / apply / untrack
│   ├── macos-setup.ts         # Brewfile install + macOS defaults
│   ├── skills-sync-cw.ts    # cw skill drift check + zip build
│   └── lib/
│       ├── manifest.ts        # The engine — derives the link set from the tree
│       ├── manifest.test.ts   # vitest suite for the engine
│       └── print.ts           # Terminal output vocabulary
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

**lib/manifest.ts** — the engine. Walks `home/` and derives the expected link set. A directory is
linked wholesale unless the matching path in `~` is already a real directory (meaning it holds
content this repo doesn't own, like `~/.config` or `~/.claude`) — then it descends and links the
leaves. `noLink` names the few dirs stored in `home/` but referenced by absolute path instead. Nothing runs
it directly — it decides, `dotfiles-link.ts` acts.

**dotfiles-link.ts** — status / apply / untrack over that manifest. Idempotent, and it refuses to
clobber a real file rather than moving it into a backup directory nobody reads.

**macos-setup.ts** — runs `brew bundle` against the root `Brewfile`, writes the macOS defaults this
repo owns, points a few file types at their editor via `duti`, fetches vim-plug. Packages live in the
`Brewfile`, never in the script.

## Dotfiles Management

### Available Commands

```bash
pnpm dotfiles-link                        # status — what's linked, what conflicts
pnpm dotfiles-link apply                  # link everything not linked yet
pnpm dotfiles-link untrack ~/.gitconfig   # hand a file back to ~, drop it from the repo

pnpm macos-setup                           # what this machine is missing vs the Brewfile
pnpm macos-setup apply                     # install packages, write defaults

pnpm test                            # vitest — the mirror rule, against a temp fixture
pnpm test:watch
```

Registering a new dotfile is a move, not a command — `mv ~/.foo home/.foo && pnpm dotfiles-link apply`.
The tree under `home/` is the config; there is nothing else to update.

Git hooks run through **lefthook** (`lefthook.yml`): biome on staged files, `pnpm typecheck` and
`pnpm test` at commit; `pnpm dotfiles-link` at push. Nothing in a hook writes to your files.

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

- **Dependencies**: zx for scripting; TypeScript for type checking only. Node/pnpm floors live in
  `package.json` `engines`, never duplicated here.
- **Scripts are `.ts`, run by Node directly** — Node 24 strips types natively, so there is no
  build step and no `tsx`. `tsconfig.json` sets `erasableSyntaxOnly`, which bans any syntax that
  would need real compilation. `pnpm typecheck` is the checker; it runs on pre-commit.
- **Script layout**: anything directly under `script/` is a runnable entrypoint with a matching
  `pnpm` script; anything under `script/lib/` is a library and is never invoked directly.
- **Code quality**: Biome (`pnpm check`) — the only formatter/linter here

## Claude Config Management (home/.claude)

### System Architecture

**Config Locations:**

- `~/.claude/` = Standard Claude Code config directory (symlink targets)
- `~/dotfiles/home/.claude/` = Source of truth (original files, git tracked)
- `~/dotfiles/cc` = symlink to the above, for shorter paths
- `~/dotfiles/.claude/` = Project-level claude configs for dotfiles project

**Symlink Flow:**

```
~/.claude/CLAUDE.md      → ~/dotfiles/home/.claude/CLAUDE.md
~/.claude/settings.json  → ~/dotfiles/home/.claude/settings.json
~/.claude/hooks/         → ~/dotfiles/home/.claude/hooks/
```

These are no longer hand-made: the mirror rule covers them, so `pnpm dotfiles-link` reports and
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
- ✅ `pnpm dotfiles-link` manages these links like every other one
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
├── plugin-x/              # Personal plugin (skills: handoff, handoff-pull, sweep-issues, cmt, cct, …), registered as marketplace "x"; CST-SPEC.md = single definition of the CST format
├── mcp-x-cw/              # Local stdio MCP server giving `cw` handoff tools over the shared ~/.claude/shelf/handoffs/ store (build: pnpm mcp:build)
├── skills-cw/             # Thin claude.ai skills, hand-adapted from plugin-x sources (pm, comms-mobile, remind, queue; handoff UX lives in the MCP server's tool descriptions + prompts); sync via `pnpm skills-sync-cw` (drift check + zips + Finder) — not `cc`-loadable, manual zip upload to `cw`
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

Issues live in **Linear** (workspace `x-com`, team `DOT`), managed via the `linear` CLI — never the Linear MCP. GitHub issues are retired (closed history). See `docs/tracker/CONTEXT.md`; the `x:pm` skill owns the operating contract.

### Triage labels

Five-role vocabulary mapped onto Linear statuses/labels (Triage inbox, `needs-info`, `agent`, `human`, Canceled). See the triage role bridge in `docs/tracker/CONTEXT.md`.

### Authoring guides — skills and memory

The reference pair: `docs/agents/authoring-skill.md` (frontmatter, invocation
control, the listing budget) and `docs/agents/authoring-memory.md` (where a fact goes, decided
before it is written).

### Domain docs

Multi-context layout — see `CONTEXT-MAP.md` at root. Repo context: `CONTEXT.md` + `docs/adr/` (ADR-nnnn). Tracker context: `docs/tracker/CONTEXT.md` + `docs/tracker/adr/` (TRK-nnnn). See `docs/agents/domain.md`.

### Research docs

`docs/research/<subject>.md` — subject-first filename, never a ticket-id prefix, so the folder
groups by topic and a doc survives the ticket that prompted it. When a ticket owns the doc, put
`Ticket: DOT-N` on its own line at the top; `grep -rl DOT-N docs/` then finds it.
