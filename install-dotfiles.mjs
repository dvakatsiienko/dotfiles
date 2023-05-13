/**
 * ? install-dotfiles.sh
 * ? This script creates symlinks from the home directory to any desired dotfiles in ~/.dotfiles
 */

// TODO
// ~/.config/oh-my-zsh-custom/functions.zsh
// ~/.config/oh-my-zsh-custom/aliases.zsh

// TODO
// backup and symlink ssh configs
// mv ~/.ssh/config $dotfiles_backup_dir
// ln -s $dotfiles_source_dir/.ssh/config ~/.ssh/config

/* Core */
import * as zx from 'zx';

const homedir = zx.os.homedir();
const dotfiles_source_dir = `${ homedir }/.dotfiles/.source`; // ? dotfiles source directory
const dotfiles_backup_dir = `${ homedir }/.dotfiles_backup`; // ? dotfiles backup directory
const dotfile_list = [
    /// ? list of files/folders to symlink in homedir.
    '.zshrc', // ? zsh main config file
    '.zprofile', // ? zsh config file that sets the environment for login shells
    '.zshenv', // ? additional zsh config file that sets the environment for login shells
    '.vimrc', // ? vim config file
    '.yarnrc', // ? yarn config file
    '.hushlogin', // ? remove the "Last login" message when opening a new terminal window
];

// ? Go to the dotfiles directory
zx.echo(bb(`🏁 Moving to the ${ yb(dotfiles_source_dir) } directory.`));
zx.cd(dotfiles_source_dir);

new_line();

zx.echo(bb(`📦 Creating a ${ yb(dotfiles_backup_dir) } directory to backup existing dotfiles in ${ yb(homedir) }.`));
await zx.$`mkdir -p ${ dotfiles_backup_dir }`;

new_line();

for await (const dotfile of dotfile_list) {
    const dotfile_homedir_path = `${ homedir }/${ dotfile }`;
    const dotfile_source_path = `${ dotfiles_source_dir }/${ dotfile }`;
    const dotfile_backup_path = `${ dotfiles_backup_dir }/${ dotfile }`;

    // ? If a dotfile is already backed up, do not backup dotfile from homedir, because it will overwrite the existing one.
    zx.echo(bb(`🔎 Checking if a ${ mb(dotfile) } is already exists in ${ yb(dotfiles_backup_dir) }.`));
    const is_dotfile_exists = await zx.fs.exists(dotfile_backup_path);

    if (is_dotfile_exists) {
        zx.echo(rb(`Error: ${ mb(dotfile) } is already exists in ${ yb(dotfiles_backup_dir) }. Skipping backup fo this file.`));
    } else {
        zx.echo(gb(`✓ No backup ${ mb(dotfile) } found in ${ yb(dotfiles_backup_dir) }. Proceeding...`));

        try {
            // ? Backup (move) existing dotfile from homedir to dotfiles backup dir
            zx.echo(bb(`↩️  Moving a ${ mb(dotfile) } from ${ yb(homedir) } to ${ yb(dotfiles_backup_dir) }.`));

            await zx.$`mv ${ dotfile_homedir_path } ${ dotfiles_backup_dir }`;
            zx.echo(gb(`✓ Dotfile moved from ${ yb(dotfile_homedir_path) } to ${ yb(dotfiles_backup_dir) }.`));
        } catch (error) {
            zx.echo(rb(`Error: ${ error }`));
        }
    }

    try {
        // ? Symlink source dotfiles to homedir
        zx.echo(bb(`🔗 Creating a symlink for ${ mb(dotfile) }. ${ yb(dotfile_source_path) } → ${ yb(dotfile_homedir_path) }.`));
        await zx.$`ln -s ${ dotfile_source_path } ${ dotfile_homedir_path }`;
        zx.echo(gb(`✓ Symlinked: ${ mb(dotfile) }.`));
    } catch (error) {
        zx.echo(rb(`Error: ${ error }`));
    }

    new_line();
}

// ln -s $dotfiles_source_dir/$dotfile ~/$dotfile
new_line();

zx.echo('✅ Done.');

/* Helpers */
function bb (...args) {
    return zx.chalk.blueBright(...args);
}
function yb (...args) {
    return zx.chalk.yellowBright(...args);
}
function mb (...args) {
    return zx.chalk.magentaBright(...args);
}
function gb (...args) {
    return zx.chalk.greenBright(...args);
}
function rb (...args) {
    return zx.chalk.redBright(...args);
}
function new_line () {
    zx.echo('');
}
