#!/usr/bin/env zx
/**
 * ? dotfiles — reconcile ~ with the mirror.
 * ?
 * ?   pnpm dotfiles                        # status: what's linked, what conflicts
 * ?   pnpm dotfiles apply                  # link everything that isn't linked yet
 * ?   pnpm dotfiles untrack ~/.gitconfig   # hand a file back to ~, drop it from the repo
 * ?
 * ? There is no install step and no backup directory. The tree under home/ is
 * ? the whole config — status and apply are one code path, and apply refuses to
 * ? clobber a real file rather than quietly filing it away somewhere.
 * ?
 * ? Registering a new dotfile is a move, not a verb:
 * ?   mv ~/.foo home/.foo && pnpm dotfiles apply
 */

/* Core */
import * as zx from 'zx';

/* Instruments */
import {
    bb,
    done,
    fail,
    gb,
    group,
    mb,
    new_line,
    note,
    ok,
    rb,
    skip,
    step,
    title,
    warn,
    yb,
} from './lib.mjs';
import {
    build_manifest,
    lstat_or_null,
    repo_root,
    to_tilde,
} from './symlink.mjs';

const STATE = {
    ELSEWHERE: 'elsewhere',
    LINKED: 'linked',
    MISSING: 'missing',
    REAL: 'real',
};

const REPORT = {
    [STATE.ELSEWHERE]: (name) => warn(name, 'points somewhere else'),
    [STATE.LINKED]: (name) => ok(name),
    [STATE.MISSING]: (name) => skip(name, 'missing'),
    [STATE.REAL]: (name, entry) =>
        fail(
            name,
            entry.kind === 'dir'
                ? 'real directory in the way'
                : 'real file in the way',
        ),
};

const [verb = 'status', argument] = zx.argv._;

if (verb === 'status') await reconcile({ dry_run: true });
else if (verb === 'apply') await reconcile({ dry_run: false });
else if (verb === 'untrack') await untrack(argument);
else {
    zx.echo(rb(`Unknown verb: ${verb}`));
    zx.echo(bb('Usage: pnpm dotfiles [status|apply|untrack <path>]'));
    process.exit(1);
}

/* Verbs */
async function reconcile({ dry_run }) {
    const rows = await inspect();

    title(
        'Dotfiles',
        dry_run ? `${rows.length} entries mirrored into ~` : 'applying',
    );
    print(rows);

    const conflicts = rows.filter((row) => row.state === STATE.REAL);
    const pending = rows.filter(
        (row) => row.state === STATE.MISSING || row.state === STATE.ELSEWHERE,
    );

    if (conflicts.length > 0) {
        step(`${conflicts.length} in the way`);

        for (const { entry } of conflicts) {
            fail(to_tilde(entry.target), 'left untouched');
            note(
                `keep it   mv ${to_tilde(entry.target)} ${to_tilde(entry.source)}`,
            );
            note(`drop it   rm -rf ${to_tilde(entry.target)}`);
        }
    }

    if (pending.length === 0 && conflicts.length === 0) {
        done('Everything mirrored.');
        return;
    }

    if (dry_run) {
        if (pending.length > 0) {
            step(`${pending.length} to link`);
            for (const { entry } of pending) skip(to_tilde(entry.target));
        }

        done('Dry run. Run `pnpm dotfiles apply` to make it so.', {
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
            ok(to_tilde(entry.target), `→ ${to_tilde(entry.source)}`);
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

async function untrack(raw_path) {
    if (!raw_path) {
        zx.echo(rb('❌ Which file? e.g. pnpm dotfiles untrack ~/.gitconfig'));
        process.exit(1);
    }

    const target = zx.path.resolve(raw_path.replace(/^~/, zx.os.homedir()));
    const entry = (await build_manifest()).find(
        (item) => item.target === target,
    );

    if (!entry) {
        zx.echo(rb(`❌ ${to_tilde(target)} isn't part of the mirror.`));
        process.exit(1);
    }

    zx.echo(
        bb(`This turns ${mb(to_tilde(target))} into a real file and deletes`),
    );
    zx.echo(
        bb(`${mb(zx.path.relative(repo_root, entry.source))} from the repo.`),
    );
    new_line();

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
    await zx.$`git -C ${repo_root} rm -r --quiet --cached ${entry.source}`;
    await zx.fs.remove(entry.source);

    new_line();
    zx.echo(
        gb(
            `✅ ${to_tilde(target)} is yours now. Commit the removal when ready.`,
        ),
    );
}

/* Helpers */
async function inspect() {
    const manifest = await build_manifest();
    const rows = [];

    for (const entry of manifest) {
        const stats = await lstat_or_null(entry.target);
        let state = STATE.MISSING;

        if (stats?.isSymbolicLink()) {
            const link_target = await zx.fs.readlink(entry.target);
            state =
                link_target === entry.source ? STATE.LINKED : STATE.ELSEWHERE;
        } else if (stats !== null) {
            state = STATE.REAL;
        }

        rows.push({ entry, state });
    }

    return rows;
}

function print(rows) {
    let current_group = null;

    for (const { entry, state } of rows) {
        const dir = zx.path.dirname(entry.target);

        if (dir !== current_group) {
            group(`${to_tilde(dir)}/`);
            current_group = dir;
        }

        const name =
            zx.path.basename(entry.target) + (entry.kind === 'dir' ? '/' : '');
        REPORT[state](name, entry);
    }
}
