#!/usr/bin/env node
/**
 * ? plugin-release — bump the plugins the tree moved past, and refresh them.
 * ?
 * ?   pnpm plugin-release          # status: what changed, what would bump
 * ?   pnpm plugin-release apply    # bump, then refresh each registered plugin
 * ?
 * ? Status and apply are one code path, the `dotfiles-link` house convention.
 * ? Nothing here commits: the bump lands in the working tree and the commit is
 * ? the caller's, so a release and its reason stay in one commit.
 * ?
 * ? A plugin refresh binds on the NEXT session, never this one — every run ends
 * ? by saying so, because acting on a plugin that has not bound yet is the
 * ? mistake this ritual keeps producing.
 */

/* Core */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as zx from 'zx';

import { repoRoot } from './lib/manifest.ts';
import type { Plugin, Release } from './lib/plugin-release.ts';
import {
    auditCwSymlinks,
    findPlugins,
    planRelease,
    readField,
} from './lib/plugin-release.ts';
/* Instruments */
import {
    bb,
    bold,
    dim,
    done,
    fail,
    gb,
    group,
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

const CW_SKILLS = join(repoRoot, 'home/.claude/plugin-x-cw/skills');
const SOURCE_SKILLS = join(repoRoot, 'home/.claude/plugin-x/skills');

zx.$.verbose = false;

const [verb = 'status'] = zx.argv._.map(String);
if (verb !== 'status' && verb !== 'apply') {
    zx.echo(rb(`Unknown verb: ${verb}`));
    zx.echo(bb('Usage: pnpm plugin-release [status|apply]'));
    process.exit(1);
}

await release(verb === 'apply');

async function release(apply: boolean) {
    title('plugin release', apply ? 'apply' : 'status');

    const releases: Release[] = [];
    for (const plugin of await findPlugins()) releases.push(await plan(plugin));

    for (const entry of releases) await report(entry, apply);
    await audit();

    binds(releases, apply, await inWorktree());
}

/**
 * ? A marketplace resolves its `./` source against the checkout it was added
 * ? from — always the main one. Run from a worktree, the bump lands here and the
 * ? refresh reads there, so the CLI cheerfully reports "already at the latest
 * ? version" and the release binds nothing. Measured on this tool's first real
 * ? run; a silent no-op release is exactly the failure worth one git call.
 */
async function inWorktree() {
    const [common, own] = await Promise.all([
        zx.$`git -C ${repoRoot} rev-parse --path-format=absolute --git-common-dir`.nothrow(),
        zx.$`git -C ${repoRoot} rev-parse --path-format=absolute --git-dir`.nothrow(),
    ]);

    return common.stdout.trim() !== own.stdout.trim();
}

async function plan(plugin: Plugin): Promise<Release> {
    // ? The boundary commit is the last one that touched the `version` line, so
    // ? `-G` rather than a plain log: a commit editing the manifest's
    // ? description is not a release and must not reset the count.
    const moved = (
        await zx.$`git -C ${repoRoot} log -1 --format=%H -G"version" -- ${plugin.manifest}`.nothrow()
    ).stdout.trim();

    const range = moved === '' ? 'HEAD' : `${moved}..HEAD`;
    const touched = Number(
        (
            await zx.$`git -C ${repoRoot} rev-list --count ${range} -- ${plugin.dir}`.nothrow()
        ).stdout.trim() || '0',
    );

    const head = (
        await zx.$`git -C ${repoRoot} show HEAD:${plugin.manifest}`.nothrow()
    ).stdout;

    return planRelease({
        committedVersion: head === '' ? null : readField(head, 'version'),
        plugin,
        touched,
    });
}

async function report(entry: Release, apply: boolean) {
    const { action, commands, plugin, touched, version } = entry;
    step(`${plugin.name}  ${dim(version.from)}`);

    if (action === 'uncommitted') {
        warn(
            `already bumped to ${version.from}, not committed yet`,
            'commit it before releasing again',
        );
        return;
    }
    if (action === 'none') {
        skip('nothing since the version moved');
        return;
    }

    const change = `${version.from} → ${bold(version.to)}`;
    if (!apply) {
        ok(`${touched} commit(s) since the version moved`, change);
        for (const command of commands) note(`would run: ${command.join(' ')}`);
        if (commands.length === 0)
            note('bump only — cw reads this plugin by file');
        return;
    }

    await writeVersion(plugin, version.to);
    ok(`bumped ${change}`);
    for (const command of commands) await run(command);
    if (commands.length === 0) note('bump only — cw reads this plugin by file');
}

/**
 * ? A line edit, never JSON.parse + stringify: these manifests are excluded from
 * ? the formatter on purpose, so a rewrite would reformat a file this repo has
 * ? agreed not to own.
 */
async function writeVersion(plugin: Plugin, version: string) {
    const path = join(repoRoot, plugin.manifest);
    const raw = await readFile(path, 'utf8');
    const next = raw.replace(/("version":\s*")[^"]*(")/, `$1${version}$2`);

    if (next === raw) throw new Error(`No version line in ${plugin.manifest}`);
    await writeFile(path, next);
}

async function run(command: string[]) {
    const [binary = '', ...args] = command;
    const result = await zx.$`${binary} ${args}`.nothrow();

    if (result.exitCode === 0) ok(command.join(' '));
    else fail(command.join(' '), result.stderr.trim().split('\n')[0]);
}

async function audit() {
    const { unlinked } = await auditCwSymlinks({
        cwSkills: CW_SKILLS,
        sourceSkills: SOURCE_SKILLS,
    });

    step('cw symlink audit');
    if (unlinked.length === 0) {
        ok('every x skill reaches cw');
        return;
    }

    // ? Surfaced, never linked. The curated set is Dima's call.
    warn(`${unlinked.length} x skill(s) not in plugin-x-cw/skills`);
    group('absent from cw');
    for (const name of unlinked) zx.echo(dim(`    ${name}`));
    note(
        'link one with: ln -s ../../plugin-x/skills/<name> — his call, not ours',
    );
}

function binds(releases: Release[], apply: boolean, worktree: boolean) {
    const bumped = releases.filter((entry) => entry.action === 'bump');
    const refreshed = bumped.filter((entry) => entry.commands.length > 0);

    newLine();
    zx.echo(bold(yb('binds next session')));

    if (worktree && refreshed.length > 0)
        warn(
            'running from a worktree — the bump landed here, the refresh read the main checkout',
            'nothing binds until this branch merges',
        );

    if (bumped.length === 0) {
        zx.echo(dim('  nothing to release — every plugin matches its tree.'));
        done('nothing to do');
        return;
    }
    if (!apply) {
        zx.echo(
            dim(
                `  ${bumped.length} plugin(s) would bump. Nothing was written — run: pnpm plugin-release apply`,
            ),
        );
        done('status only', { clean: false });
        return;
    }

    for (const entry of bumped)
        zx.echo(
            `  ${gb('•')} ${entry.plugin.name} ${entry.version.from} → ${bold(entry.version.to)}${entry.commands.length === 0 ? dim(' (bump only)') : ''}`,
        );
    zx.echo(
        dim(
            `  ${refreshed.length} refreshed plugin(s) bind on the NEXT session, not this one.`,
        ),
    );
    zx.echo(dim('  commit the bumped manifests with the work they describe.'));
    done('released', { clean: false });
}
