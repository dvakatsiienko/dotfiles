/**
 * ? Tests for the mirror rule. Everything runs against a fixture tree in a temp
 * ? directory — nothing here reads or writes the real home directory.
 * ?
 * ?   pnpm test        # once
 * ?   pnpm test:watch  # on change
 */

/* Core */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

/* Instruments */
import {
    buildManifest,
    findOrphans,
    findRepoRoot,
    repoRoot,
} from './manifest.ts';

type Options = Parameters<typeof buildManifest>[0];

let root: string;
let mirror: string;
let target: string;

const manifest = (options?: Options) =>
    buildManifest({ mirror, skip: new Set(), target, ...options });

const rels = async (options?: Options) =>
    (await manifest(options)).map((entry) => entry.rel);

beforeAll(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'mirror-test-'));
    mirror = path.join(root, 'home');
    target = path.join(root, 'target');

    await write(`${mirror}/.zshrc`, 'zsh');
    await write(`${mirror}/.gitconfig`, 'git');
    await write(`${mirror}/.DS_Store`, 'junk');
    await write(`${mirror}/.config/starship.toml`, 'prompt');
    await write(`${mirror}/.config/nested/deep/file.txt`, 'deep');
    await write(`${mirror}/.claude/settings.json`, '{}');
    await write(`${mirror}/.claude/hooks/hook.sh`, '#!/bin/sh');
    await write(`${mirror}/.claude/plugin-x/SKILL.md`, 'skill');

    // ? The target already owns ~/.config, so the walk has to descend into it.
    await fs.mkdir(`${target}/.config`, { recursive: true });
});

afterAll(async () => {
    await fs.rm(root, { force: true, recursive: true });
});

describe('the mirror rule', () => {
    test('a path under the mirror is the same path under the target', async () => {
        const entries = await manifest();
        const zshrc = entries.find((entry) => entry.rel === '.zshrc');

        expect(zshrc?.source).toBe(`${mirror}/.zshrc`);
        expect(zshrc?.target).toBe(`${target}/.zshrc`);
    });

    test('top-level files are linked individually', async () => {
        const found = await rels();

        expect(found).toContain('.zshrc');
        expect(found).toContain('.gitconfig');
    });

    test('.DS_Store never makes it into the manifest', async () => {
        expect(await rels()).not.toContain('.DS_Store');
    });
});

describe('directory granularity', () => {
    test('a directory the target does not have is linked whole', async () => {
        const entries = await manifest();
        const claude = entries.find((entry) => entry.rel === '.claude');

        expect(claude?.kind).toBe('dir');
        // ? Linked as one directory, so its contents are not separate entries.
        expect(entries.some((entry) => entry.rel.startsWith('.claude/'))).toBe(
            false,
        );
    });

    test('a directory the target already owns is descended into', async () => {
        const found = await rels();

        expect(found).not.toContain('.config');
        expect(found).toContain('.config/starship.toml');
    });

    test('descending stops as soon as the target stops owning the path', async () => {
        // ? target/.config exists, but target/.config/nested does not — so the
        // ? walk descends one level and then links `nested` wholesale.
        const found = await rels();

        expect(found).toContain('.config/nested');
        expect(found).not.toContain('.config/nested/deep/file.txt');
    });

    test('a symlinked directory in the target is replaced, not descended into', async () => {
        const linkedTarget = path.join(root, 'linked');
        await fs.mkdir(linkedTarget, { recursive: true });
        await fs.symlink(`${mirror}/.claude`, `${linkedTarget}/.claude`);

        const found = await rels({ target: linkedTarget });

        expect(found).toContain('.claude');
        expect(found.some((rel) => rel.startsWith('.claude/'))).toBe(false);
    });
});

describe('exclusions', () => {
    test('a skipped path is absent, and so is everything under it', async () => {
        const found = await rels({ skip: new Set(['.claude']) });

        expect(
            found.some(
                (rel) => rel === '.claude' || rel.startsWith('.claude/'),
            ),
        ).toBe(false);
        expect(found).toContain('.zshrc');
    });

    test('skipping applies to nested paths too', async () => {
        // ? .claude is linked whole here, so a nested skip only bites once the
        // ? parent is itself descended into.
        const owned = path.join(root, 'owned');
        await fs.mkdir(`${owned}/.claude`, { recursive: true });

        const found = await rels({
            skip: new Set(['.claude/plugin-x']),
            target: owned,
        });

        expect(found).toContain('.claude/settings.json');
        expect(found).toContain('.claude/hooks');
        expect(found).not.toContain('.claude/plugin-x');
    });
});

describe('repo root', () => {
    test('resolves to the directory holding package.json', async () => {
        await expect(
            fs.access(path.join(repoRoot, 'package.json')),
        ).resolves.toBeUndefined();
    });

    test('finds the root from any depth, not by counting levels', () => {
        const deep = path.join(repoRoot, 'script', 'lib');

        expect(findRepoRoot(deep)).toBe(repoRoot);
        expect(findRepoRoot(repoRoot)).toBe(repoRoot);
    });

    test('throws rather than returning a wrong tree', () => {
        expect(() => findRepoRoot(os.tmpdir())).toThrow(/No package.json/);
    });
});

describe('dangling links', () => {
    test('a link into the repo whose source is gone is reported, a live one is not', async () => {
        const entries = await manifest();

        await fs.symlink(`${mirror}/.gone.md`, `${target}/.gone.md`);
        await fs.symlink(`${mirror}/.gitconfig`, `${target}/.alive`);
        await fs.symlink('/nowhere/at/all', `${target}/.foreign`);

        const orphans = await findOrphans(entries, { repo: root });

        expect(orphans.map((orphan) => orphan.link)).toEqual([
            `${target}/.gone.md`,
        ]);
        expect(orphans[0]?.points).toBe(`${mirror}/.gone.md`);
    });
});

describe('ordering', () => {
    test('entries are grouped by destination directory', async () => {
        const dirs = (await manifest()).map((entry) => path.dirname(entry.rel));

        expect(dirs, 'directories should be contiguous').toEqual(
            [...dirs].sort(),
        );
    });
});

/* Helpers */
async function write(file: string, contents: string) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, contents);
}
