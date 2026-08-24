#!/usr/bin/env node
/**
 * ? dotfiles — reconcile ~ with the mirror.
 * ?
 * ?   pnpm dotfiles-link                        # status: what's linked, what conflicts
 * ?   pnpm dotfiles-link apply                  # link everything that isn't linked yet
 * ?   pnpm dotfiles-link untrack ~/.gitconfig   # hand a file back to ~, drop it from the repo
 * ?   pnpm dotfiles-link register ~/.foo        # move a file into the mirror and link it back
 * ?
 * ? There is no install step and no backup directory. The tree under home/ is
 * ? the whole config — status and apply are one code path, and apply refuses to
 * ? clobber a real file rather than quietly filing it away somewhere.
 */

/* Core */
import * as zx from 'zx';

import type { Entry } from './lib/manifest.ts';
import {
    buildManifest,
    lstatOrNull,
    noLink,
    noLinkReasons,
    repoRoot,
    toTilde,
} from './lib/manifest.ts';
/* Instruments */
import {
    bb,
    done,
    fail,
    gb,
    group,
    mb,
    newLine,
    note,
    ok,
    rb,
    skip,
    step,
    title,
    warn,
    yb,
} from './lib/print.ts';

const STATE = {
    ELSEWHERE: 'elsewhere',
    LINKED: 'linked',
    MISSING: 'missing',
    REAL: 'real',
} as const;

type State = (typeof STATE)[keyof typeof STATE];
type Row = { entry: Entry; state: State };

const REPORT: Record<State, (name: string, entry: Entry) => void> = {
    [STATE.ELSEWHERE]: (name: string) => warn(name, 'points somewhere else'),
    [STATE.LINKED]: (name: string) => ok(name),
    [STATE.MISSING]: (name: string) => skip(name, 'missing'),
    [STATE.REAL]: (name: string, entry: Entry) =>
        fail(
            name,
            entry.kind === 'dir'
                ? 'real directory in the way'
                : 'real file in the way',
        ),
};

const [verb = 'status', argument] = zx.argv._;

if (verb === 'status') await reconcile({ dryRun: true });
else if (verb === 'apply') await reconcile({ dryRun: false });
else if (verb === 'untrack') await untrack(argument);
else if (verb === 'register') await register(argument);
else {
    zx.echo(rb(`Unknown verb: ${verb}`));
    zx.echo(
        bb(
            'Usage: pnpm dotfiles-link [status|apply|untrack <path>|register <path>]',
        ),
    );
    process.exit(1);
}

/* Verbs */
async function reconcile({ dryRun }: { dryRun: boolean }) {
    const rows = await inspect();

    title(
        'Dotfiles',
        dryRun ? `${rows.length} entries mirrored into ~` : 'applying',
    );
    print(rows);

    // ? Held back on purpose, and for three different reasons. Printing the
    // ? reason is why noLink carries one — otherwise these six paths just look
    // ? like an oversight every time someone reads the report.
    if (dryRun) {
        step(`${noLink.size} not linked, by design`);
        for (const [path, reason] of noLink) skip(path, noLinkReasons[reason]);
    }

    const conflicts = rows.filter((row) => row.state === STATE.REAL);
    const pending = rows.filter(
        (row) => row.state === STATE.MISSING || row.state === STATE.ELSEWHERE,
    );

    if (conflicts.length > 0) {
        step(`${conflicts.length} in the way`);

        for (const { entry } of conflicts) {
            fail(toTilde(entry.target), 'left untouched');
            note(
                `keep it   mv ${toTilde(entry.target)} ${toTilde(entry.source)}`,
            );
            note(`drop it   rm -rf ${toTilde(entry.target)}`);
        }
    }

    if (pending.length === 0 && conflicts.length === 0) {
        done('Everything mirrored.');
        return;
    }

    if (dryRun) {
        if (pending.length > 0) {
            step(`${pending.length} to link`);
            for (const { entry } of pending) skip(toTilde(entry.target));
        }

        done('Dry run. Run `pnpm dotfiles-link apply` to make it so.', {
            clean: false,
        });
        process.exit(1);
    }

    if (pending.length > 0) {
        step(`Linking ${pending.length}`);

        for (const { entry } of pending) {
            // ? The parent has to exist before anything can be linked into it.
            await zx.fs.mkdirp(zx.path.dirname(entry.target));
            await zx.fs.remove(entry.target);
            await zx.fs.symlink(entry.source, entry.target);
            ok(toTilde(entry.target), `→ ${toTilde(entry.source)}`);
        }
    }

    if (conflicts.length > 0) {
        done(`Linked ${pending.length}, left ${conflicts.length} alone.`, {
            clean: false,
        });
        process.exit(1);
    }

    done(`Linked ${pending.length}.`);
}

