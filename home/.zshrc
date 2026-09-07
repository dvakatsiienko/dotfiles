# .zshrc should contain: aliases, functions, prompt themes, interactive features

# Completions — the dump is generated data, so ~/.cache
autoload -Uz compinit
compinit -d ~/.cache/zsh/zcompdump

# A bare directory path is a cd — `..`, `...` (global alias) and `~/projects` all work; omz used to set this
setopt auto_cd

# Custom aliases and functions
for f in ~/.config/zsh-custom/*.zsh; do source $f; done

# Custom zsh plugins installed with homebrew because antigen (zsh plugin manager) is deprecated.
source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# Tools that print their own init code get it cached and stamped with the
# version that produced it, so an upgrade regenerates and nothing can go stale
# unnoticed. The cache is generated data — it lives in ~/.cache, never in the
# dotfiles repo.
zsh_init_cached() {           # $1 = binary, rest = the command that prints init
    local name=$1; shift
    local cache="$ZSH_INIT_CACHE_DIR/$name.zsh"
    local stamp="$ZSH_INIT_CACHE_DIR/$name.version"
    local bin version

    # the binary's mtime is the version: a `--version` subprocess per tool per tab cost ~30 ms
    bin=$(whence -p $name) || { eval "$("$@")"; return }
    zmodload -F zsh/stat b:zstat
    version=$(zstat +mtime $bin)

    if [[ ! -s $cache || $version != "$(<$stamp 2>/dev/null)" ]]; then
        mkdir -p $ZSH_INIT_CACHE_DIR
        "$@" > $cache || return
        print -r -- "$version" > $stamp
    fi

    source $cache
}

zsh_init_cached fnm fnm env --use-on-cd --version-file-strategy=recursive
zsh_init_cached starship starship init zsh
zsh_init_cached zoxide zoxide init zsh
