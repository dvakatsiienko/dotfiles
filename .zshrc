export ZSH="/Users/$USER/.oh-my-zsh"

source ~/.iterm2_shell_integration.zsh

ZSH_THEME="spaceship"
SPACESHIP_PROMPT_SYMBOL="λ"
SPACESHIP_PROMPT_SEPARATE_LINE="false"
SPACESHIP_PROMPT_DEFAULT_PREFIX=""
SPACESHIP_DIR_PREFIX="=> "
SPACESHIP_DIR_COLOR="blue"
SPACESHIP_GIT_PREFIX="=>"
SPACESHIP_GIT_SYMBOL="  "
SPACESHIP_GIT_BRANCH_COLOR="blue"
SPACESHIP_NODE_SHOW="false"
SPACESHIP_DOCKER_SHOW='false'
SPACESHIP_PROMPT_ORDER=(
    char          # Prompt character
    dir           # Current directory section
    time          # Time stampts section
    user          # Username section
    host          # Hostname section
    git           # Git section (git_branch + git_status)
    hg            # Mercurial section (hg_branch  + hg_status)
    node          # Node.js section
    ruby          # Ruby section
    xcode         # Xcode section
    swift         # Swift section
    golang        # Go section
    php           # PHP section
    rust          # Rust section
    haskell       # Haskell Stack section
    julia         # Julia section
    docker        # Docker section
    venv          # virtualenv section
    pyenv         # Pyenv section
    exec_time     # Execution time
    line_sep      # Line break
    vi_mode       # Vi-mode indicator
)

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# The optional three formats: "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"
# HIST_STAMPS="mm/dd/yyyy"

# Plugins

plugins=(git, zsh-syntax-highlighting)

source $ZSH/oh-my-zsh.sh

# Syntax highlighting
ZSH_HIGHLIGHT_STYLES[path]='fg=yellow'

# Global configs

export EDITOR='vim'
# ssh
# export SSH_KEY_PATH="~/.ssh/rsa_id"

# Tuning

# General
alias v="open -a macvim"
alias vv="vim"

# alias reinstall="rm -rf node_modules && if [-f yarn.lock] then rm yarn.lock package-lock.json && y && rm -rf node_modules && npm i"
alias reinstall="sh ~/.sh/reinstall.sh"

# System
alias k="lsof -i tcp:3000"
alias kk="kill -9"

# Git
alias gq="ga && gc 'quick update' && gp"
alias gs="git status -s"
alias ga="git add ."
alias gc="git commit -m"
alias gca="git commit -a -m"
alias gcam="git commit --amend"
alias gch="git checkout"
alias gchb="git checkout -b"
alias gp="git push"
alias gpf="git push --force"
alias gpu="git push --set-upstream origin"
alias gpl="git pull"
alias gcl="git clone"
alias gbd="git branch -d"
alias gba="git branch -a"
alias gbD="git branch -D"
alias gsl="git stash list"
alias gss="git stash save"
alias gsp="git stash pop"
alias gcv="git cherry -v dev | wc -l"
alias grb="git rebase"
alias grbi="git rebase -i"
alias grba="git rebase --abort"
alias grbc="git rebase --continue"
alias grbd="git rebase dev"
alias grh="git reset --hard"

# Yarn
alias y='yarn'
alias ys='yarn start'
alias yb='yarn build'
alias yt='yarn test'
alias ya='yarn add'
alias yga='yarn global add'
alias yad='yarn add --dev'
alias yre='yarn remove'
alias ygre='yarn global remove'
alias yr='yarn run'
alias yo='yarn outdated'
alias yu='yarn upgrade'
alias yui='yarn upgrade-interactive'

PATH=/opt/local/bin:$PATH

# for remote in $(git remote); do git remote rm $remote; done
# for branch in $(git branch -a | grep -v master); do git branch -D $branch; done

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

source "/Users/$USER/.oh-my-zsh/custom/themes/spaceship.zsh-theme"

# Homebrew requires /usr/local/bin occurs before /usr/bin in PATH
export PATH="/usr/local/bin:$PATH"

test -e "${HOME}/.iterm2_shell_integration.zsh" && source "${HOME}/.iterm2_shell_integration.zsh"