async function untrack(rawPath: string | undefined) {
    if (!rawPath) {
        zx.echo(
            rb('❌ Which file? e.g. pnpm dotfiles-link untrack ~/.gitconfig'),
        );
        process.exit(1);
    }

    const target = zx.path.resolve(rawPath.replace(/^~/, zx.os.homedir()));
    const entry = (await buildManifest()).find(
        (item) => item.target === target,
    );

    if (!entry) {
        zx.echo(rb(`❌ ${toTilde(target)} isn't part of the mirror.`));
        process.exit(1);
    }

    zx.echo(
        bb(`This turns ${mb(toTilde(target))} into a real file and deletes`),
    );
    zx.echo(
        bb(`${mb(zx.path.relative(repoRoot, entry.source))} from the repo.`),
    );
    newLine();

    const confirm = await zx.question(yb('Continue? (y/N): '));
    if (confirm.toLowerCase() !== 'y') {
        zx.echo(bb('Cancelled.'));
        return;
    }

    // ? Copy through the link first, so the content survives losing it.
    const staged = `${target}.untracking`;
    await zx.fs.copy(entry.source, staged);
    await zx.fs.remove(target);
    await zx.fs.move(staged, target);
    await zx.$`git -C ${repoRoot} rm -r --quiet --cached ${entry.source}`;
    await zx.fs.remove(entry.source);

    newLine();
    zx.echo(
        gb(
            `✅ ${toTilde(target)} is yours now. Commit the removal when ready.`,
        ),
    );
}

async function register(rawPath: string | undefined) {
    if (!rawPath) {
        zx.echo(rb('❌ Which file? e.g. pnpm dotfiles-link register ~/.foo'));
        process.exit(1);
    }

    const home = zx.os.homedir();
    const target = zx.path.resolve(rawPath.replace(/^~/, home));
    const relative = zx.path.relative(home, target);

    if (relative.startsWith('..')) {
        zx.echo(
            rb(`❌ ${target} is outside ~ — only home paths can be mirrored.`),
        );
        process.exit(1);
    }

    const stats = await lstatOrNull(target);
    if (stats === null) {
        zx.echo(rb(`❌ ${toTilde(target)} does not exist.`));
        process.exit(1);
    }
    if (stats.isSymbolicLink()) {
        zx.echo(
            rb(
                `❌ ${toTilde(target)} is already a symlink — nothing to register.`,
            ),
        );
        process.exit(1);
    }

    const source = zx.path.join(repoRoot, 'home', relative);
    if ((await lstatOrNull(source)) !== null) {
        zx.echo(rb(`❌ home/${relative} already exists in the repo.`));
        process.exit(1);
    }

    await zx.fs.mkdirp(zx.path.dirname(source));
    await zx.fs.move(target, source);
    ok(toTilde(target), `→ home/${relative}`);

    await reconcile({ dryRun: false });
}

/* Helpers */
async function inspect() {
    const manifest = await buildManifest();
    const rows: Row[] = [];

    for (const entry of manifest) {
        const stats = await lstatOrNull(entry.target);
        let state: State = STATE.MISSING;

        if (stats?.isSymbolicLink()) {
            const linkTarget = await zx.fs.readlink(entry.target);
            state =
                linkTarget === entry.source ? STATE.LINKED : STATE.ELSEWHERE;
        } else if (stats !== null) {
            state = STATE.REAL;
        }

        rows.push({ entry, state });
    }

    return rows;
}

function print(rows: Row[]) {
    let currentGroup: string | null = null;

    for (const { entry, state } of rows) {
        const dir = zx.path.dirname(entry.target);

        if (dir !== currentGroup) {
            group(`${toTilde(dir)}/`);
            currentGroup = dir;
        }

        const name =
            zx.path.basename(entry.target) + (entry.kind === 'dir' ? '/' : '');
        REPORT[state]?.(name, entry);
    }
}
