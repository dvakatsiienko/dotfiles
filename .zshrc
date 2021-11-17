
#### FIG ENV VARIABLES ####
# Please make sure this block is at the start of this file.
[ -s ~/.fig/shell/pre.sh ] && source ~/.fig/shell/pre.sh
#### END FIG ENV VARIABLES ####

# Global configs
export EDITOR='vim'

# Global variables
export ZSH=/Users/$USER/.oh-my-zsh # Reference oh-my-zsh
export PATH="/usr/local/bin:$PATH" # Homebrew requires /usr/local/bin occurs before /usr/bin in PATH
export DENO_INSTALL=/Users/$USER/.deno
export PATH=$DENO_INSTALL/bin:$PATH

# Oh-my-zsh plugins
plugins=(
    node
    npm
    z
    copyfile
    copydir
    colored-man-page
    shistory
    colorize
)

# Init
source $HOME/.profile        # source github token for release-it
source $HOME/.zplug/init.zsh # init zplug
source $ZSH/oh-my-zsh.sh     # init oh-my-zsh

# List zplug plugins
zplug "zsh-users/zsh-syntax-highlighting", defer:2
zplug "zsh-users/zsh-autosuggestions"
zplug "denysdovhan/spaceship-prompt", use:spaceship.zsh, from:github, as:theme
zplug "paulirish/git-open", as:plugin

# VSCode
alias .="code ."

# Railway
alias rw="railway"

# System
alias k="lsof -i tcp:3000"
alias kk="kill -9"
alias kkk netstat -na | grep 8080

# Dotfiles
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
alias ys='yarn start'
alias yd='yarn dev'
alias yb='yarn build'
alias yt='yarn test'
alias ya='yarn add'
alias yga='yarn global add'
alias yad='yarn add --dev'
alias yre='yarn remove'
alias yr='yarn run'
alias yot='yarn outdated'
alias yu='yarn upgrade'
alias yui='yarn upgrade-interactive'
alias yul='yarn upgrade --latest'

# pnpm
alias p="pnpm"
alias pi="pnpm i"
alias pid="pnpm i -D"
alias pu="pnpm un"
alias ps="pnpm start"
alias pb="pnpm build"
alias px="pnpm exec"
alias dlx="pnpm dlx"

# npm-check
alias out="NPM_CHECK_INSTALLER=pnpm npm-check --skip-unused"
alias outg="NPM_CHECK_INSTALLER=pnpm npm-check -g --skip-unused"
alias upd="NPM_CHECK_INSTALLER=pnpm npm-check --skip-unused --update-all"
alias updg="NPM_CHECK_INSTALLER=pnpm npm-check -g --skip-unused --update-all"
alias updi="NPM_CHECK_INSTALLER=pnpm npm-check --skip-unused --update"
alias updgi="NPM_CHECK_INSTALLER=pnpm npm-check -g --skip-unused --update"

# exa
alias la="exa -abghl --git --color=automatic"

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

# Load zplug plugins after spaceship but before zsh hightlight (order is important)
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

test -e "${HOME}/.iterm2_shell_integration.zsh" && source "${HOME}/.iterm2_shell_integration.zsh"


#### FIG ENV VARIABLES ####
# Please make sure this block is at the end of this file.
[ -s ~/.fig/fig.sh ] && source ~/.fig/fig.sh
#### END FIG ENV VARIABLES ####

export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"
