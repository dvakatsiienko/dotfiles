/**
 * ? This script lists all current dotfiles symlinks
 * ? Helps identify which files are tracked by dotfiles repo
 */

/* Core */
import * as zx from 'zx';

/* Instruments */
import { bb, gb, mb, new_line, rb, yb } from './lib.mjs';

const homedir = zx.os.homedir();

zx.echo(gb('🔗 Current dotfiles symlinks:'));
new_line();

const symlink_locations = [
    // Home directory dotfiles
    {
        files: [
            '.zshrc',
            '.zprofile',
            '.zshenv',
            '.vimrc',
            '.gitconfig',
            '.hushlogin',
        ],
        location: homedir,
    },

    // oh-my-zsh custom
    {
        files: ['aliases.zsh', 'functions.zsh'],
        location: `${homedir}/.config/oh-my-zsh-custom`,
    },

    // starship config
    { files: ['starship.toml'], location: `${homedir}/.config` },

    // SSH config
    {
        files: ['config', 'known_hosts', 'allowed_signers'],
        location: `${homedir}/.ssh`,
    },
];

let symlink_count = 0;
let real_file_count = 0;
let missing_count = 0;

for (const { location, files } of symlink_locations) {
    zx.echo(bb(`📁 ${location.replace(homedir, '~')}/`));

    for (const file of files) {
        const file_path = `${location}/${file}`;

        try {
            const file_exists = await zx.fs.exists(file_path);

            if (!file_exists) {
                zx.echo(`   ${rb('✗')} ${mb(file)} ${bb('(missing)')}`);
                missing_count++;
                continue;
            }

            const stats = await zx.fs.lstat(file_path);

            if (stats.isSymbolicLink()) {
                const link_target = await zx.fs.readlink(file_path);
                if (link_target.includes('.dotfiles/source')) {
                    zx.echo(
                        `   ${gb('🔗')} ${yb(file)} ${bb('→')} ${link_target}`,
                    );
                    symlink_count++;
                } else {
                    zx.echo(
                        `   ${yb('🔗')} ${mb(file)} ${bb('→')} ${link_target} ${rb('(external)')}`,
                    );
                }
            } else {
                zx.echo(`   ${rb('📄')} ${mb(file)} ${bb('(real file)')}`);
                real_file_count++;
            }
        } catch (error) {
            zx.echo(
                `   ${rb('❌')} ${mb(file)} ${bb(`(error: ${error.message})`)}`,
            );
        }
    }

    new_line();
}

zx.echo(gb('📊 Summary:'));
zx.echo(`   ${gb('🔗')} Dotfiles symlinks: ${yb(symlink_count)}`);
zx.echo(`   ${rb('📄')} Real files: ${yb(real_file_count)}`);
zx.echo(`   ${rb('✗')} Missing files: ${yb(missing_count)}`);

if (real_file_count > 0) {
    new_line();
    zx.echo(bb('💡 Real files are not managed by dotfiles repo'));
    zx.echo(
        bb(
            '💡 Use `pnpm untrack-dotfile <path>` to convert symlinks to real files',
        ),
    );
}

if (symlink_count > 0) {
    new_line();
    zx.echo(bb('🔧 To untrack a symlink:'));
    zx.echo(bb('   pnpm untrack-dotfile ~/.gitconfig'));
}
