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
const CURSOR = { id: 'com.todesktop.230313mzl4w4u92', name: 'Cursor' };
// ? Prose and shell open in MacVim; everything that is code opens in Cursor,
// ? which is the editor this repo points at everywhere else — duti, and the
// ? cursor:// links sline and the reply rules emit. Neovide was installed to be
// ? tried, never opened, and is gone from here.
const DEFAULT_APPS = [
    { app: MACVIM, ext: 'md', uti: 'net.daringfireball.markdown' },
    { app: MACVIM, ext: 'md', uti: 'net.ia.markdown' },
    { app: MACVIM, ext: 'txt', uti: 'public.plain-text' },
    { app: MACVIM, ext: 'sh', uti: 'public.shell-script' },
    { app: CURSOR, ext: 'zsh', uti: 'public.zsh-script' },
    { app: CURSOR, ext: 'go', uti: 'org.golang.go-script' },
    { app: CURSOR, ext: 'tsx', uti: 'com.microsoft.typescript' },
    { app: CURSOR, ext: 'js', uti: 'com.netscape.javascript-source' },
    { app: CURSOR, ext: 'json', uti: 'public.json' },
    { app: CURSOR, ext: 'toml', uti: 'public.toml' },
    { app: CURSOR, ext: 'yml', uti: 'public.yaml' },
    { app: CURSOR, ext: 'css', uti: 'public.css' },
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

    await taps();

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

    const install = await zx.$({
        verbose: true,
    })`brew bundle install --file=${BREWFILE}`.nothrow();

    if (install.exitCode !== 0) {
        fail('brew bundle install failed', 'see the brew output above');
        process.exit(1);
    }

    ok(`${pending.length} reconciled`);
}

// ? Homebrew refuses to read a third-party tap's formula until it is trusted
// ? once, and an unreadable formula reports as "missing or outdated" forever.
// ? The Brewfile's own `tap` lines are the list, so a fresh machine needs no
// ? second inventory.
async function taps() {
    const brewfile = await zx.fs.readFile(BREWFILE, 'utf8');
    const wanted = [...brewfile.matchAll(/^tap "([^"]+)"/gm)].map(
        (match) => match[1],
    );

    const listed = await zx.$`brew trust`.quiet().nothrow();
    const untrusted = wanted.filter((tap) => !listed.stdout.includes(tap));

    if (untrusted.length === 0) return;

    if (!apply) {
        for (const tap of untrusted) skip(tap, 'would trust');
        return;
    }

    const trust = await zx.$`brew trust ${untrusted}`.quiet().nothrow();

    if (trust.exitCode !== 0) {
        fail(`could not trust ${untrusted.length} taps`, trust.stderr.trim());
        process.exit(1);
    }

    for (const tap of untrusted) ok(tap, 'trusted');
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
        // ? One extension can carry several UTIs (.md is both Daring Fireball's
        // ? and iA's), so the extension alone is an ambiguous label — name the UTI
        // ? whenever it is not the only one for that extension.
        const twin = DEFAULT_APPS.some(
            (other) => other.ext === ext && other.uti !== uti,
        );
        const label = twin ? `.${ext}  ${uti}` : `.${ext}`;

        // ? Skipping what already matches is not just tidiness: macOS raises a
        // ? "keep using X?" dialog per type whenever a handler actually changes,
        // ? and those queue up invisibly behind the terminal.
        const current = await handlerFor(ext);

        if (current.id === app.id) {
            ok(label, app.name);
            continue;
        }

        // ? A type nobody has claimed and a type currently claimed by a
        // ? DIFFERENT app are not the same news. The second means apply would
        // ? take the type away from whatever holds it, which is how a stale row
        // ? here silently reverted .go and .tsx off Cursor — reported for months
        // ? as an ordinary "would open in Neovide" line.
        // ? A type nobody has claimed and a type currently claimed by a
        // ? DIFFERENT app are not the same news. The second means apply would
        // ? take the type away from whatever holds it.
        const heldByOther = current.id !== '' && current.name !== '';

        if (!apply) {
            if (heldByOther) warn(label, `${current.name} → ${app.name}`);
            else skip(label, `would open in ${app.name}`);
            continue;
        }

        await zx.$`duti -s ${app.id} ${uti} all`;
        warn(
            label,
            heldByOther
                ? `${current.name} → ${app.name} — confirm the dialog`
                : `confirm the ${app.name} dialog`,
        );
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
// ? duti -x prints three lines: app name, app path, bundle id. The id is what
// ? identifies a handler; the name is what a human recognises in a report, so
// ? both come back from the one call rather than a second lookup.
async function handlerFor(ext: string) {
    const seen = await zx.$`duti -x ${ext}`.quiet().nothrow();
    const lines = seen.stdout.trim().split('\n').filter(Boolean);
    return { id: lines.at(-1) ?? '', name: lines.at(0) ?? '' };
}

async function which(binary: string) {
    try {
        await zx.which(binary);
        return true;
    } catch {
        return false;
    }
}
