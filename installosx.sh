# Pre-requisite - system ssh agent setup  with keys

echo 'Setting up a blazingly fast keyboard repeat rate'
defaults write NSGlobalDomain KeyRepeat -int 1

echo 'Setting up a shorter delay until key repeat'
defaults write NSGlobalDomain InitialKeyRepeat -int 10

echo 'Disabling key Character Accent Menu (foreing characters like ø)'
defaults write -g ApplePressAndHoldEnabled -bool false

echo 'Installing Powerline Fonts (spaceship-prompt dependency)'
git clone git@github.com:powerline/fonts.git ~/fonts && sh ~/fonts/install.sh && rm -rf ~/fonts

echo 'Installing Nerd Fonts'
git clone git@github.com:ryanoasis/nerd-fonts.git ~/nerd-fonts && cd ~/nerd-fonts && ./install.sh && cd ~ && rm -rf ~/nerd-fonts

echo 'Installing classic formulas'
brew install exa bat the_silver_searcher fzf httpie rename
# the_silver_searcher — a code searching tool similar to ack, with a focus on speed (source code).
# fzf — 🌸 A command-line fuzzy finder (directories).
# httpie — is a command line HTTP client with an intuitive UI, JSON support, syntax highlighting, wget-like downloads, plugins, and more.
# exa — a modern version of ls.
# rename — rename [switches|transforms] [files] (http://plasmasturm.org/code/rename/).
# bat — A cat(1) clone with wings.
# ‼️  do not forget to install z.

# Install Vim-Plug into ~/.vim/autoload
curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
    https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

