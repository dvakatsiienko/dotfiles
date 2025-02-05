/**
 * ? This script:
 * ? - Sets reasonable macOS defaults
 * ? - Installs homebrew
 */

/* Core */
import * as zx from 'zx';

/* Instruments */
import { bb, yb, mb, gb, rb, new_line } from './lib.mjs';

zx.echo(gb('🏁 Initiating macOS setup.'));
new_line();

zx.echo(bb('🖥️  Configuring macOS defaults...'));
new_line();

zx.echo(bb(`Show ${ mb('hidden files') } by default.`));
await zx.$`defaults write com.apple.finder AppleShowAllFiles true`;
new_line();

zx.echo(bb(`Setting up a ${ mb('blazingly fast keypress repeat rate') }.`));
await zx.$`defaults write NSGlobalDomain KeyRepeat -int 1`;
new_line();

zx.echo(bb(`Setting up a ${ mb('shorter delay until key repeat') }.`));
await zx.$` defaults write NSGlobalDomain InitialKeyRepeat -int 10`;
new_line();

zx.echo(bb(`🍻 Initializing ${ mb('brew') }...`));
new_line();

const is_brew_installed = await check_is_brew_installed();

if (!is_brew_installed) {
    zx.echo(rb(`Error: ${ mb('brew') } is not installed. Installing...`));

    try {
        await zx.$`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`;
        zx.echo(gb(`✓ ${ mb('brew') } is now installed. Proceeding...`));
    } catch {
        zx.echo(rb(`Failed to install ${ mb('brew') }. Aborting.`));
        await zx.$`exit 1`;
    }
} else {
    zx.echo(gb(`✓ ${ mb('brew') } is already installed. Proceeding...`));
}

new_line();

zx.echo(bb(`🍺 Installing classic ${ mb('brew') } formulaes.`));
// TODO check if zsh is needed to install on a new system
await zx.$`brew install zsh zsh-autosuggestions zsh-syntax-highlighting starship eza bat fzf vim gh the_silver_searcher yarn 1password-cli`;
// ? zsh — a zsh shell (check if needed because macos have it installed by default)
// ? zsh-* - zsh plugins
// ? starship  — a zsh prompt framework
// ? eza — a modern version of ls.
// ? bat — A cat(1) clone with wings.
// ? fzf — 🌸 A command-line fuzzy finder (directories).
// ? vim — vim
// ? gh — github cli
// ? the_silver_searcher — a code searching tool similar to ack, with a focus on speed (source code).
// ? yarn — old good node package manager
// ? 1password-cli — a cli for 1password for terminal use and raycast ingegration

// ? Installing a Vim plugin manager.
// ? A list of Vim plugins is set in .vimrc config file.
// ? Vim plugins are installed by executing :PlugInstall command from inside of a Vim session.
zx.echo(`🔌 Installing ${ mb('vim-plug') } into ${ yb('~/.vim/autoload') }`);
await zx.$`curl -fLo ~/.vim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim`;

new_line();
zx.echo('✅ Done.');

/* Helpers */
async function check_is_brew_installed () {
    zx.echo(bb(`🔎 Checking if ${ mb('brew') } binary is installed in the sytem.`));

    try {
        await zx.$`which brew`;
    } catch {
        return false;
    }

    return true;
}
