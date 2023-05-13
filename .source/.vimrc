vim9script

# Editing
filetype plugin indent on # ?
set tabstop=4             # show existing tab with 4 spaces width
set shiftwidth=4          # when indenting with '>', use 4 spaces width
set expandtab             # On pressing tab, insert 4 spaces
set number                # show line numbers

# Style
syntax on


plug#begin() # Start Vim-Plug plugin list

Plug 'tpope/vim-sensible'
Plug 'tpope/vim-surround'
Plug 'tpope/vim-commentary'
Plug 'morhetz/gruvbox'
Plug 'itchyny/lightline.vim'

plug#end() # End Vim-Plug plugin list

# Activate and configure gruvbox theme
autocmd vimenter * ++nested colorscheme gruvbox
g:gruvbox_contrast_dark = 'hard'
