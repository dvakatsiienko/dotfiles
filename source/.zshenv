# =============================================================================
# ZSH Environment Variables
# =============================================================================
# This file is sourced for all zsh invocations (interactive, non-interactive, scripts)
# Contains environment variables that should be available globally

# =============================================================================
# Oh My Zsh Configuration
# =============================================================================

export ZSH=$HOME/.oh-my-zsh
export ZSH_COMPDUMP=$ZSH/cache/.zcompdump-$HOST
export ZSH_CUSTOM=$HOME/.config/oh-my-zsh-custom

# =============================================================================
# Security & Authentication
# =============================================================================

# 1Password SSH agent
export SSH_AUTH_SOCK=~/Library/Group\ Containers/2BUA8C4S2C.com.1password/t/agent.sock

# =============================================================================
# User Environment
# =============================================================================

# Default editor
export EDITOR=vim

# =============================================================================
# Tool Configuration
# =============================================================================

# bat - syntax highlighting cat replacement
export BAT_THEME=gruvbox-dark

# fzf - fuzzy finder
export FZF_DEFAULT_COMMAND='find * -type f'

# zoxide - directory navigation
export _ZO_DATA_DIR=$HOME/.cache
export _ZO_ECHO=1
export _ZO_RESOLVE_SYMLINKS=1

# =============================================================================
# Terminal Configuration
# =============================================================================

# iTerm2 color support
export CLICOLOR=1
export TERM=xterm-256color

# =============================================================================
# Development Tools & Package Managers
# =============================================================================

# fnm - Node.js version manager
export FNM_PATH="$HOME/Library/Application Support/fnm"

# pnpm - Package manager
export PNPM_HOME="$HOME/Library/pnpm"

# =============================================================================
# PATH Configuration
# =============================================================================

# Base PATH additions for development tools
if [ -d "$FNM_PATH" ]; then
  export PATH="$FNM_PATH:$PATH"
fi

# pnpm PATH
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac

# LM Studio CLI
export PATH="$PATH:~/.lmstudio/bin"

# User local bins
export PATH="~/.local/bin:$PATH"
export PATH="$HOME/.local/bin:$PATH"
