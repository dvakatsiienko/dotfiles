#!/usr/bin/env node
/**
 * ? macos — bring a Mac up to this repo's baseline.
 * ?
 * ?   pnpm macos-setup          # show what's missing, change nothing
 * ?   pnpm macos-setup apply    # install packages, write defaults, fetch vim-plug
 * ?
 * ? Packages live in the Brewfile at the repo root, never in this file.
 * ? This script only knows how to run `brew bundle`, set a few defaults, and
 * ? point a handful of file types at their editor.
 */

/* Core */
import * as zx from 'zx';

import { repoRoot } from './lib/manifest.ts';
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
} from './lib/print.ts';

const BREWFILE = `${repoRoot}/Brewfile`;

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

// ? Which app opens which kind of file. Keyed by the UTI macOS actually assigns,
// ? which is per-language and rarely guessable — `.go` is org.golang.go-script,
// ? not public.source-code. Read one off a real file with
// ? `mdls -name kMDItemContentType -raw <file>`.
// ? Each entry also carries an extension, purely so the current handler can be
// ? read back: duti answers `-x <ext>` and has no `-x <uti>`.
// ? `.ts` is deliberately absent: macOS maps it to public.mpeg-2-transport-stream,
// ? so claiming it would send video files to an editor.
const MACVIM = { id: 'org.vim.MacVim', name: 'MacVim' };
const NEOVIDE = { id: 'com.neovide.neovide', name: 'Neovide' };
const DEFAULT_APPS = [
    { app: MACVIM, ext: 'md', uti: 'net.daringfireball.markdown' },
    { app: MACVIM, ext: 'md', uti: 'net.ia.markdown' },
    { app: MACVIM, ext: 'txt', uti: 'public.plain-text' },
    { app: MACVIM, ext: 'sh', uti: 'public.shell-script' },
    { app: MACVIM, ext: 'zsh', uti: 'public.zsh-script' },
    { app: NEOVIDE, ext: 'go', uti: 'org.golang.go-script' },
    { app: NEOVIDE, ext: 'tsx', uti: 'com.microsoft.typescript' },
    { app: NEOVIDE, ext: 'js', uti: 'com.netscape.javascript-source' },
    { app: NEOVIDE, ext: 'json', uti: 'public.json' },
    { app: NEOVIDE, ext: 'toml', uti: 'public.toml' },
    { app: NEOVIDE, ext: 'yml', uti: 'public.yaml' },
    { app: NEOVIDE, ext: 'css', uti: 'public.css' },
];

const VIM_PLUG = `${zx.os.homedir()}/.vim/autoload/plug.vim`;

const apply = zx.argv._[0] === 'apply';

zx.$.verbose = false;

title('macOS setup', apply ? 'applying' : 'dry run — nothing will change');

await ensureHomebrew();
await packages();
await defaults();
await defaultApps();
await vimPlug();

if (apply) {
    done('Machine matches the baseline.');
} else {
    done('Dry run. Run `pnpm macos-setup apply` to make it so.', {
        clean: false,
    });
}

/* Steps */
async function ensureHomebrew() {
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
    note(`from ${mb(zx.path.relative(repoRoot, BREWFILE))}`);

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

async function defaultApps() {
    step('Default apps');

    if (!(await which('duti'))) {
        warn('duti missing', 'brew bundle installs it — rerun after packages');
        return;
    }

    for (const { app, ext, uti } of DEFAULT_APPS) {
        // ? Skipping what already matches is not just tidiness: macOS raises a
        // ? "keep using X?" dialog per type whenever a handler actually changes,
        // ? and those queue up invisibly behind the terminal.
        if ((await handlerFor(ext)) === app.id) {
            ok(`.${ext}`, app.name);
            continue;
        }

        if (!apply) {
            skip(`.${ext}`, `would open in ${app.name}`);
            continue;
        }

        await zx.$`duti -s ${app.id} ${uti} all`;
        warn(`.${ext}`, `confirm the ${app.name} dialog`);
    }
}

async function vimPlug() {
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
async function handlerFor(ext: string) {
    const seen = await zx.$`duti -x ${ext}`.quiet().nothrow();
    return seen.stdout.trim().split('\n').at(-1) ?? '';
}

async function which(binary: string) {
    try {
        await zx.which(binary);
        return true;
    } catch {
        return false;
    }
}
