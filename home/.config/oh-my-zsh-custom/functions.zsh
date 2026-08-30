# List files with eza
# TODO revalidate eza argument list after exa deprecation
function l() {
    if [ "$#" -eq "0" ]; then
        eza --all --long --header --color=always --icons --group-directories-first --binary --no-user --no-time --git
    elif [[ "$1" == "-m" ]]; then
        eza --all --long --header --color=always --icons --group-directories-first --binary --no-user --git
    else
        eza --all --long --header --color=always --icons --group-directories-first --binary --no-user --git "$1"
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
