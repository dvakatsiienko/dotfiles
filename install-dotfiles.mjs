/**
 * ? install-dotfiles.sh
 * ? This script creates symlinks from the home directory to any desired dotfiles in ~/.dotfiles
 */

// TODO
// backup and symlink ssh configs
// mv ~/.ssh/config $dotfiles_backup_dir
// ln -s $dotfiles_source_dir/.ssh/config ~/.ssh/config

// backup and symlink iTerm configs

/* Core */
import * as zx from 'zx';

const homedir = zx.os.homedir();
const dotfiles_source_dir = `${ homedir }/.dotfiles/source`; // ? dotfiles source directory
const dotfiles_backup_dir = `${ homedir }/.dotfiles_backup`; // ? dotfiles backup directory
const omzsh_custom_dir = `${ homedir }/.config/oh-my-zsh-custom`; // ? oh-my-zsh custom directory
const omzsh_custom_source_dir = `${ dotfiles_source_dir }/.config/oh-my-zsh-custom`; // ? oh-my-zsh custom directory
const omzsh_custom_backup_dir = `${ dotfiles_backup_dir }/.config/oh-my-zsh-custom`; // ? oh-my-zsh custom directory

const dotfile_list = [
    // ? list of files/folders to symlink in homedir.
    '.zshrc', // ? zsh main config file
    '.zprofile', // ? zsh config file that sets the environment for login shells
    '.zshenv', // ? additional zsh config file that sets the environment for login shells
    '.vimrc', // ? vim config file
    '.yarnrc', // ? yarn config file
    '.hushlogin', // ? remove the "Last login" message when opening a new terminal window
];
const omzsh_file_list = [ 'aliases.zsh', 'functions.zsh' ];
const shellBinList = [ 'zsh', 'vim', 'yarn' ];

zx.echo(bb(`🔐 Checking if required binaries are installed: ${ mb(shellBinList.join(', ')) }.`));

let is_all_bins_installed = true;

for await (const bin of shellBinList) {
    try {
        await zx.which(bin);
    } catch {
        zx.echo(rb(`🚨 ${ mb(bin) } is not installed. Please install ${ mb(bin) } first.`));
        is_all_bins_installed = false;
    }
}

if (is_all_bins_installed) {
    zx.echo(gb('✓ All required binaries are installed. Proceeding...'));
    new_line();

    zx.echo(bb(`📦 Creating a ${ yb(dotfiles_backup_dir) } directory to backup existing dotfiles.`));
    await zx.$`mkdir -p ${ dotfiles_backup_dir }`;
    new_line();

    zx.echo(bb(`📦 Creating a ${ yb(omzsh_custom_backup_dir) } directory to backup existing oh-my-zsh config files.`));
    await zx.$`mkdir -p ${ omzsh_custom_backup_dir }`;
    new_line();

    for await (const dotfile of [ ...dotfile_list, ...omzsh_file_list ]) {
        const is_omzsh_dotfile = omzsh_file_list.includes(dotfile);

        const dotfile_dir = is_omzsh_dotfile ? omzsh_custom_dir : homedir;
        const dotfile_path = `${ dotfile_dir }/${ dotfile }`;
        const dotfile_source_dir = is_omzsh_dotfile ? omzsh_custom_source_dir : dotfiles_source_dir;
        const dotfile_source_path = `${ dotfile_source_dir }/${ dotfile }`;
        const dotfile_backup_dir = is_omzsh_dotfile ? omzsh_custom_backup_dir : dotfiles_backup_dir;
        const dotfile_backup_path = `${ dotfile_backup_dir }/${ dotfile }`;
        new_line();

        // ? If a dotfile is already backed up, do not backup dotfile from homedir, because it will overwrite the existing one.
        zx.echo(bb(`🔎 Checking if a ${ mb(dotfile) } is already exists in ${ yb(dotfile_backup_dir) }.`));
        const is_dotfile_exists = await zx.fs.exists(dotfile_backup_path);

        if (is_dotfile_exists) {
            zx.echo(rb(`Error: ${ mb(dotfile) } is already exists in ${ yb(dotfile_backup_dir) }. Skipping backup fo this file.`));
        } else {
            zx.echo(gb(`✓ No backup ${ mb(dotfile) } found in ${ yb(dotfile_backup_dir) }. Proceeding...`));

            try {
                // ? Backup (move) existing dotfile from homedir to dotfiles backup dir
                zx.echo(bb(`↩️  Moving a ${ mb(dotfile) } from ${ yb(dotfile_path) } to ${ yb(dotfile_backup_dir) }.`));

                await zx.$`mv ${ dotfile_path } ${ dotfile_backup_dir }`;
                zx.echo(gb(`✓ Dotfile moved from ${ yb(dotfile_path) } to ${ yb(dotfile_backup_dir) }.`));
            } catch (error) {
                zx.echo(rb(`Error: ${ error }`));
            }
        }

        try {
            // ? Symlink source dotfiles to homedir
            zx.echo(bb(`🔗 Creating a symlink for ${ mb(dotfile) }. ${ yb(dotfile_source_path) } → ${ yb(dotfile_path) }.`));
            await zx.$`ln -s ${ dotfile_source_path } ${ dotfile_path }`;
            zx.echo(gb(`✓ Symlinked: ${ mb(dotfile) }.`));
        } catch (error) {
            zx.echo(rb('Error: symlink already exists.'));
        }
    }

    new_line();
    zx.echo('✅ Done.');
}

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
