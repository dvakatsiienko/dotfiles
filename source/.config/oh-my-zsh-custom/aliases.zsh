# Delete all built-in aliases: system and oh-my-zsh
unalias -m '*'

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

# Git vibe
alias grab='git add .'
alias mana='git commit'
alias vibe='git commit -m'
alias vibetune='git commit --amend'
alias slay='git push'
alias slayer='git push --force'
alias sup='git status -s'
alias chill='git rebase -i $(git merge-base HEAD master)'

# Git
alias gs='git status -s'
alias ga='git add .'
alias gc='git commit'
alias gcm='git commit -m'
alias gca='git commit -a -m'
alias gcam='git commit --amend'
alias gsw='git switch'
alias gswb='git switch -c'
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
alias gwa='git worktree add'
alias gwl='git worktree list'
alias gwr='git worktree remove'
alias gprune='git fetch --prune && git for-each-ref --format='\''%(refname:short) %(upstream:track)'\'' refs/heads | awk '\''$2 == "[gone]" { print $1 }'\'' | xargs -r git branch -D && git branch --merged | grep -v "^\*" | grep -Ev "(^|\s+)(main|master|dev|develop)$" | xargs -r git branch -d'
alias gpruned='git fetch --prune && echo "Branches to delete:" && git branch --merged | grep -v "^\*" | grep -Ev "(^|\s+)(main|master|dev|develop)$"'

# Github CLI
alias goo='gh browse' # TODO: connect GITHUB_TOKEN

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
alias pnt='pnpm typecheck'

# pnpm: scripts
alias pnd='pnpm dev'
alias pns='pnpm start'
alias pnb='pnpm build'

# turbo
alias tb='turbo'

# other
alias rmx='trash'

# llms
alias cute='claude'
alias cutemon='claude-monitor --plan max5 --time-format	24h'

# gum
alias gg='git log --oneline | gum filter | cut -d" " -f1 # | copy'

# libsource management
alias lib-add='python3 ~/.dotfiles/.clauderc/scripts/libsource-add.py'
alias lib-list='python3 ~/.dotfiles/.clauderc/scripts/libsource-list.py'
alias lib-update='python3 ~/.dotfiles/.clauderc/scripts/libsource-update.py'
alias lib-delete='python3 ~/.dotfiles/.clauderc/scripts/libsource-delete.py'
