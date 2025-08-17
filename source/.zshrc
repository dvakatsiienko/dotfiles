# .zshrc should contain: aliases, functions, prompt themes, interactive features

# oh-my-zsh plugins
plugins=()

source $ZSH/oh-my-zsh.sh

# Custom zsh plugins installed with homebrew because antigen (zsh plugin manager) is deprecated.
source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# fnm - Node.js version manager initialization
eval "`fnm env`"
eval "$(fnm env --use-on-cd --version-file-strategy=recursive)"

# Init starship
eval "$(starship init zsh)"


# zoxide - directory navigation
source $ZSH_CUSTOM/functions-zoxide.zsh
