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

# cleanup branches — `gprune -h` prints the contract; tab shows the flags
function gprune() {
    local B=$'\e[1;34m' Y=$'\e[1;33m' R=$'\e[1;31m' D=$'\e[2;37m' T=$'\e[1;32m' G=$'\e[1;32m' N=$'\e[0m'
    if [[ "$1" == "-h" || "$1" == "--help" ]]; then
        cat <<USAGE
gprune               list what is safe to delete, and what is held and why
gprune -d            delete the safe set locally (merged, or remote gone + nothing unmerged)
gprune -d rmt        …and delete the merged ones on origin too
gprune -D            walk the held branches one by one, ask y/n each — the force lane
gprune --stale [Nd]  list unmerged branches untouched for N days (default 90) as candidates
USAGE
        return
    fi
    git fetch --prune
    if [[ "$1" == "--stale" ]]; then
        local days=${2%d}; days=${days:-90}
        echo "${Y}unmerged, untouched for ${days}+ days${N}"
        git for-each-ref --sort=committerdate --format='%(refname:short)%09%(committerdate:unix)%09%(committerdate:relative)' refs/heads \
        | while IFS=$'\t' read -r name ts rel; do
            (( ts > $(date +%s) - days*86400 )) && continue
            [[ "$name" == main ]] && continue
            printf "  ${B}%s${N}  ${T}%s${N}\n" "$name" "$rel"
        done
        return
    fi
    # %1f = the ascii unit separator: a tab would collapse the empty worktree field in zsh
    local refs=$(git for-each-ref --format='%(refname:short)%1f%(upstream:track)%1f%(worktreepath)%1f%(committerdate:relative)' refs/heads)
    local gone=() held=() heldnames=()
    while IFS=$'\x1f' read -r name track wt age; do
        [[ "$track" != "[gone]" ]] && continue
        if [[ -n "$wt" ]]; then held+=("$name  ${T}$age${N} ${D}· checked out in ${wt}${N}"); heldnames+=("$name"); continue; fi
        local n=$(git rev-list --count main.."$name")
        if (( n > 0 )); then
            # squash-merged? replay the branch as ONE commit on its merge-base and ask
            # `git cherry` whether main already holds that exact patch ("-" = yes)
            local tmp=$(git commit-tree "$name^{tree}" -p "$(git merge-base main "$name")" -m squash-probe)
            if [[ "$(git cherry main "$tmp")" == -* ]]; then gone+=("$name  ${T}$age${N} ${D}· squash-merged${N}")
            else held+=("$name  ${T}$age${N} ${D}·${N} ${R}carries $n commit(s) main lacks${N}"); heldnames+=("$name"); continue; fi
        else gone+=("$name  ${T}$age${N}"); fi
    done <<< "$refs"
    local merged=$(git branch --merged | grep -Ev '^[*+]' | grep -Ev '(^|\s+)(main|master|dev|develop)$' | tr -d ' ')
    local local_only=$(git for-each-ref --format='%(refname:short)%09%(upstream:short)%09%(committerdate:relative)' refs/heads | awk -F'\t' '$2=="" && $1!~/^(main|master|dev|develop)$/ {print "  " $1 "  " $3}')
    if (( ${#gone} == 0 )) && [[ -z "$merged" ]] && (( ${#held} == 0 )) && [[ -z "$local_only" ]]; then
        echo "${G}✨ nothing to prune${N} — every branch is alive or unmerged"; return
    fi
    (( ${#gone} ))  && { echo "${Y}remote gone, nothing unmerged${N}"; printf "  ${B}%s\n" "${gone[@]}"; }
    [[ -n "$merged" ]] && { echo "${Y}merged into main${N}"; echo "$merged" | sed "s/^/  ${B}/;s/\$/${N}/"; }
    (( ${#held} ))  && { echo "${D}held, not touched${N}"; printf "  ${B}%s\n" "${held[@]}"; }
    [[ -n "$local_only" ]] && { echo "${D}local only, never pushed — ${R}-D${D} walks them${N}"; echo "$local_only" | sed "s/^  /  ${B}/;s/\$/${N}/"; }
    if [[ "$1" == "-D" ]]; then
        # every unmerged local branch, not only the [gone] ones — a branch never pushed has no
        # upstream to be gone, and used to slip past this lane entirely (bytes, 2026-09-05)
        local b; for b in $(git for-each-ref --format='%(refname:short)' refs/heads | grep -Ev '^(main|master|dev|develop)$'); do
            (( $(git rev-list --count main.."$b") == 0 )) && continue
            git worktree list --porcelain | grep -qx "branch refs/heads/$b" && { echo "${D}$b is checked out in a worktree, skipping${N}"; continue; }
            if read -q "?${R}force-delete${N} $b ${D}($(git log -1 --format=%cr "$b"), $(git rev-list --count main.."$b") ahead)${N}? [y/N] "; then echo; git branch -D "$b"; else echo; fi
        done
        return
    fi
    [[ "$1" != "-d" ]] && return
    (( ${#gone} )) && printf '%s\n' "${gone[@]%%  *}" | xargs git branch -D
    [[ -n "$merged" ]] && echo "$merged" | xargs git branch -d
    if [[ "$2" == "rmt" && -n "$merged" ]]; then
        echo "$merged" | xargs -I{} git push origin --delete {}
    fi
}
# tab completion: the flags with their meaning
_gprune() {
    _arguments \
        '-d[delete the safe set locally]' \
        '-D[force lane: walk held branches, ask y/n each]' \
        '--stale[unmerged branches untouched for N days, default 90]' \
        '-h[print the contract]' \
        '1: :(rmt)'
}
compdef _gprune gprune

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
