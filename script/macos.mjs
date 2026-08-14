#!/usr/bin/env zx
/**
 * ? macos — bring a Mac up to this repo's baseline.
 * ?
 * ?   pnpm macos          # show what's missing, change nothing
 * ?   pnpm macos apply    # install packages, write defaults, fetch vim-plug
 * ?
 * ? Packages live in the Brewfile at the repo root, never in this file.
 * ? This script only knows how to run `brew bundle` and set a few defaults.
 */

/* Core */
import * as zx from 'zx';

/* Instruments */
import {
    bb,
    done,
    fail,
    mb,
    note,
    ok,
    skip,
    step,
    title,
    warn,
} from './lib.mjs';
import { repo_root } from './symlink.mjs';

const BREWFILE = `${repo_root}/Brewfile`;

// ? Every macOS default this repo owns, in one place.
const DEFAULTS = [
    {
        args: ['com.apple.finder', 'AppleShowAllFiles', '-bool', 'true'],
        label: 'Finder shows hidden files',
    },
    {
        args: ['NSGlobalDomain', 'KeyRepeat', '-int', '1'],
        label: 'Fastest key repeat',
    },
    {
        args: ['NSGlobalDomain', 'InitialKeyRepeat', '-int', '10'],
        label: 'Short delay before key repeat',
    },
];

const VIM_PLUG = `${zx.os.homedir()}/.vim/autoload/plug.vim`;

const apply = zx.argv._[0] === 'apply';

zx.$.verbose = false;

title('macOS setup', apply ? 'applying' : 'dry run — nothing will change');

await ensure_homebrew();
await packages();
await defaults();
await vim_plug();

if (apply) {
    done('Machine matches the baseline.');
} else {
    done('Dry run. Run `pnpm macos apply` to make it so.', { clean: false });
}

/* Steps */
async function ensure_homebrew() {
    step('Homebrew');

    if (await which('brew')) {
        ok('installed');
        return;
    }

    if (!apply) {
        warn('not installed', 'would be installed');
        return;
    }

    fail('not installed', 'installing…');

    try {
        await zx.$({
            verbose: true,
        })`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`;
        ok('installed');
    } catch {
        fail('install failed');
        process.exit(1);
    }
}

async function packages() {
    step('Packages');
    note(`from ${mb(zx.path.relative(repo_root, BREWFILE))}`);

    const check = await zx.$`brew bundle check --verbose --file=${BREWFILE}`
        .quiet()
        .nothrow();

    // ? brew reports the unmet lines on stderr, the summary on stdout.
    const pending = `${check.stdout}\n${check.stderr}`
        .split('\n')
        .filter((line) => line.trim().startsWith('→'))
        .map((line) =>
            line.replace(/^\s*→\s*/, '').replace(/ needs to be.*$/, ''),
        );

    if (pending.length === 0) {
        ok('everything installed');
        return;
    }

    for (const item of pending) skip(item, 'missing or outdated');

    if (!apply) {
        warn(`${pending.length} to install`, 'would run brew bundle');
        return;
    }

    await zx.$({ verbose: true })`brew bundle install --file=${BREWFILE}`;
    ok(`${pending.length} reconciled`);
}

async function defaults() {
    step('System defaults');

    for (const { label, args } of DEFAULTS) {
        if (!apply) {
            skip(label, 'would set');
            continue;
        }

        await zx.$`defaults write ${args}`;
        ok(label);
    }
}

async function vim_plug() {
    step('vim-plug');

    if (await zx.fs.pathExists(VIM_PLUG)) {
        ok('present', '~/.vim/autoload/plug.vim');
        return;
    }

    if (!apply) {
        warn('missing', 'would download');
        return;
    }

    await zx.$`curl -fLo ${VIM_PLUG} --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim`;
    ok('downloaded');
    note(
        `run ${bb(':PlugInstall')} inside vim to install the plugins listed in .vimrc`,
    );
}

/* Helpers */
async function which(binary) {
    try {
        await zx.which(binary);
        return true;
    } catch {
        return false;
    }
}
