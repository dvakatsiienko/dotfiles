/**
 * ? This script safely converts a symlinked dotfile back to a real file
 * ? and removes it from git tracking
 * 
 * Usage: zx untrack-dotfile.mjs <dotfile-path>
 * Example: zx untrack-dotfile.mjs ~/.yarnrc
 */

/* Core */
import * as zx from 'zx';

/* Instruments */
import { bb, yb, mb, gb, rb, new_line } from './lib.mjs';

const dotfile_path = process.argv[3];

if (!dotfile_path) {
    zx.echo(rb('❌ Error: Please provide a dotfile path'));
    zx.echo(bb('Usage: zx untrack-dotfile.mjs <dotfile-path>'));
    zx.echo(bb('Example: zx untrack-dotfile.mjs ~/.yarnrc'));
    process.exit(1);
}

const homedir = zx.os.homedir();
const dotfiles_source_dir = `${homedir}/.dotfiles/source`;
const resolved_path = dotfile_path.replace('~', homedir);

zx.echo(gb(`🔄 Processing: ${yb(dotfile_path)}`));
new_line();

try {
    // Check if file exists
    const file_exists = await zx.fs.exists(resolved_path);
    if (!file_exists) {
        zx.echo(rb(`❌ File does not exist: ${dotfile_path}`));
        process.exit(1);
    }

    // Check if it's a symlink
    const stats = await zx.fs.lstat(resolved_path);
    if (!stats.isSymbolicLink()) {
        zx.echo(rb(`❌ File is not a symlink: ${dotfile_path}`));
        zx.echo(bb('This script only works with symlinked dotfiles'));
        process.exit(1);
    }

    // Get symlink target
    const link_target = await zx.fs.readlink(resolved_path);
    zx.echo(bb(`🔗 Symlink target: ${yb(link_target)}`));

    // Verify it points to our dotfiles repo
    if (!link_target.includes('.dotfiles/source')) {
        zx.echo(rb(`❌ Symlink doesn't point to dotfiles repo: ${link_target}`));
        process.exit(1);
    }

    // Determine the source file path in repo
    const filename = zx.path.basename(resolved_path);
    let source_file_path;
    
    if (link_target.includes('.config/oh-my-zsh-custom')) {
        source_file_path = `source/.config/oh-my-zsh-custom/${filename}`;
    } else if (link_target.includes('.config')) {
        source_file_path = `source/.config/${filename}`;
    } else if (link_target.includes('.ssh')) {
        source_file_path = `source/.ssh/${filename}`;
    } else {
        source_file_path = `source/${filename}`;
    }

    zx.echo(bb(`📁 Source in repo: ${yb(source_file_path)}`));
    new_line();

    // Confirm with user
    zx.echo(bb('This will:'));
    zx.echo(`  1. Copy ${mb(link_target)} → ${mb(resolved_path)} (real file)`);
    zx.echo(`  2. Remove ${mb(source_file_path)} from git tracking`);
    zx.echo(`  3. Delete ${mb(source_file_path)} from repo`);
    new_line();

    const confirm = await zx.question(yb('Continue? (y/N): '));
    if (confirm.toLowerCase() !== 'y') {
        zx.echo(bb('Operation cancelled.'));
        process.exit(0);
    }

    new_line();

    // Step 1: Copy symlink target content to a temp file
    zx.echo(bb(`1️⃣ Copying symlink content to temp file...`));
    const temp_file = `${resolved_path}.tmp.${Date.now()}`;
    await zx.$`cp ${resolved_path} ${temp_file}`;
    zx.echo(gb(`✓ Content copied to: ${temp_file}`));

    // Step 2: Remove the symlink
    zx.echo(bb(`2️⃣ Removing symlink...`));
    await zx.$`rm ${resolved_path}`;
    zx.echo(gb(`✓ Symlink removed: ${resolved_path}`));

    // Step 3: Move temp file to original location (now as real file)
    zx.echo(bb(`3️⃣ Creating real file...`));
    await zx.$`mv ${temp_file} ${resolved_path}`;
    zx.echo(gb(`✓ Real file created: ${resolved_path}`));

    // Step 4: Remove from git tracking
    zx.echo(bb(`4️⃣ Removing from git tracking...`));
    await zx.$`git rm --cached ${source_file_path}`;
    zx.echo(gb(`✓ Removed from git: ${source_file_path}`));

    // Step 5: Delete source file from repo
    zx.echo(bb(`5️⃣ Deleting source file...`));
    const full_source_path = `${dotfiles_source_dir.replace('source', '')}${source_file_path}`;
    await zx.$`rm ${full_source_path}`;
    zx.echo(gb(`✓ Source file deleted: ${full_source_path}`));

    new_line();
    zx.echo(gb(`✅ Successfully untracked: ${yb(dotfile_path)}`));
    zx.echo(bb(`📝 The file is now a regular file (not symlinked)`));
    zx.echo(bb(`📝 Run 'git status' to see the changes ready to commit`));

} catch (error) {
    zx.echo(rb(`❌ Error: ${error.message}`));
    process.exit(1);
}