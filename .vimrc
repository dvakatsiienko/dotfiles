" 🌙 """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" 🌙
"   Filename: .vimrc                                                                              "
" Maintainer: Mike Midnight <imagnum.satellite@gmail.com>                                         "
"        URL: http://github.com/mike-midnight/.dotfiles                                           "
"                                                                                                 "
"                                                                                                 "
" Sections:                                                                                       "
"   01. General ....................... General Vim behavior                                      "
"   02. UI ............................ Syntax, colors, fonts, etc                                "
"   03. Autocommands .................. Autocmd events                                            "
"   04. Layout ........................ Text, tabs, indentation related                           "
"   05. Mappings: editing ............. General text editing                                      "
"   06. Mappings: layout .............. Major layout editing: inserting/replacing lines etc...    "
"   07. Abbreviations ................. Custom abbreviations                                      "
"   08. Plugs ......................... List of plugins for install                               "
"   09. Plugs settings ................ Plugins settings                                          "
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" 01. General                                                                                     "
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

set nocompatible                      " Disables Vi compatibility (much better!)
set encoding=utf-8
set hidden                            " Hides buffers instead of closing them when
set history=200                       " Remember more commands and search history
set undolevels=100                    " Use many levels of undo
set wildmenu                          " Command-line completion operates in an enhanced mode
set wildmode=list:longest             " Completion mode that is used for wildchar character
set wildignore+=*/tmp/*,*.so,*.swp,*.zip
set visualbell                        " Use visual bell instead of beeping
set undofile                          " Gives the ability to undo file even after closing it
set shell=/bin/zsh
set ttyfast                           " Indicates a fast terminal connection, improves performance
set path+=**
set updatetime=200                    " Inactivity delay before swp is written, requried forGitgutter
set nrformats-=octal                  " Incrementing values

" Tell vim to remember certain things when we exit
"  '10  :  marks will be remembered for up to 10 previously edited files
"  "100 :  will save up to 100 lines for each register
"  :20  :  up to 20 lines of command-line history will be remembered
"  %    :  saves and restores the buffer list
"  n... :  where to save the viminfo files
set viminfo='10,\"100,:20,%,n~/.viminfo

" русский язык можно включить через CTRL+^
set keymap=russian-jcukenwin
set iminsert=0
set imsearch=0
highlight lCursor guifg=NONE guibg=Cyan

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" 02. UI                                                                                          "
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

if has("gui_macvim")
    " set fullscreen                   " MacVim automatic full screen mode on file open
    set fuopt+=maxhorz               " Grow to maximum screen size on entering full screen mode
endif

set guioptions-=r                    "remove right-hand scroll bar
set guioptions-=L                    "remove left-hand scroll bar
set guioptions-=T                    "remove toolbar
set guioptions-=m                    "remove menu bar
set guiheadroom=0                    "adjust gui behaivor to be more compact and console-like

set guifont=Droid\ Sans\ Mono\ for\ Powerline\ Nerd\ Font\ Complete:h14

syntax enable

set t_Co=256                         " Enable 256-color mode.

set ruler                            " Show the line and column number of the cursor position
set number
set numberwidth=2
set list listchars=tab:»·,trail:·,nbsp:·
set nojoinspaces

set laststatus=2                     " Last window always has a status line

set ignorecase                       " Searches are case insensitive...
set smartcase                        " ... unless they contain at least one capital letter
set incsearch                        " But do highlight as you type your search.
set showmatch
set nohlsearch                       " Do not continue to highlight searched phrases.

set showmode                         " Show current modal editing mode
set showcmd                          " Show command in the last line of the screen

set statusline=\ ✪
set statusline+=\ λ
set statusline+=\ ✪
set statusline+=\ %4F                " Path to the file
set statusline+=\ •\                 " Separator
set statusline+=FileType:            " Label
set statusline+=%-4y                 " Filetype of the file
set statusline+=\ %h%m%r%{fugitive#statusline()} " Fugitive git status
set statusline+=\ [%{ALEGetStatusLine()}] " Ale linting errors

set statusline+=%=                   " Switch to the right side

set statusline+=\ W:
set statusline+=%{WordCount()}
set statusline+=\ Ch:
set statusline+=%{\ line2byte(line(\"$\")+1)-1\ }
set statusline+=\ Col:
set statusline+=%-2c
set statusline+=\ L:
set statusline+=%-4l               " Current line
set statusline+=\ T:
set statusline+=%-4L               " Total lines

" Shut down performance killers

set nocursorline
set norelativenumber

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" 03. Layout                                                                                      "
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

" tab ball                           " Opens a new tab for each open buffer
set splitright                       " Forces vsplits to be opened right
set splitbelow                       " Forces hsplits to be opened below

set backspace=indent,eol,start
set autoindent                       " Always set autoindenting on
set tabstop=4                        " Tab spacing
set softtabstop=4                    " Delete spaces by one
set shiftwidth=4
set shiftround
set expandtab

set nowrap                           " No wrap lines
set textwidth=100                    " The line length used in hard line wrapping
set colorcolumn=100                  " Code margin indicator + color
highlight ColorColumn ctermbg=magenta

set showmatch                        " Show matching parenthesis
set matchtime=5

set scrolloff=3                      " Minimal number of screen lines to keep above and below cursor
set sidescroll=1                     " Turn on smooth side scrolling
set sidescrolloff=5                  " Minimal number of screen cols to keep left and right of cursor

" Vertical and horizontal vindow resizing with ALT-arrows
nnoremap <s-left>  :vertical resize -1<CR>
nnoremap <s-right> :vertical resize +1<CR>
nnoremap <s-up>    :resize +1<CR>
nnoremap <s-down>  :resize -1<CR>

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" 04. Autocommands                                                                                "
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

if has ('autocmd')

    " Automatically wrties a newly created file
    autocmd BufNewFile * :w

    " Set local nowrap to all newly created or opened existing html files
    autocmd BufNewFile,BufRead *.html setlocal nowrap

    " Automatically writes all buffers on lost focus of the Vim
    autocmd FocusLost * :wa

    " Restores cursor position when opening a file
    augroup resCur
        autocmd!
        autocmd BufWinEnter * call ResCur()
    augroup END

    " Vimscript file settings ---------------------- {{{
    augroup filetype_vim
        autocmd!
        autocmd FileType vim setlocal foldmethod=marker
    augroup END
    " }}}

    augroup filetype_yml
        autocmd!
        autocmd FileType yaml setlocal ts=2 sts=2 sw=2 expandtab
    augroup END

    augroup filetype_js
        autocmd!
        autocmd FileType javascript nnoremap <buffer> <localleader>c I//<esc>
        autocmd FileType javascript iabbrev  <buffer> iff if ()
        autocmd FileType javascript iabbrev  <buffer> conts const
        autocmd FileType javascript iabbrev  <buffer> cotns const
        autocmd FileType javascript iabbrev  <buffer> fu function
        autocmd FileType javascript iabbrev  <buffer> fuction function

        autocmd FileType javascript inoremap cll console.log('λ', );<Esc>==f)i
        autocmd FileType javascript nnoremap cll yiwoconsole.log('λ', )<Esc>P
        autocmd FileType javascript set formatprg=prettier\ --stdin\ --parser\ flow\ --single-quote\ --trailing-comma\ none
    augroup END

    " ordering fix
    augroup filetype_md
        autocmd!
        autocmd FileType markdown   onoremap ih :<c-u>execute "normal! ?^==\\+$\r:nohlsearch\rk0vg_"<cr>
        autocmd FileType markdown   onoremap ah :<c-u>execute "normal! ?^==\\+$\r:nohlsearch\rg_vk0"<cr>
        autocmd FileType markdown   setlocal textwidth=100
        autocmd FileType markdown   setlocal colorcolumn=100
        autocmd FileType markdown   setlocal formatoptions=t  " Automatically inserts lbr while typing
        autocmd FileType markdown   setlocal formatoptions+=a " Adding `live-mode` enhancement
        autocmd FileType markdown   setlocal formatoptions+=l " ?
        autocmd FileType markdown   setlocal formatoptions+=q " ?
        autocmd FileType markdown   setlocal formatoptions+=n " ?
        autocmd FileType markdown   setlocal formatoptions+=r " ?
        autocmd FileType markdown   setlocal conceallevel=2
        autocmd FileType markdown   setlocal spell spelllang=en_us
    augroup END

    augroup filetype_py
        autocmd!
        autocmd FileType python     nnoremap <buffer> <localleader>c I#<esc>
        autocmd FileType python     iabbrev  <buffer> iff if:<left>
    augroup END


endif

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" 05. Mappings: editing                                                                           "
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

let mapleader = "\<space>"
let maplocalleader = "\\"

" Insert mode arrows ABCD fix
if &term[:4] == "xterm" || &term[:5] == 'screen' || &term[:3] == 'rxvt'
    inoremap <silent> <C-[>OC <RIGHT>
endif

set gdefault                                  " Applies substitutions globally on lines

" Disable ESC, and arrow keys in all modes
" inoremap  <Esc>    <nop>
inoremap  <up>     <nop>
inoremap  <right>  <nop>
inoremap  <down>   <nop>
inoremap  <left>   <nop>
noremap   <up>     <nop>
noremap   <right>  <nop>
noremap   <down>   <nop>
noremap   <left>   <nop>
inoremap  <up>     <nop>
inoremap  <right>  <nop>
inoremap  <down>   <nop>
inoremap  <left>   <nop>

nnoremap  <leader>ev :vsplit $MYVIMRC<cr>
nnoremap  <leader>sv :source $MYVIMRC<cr>

" inoremap jk <Esc>

" `g` prefix is made in order to navigate on every visual line in soft-wrap mode
nnoremap j gj
nnoremap k gk
nnoremap $ g$
nnoremap ^ g^
vnoremap j gj
vnoremap k gk
vnoremap $ g$
vnoremap ^ g^

" Uppercase a word
inoremap <c-u> <Esc>viwU<Esc>
nnoremap <c-u> viwU

" Adds period to visual mode
vnoremap . :norm.<CR>

onoremap p i(
onoremap b /return<cr>

onoremap in( :<c-u>normal! f(vi(<cr>
onoremap il( :<c-u>normal! F)vi(<cr>
onoremap an( :<c-u>normal! f(va(<cr>
onoremap al( :<c-u>normal! F)va(<cr>

onoremap in{ :<c-u>normal! f{vi{<cr>
onoremap il{ :<c-u>normal! F}vi{<cr>
onoremap an{ :<c-u>normal! f{va{<cr>
onoremap al{ :<c-u>normal! F}va{<cr>

" Navigate over splits with hjkl
nnoremap <C-h> <C-w>h
nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-l> <C-w>l

" Navigate current window to according farmost side
nnoremap <left>  <C-w>H
nnoremap <down>  <C-w>J
nnoremap <up>    <C-w>K
nnoremap <right> <C-w>L

" Rotate windows right
nnoremap <leader>r <C-w>r
" Rotate windows left
nnoremap <leader>e <C-w>R
" Exchange tab with the one next to right
nnoremap <leader>x <C-w>x

" Command-key navigation
map <D-S-]> gt
map <D-S-[> gT
map <D-1> 1gt
map <D-2> 2gt
map <D-3> 3gt
map <D-4> 4gt
map <D-5> 5gt
map <D-6> 6gt
map <D-7> 7gt
map <D-8> 8gt
map <D-9> 9gt
map <D-0> :tablast<CR>

" Strip whitespaces in current line
nnoremap <leader>W :%s/\s\+$//<cr>:let @/=''<CR>

nnoremap <leader>v :e ~/..vimrc<CR>
nnoremap <leader>v :tabnew ~/..vimrc<CR>

nnoremap <leader><space> :noh<cr>

" Fold HTML tag
nnoremap <leader>ft Vatzf

" Sort CSS properties
nnoremap <leader>S ?{<CR>jV/^\s*\}?$<CR>k:sort<CR>:noh<CR>

" Re-hardwrap paragraphs of text
nnoremap <leader>q gqip

" Reselect line of text that was just pasted
nnoremap <leader>v V`]

" Open a split and switch to it
nnoremap <leader>w <C-w>v<C-w>l

" Put a semicolong in the end of a line
nnoremap <leader>; mqA;<esc>`q

"bind ;; to insert ; at the end of the line
inoremap ;; <Esc>:startinsert!<CR>;<Esc>

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" 06. Mappings: layout                                                                            "
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

nnoremap - ddp
nnoremap _ ddkP
nnoremap <leader>+ O<Esc>
nnoremap <leader>= o<Esc>k

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" 07. Abbreviations                                                                               "
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

iabbrev fu function
iabbrev fuction function
iabbrev swtich switch
iabbrev swithc switch
iabbrev swithc switch
iabbrev r return
iabbrev retrun return

iabbrev improt import
iabbrev impotr import
iabbrev exprot export
iabbrev exprtr export
iabbrev ed export deafult

iabbrev tehn then
iabbrev calls class
iabbrev claas class
iabbrev extneds extends

iabbrev extedns extends
iabbrev extedns extends
iabbrev Componetn Component

iabbrev @@ imagnum.satellite@gmail.com

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" 08. Plugs                                                                                       "
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

call plug#begin('~/.vim/plugged')

" Navigation
Plug 'scrooloose/nerdtree'
Plug 'jistr/vim-nerdtree-tabs'
Plug 'tiagofumo/vim-nerdtree-syntax-highlight'

" Syntax highlighters
" Unresolved question of syntax highlighting
Plug 'pangloss/vim-javascript'
Plug 'jelera/vim-javascript-syntax'
Plug 'mxw/vim-jsx'
Plug 'othree/javascript-libraries-syntax.vim'
Plug 'sheerun/vim-polyglot'
Plug 'othree/es.next.syntax.vim'
" Unresolved question of syntax highlighting

" Linting
Plug 'w0rp/ale'

" vim-markdown and it's dependency - tabular
Plug 'plasticboy/vim-markdown', {'for': 'markdown'}
Plug 'godlygeek/tabular', {'for': 'markdown'}

" Color schemes
Plug 'morhetz/gruvbox'
Plug 'tomasr/molokai'
Plug 'sjl/badwolf'
Plug 'nanotech/jellybeans.vim'
Plug 'altercation/vim-colors-solarized'
Plug 'chriskempson/base16-vim'

" Git
Plug 'tpope/vim-fugitive'
Plug 'airblade/vim-gitgutter'

" Editing and formatting
Plug 'rstacruz/sparkup', {'rtp': 'vim/'}
Plug 'tpope/vim-surround'
Plug 'jiangmiao/auto-pairs'

" Autocomplete
Plug 'maralla/completor.vim', {'do': 'cd pythonx/completers/javascript && npm install'}

" Searching
Plug 'mhinz/vim-grepper'
Plug 'ctrlpvim/ctrlp.vim'
Plug 'haya14busa/incsearch.vim'

" devicons should be loaded after all other dependent plugins
Plug 'ryanoasis/vim-devicons'

" P.S.: call "plug#end()" utomatically executes "filetype plugin indent on" and "syntax enable"
call plug#end()

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" 09. Plugins settings                                                                            "
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

nnoremap <leader>pi :PlugInstall<CR>
nnoremap <leader>pu :PlugUpdate<CR>
nnoremap <leader>pc :PlugClean<CR>

"--------------------------------------------------------------------------------------------------
" ••••••••••••••••••••••••••••••••••••••• Colorschemes ••••••••••••••••••••••••••••••••••••••••••••
"--------------------------------------------------------------------------------------------------

colorscheme gruvbox
set background=dark

" Gruvbox
let g:gruvbox_contrast_dark='dark'
let g:gruvbox_contrast_light='soft'

let g:gruvbox_invert_selection=0
let g:gruvbox_italicize_comments=0

" Molokai
let g:molokai_original = 1
let g:rehash256 = 1

" Base16
let base16colorspace=256

"∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞

"--------------------------------------------------------------------------------------------------
" •••••••••••••••••••••••••••••••••• Syntax highlighting ••••••••••••••••••••••••••••••••••••••••••
"--------------------------------------------------------------------------------------------------

let g:jsx_ext_required = 0

" javascript-libraries-syntax.vim
let g:used_javascript_libs = 'react,d3,underscore,chai,jasmine'

"∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞

"--------------------------------------------------------------------------------------------------
" ••••••••••••••••••••••••••••••••••••••••• Linting •••••••••••••••••••••••••••••••••••••••••••••••
"--------------------------------------------------------------------------------------------------

" Dictionary of active linting tools
let g:ale_linters = {
\   'JavaScript': ['eslint', 'flow'],
\   'SCSS': 'all',
\   'CSS': 'all',
\   'JSON': 'all',
\   'Markdown': 'all'
\}

" Alays keep the sign gutter open at all times
let g:ale_sign_column_always = 1

" Custom Ale signs symbols
let g:ale_sign_error = '•>'
let g:ale_sign_warning = '•≈'
" let g:ale_sign_warning = '•≈'

" Custom Alle signs colors
highlight ALEErrorSign guibg=firebrick guifg=wheat
highlight ALEWarningSign guibg=gold guifg=black

" Custom statusline symbols
let g:ale_statusline_format = ['🔥 %d', '⚡️ %d', '🍀 OK']

let g:ale_echo_msg_error_str = '🔥'
let g:ale_echo_msg_warning_str = '⚡️'
let g:ale_echo_msg_format = '%severity% %linter%: %s'

" Ale navigation between linting asserts
nmap <silent> ]a <Plug>(ale_next_wrap)
nmap <silent> [a <Plug>(ale_previous_wrap)

"∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞

"--------------------------------------------------------------------------------------------------
" ••••••••••••••••••••••••••••••••••••••• NERDTree ••••••••••••••••••••••••••••••••••••••••••••••••
"--------------------------------------------------------------------------------------------------

augroup vimenter
    autocmd!

    " prevents NERDTree from hiding when first selecting a file
    autocmd VimEnter * if argc() == 1 && isdirectory(argv()[0]) && !exists("s:std_in") | exe 'NERDTree' argv()[0] | wincmd p | ene | endif

    " close vim if the only window left open is a NERDTree
    autocmd bufenter * if (winnr("$") == 1 && exists("b:NERDTree") && b:NERDTree.isTabTree()) | q | endif

augroup END

" custom arrows
let g:NERDTreeDirArrowExpandable = '▸'
let g:NERDTreeDirArrowCollapsible = '▾'

let NERDTreeIgnore = ['\.DS_Store$', '\.swp$',  '\.un\~$']

map <Leader>n <plug>NERDTreeTabsToggle<CR>

let NERDTreeShowBookmarks = 1
let NERDTreeBookmarksFile = $HOME . '/.dotfiles/.vim/meta/NERDTree/.NERDTreeBookmarks'
let NERDTreeShowHidden = 1
let g:NERDTreeWinSize = 35

"∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞

"--------------------------------------------------------------------------------------------------
" ••••••••••••••••••••••••••••••••••••••• Autopairs •••••••••••••••••••••••••••••••••••••••••••••••
"--------------------------------------------------------------------------------------------------

" Toggle autopairs
let g:AutoPairsShortcutToggle = '<localleader>ta'

" Fast wrap
let g:AutoPairsShortcutFastWrap = '<localleader>fw'

" Jump to next closed pair
let g:AutoPairsShortcutJump = '<localleader>n'

" Disable <C-h> mapping to delete brackets, quotes in pair
let g:AutoPairsMapCh = 0

" This one seem to be now working
" let g:AutoPairs['<']='>'

"∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞

"--------------------------------------------------------------------------------------------------
"•••••••••••••••••••••••••••••••••••••••• Markdown ••••••••••••••••••••••••••••••••••••••••••••••••
"--------------------------------------------------------------------------------------------------

let g:vim_markdown_folding_disabled = 1
let g:vim_markdown_toc_autofit = 1
let g:vim_markdown_fenced_languages = ['c++=cpp', 'viml=vim', 'bash=sh', 'ini=dosini', 'js=javascript', 'css=css']
let g:vim_markdown_autowrite = 1

" Convenient headers navigation remap. For some reason, `nnoremap` doen't work.
map [] <Plug>Markdown_MoveToNextSiblingHeader
map ][ <Plug>Markdown_MoveToPreviousSiblingHeader

" Calls vertical quickfix window to quicly navigate in a buffer with Table of Contents
nnoremap <leader><space>n :Tocv<CR>
nnoremap <leader>tf :TableFormat<CR>

"∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞

"--------------------------------------------------------------------------------------------------
" ••••••••••••••••••••••••••••••••••••••• GitGutter •••••••••••••••••••••••••••••••••••••••••••••••
"--------------------------------------------------------------------------------------------------

" Threshold of changes qunatity if a file when GitGutter starts to suppress itself for performance
let g:gitgutter_max_signs = 500

" Always display signs column, no matter there are changes or not
" recheck this option during refactoring
let signcolumn = 1

" Change modified and deleted line symbol
let g:gitgutter_sign_modified_removed = '~-'
let g:gitgutter_sign_added = '+'
let g:gitgutter_sign_modified = '~'
let g:gitgutter_sign_removed = '-'
let g:gitgutter_sign_removed_first_line = '·'

" Navigation between hungs within a single buffer
nmap ]h <Plug>GitGutterNextHunk
nmap [h <Plug>GitGutterPrevHunk

" Global navigation between hunks
nmap <silent> ]H :call NextHunkAllBuffers()<CR>
nmap <silent> [H :call PrevHunkAllBuffers()<CR>

" Hunk add, hunk revert - remapping in more intuitive mnemonic manner (instead stage, undo)
nmap <Leader>ha <Plug>GitGutterStageHunk
nmap <Leader>hr <Plug>GitGutterUndoHunk 

" A hunk text object is provided which works in visual and operator-pending modes
omap ih <Plug>GitGutterTextObjectInnerPending
omap ah <Plug>GitGutterTextObjectOuterPending
xmap ih <Plug>GitGutterTextObjectInnerVisual
xmap ah <Plug>GitGutterTextObjectOuterVisual

"∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞

"--------------------------------------------------------------------------------------------------
" ••••••••••••••••••••••••••••••••••••••• Completor •••••••••••••••••••••••••••••••••••••••••••••••
"--------------------------------------------------------------------------------------------------

" Use Tab to select completion 
inoremap <expr> <Tab> pumvisible() ? "\<C-n>" : "\<Tab>"
inoremap <expr> <S-Tab> pumvisible() ? "\<C-p>" : "\<S-Tab>"

" TODO enter does't work for some reason
inoremap <expr> <cr> pumvisible() ? "\<C-y>\<cr>" : "\<cr>"

" Minimum characters to trigger completions
let g:completor_min_chars = 1

let g:completor_completion_delay = 0

" Use Tab to trigger completion (disable auto trigger)
" let g:completor_auto_trigger = 0
" inoremap <expr> <Tab> pumvisible() ? "\<C-n>" : "\<C-x>\<C-u>\<C-p>"

"∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞

"--------------------------------------------------------------------------------------------------
" ••••••••••••••••••••••••••••••••••••••• Grepper •••••••••••••••••••••••••••••••••••••••••••••••••
"--------------------------------------------------------------------------------------------------

" mapping for Grepper
nnoremap <leader>g :Grepper<cr>

" ability to cycle through avaialbe greppers using corresponding mapping
let g:grepper = {
    \'next_tool': '<leader>g',
    \'tools':     ['ag', 'git', 'grep']
\}

" For normal and visual modes
" Set of options
" Option to exectue search only in a current buffer
let g:grepper.buffer = 1
let g:grepper.highlight = 1
let g:grepper.simple_prompt = 1

" for normal and visual modes
nmap gs  <plug>(GrepperOperator)
xmap gs  <plug>(GrepperOperator)

" Highlight searches
let g:grepper.highlight = 1

" Only show the tool name in the prompt, without any of its arguments.
let g:grepper.simple_prompt = 1

" Open a new window and show matches with surrounding context
let g:grepper.side = 0

" Open selected item from quickfix in a vsplit
autocmd! FileType qf nnoremap <buffer> <leader><Enter> <C-w><Enter><C-w>L

"∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞

"--------------------------------------------------------------------------------------------------
" ••••••••••••••••••••••••••••••••••••••• CtrlP •••••••••••••••••••••••••••••••••••••••••••••••••
"--------------------------------------------------------------------------------------------------

let g:ctrlp_map = '<c-p>'
let g:ctrlp_cmd = 'CtrlP'
let g:ctrlp_custom_ignore = '\v[\/](node_modules|target|dist)|(\.(swp|ico|git|svn))$'

"∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞

"--------------------------------------------------------------------------------------------------
" ••••••••••••••••••••••••••••••••••••••• Devicons ••••••••••••••••••••••••••••••••••••••••••••••••
"--------------------------------------------------------------------------------------------------

let g:WebDevIconsUnicodeGlyphDoubleWidth = 0
let g:webdevicons_conceal_nerdtree_brackets = 1

"∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞

" GREPPER
nnoremap <leader>p gggqG<C-o><C-o>

" INCSEARCH
map /  <Plug>(incsearch-forward)
map ?  <Plug>(incsearch-backward)
map g/ <Plug>(incsearch-stay)

set hlsearch
" Turns 'hlsearch' off automatically after searching-related motions
let g:incsearch#auto_nohlsearch = 1
map n  <Plug>(incsearch-nohl-n)
map N  <Plug>(incsearch-nohl-N)
map *  <Plug>(incsearch-nohl-*)
map #  <Plug>(incsearch-nohl-#)
map g* <Plug>(incsearch-nohl-g*)
map g# <Plug>(incsearch-nohl-g#)

" Enables improved 'very magic' mode
let g:incsearch#magic = '\v'

" Ctags:
" Create a 'tags' file (may need to install ctags first)
" command! MAkeTags !ctags -R .

" ^] - jump to tag under curosr
" g^] for amboguous tags
" ^t to jump back to the tag stack

" "TODO" check that out during refactoring vimrc:

" CTRL-U in insert mode deletes a lot.  Use CTRL-G u to first break undo,
" so that you can undo CTRL-U after inserting a line break.
" inoremap <C-U> <C-G>u<C-U>

" "TODO"
" 1. solve vim-surround 'd' and 'c' cursor issue in MacVim; after surround added autopairs
" 2. investigate jk missclick (probably only in js files)
" 3. Multiline insert and EDIT
" 4. Multiline identation
" 5. Improve Comment hotkey in order to uncomment automatically
" 6. Dot-like empty spaces before start of line
" 7. investigate filetype option over vimrc file
" 8. word and symbol count in MD files
" 9. also wrap WORD in qutes, and add possibility un unwrap
" 10. investigate and setup CTAGS
" Fix grepper in markdown
" 
" Investigate these below - for storing helper files in more ordered manner
" 11. set backupdir=~/.vimbackup
" 12. set directory=~/.vimbackup
" 13. set undodir=~/.vimbackup
" 14. investigate how to 'nnoremap' plugin mappings instad of 'nmap'
" 15. great text formatter - `par` http://vimcasts.org/episodes/formatting-text-with-par/ 

