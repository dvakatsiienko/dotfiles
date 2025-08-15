# CLAUDE.md

Personal macOS dotfiles repository with automated installation and symlink-based configuration management.

## Repository Overview

**Purpose**: Complete macOS development environment setup with automated configuration management  
**Approach**: Symlink-based dotfiles with backup system  
**Git Repository**: `git@github.com:dvakatsiienko/.dotfiles.git`  
**Scripting**: zx (Google's shell scripting utility) for automation  

## Technology Stack

### Core Development Environment
- **Node.js**: fnm (Fast Node Manager) with auto-switching via `.nvmrc`
- **Package Managers**: pnpm (primary), yarn (legacy support)
- **Shell**: zsh with oh-my-zsh framework
- **Terminal Enhancement**: Starship prompt with gruvbox theme
- **Version Control**: Git with 1Password SSH signing integration
- **Editor**: Vim with vim-plug and essential plugins

### Installed Tools & Utilities
```bash
# Core utilities (installed via brew)
zsh zsh-autosuggestions zsh-syntax-highlighting starship eza bat fzf trash vim gh the_silver_searcher yarn 1password-cli

# Key tools explained:
# eza        - modern ls replacement with icons and git integration
# bat        - cat clone with syntax highlighting
# fzf        - command-line fuzzy finder
# trash      - safe file deletion (move to trash)
# gh         - GitHub CLI
# ag         - the_silver_searcher for fast code search
```

## Directory Structure

```
.dotfiles/
├── source/                     # Configuration files to be symlinked
│   ├── .config/
│   │   ├── oh-my-zsh-custom/  # Custom zsh aliases and functions
│   │   └── starship.toml      # Starship prompt configuration
│   ├── .ssh/                  # SSH configuration and keys
│   ├── iTerm2/                # iTerm2 configuration
│   ├── .zshrc .zprofile .zshenv  # Shell configuration
│   ├── .gitconfig             # Git configuration with 1Password
│   ├── .vimrc                 # Vim configuration
│   └── .npmrc .yarnrc         # Package manager configs
├── script/                    # Installation automation
│   ├── install-macos.mjs      # macOS defaults + Homebrew setup
│   ├── install-dotfiles.mjs   # Backup + symlink creation
│   └── lib.mjs               # Colored terminal output utilities
├── themes/                    # Terminal and editor themes
│   ├── terminal/             # Gruvbox and Treehouse terminal themes
│   └── VSCode/               # Gruvbox VSCode themes
└── .claude/                  # Claude Code configuration
    └── settings.local.json   # Additional directory permissions
```

## Installation Process

### Prerequisites (Manual Setup)
1. Install [Homebrew](https://brew.sh/)
2. Install [fnm](https://github.com/Schniz/fnm) and [pnpm](https://pnpm.io/installation) via Homebrew
3. Install Node.js via fnm
4. Install [oh-my-zsh](https://ohmyz.sh/#install) with curl

### Automated Installation
```bash
# Install project dependencies
pnpm i

# Phase 1: macOS defaults and core tools
pnpm install-macos

# Phase 2: dotfiles backup and symlink creation
pnpm install-dotfiles
```

### What install-macos.mjs Does
- Sets macOS defaults (show hidden files, fast key repeat)
- Installs/verifies Homebrew installation
- Installs core CLI tools and utilities
- Sets up vim-plug plugin manager

### What install-dotfiles.mjs Does
- Validates required binaries (zsh, vim, yarn)
- Creates backup directories (`~/.dotfiles_backup`)
- Backs up existing dotfiles to prevent data loss
- Creates symlinks from `source/` to target locations:
  - Home directory files (`.zshrc`, `.gitconfig`, etc.)
  - oh-my-zsh custom directory
  - SSH configuration
  - Starship configuration

## Key Configuration Details

### Shell Environment (.zshrc)
- **oh-my-zsh** integration with custom directory
- **1Password SSH agent** configuration
- **fnm** initialization with auto-switching
- **Starship prompt** initialization
- **zsh plugins**: autosuggestions, syntax highlighting, z navigation
- **pnpm** and **LM Studio** PATH configuration

### Git Configuration (.gitconfig)
- **User**: Dima Vakatsiienko (imagnum.satellite@gmail.com)
- **SSH Signing**: 1Password integration for commit signing
- **Git LFS** support
- **Custom alias**: `lg` for pretty graph log
- **Auto remote setup** for new branches

### Starship Prompt (starship.toml)
- **Theme**: Gruvbox dark color palette
- **Format**: OS icon → directory → git status → language versions
- **Features**: Git branch/status, Node.js/Python/Rust/Go version display
- **Character**: Lambda (λ) symbol with color-coded states

### Vim Configuration (.vimrc)
- **Modern Vim9 script** syntax
- **Plugins**: sensible, surround, commentary, gruvbox, lightline
- **Theme**: Gruvbox with hard contrast
- **Indentation**: 4 spaces, auto-expansion
- **Features**: line numbers, syntax highlighting

## Custom Aliases & Functions

### Git Workflow ("Vibe" Theme)
```bash
# Creative git aliases
grab='git add .'
mana='git commit'
vibe='git commit -m'
vibetune='git commit --amend'
slay='git push'
slayer='git push --force'
sup='git status -s'
chill='git rebase -i $(git merge-base HEAD master)'
```

### Standard Git Aliases
```bash
gs='git status -s'
ga='git add .'
gcm='git commit -m'
gp='git push'
gpf='git push --force'
gswb='git switch -c'
# ... and many more
```

### Package Manager Shortcuts
```bash
# pnpm aliases
pn='pnpm'
pni='pnpm install'
pnd='pnpm dev'
pnb='pnpm build'
pnt='pnpm typecheck'

# yarn aliases  
y='yarn'
yd='yarn dev'
yb='yarn build'
```

### Custom Functions
```bash
# Enhanced ls with eza
l()  # Lists files with icons, git status, and metadata

# Git workflow automation
acp() {  # Add, commit, push in one command
    git add .
    git commit -m "$1"
    git push
}
```

### Claude CLI Integration
```bash
cute='claude'                                    # Claude CLI shortcut
cutemon='claude-monitor --plan max5 --time-format 24h'  # Claude monitoring
```

## Development Environment Features

### Node.js Management
- **fnm** with automatic version switching based on `.nvmrc`
- **pnpm** as primary package manager (faster, disk-efficient)
- **yarn** for legacy project support

### Terminal Enhancement
- **eza**: Modern ls with git integration, icons, and tree view
- **bat**: Syntax-highlighted cat with gruvbox theme
- **fzf**: Fuzzy finder for files and command history
- **trash**: Safe file deletion (moves to macOS trash)

### Git Integration
- **1Password SSH signing** for verified commits
- **GitHub CLI** for repository management
- **Git LFS** support for large files
- **Extensive aliases** for common workflows
- **Branch pruning utilities** for cleanup

## Theming & Aesthetics

### Color Scheme: Gruvbox Dark
- **Terminal**: Consistent gruvbox palette
- **Starship**: Custom gruvbox color configuration
- **Vim**: Gruvbox theme with hard contrast
- **VSCode**: Gruvbox material themes available

### Icons & Visual Enhancement
- **Starship**: OS icons, programming language symbols
- **eza**: File type icons and git status indicators
- **Terminal themes**: Multiple gruvbox variants + Treehouse theme

## Scripts & Automation

### lib.mjs - Utility Functions
```javascript
// Colored terminal output helpers
bb()  // blue bright
yb()  // yellow bright  
mb()  // magenta bright
gb()  // green bright
rb()  // red bright
new_line()  // empty line
```

### Dotfiles Management Scripts

#### list-symlinks.mjs
- **Purpose**: Lists all current dotfiles symlinks and their status
- **Output**: Shows symlinks, real files, and missing files with visual indicators
- **Usage**: `pnpm list-symlinks`
- **Features**: Categorizes by location (home, .config, .ssh) and shows link targets

#### untrack-dotfile.mjs  
- **Purpose**: Safely converts symlinked dotfiles to real files and removes from git tracking
- **Process**: 
  1. Verifies file is a dotfiles symlink
  2. Copies symlink content to real file
  3. Removes from git tracking (`git rm --cached`)
  4. Deletes source file from repo
- **Safety**: Interactive confirmation and comprehensive error checking
- **Usage**: `pnpm untrack-dotfile ~/.yarnrc`

### Error Handling & Safety
- **Backup system**: Prevents overwriting existing configurations
- **Validation checks**: Ensures required binaries are installed
- **Rollback capability**: Original files backed up to `~/.dotfiles_backup`
- **Idempotent installation**: Safe to run multiple times

## Project Configuration

### Package Management
- **Engine requirements**: Node >=18.12.0, pnpm >=8.5.0
- **Dependencies**: zx for scripting
- **Dev dependencies**: ESLint (polished config), Prettier

### Code Quality
- **ESLint**: Uses `polished/typescript` configuration
- **Prettier**: Uses `polished` configuration for consistent formatting
- **Git hooks**: Standard hooks available (not customized)

## Commands Reference

### Installation Commands
```bash
pnpm install-macos     # Setup macOS + install tools
pnpm install-dotfiles  # Backup + create symlinks
```

### Dotfiles Management Commands
```bash
pnpm list-symlinks     # List all current dotfiles symlinks
pnpm untrack-dotfile   # Convert symlink to real file and remove from repo

# Examples:
pnpm list-symlinks                    # See what's currently tracked
pnpm untrack-dotfile ~/.yarnrc        # Remove .yarnrc from tracking
pnpm untrack-dotfile ~/.gitconfig     # Remove .gitconfig from tracking
```

### Useful Aliases
```bash
# System
k='lsof -i tcp:3000'   # List processes on port 3000
kk='kill -9'           # Kill process by PID
rezsh='omz reload'     # Reload zsh configuration

# Git workflow
grab && mana && slay   # Add, commit, push workflow
sup                    # Quick git status
chill                  # Interactive rebase to master

# Package management
pni && pnd            # Install deps and start dev server
ncu --format=repo     # Check for package updates
```

## Maintenance & Troubleshooting

### Common Tasks
- **Update tools**: `brew upgrade` for CLI tools
- **Vim plugins**: Run `:PlugInstall` in Vim for new plugins
- **zsh reload**: Use `rezsh` alias after config changes
- **Package updates**: Use `ncu` to check for updates

### Backup Locations
- **Original dotfiles**: `~/.dotfiles_backup/`
- **oh-my-zsh custom**: `~/.dotfiles_backup/.config/oh-my-zsh-custom/`
- **SSH configs**: `~/.dotfiles_backup/.ssh/`

### Important Notes
- Uses **symlinks**, not file copies (changes to source files immediately apply)
- **1Password required** for SSH signing functionality
- **fnm setup** needed before Node.js projects work properly
- **Vim plugins** require manual installation after initial setup

## Claude Code Integration

### Settings
- **Additional directories**: `/Users/dima` (via `.claude/settings.local.json`)
- **Tool access**: Full access to MCP servers and development tools

### Workflow Tips
- Use `cute` alias for Claude CLI
- Monitor usage with `cutemon` alias
- Repository is optimized for Claude Code development workflows