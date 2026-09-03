# List files with eza; `l -m` adds mtime
function l() {
    local args=(--all --long --header --color=always --icons --group-directories-first --binary --no-user --git)
    [[ "$1" == "-m" ]] && shift || args+=(--no-time)
    eza "${args[@]}" "$@"
}

# processes on a tcp port — `port` = 3000, `port 5177` = that one
function port() {
    lsof -i tcp:"${1:-3000}"
}

# cleanup branches: `gprune` lists · `gprune -d` deletes local · `gprune -d rmt` also deletes merged branches on origin
function gprune() {
    git fetch --prune
    # %(worktreepath) is non-empty for a branch checked out in any worktree, the current
    # one included. git refuses to delete those, so they are held back rather than piped
    # into `branch -D`, which used to fail the whole prune partway.
    local refs=$(git for-each-ref --format='%(refname:short)%09%(upstream:track)%09%(worktreepath)' refs/heads)
    local gone=$(echo "$refs" | awk -F'\t' '$2 == "[gone]" && $3 == "" { print $1 }')
    local held=$(echo "$refs" | awk -F'\t' '$2 == "[gone]" && $3 != "" { print $1 }')
    local merged=$(git branch --merged | grep -Ev '^[*+]' | grep -Ev '(^|\s+)(main|master|dev|develop)$' | tr -d ' ')
    if [[ -z "$gone" && -z "$merged" ]]; then
        echo "✨ nothing to prune — every branch is alive or unmerged"
        [[ -n "$held" ]] && { echo "held by a worktree:"; echo "$held" }
        return
    fi
    if [[ "$1" != "-d" ]]; then
        echo "gone on remote:"; echo "$gone"; echo "merged:"; echo "$merged"
        [[ -n "$held" ]] && { echo "held by a worktree (skipped):"; echo "$held" }
        return
    fi
    [[ -n "$gone" ]] && echo "$gone" | xargs git branch -D
    [[ -n "$merged" ]] && echo "$merged" | xargs git branch -d
    if [[ "$2" == "rmt" && -n "$merged" ]]; then
        echo "$merged" | xargs -I{} git push origin --delete {}
    fi
}

# github cli: bare `go` opens the repo on github; with arguments it is the Go toolchain
# (/opt/homebrew/bin/go, sline is written in Go), so a plain alias would shadow it (DOT-68)
go() { if (( $# )); then command go "$@"; else gh browse; fi }

# Add to git stage, commit and push — `acp "message"`
# Chained on purpose: a zsh function does not stop on error, so an unchained
# sequence pushed even when the commit was rejected — failing hook, nothing
# staged, empty message — publishing whatever the branch already held.
function acp() {
    git add . && git commit -m "$1" && git push
}

# mkdir + cd in one move (ex-omz `take`)
function take() {
    mkdir -p "$1" && cd "$1"
}

# Universal unarchiver (ex-omz `extract`)
function extract() {
    case "$1" in
        *.tar.gz | *.tgz | *.tar.bz2 | *.tbz2 | *.tar.xz | *.tar) tar xf "$1" ;;
        *.zip) unzip "$1" ;;
        *.gz) gunzip "$1" ;;
        *.7z) 7z x "$1" ;;
        *) echo "extract: unknown archive: $1" ;;
    esac
}

# llms
function cute() {
  claude --remote-control "${*:-$(date +%s)}"
}
