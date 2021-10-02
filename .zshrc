# export ZSH_COMPDUMP=/tmp/zcompdump-$USER


# Reference oh-my-zsh
export ZSH=/Users/$USER/.oh-my-zsh

# Load zplug
source ~/.zplug/init.zsh

# Oh-my-zsh plugins
plugins=(
    node npm yarn
    z
    copyfile copydir
    colored-man-page shistory
    colorize
)

# Initi oh-my-zsh
source $ZSH/oh-my-zsh.sh

# Global configs
export EDITOR='vim'

# System
alias k="lsof -i tcp:3000"
alias kk="kill -9"
alias kkk netstat -na | grep 8080

alias reinstall="sh ~/.dotfiles/.sh/reinstall.sh"
alias replace="sh ~/.dotfiles/.sh/replace.sh"
alias RM=rm -rf

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
alias gspush="git stash push"
alias gspop="git stash pop"
alias gcv="git cherry -v dev | wc -l"
alias grb="git rebase"
alias grbi="git rebase -i"
alias grba="git rebase --abort"
alias grbc="git rebase --continue"
alias grbd="git rebase dev"
alias grh="git reset --hard"
alias gfp="git fetch --prune"
alias gprune="git fetch --prune && git branch --merged | egrep -v \"(^\*|master|dev)\" | xargs git branch -d"

alias go="git open"

# Yarn: packages
alias y='yarn'
alias yd='yarn dev'
alias ys='yarn start'
alias yb='yarn build'
alias ybd='yarn build:dev'
alias ybs='yarn build:stage'
alias ybp='yarn build:prod'
alias yan='yarn analyze'
alias yba='yarn build:analyze'
alias yt='yarn test'
alias ytu='yarn test -u'
alias ytw='yarn test:watch'
alias yl='yarn lint'
alias ylj='yarn lint:javascript'
alias ylc='yarn lint:css'
alias yso='yarn soundcheck'
alias yi='yarn init'
alias yfmt='yarn prettier'

alias ya='yarn add'
alias yim='yarn import'
alias yga='yarn global add'
alias yad='yarn add --dev'
alias yre='yarn remove'
alias ygre='yarn global remove'
alias yr='yarn run'
alias yot='yarn outdated'
alias yu='yarn upgrade'
alias yui='yarn upgrade-interactive'
alias yul='yarn upgrade --latest'

# Package management
alias yp='yarn publish'
alias yv='yarn version'
alias yvn='yarn version --new-version'
alias yvnp='yarn version --new-version patch'
alias yvs='yarn versions'

# exa:
alias la="exa -abghl --git --color=automatic"

# Expose yarn
export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"

# ?
# PATH=/opt/local/bin:$PATH

# Homebrew requires /usr/local/bin occurs before /usr/bin in PATH
export PATH="/usr/local/bin:$PATH"
# List zsplug plugins
zplug "zsh-users/zsh-syntax-highlighting", defer:2
zplug "zsh-users/zsh-autosuggestions"
zplug "denysdovhan/spaceship-prompt", use:spaceship.zsh, from:github, as:theme
zplug "denysdovhan/spaceship-prompt", use:spaceship.zsh, from:github, as:theme
zplug "paulirish/git-open", as:plugin

# Spaceship prompt description
SPACESHIP_PROMPT_ORDER=(
    user          # Username section
    node          # Node.js section
    package       # Package version
    battery       # Battery level and status
    host          # Hostname section
    dir           # Current directory section
    git           # Git section (git_branch + git_status)
    exit_code     # Exit code section
    exec_time     # Execution time
    line_sep      # Line break
    jobs          # Backgound jobs indicator
    char          # Prompt character
)

SPACESHIP_RPROMPT_ORDER=(
    docker        # Docker section
)

SPACESHIP_PROMPT_DEFAULT_PREFIX=""

SPACESHIP_CHAR_SYMBOL="λ "

SPACESHIP_USER_SHOW=false

SPACESHIP_BATTERY_SHOW=false

SPACESHIP_DIR_PREFIX="⚡️ => "
SPACESHIP_DIR_COLOR="blue"
SPACESHIP_DIR_TRUNC=0

SPACESHIP_GIT_PREFIX="=> "
SPACESHIP_GIT_SYMBOL=" "
SPACESHIP_GIT_BRANCH_COLOR="blue"

SPACESHIP_EXIT_CODE_SHOW=true
SPACESHIP_EXIT_CODE_SYMBOL=":( "

SPACESHIP_PACKAGE_SHOW=true
SPACESHIP_PACKAGE_PREFIX=""
SPACESHIP_NODE_SHOW=true
SPACESHIP_DOCKER_SHOW=true

# Load zplug plugins
zplug load

# Prompt highlighting
ZSH_HIGHLIGHT_HIGHLIGHTERS=(main brackets)
ZSH_HIGHLIGHT_STYLES[path]='fg=yellow,bold'
ZSH_HIGHLIGHT_STYLES[alias]='fg=magenta'
ZSH_HIGHLIGHT_STYLES[commandseparator]='fg=white'
ZSH_HIGHLIGHT_STYLES[globbing]='fg=blue,bold'

# place this after nvm initialization!
autoload -U add-zsh-hook
load-nvmrc() {
  local node_version="$(nvm version)"
  local nvmrc_path="$(nvm_find_nvmrc)"

  if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")

    if [ "$nvmrc_node_version" = "N/A" ]; then
      nvm install
    elif [ "$nvmrc_node_version" != "$node_version" ]; then
      nvm use
    fi
  elif [ "$node_version" != "$(nvm version default)" ]; then
    echo "Reverting to nvm default version"
    nvm use default
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
###-begin-npm-completion-###
#
# npm command completion script
#
# Installation: npm completion >> ~/.bashrc  (or ~/.zshrc)
# Or, maybe: npm completion > /usr/local/etc/bash_completion.d/npm
#

if type complete &>/dev/null; then
  _npm_completion () {
    local words cword
    if type _get_comp_words_by_ref &>/dev/null; then
      _get_comp_words_by_ref -n = -n @ -n : -w words -i cword
    else
      cword="$COMP_CWORD"
      words=("${COMP_WORDS[@]}")
    fi

    local si="$IFS"
    IFS=$'\n' COMPREPLY=($(COMP_CWORD="$cword" \
                           COMP_LINE="$COMP_LINE" \
                           COMP_POINT="$COMP_POINT" \
                           npm completion -- "${words[@]}" \
                           2>/dev/null)) || return $?
    IFS="$si"
    if type __ltrim_colon_completions &>/dev/null; then
      __ltrim_colon_completions "${words[cword]}"
    fi
  }
  complete -o default -F _npm_completion npm
elif type compdef &>/dev/null; then
  _npm_completion() {
    local si=$IFS
    compadd -- $(COMP_CWORD=$((CURRENT-1)) \
                 COMP_LINE=$BUFFER \
                 COMP_POINT=0 \
                 npm completion -- "${words[@]}" \
                 2>/dev/null)
    IFS=$si
  }
  compdef _npm_completion npm
elif type compctl &>/dev/null; then
  _npm_completion () {
    local cword line point words si
    read -Ac words
    read -cn cword
    let cword-=1
    read -l line
    read -ln point
    si="$IFS"
    IFS=$'\n' reply=($(COMP_CWORD="$cword" \
                       COMP_LINE="$line" \
                       COMP_POINT="$point" \
                       npm completion -- "${words[@]}" \
                       2>/dev/null)) || return $?
    IFS="$si"
  }
  compctl -K _npm_completion npm
fi
###-end-npm-completion-###
