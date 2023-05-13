# Oh My Zsh
export ZSH=$HOME/.oh-my-zsh # Path to oh-my-zsh installation.
export ZSH_COMPDUMP=$ZSH/cache/.zcompdump-$HOST # Store zsh's completion cache inside oh-my-zsh cache folder

# Oh My Zsh config variables
ZSH_CUSTOM=~/.config/oh-my-zsh-custom # my oh-my-zsh customization folder. contains aliases, functions, plugins, etc.

# Oh My Zsh plugins
plugins=( z )

# TODO: Try plugins
# plugins=(alias-finder brew common-aliases copydir copyfile docker docker-compose dotenv encode64 extract git jira jsontools node npm npx osx urltools vscode web-search z)

# Init Oh My Zsh after its config variables are set
source $ZSH/oh-my-zsh.sh

. $(brew --prefix)/share/zsh-autosuggestions/zsh-autosuggestions.zsh
. $(brew --prefix)/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# User Configuration
export EDITOR=vim # Default editor
export BAT_THEME=gruvbox-dark # Set bat theme
export FZF_DEFAULT_COMMAND='find * -type f' # tells fzf to include hiden files in search results

# init nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Init starship
eval "$(starship init zsh)"

