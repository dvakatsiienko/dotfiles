// The A/B harness for the refinement passes. Dima judges every pass by holding the new page
// against the one before it in two tabs, so a pass has to ship its own baseline: this builds a
// git ref into `dist-before/` and the working tree into `dist/`, and the daemon serves the first
// one at /before. The ref defaults to HEAD~1, which is the commit a just-finished pass replaced.
//
// The old tree is taken with `git archive` rather than a second worktree: nothing here runs pnpm,
// and a registered worktree in this repo rewrites the shared lefthook shims on the first install
// anyone triggers inside it.
//
// 📌 The baseline is patched before it compiles. `router.ts` reads `window.location.pathname`
// raw, so mounted under /before every route would read as `/before` and fall through to the
// board — the /hk half of the comparison would silently show the wrong page. Two replacements
// teach that one copy where it lives, and both assert: a patch that matched nothing is exactly
// the failure this file exists to prevent.
import { execFileSync } from 'node:child_process';
import {
    cpSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    symlinkSync,
    writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const MOUNT = '/before';

const app = import.meta.dirname;
const repo = execFileSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: app,
    encoding: 'utf8',
}).trim();
const vite = join(repo, 'node_modules/.bin/vite');
const ref = process.argv[2] ?? 'HEAD~1';

const patch = (path: string, edits: readonly [string, string][]) => {
    let text = readFileSync(path, 'utf8');

    for (const [from, to] of edits) {
        if (!text.includes(from)) {
            throw new Error(`${path}: nothing matched ${JSON.stringify(from)}`);
        }

        text = text.replaceAll(from, to);
    }

    writeFileSync(path, text);
};

const buildBaseline = (stage: string) => {
    const tar = join(stage, 'tree.tar');
    const staged = join(stage, 'hotkeys/chords');

    execFileSync('git', ['archive', ref, 'hotkeys', '-o', tar], { cwd: repo });
    execFileSync('tar', ['-xf', tar, '-C', stage]);

    // The install is the current one on purpose: the baseline is a comparison of the pages, not
    // of their lockfiles, and resolving a second store to build one tab would be minutes per pass.
    symlinkSync(join(repo, 'node_modules'), join(stage, 'node_modules'));
    symlinkSync(join(app, 'node_modules'), join(staged, 'node_modules'));

    patch(join(staged, 'src/router.ts'), [
        [
            'path: window.location.pathname,',
            `path: window.location.pathname.replace(/^\\${MOUNT}/, '') || '/',`,
        ],
        [
            "window.history.pushState(null, '', to);",
            `window.history.pushState(null, '', '${MOUNT}' + to);`,
        ],
    ]);
    // Two tabs of one app, and the tab strip is how dima tells them apart. The built page keeps
    // the bare name; this is the same marker the dev server wears.
    patch(join(staged, 'index.html'), [
        ['<title>chords</title>', '<title>chords: before</title>'],
    ]);

    execFileSync(vite, ['build', `--base=${MOUNT}/`], {
        cwd: staged,
        stdio: 'inherit',
    });

    return join(staged, 'dist');
};

const stage = mkdtempSync(join(tmpdir(), 'chords-ab-'));
const before = join(app, 'dist-before');

try {
    const built = buildBaseline(stage);

    // Replaced rather than merged: vite hashes its asset names, so a copy over the last baseline
    // would leave every earlier pass's bundle sitting in the directory.
    rmSync(before, { force: true, recursive: true });
    cpSync(built, before, { recursive: true });
} finally {
    rmSync(stage, { force: true, recursive: true });
}

execFileSync(vite, ['build'], { cwd: app, stdio: 'inherit' });

console.log(`\n${ref} → /before · working tree → /`);
