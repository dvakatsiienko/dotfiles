# Pre-requisite - system ssh agent setup  with keys

echo 'Setting up a blazingly fast keyboard repeat rate'
defaults write NSGlobalDomain KeyRepeat -int 1

echo 'Setting up a shorter delay until key repeat'
defaults write NSGlobalDomain InitialKeyRepeat -int 10

echo 'Disabling key Character Accent Menu (foreing characters like ø)'
defaults write -g ApplePressAndHoldEnabled -bool false

echo 'Turn off annoying FaceTime ringer on Mac'
sudo defaults write ~/Library/Containers/com.apple.tonelibraryd/Data/Library/Preferences/com.apple.ToneLibrary.plist ringtone "system:"

# Revert to default settings with:
# defaults delete NSGlobalDomain KeyRepeat
# defaults delete NSGlobalDomain InitialKeyRepeat

echo 'Installing xcode command line tools...'
xcode-select --install

echo 'Installning Homebrew...'
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

echo 'Fixing Homebrew permissions'
sudo chown -R "$USER":admin /usr/local

echo "Installing Yarn..."
curl -o- -L https://yarnpkg.com/install.sh | bash

echo 'Deleting old bash meta info'
rm ~/.bash_history
rm -rf ~/.bash_sessions

echo 'Installing omzsh'
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"

echo 'Switching to zsh'
if [ $SHELL != '/bin/zsh' ]; then
    chsh -s $(which zsh)
    exec zsh
else
    echo 'Shell is already switched to zsh'
fi

echo "Installing .dotfiles"
cd ~ && git clone git@github.com:dvakatsiienko/.dotfiles.git
sh ~/.dotfiles/install.sh

echo "Installing nvm..."
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash

echo "Applying installed nvm..."
source ~/.zshrc

echo "Installing node..."
nvm install --lts

echo "Installing npm..."
nvm install --latest-npm

echo "Applying installed npm..."
source ~/.zshrc

echo 'Installing classic brew formulas'
brew install the_silver_searcher
brew install httpie
brew install macvim

echo 'Installing set of cask formulas'
brew cask install atom
brew cask install google-chrome
brew cask install google-drive
brew cask install firefox
brew cask install postman
brew cask install hyper
brew cask install iterm2
brew cask install skype
brew cask install alfred
brew cask install sip
brew cask install cloudapp
brew cask install appcleaner
brew cask install battle-net
open /usr/local/Caskroom/battle-net/latest/Battle.net-Setup.app
brew cask install steam
brew cask install vlc
brew cask install transmission

echo 'Installing Vim from binaries'
sudo mkdir -p /opt/local/bin
cd ~
git clone https://github.com/vim/vim.git
cd vim
./configure --prefix=/opt/local --with-features=huge --enable-pythoninterp
make
sudo make install

echo 'Installing Vim Plug'
curl -fLo ~/.vim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

echo 'Installing Powerline Fonts'
git clone git@github.com:powerline/fonts.git ~/fonts && sh ~/fonts/install.sh && rm -rf ~/fonts

echo 'Installing Nerd Fonts'
git clone git@github.com:ryanoasis/nerd-fonts.git ~/nerd-fonts && cd ~/nerd-fonts && ./install.sh && cd ~ && rm -rf ~/nerd-fonts

echo "Installing Spaceship zsh theme"
npm install -g spaceship-zsh-theme

echo "Installing syntax highlighting"
cd ~/.oh-my-zsh/plugins
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

echo "Activating terminal themes"
open ~/.dotfiles/themes/gruvbox-dark.terminal
open ~/.dotfiles/themes/gruvbox-light.terminal
open ~/.dotfiles/themes/Treehouse.terminal


