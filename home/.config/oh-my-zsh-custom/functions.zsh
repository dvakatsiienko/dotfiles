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
function acp() {
    git add .
    git commit -m "$1"
    git push
}
