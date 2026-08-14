#!/usr/bin/env node

/**
 * ? skills-desk — keep the Claude Desktop skills in step with their plugin-x sources.
 * ?
 * ?   pnpm skills-desk-sync                 # check + build
 * ?   pnpm skills-desk-sync check           # drift only
 * ?   pnpm skills-desk-sync build           # zips only
 * ?   pnpm skills-desk-sync stamp <skill>   # after re-adapting a desk SKILL.md
 * ?
 * ? Desk skills are thin ADAPTATIONS of their plugin-x sources, not copies, so
 * ? this never touches SKILL.md content. Each one carries a .source-sha (the git
 * ? blob hash of the SKILL.md it was adapted from); a differing live hash = stale.
 */

import * as zx from 'zx';

/* Instruments */
import { bb, done, fail, mb, note, ok, step, title } from './lib.ts';
import { repo_root } from './symlink.ts';
/* Core */
import type { Dirent } from 'node:fs';

const desk_dir = `${repo_root}/home/.claude/skills-desk`;
const dist_dir = `${desk_dir}/dist`;

zx.$.verbose = false;
zx.$.cwd = repo_root;

const skills = (await zx.fs.readdir(desk_dir, { withFileTypes: true }))
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
        const stamped = await read_stamp(skill);
        if (stamped === (await source_sha(skill))) {
            ok(skill);
            continue;
        }

        stale += 1;
        fail(skill, stamped === null ? 'never stamped' : 'drifted');
    }

    if (stale > 0) {
        note(
            `re-adapt SKILL.md, then ${bb('pnpm skills-desk-sync stamp <skill>')}`,
        );
    }

    return stale;
}

async function build() {
    step('Zips');
    await zx.fs.emptyDir(dist_dir);

    for (const skill of skills) {
        await zx.$({
            cwd: desk_dir,
        })`zip -rq dist/${skill}.zip ${skill} -x '*/.source-sha'`;
        ok(`${skill}.zip`, mb(zx.path.relative(repo_root, dist_dir)));
    }

    note(
        'upload: Claude Desktop → Settings → Capabilities → Skills → drag zips',
    );
    await zx.$`open ${dist_dir}`;
    done(`Built ${skills.length}.`);
}

async function stamp(skill: string) {
    if (!skills.includes(skill)) {
        step('Stamp');
        fail(`unknown desk skill: ${skill}`, `have: ${skills.join(', ')}`);
        process.exit(1);
    }

    await zx.fs.writeFile(
        `${desk_dir}/${skill}/.source-sha`,
        `${await source_sha(skill)}\n`,
    );

    step('Stamp');
    ok(skill, 'stamped at the current source');
    done('Stamped.');
}

/* Helpers */
async function source_sha(skill: string) {
    const rel = `home/.claude/plugin-x/skills/${skill}/SKILL.md`;
    return (await zx.$`git hash-object ${rel}`).stdout.trim();
}

async function read_stamp(skill: string) {
    const path = `${desk_dir}/${skill}/.source-sha`;
    if (!(await zx.fs.pathExists(path))) return null;
    return (await zx.fs.readFile(path, 'utf8')).trim();
}
