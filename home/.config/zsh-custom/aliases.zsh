# Delete all built-in aliases
unalias -m '*'

# system
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
alias kk='kill -9'
alias rmx='trash'
alias fpson='/bin/launchctl setenv MTL_HUD_ENABLED 1'
alias fpsoff='/bin/launchctl setenv MTL_HUD_ENABLED 0'

# shell + editor
alias rezsh='exec zsh'
alias ezsh='nvim ~/.zshrc'
alias ealiases='nvim ~/.config/zsh-custom/aliases.zsh'
alias evim='nvim ~/.vimrc'

# git vibe — dima's hands; vocabulary owned by DOT-37
alias grab='git add .'
alias mana='git commit'
alias vibe='git commit -m'
alias vibetune='git commit --amend'
alias slay='git push'
alias slayer='git push --force'
alias sup='git status -s'
alias chill='git rebase -i $(git merge-base HEAD master)'

# git
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
alias gpl='git pull'
alias gcl='git clone'
alias gba='git branch -a'
alias gbD='git branch -D'
alias grb='git rebase'
alias grbi='git rebase -i'
alias grba='git rebase --abort'
alias grbc='git rebase --continue'
alias grh='git reset --hard'
alias gfp='git fetch --prune'
alias gwa='git worktree add'
alias gwl='git worktree list'
alias gwr='git worktree remove'
alias gg='git log --oneline | gum filter | cut -d" " -f1'

# github cli
# PROBLEM (DOT-68): this wants to be `go`, and muscle memory types `go`. It cannot be —
# bare `go` opens the repo on github; with arguments it is the Go toolchain
# (/opt/homebrew/bin/go, sline is written in Go) — a plain alias would shadow it.
go() { if (( $# )); then command go "$@"; else gh browse; fi }

# pnpm
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
alias pnd='pnpm dev'
alias pns='pnpm start'
alias pnb='pnpm build'
alias tb='turbo'

# llms
alias cc='claude'
alias cclio='cd ~/dotfiles/cclio && claude --remote-control "💻 cclio"'
alias cclio-list='~/dotfiles/cclio/.claude/hooks/boot-prefetch.sh'
