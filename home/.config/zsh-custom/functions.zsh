# List files with eza; `l -m` adds mtime
function l() {
    local args=(--all --long --header --color=always --icons --group-directories-first --binary --no-user --git)
    [[ "$1" == "-m" ]] && shift || args+=(--no-time)
    eza "${args[@]}" "$@"
}

# processes on a tcp port, 3000 by default
function port() {
    lsof -i tcp:"${1:-3000}"
}

# gone-upstream + merged branches: list, or delete with -d
function gprune() {
    git fetch --prune
    local gone=$(git for-each-ref --format='%(refname:short) %(upstream:track)' refs/heads | awk '$2 == "[gone]" { print $1 }')
    local merged=$(git branch --merged | grep -v '^\*' | grep -Ev '(^|\s+)(main|master|dev|develop)$')
    if [[ "$1" == "-d" ]]; then
        [[ -n "$gone" ]] && echo "$gone" | xargs git branch -D
        [[ -n "$merged" ]] && echo "$merged" | xargs git branch -d
    else
        echo "gone:"; echo "$gone"; echo "merged:"; echo "$merged"
    fi
}

# Add to git stage, commit and push
# Chained on purpose: a zsh function does not stop on error, so an unchained
# sequence pushed even when the commit was rejected — failing hook, nothing
# staged, empty message — publishing whatever the branch already held.
function acp() {
    git add . && git commit -m "$1" && git push
}

function cute() {
  claude --remote-control "${*:-$(date +%s)}"
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
