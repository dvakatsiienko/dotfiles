#!/usr/bin/env node

/**
 * ? skills-desk — keep the Claude Desktop skills in step with their plugin-x sources.
 * ?
 * ?   pnpm skills-sync-desk                 # check + build
 * ?   pnpm skills-sync-desk check           # drift only
 * ?   pnpm skills-sync-desk build           # zips only
 * ?   pnpm skills-sync-desk stamp <skill>   # after re-adapting a desk SKILL.md
 * ?
 * ? Desk skills are thin ADAPTATIONS of their plugin-x sources, not copies, so
 * ? this never touches SKILL.md content. Each one carries a .source-sha (the git
 * ? blob hash of the SKILL.md it was adapted from); a differing live hash = stale.
 */

import * as zx from 'zx';

import { repoRoot } from './lib/manifest.ts';
/* Instruments */
import { bb, done, fail, mb, note, ok, step, title } from './lib/print.ts';
/* Core */
import type { Dirent } from 'node:fs';

const deskDir = `${repoRoot}/home/.claude/skills-desk`;
const distDir = `${deskDir}/dist`;

zx.$.verbose = false;
zx.$.cwd = repoRoot;

const skills = (await zx.fs.readdir(deskDir, { withFileTypes: true }))
    .filter((entry: Dirent) => entry.isDirectory() && entry.name !== 'dist')
    .map((entry: Dirent) => entry.name);

const [verb = 'sync', argument] = zx.argv._ as string[];

title('Desk skills', `${skills.length} adapted from plugin-x`);

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
            `re-adapt SKILL.md, then ${bb('pnpm skills-sync-desk stamp <skill>')}`,
        );
    }

    return stale;
}

async function build() {
    step('Zips');
    await zx.fs.emptyDir(distDir);

    for (const skill of skills) {
        await zx.$({
            cwd: deskDir,
        })`zip -rq dist/${skill}.zip ${skill} -x '*/.source-sha'`;
        ok(`${skill}.zip`, mb(zx.path.relative(repoRoot, distDir)));
    }

    note(
        'upload: Claude Desktop → Settings → Capabilities → Skills → drag zips',
    );
    await zx.$`open ${distDir}`;
    done(`Built ${skills.length}.`);
}

async function stamp(skill: string) {
    if (!skills.includes(skill)) {
        step('Stamp');
        fail(`unknown desk skill: ${skill}`, `have: ${skills.join(', ')}`);
        process.exit(1);
    }

    await zx.fs.writeFile(
        `${deskDir}/${skill}/.source-sha`,
        `${await sourceSha(skill)}\n`,
    );

    step('Stamp');
    ok(skill, 'stamped at the current source');
    done('Stamped.');
}

/* Helpers */
async function sourceSha(skill: string) {
    const rel = `home/.claude/plugin-x/skills/${skill}/SKILL.md`;
    return (await zx.$`git hash-object ${rel}`).stdout.trim();
}

async function readStamp(skill: string) {
    const path = `${deskDir}/${skill}/.source-sha`;
    if (!(await zx.fs.pathExists(path))) return null;
    return (await zx.fs.readFile(path, 'utf8')).trim();
}
