# tabnew Get current dir (so run this script from anywhere)

# export DOTFILES_DIR EXTRA_DIR
# DOTFILES_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# EXTRA_DIR="$HOME/.extra"
# echo DOFTILES_DIR

###################################################################################################
# install.sh
# This script creates symlinks from the home directory to any desired dotfiles in ~/.dotfiles
###################################################################################################

########## Variables
dir=~/.dotfiles        # dotfiles directory
olddir=~/.dotfiles_old # old dotfiles backup directory

files=".vimrc .hushlogin .zprofile .npmrc .zshrc .yarnrc .prettierrc .gitignore_global" # list of files/folders to symlink in homedir

# go to the dotfiles directory
echo "Changing to the $dir directory"
cd $dir
echo "...done"

# create dotfiles_old in homedir
echo "Creating $olddir for backup of any existing dotfiles in ~"
mkdir -p $olddir
echo "...done"

# move any existing dotfiles in homedir to dotfiles_old directory, then create symlinks
for file in $files; do
        echo "Moving any existing dotfiles from ~ to $olddir"
            mv ~/$file ~/.dotfiles_old/
                echo "Creating symlink to $file in home directory."
                    ln -s $dir/$file ~/$file
                done

# backup and symlink ssh configs
mv ~/.ssh/config ~/.dotfiles_old
ln -s $dir/.ssh/config ~/.ssh/config

echo "Operation completed."
