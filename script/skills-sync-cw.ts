#!/usr/bin/env node

/**
 * ? skills-cw — keep the cw skills in step with their plugin-x sources.
 * ?
 * ?   pnpm skills-sync-cw                 # check + build
 * ?   pnpm skills-sync-cw check           # drift only
 * ?   pnpm skills-sync-cw build           # zips only
 * ?   pnpm skills-sync-cw stamp <skill>   # after re-adapting a cw SKILL.md
 * ?
 * ? cw skills are thin ADAPTATIONS of their plugin-x sources, not copies, so
 * ? this never touches SKILL.md content. Each one carries a .source-sha, digested
 * ? over every tracked file of the source skill dir (SKILL.md + references/);
 * ? a differing live hash = stale.
 */

/* Core */
import { createHash } from 'node:crypto';
import * as zx from 'zx';

import { repoRoot } from './lib/manifest.ts';
/* Instruments */
import { bb, done, fail, mb, note, ok, step, title } from './lib/print.ts';
import type { Dirent } from 'node:fs';

const cwDir = `${repoRoot}/home/.claude/skills-cw`;
const distDir = `${cwDir}/dist`;

zx.$.verbose = false;
zx.$.cwd = repoRoot;

const skills = (await zx.fs.readdir(cwDir, { withFileTypes: true }))
    .filter((entry: Dirent) => entry.isDirectory() && entry.name !== 'dist')
    .map((entry: Dirent) => entry.name);

const [verb = 'sync', argument] = zx.argv._ as string[];

title('cw skills', `${skills.length} adapted from plugin-x`);

if (verb === 'check') {
    const stale = await check();
    done(stale > 0 ? `${stale} drifted.` : 'All fresh.', {
        clean: stale === 0,
    });
    process.exit(stale > 0 ? 1 : 0);
}

if (verb === 'build') await build();
else if (verb === 'stamp') await stamp(argument ?? '');
else {
    const stale = await check();
    await build();
    process.exit(stale > 0 ? 1 : 0);
}

/* Verbs */
async function check() {
    step('Drift');

    let stale = 0;

    for (const skill of skills) {
        const stamped = await readStamp(skill);
        if (stamped === (await sourceSha(skill))) {
            ok(skill);
            continue;
        }

        stale += 1;
        fail(skill, stamped === null ? 'never stamped' : 'drifted');
    }

    if (stale > 0) {
        note(
            `re-adapt SKILL.md, then ${bb('pnpm skills-sync-cw stamp <skill>')}`,
        );
    }

    return stale;
}

async function build() {
    step('Zips');
    await zx.fs.emptyDir(distDir);

    for (const skill of skills) {
        await zx.$({
            cwd: cwDir,
        })`zip -rq dist/${skill}.zip ${skill} -x '*/.source-sha'`;
        ok(`${skill}.zip`, mb(zx.path.relative(repoRoot, distDir)));
    }

    note('upload: cw → Settings → Capabilities → Skills → drag zips');
    await zx.$`open ${distDir}`;
    done(`Built ${skills.length}.`);
}

async function stamp(skill: string) {
    if (!skills.includes(skill)) {
        step('Stamp');
        fail(`unknown cw skill: ${skill}`, `have: ${skills.join(', ')}`);
        process.exit(1);
    }

    await zx.fs.writeFile(
        `${cwDir}/${skill}/.source-sha`,
        `${await sourceSha(skill)}\n`,
    );

    step('Stamp');
    ok(skill, 'stamped at the current source');
    done('Stamped.');
}

/* Helpers */
// ? Digested from the files' own bytes, not from git's index. `git ls-files`
// ? sees only TRACKED files, so a reference doc added to a source skill and not
// ? yet committed left the hash unmoved — the check reported the cw adaptation
// ? fresh while it was already stale. A drift detector that under-reports is
// ? worse than none, because it is believed.
// ? Path goes into the digest alongside content, so a rename counts as drift.
async function sourceSha(skill: string) {
    const dir = `${repoRoot}/home/.claude/plugin-x/skills/${skill}`;
    const digest = createHash('sha1');

    for (const rel of await sourceFiles(dir)) {
        digest.update(rel);
        digest.update(await zx.fs.readFile(`${dir}/${rel}`));
    }

    return digest.digest('hex');
}

// ? Sorted, so the digest does not depend on directory order.
async function sourceFiles(dir: string, prefix = ''): Promise<string[]> {
    const entries = await zx.fs.readdir(dir, { withFileTypes: true });
    const found: string[] = [];

    for (const entry of entries.sort((a: Dirent, b: Dirent) =>
        a.name.localeCompare(b.name),
    )) {
        if (entry.name === '.DS_Store') continue;
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory())
            found.push(...(await sourceFiles(`${dir}/${rel}`, rel)));
        else found.push(rel);
    }

    return found;
}

async function readStamp(skill: string) {
    const path = `${cwDir}/${skill}/.source-sha`;
    if (!(await zx.fs.pathExists(path))) return null;
    return (await zx.fs.readFile(path, 'utf8')).trim();
}
