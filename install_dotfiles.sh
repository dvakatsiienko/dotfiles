###################################################################################################
# install_dotfiles.sh
# This script creates symlinks from the home directory to any desired dotfiles in ~/.dotfiles
###################################################################################################

########## Variables
dotfiles_source_dir=~/.dotfiles/.source # ? dotfiles source directory
dotfiles_backup_dir=~/.dotfiles_backup  # ? dotfiles backup directory
dotfile_list=".hushlogin"               # ? list of files/folders to symlink in homedir
# files=".zshrc .zprofile .zshenv .zshrc .vimrc .yarnrc .hushlogin" # ? list of files/folders to symlink in homedir. Description of zsh files https://apple.stackexchange.com/questions/388622/zsh-zprofile-zshrc-zlogin-what-goes-where

# TODO
# ~/.config/oh-my-zsh-custom/functions.zsh
# ~/.config/oh-my-zsh-custom/aliases.zsh

# go to the dotfiles directory
echo "Changing to the $dotfiles_source_dir directory"
cd $dotfiles_source_dir
echo "...done"

# create dotfiles_old in homedir
echo "Creating $dotfiles_backup_dir for backup of any existing dotfiles in ~"
mkdir -p $dotfiles_backup_dir
echo "...done"

# move any existing dotfiles in home diretroy to .dotfiles_backup directory, then create symlinks
for dotfile in $dotfile_list; do
        echo "Moving any existing dotfiles from ~ to $dotfiles_backup_dir"
            mv ~/$dotfile $dotfiles_backup_dir
                echo "Creating symlink to $dotfile in home directory."
                    ln -s $dotfiles_source_dir/$dotfile ~/$dotfile
                done

# TODO
# backup and symlink ssh configs
mv ~/.ssh/config $dotfiles_backup_dir
ln -s $dotfiles_source_dir/.ssh/config ~/.ssh/config

echo "Operation completed."
