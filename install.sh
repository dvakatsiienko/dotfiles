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

dir=~/.dotfiles                                                             # dotfiles directory

vimPluginsDir=$dir/.vim/plugin                                              # personal Vim plugins directory
vimSpellDir=$dir/.vim/spell
olddir=~/.dotfiles_old                                                      # old dotfiles backup directory
files=".npmrc .vimrc .zshrc .ctags .hyper.js .gitconfig .yarnrc .prettierrc"            # list of files/folders to symlink in homedir
vimPlugins="AddSubstract.vim GlobalHunkNav.vim ResCur.vim Functional.vim Stab.vim WordCount.vim"       # list of personal Vim plugins
spellFiles="en.utf-8.add en.utf-8.add.spl"

########## Action

# create dotfiles_old in homedir
echo "Creating $olddir for backup of any existing dotfiles in ~"
mkdir -p $olddir
echo "...done"

# create plugin directory for personal plugins
echo "Creating $vimPluginsDir for for personal Vim plugins."
mkdir -p ~/.vim/plugin
mkdir -p ~/.vim/spell
echo "...done"

# change to the dotfiles directory
echo "Changing to the $dir directory"
cd $dir
echo "...done"

# move any existing dotfiles in homedir to dotfiles_old directory, then create symlinks 
for file in $files; do
        echo "Moving any existing dotfiles from ~ to $olddir"
            mv ~/$file ~/.dotfiles_old/
                echo "Creating symlink to $file in home directory."
                    ln -s $dir/$file ~/$file
                done

# create symlinks to personal Vim plugins
for plugin in $vimPlugins; do
        echo "Creating syblink to $plugin in .vim/bundle directory."
            ln -s $vimPluginsDir/$plugin ~/.vim/plugin/$plugin
        done

for spellFile in $spellFiles; do
    ln -s $vimSpellDir/$spellFile ~/.vim/spell/$spellFile
done

# backup and symlink ssh configs
mv ~/.ssh/config ~/.dotfiles_old
ln -s $dir/.ssh/config ~/.ssh/config

echo "Operation completed."
