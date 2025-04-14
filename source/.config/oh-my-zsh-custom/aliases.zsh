# Delete all built-in aliases: system and oh-my-zsh
unalias -m '*'

# Oh-my-zsh — return unaliased z alias
alias z='zshz 2>&1'

# System
alias _=sudo
alias -- -='cd -'
alias -g ...=../..
alias -g ....=../../..
alias -g .....=../../../..
alias -g ......=../../../../..
alias 1='cd -1'
alias 2='cd -2'
alias 3='cd -3'
alias 4='cd -4'
alias 5='cd -5'
alias 6='cd -6'
alias 7='cd -7'
alias 8='cd -8'
alias 9='cd -9'
alias k='lsof -i tcp:3000' # list processses on port 3000
alias kk='kill -9' # kill process by passing PID

# Exotic
alias rezsh='omz reload'
alias ezsh='vim ~/.zshrc'
alias ealiases='~/.config/oh-my-zsh-custom/aliases.zsh'
alias evim='vim ~/.vimrc'
alias fpson='/bin/launchctl setenv MTL_HUD_ENABLED 1'
alias fpsoff='/bin/launchctl setenv MTL_HUD_ENABLED 0'

# Git
alias gs='git status -s'
alias ga='git add .'
alias gc='git commit'
alias gcm='git commit -m'
alias gca='git commit -a -m'
alias gcam='git commit --amend'
alias gch='git checkout'
alias gchb='git checkout -b'
alias gp='git push'
alias gpf='git push --force'
alias gpu='git push --set-upstream origin'
alias gpl='git pull'
alias gcl='git clone'
alias gbd='git branch -d'
alias gba='git branch -a'
alias gbD='git branch -D'
alias gcv='git cherry -v dev | wc -l'
alias grb='git rebase'
alias grbi='git rebase -i'
alias grba='git rebase --abort'
alias grbc='git rebase --continue'
alias grbd='git rebase dev'
alias grh='git reset --hard'
alias gfp='git fetch --prune'
alias gprune='git fetch --prune && git branch --merged | egrep -v \"(^\*|main|master|dev|develop)\" | xargs git branch -d'

# Github CLI
alias go='gh browse' # TODO: connect GITHUB_TOKEN

# pnpm: core
alias pn='pnpm'
alias pna='pnpm add'
alias pnar='pnpm add -r'
alias pni='pnpm install'
alias pno='pnpm outdated'
alias pnor='pnpm outdated -r'
alias pnup='pnpm update --latest'
alias pnun='pnpm uninstall'
alias pnpx='pnpm dlx'

# pnpm: scripts
alias pns='pnpm start'
alias pnb='pnpm build'

# yarn
alias y='yarn'
alias ys='yarn start'
alias yserv='yarn start'
alias yd='yarn dev'
alias yb='yarn build'
alias yt='yarn test'
alias ya='yarn add'
alias yad='yarn add --dev'
alias yre='yarn remove'
alias yot='yarn outdated'
alias yui='yarn upgrade-interactive'
alias yul='yarn upgrade --latest'

# npm-check-updates
alias ncu='ncu --format=repo'

# turbo
alias tb='turbo'

# other
alias rmx='trash'
