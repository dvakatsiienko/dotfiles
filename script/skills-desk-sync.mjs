#!/usr/bin/env zx
/**
 * skills-desk-sync — leg 1 of dotfiles#16.
 *
 * Desk skills are thin ADAPTATIONS of their plugin-x sources, not copies, so
 * this script never touches SKILL.md content. It does the deterministic part:
 *   - drift check: each desk skill carries .source-sha (git blob hash of the
 *     plugin-x SKILL.md it was adapted from); a differing live hash = stale
 *   - zip build: fresh zips for every desk skill into skills-desk/dist/
 *   - stamp: record the current source hash after a re-adaptation
 *
 * Usage:
 *   pnpm skills-desk [check|build]   # default: check + build
 *   pnpm skills-desk stamp <skill>   # after re-adapting a desk SKILL.md
 */
import { $, argv, chalk, fs, path } from 'zx';

const root = path.join(import.meta.dirname, '..');
const srcDir = path.join(root, '.clauderc/plugin-x/skills');
const deskDir = path.join(root, '.clauderc/skills-desk');
const distDir = path.join(deskDir, 'dist');

$.verbose = false;
$.cwd = root;

const mirrored = (await fs.readdir(deskDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && e.name !== 'dist')
    .map((e) => e.name);

const sourceSha = async (skill) => {
    const rel = `.clauderc/plugin-x/skills/${skill}/SKILL.md`;
    return (await $`git hash-object ${rel}`).stdout.trim();
};

const check = async () => {
    let staleCount = 0;
    for (const skill of mirrored) {
        const stampPath = path.join(deskDir, skill, '.source-sha');
        const stamped = (await fs.pathExists(stampPath))
            ? (await fs.readFile(stampPath, 'utf8')).trim()
            : null;
        const live = await sourceSha(skill);
        const stale = stamped !== live;
        if (stale) staleCount += 1;
        const mark = stale ? chalk.red('● stale') : chalk.green('○ fresh');
        const hint = stamped === null ? chalk.dim(' (never stamped)') : '';
        console.log(`${mark}  ${skill}${hint}`);
    }
    if (staleCount > 0) {
        console.log(
            chalk.yellow(
                `\n${staleCount} desk skill(s) drifted from plugin-x — re-adapt SKILL.md, then: pnpm skills-desk stamp <skill>`,
            ),
        );
    }
    return staleCount;
};

const build = async () => {
    await fs.emptyDir(distDir);
    for (const skill of mirrored) {
        await $({ cwd: deskDir })`zip -rq dist/${skill}.zip ${skill} -x '*/.source-sha'`;
        console.log(chalk.green(`⇡ ${path.relative(root, distDir)}/${skill}.zip`));
    }
    console.log(chalk.dim(`\nupload: Claude Desktop → Settings → Capabilities → Skills → drag zips from dist/`));
    await $`open ${distDir}`;
};

const stamp = async (skill) => {
    if (!mirrored.includes(skill)) {
        console.log(chalk.red(`unknown desk skill: ${skill} (have: ${mirrored.join(', ')})`));
        process.exit(1);
    }
    await fs.writeFile(path.join(deskDir, skill, '.source-sha'), `${await sourceSha(skill)}\n`);
    console.log(chalk.green(`stamped ${skill}`));
};

const cmd = argv._[0] ?? 'sync';
if (cmd === 'check') process.exit((await check()) > 0 ? 1 : 0);
else if (cmd === 'build') await build();
else if (cmd === 'stamp') await stamp(argv._[1]);
else {
    const staleCount = await check();
    console.log('');
    await build();
    process.exit(staleCount > 0 ? 1 : 0);
}
