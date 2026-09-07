# command usage log — the problem identifier for "what should be automated?"
# one tab-separated line per interactive command: epoch, first word, kind, repo.
# first word only: never arguments, never paths, never secrets.
# generated data, so it lives in ~/.local/share, never in the dotfiles repo.

CMDLOG_FILE=${CMDLOG_FILE:-$HOME/.local/share/cmdlog.tsv}

_cmdlog_preexec() {
    local -a words; words=(${(z)1})
    local word=$words[1] kind repo
    [[ -n $word ]] || return
    kind=$(whence -w -- $word 2>/dev/null) || kind="$word: none"
    kind=${kind#*: }
    repo=${$(git rev-parse --show-toplevel 2>/dev/null):t}
    print -r -- "$EPOCHSECONDS	$word	$kind	${repo:--}" >> $CMDLOG_FILE
}

zmodload zsh/datetime
autoload -Uz add-zsh-hook
mkdir -p ${CMDLOG_FILE:h}
add-zsh-hook preexec _cmdlog_preexec

# cmdstats [days] — top commands and top pairs, for deciding what to automate
cmdstats() {
    local days=${1:-30} since
    zmodload zsh/datetime
    since=$(( EPOCHSECONDS - days * 86400 ))
    [[ -s $CMDLOG_FILE ]] || { print "cmdlog empty: $CMDLOG_FILE"; return 1 }

    print -P "%B── top commands · last $days days ──%b"
    awk -F'\t' -v s=$since '$1>=s {c[$2"\t"$3]++} END {for (k in c) printf "%6d  %s\n", c[k], k}' $CMDLOG_FILE |
        sort -rn | head -25

    print -P "\n%B── top pairs (ran back to back, same minute) ──%b"
    awk -F'\t' -v s=$since '$1>=s { if (p != "" && $1-t <= 60) c[p" → "$2]++; p=$2; t=$1 } END {for (k in c) printf "%6d  %s\n", c[k], k}' $CMDLOG_FILE |
        sort -rn | head -15
}
