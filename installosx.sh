# Pre-requisite - system ssh agent setup  with keys

echo 'Setting up a blazingly fast keyboard repeat rate'
defaults write NSGlobalDomain KeyRepeat -int 1

echo 'Setting up a shorter delay until key repeat'
defaults write NSGlobalDomain InitialKeyRepeat -int 10

echo 'Disabling key Character Accent Menu (foreing characters like ø)'
defaults write -g ApplePressAndHoldEnabled -bool false

echo 'Turn off annoying FaceTime ringer on Mac'
sudo defaults write ~/Library/Containers/com.apple.tonelibraryd/Data/Library/Preferences/com.apple.ToneLibrary.plist ringtone "system:"

Revert to default settings with:
defaults delete NSGlobalDomain KeyRepeat
defaults delete NSGlobalDomain InitialKeyRepeat

echo 'Installing xcode command line tools...'
xcode-select --install

echo 'Installing ohmyz.sh'
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"

echo 'Switching to zsh'
if [ $SHELL != '/bin/zsh' ]; then
    chsh -s $(which zsh)
    exec zsh
else
    echo 'Shell is already switched to zsh'
fi

echo 'Installing zplug...'
curl -sL --proto-redir -all,https https://raw.githubusercontent.com/zplug/installer/master/installer.zsh | zsh

echo "Applying installed zplug..."
source ~/.zshrc

echo 'Activating zplug install mechanism...'
zplug install

echo "Installing nvm..."
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash

echo "Applying installed nvm..."
source ~/.zshrc

echo "Installing node..."
nvm install --lts

echo "Installing npm..."
nvm install --latest-npm

echo 'Installning Homebrew...'
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

echo 'Fixing Homebrew permissions'
sudo chown -R "$USER":admin /usr/local

echo "Installing Yarn without node (because nvm is already installed)..."
brew install yarn --without-node

echo 'Deleting old bash meta info'
rm ~/.bash_history
rm -rf ~/.bash_sessions

echo 'Installing Powerline Fonts (spaceship-prompt dependency)'
git clone git@github.com:powerline/fonts.git ~/fonts && sh ~/fonts/install.sh && rm -rf ~/fonts

echo 'Installing Nerd Fonts'
git clone git@github.com:ryanoasis/nerd-fonts.git ~/nerd-fonts && cd ~/nerd-fonts && ./install.sh && cd ~ && rm -rf ~/nerd-fonts

echo "Activating terminal themes"
open ~/.dotfiles/themes/gruvbox-dark.terminal
open ~/.dotfiles/themes/gruvbox-light.terminal
open ~/.dotfiles/themes/Treehouse.terminal

echo 'Installing classic formulas'
brew install the_silver_searcher httpie googler fzf hub exa youtube-dl rename

echo "Installing classic packages"
yarn global add npx node-ip http-server create-react-app speed-test tldr trash-cli empty-trash-cli

echo "Installing core rc files"
sh ~/.dotfiles/install.sh

echo "Installing zsh plugins via zplug"
zplug install

echo "Applying changes"
source ~/.zshrc
