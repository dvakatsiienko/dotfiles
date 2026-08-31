/**
 * ? Tests for the release ritual. The walk and the audit run against a fixture
 * ? tree in a temp directory; the planning half is pure and takes its git facts
 * ? as arguments, so no test shells out or touches the real plugins.
 * ?
 * ?   pnpm test        # once
 * ?   pnpm test:watch  # on change
 */

/* Core */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

/* Instruments */
import type { Plugin } from './plugin-release.ts';
import {
    auditCwSymlinks,
    bumpPatch,
    findPlugins,
    planRelease,
    readField,
    refreshCommands,
} from './plugin-release.ts';

let root: string;

beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'plugin-release-test-'));
});

afterEach(async () => {
    await fs.rm(root, { force: true, recursive: true });
});

const plugin = (overrides: Partial<Plugin> = {}): Plugin => ({
    dir: 'home/.claude/plugin-x',
    manifest: 'home/.claude/plugin-x/.claude-plugin/plugin.json',
    marketplace: 'x',
    name: 'x',
    scope: 'user',
    version: '0.11.11',
    ...overrides,
});

describe('version bumping', () => {
    test('patch moves, major and minor stay', () => {
        expect(bumpPatch('0.11.11')).toBe('0.11.12');
        expect(bumpPatch('1.0.9')).toBe('1.0.10');
    });

    test('a version that is not semver throws rather than guessing', () => {
        expect(() => bumpPatch('1.0')).toThrow(/Not a semver/);
        expect(() => bumpPatch('1.0.x')).toThrow(/Not a semver/);
    });

    test('a field is read without reformatting the manifest', () => {
        expect(readField('{"version": "0.2.7"}', 'version')).toBe('0.2.7');
        expect(readField('{"version": 3}', 'version')).toBeNull();
        expect(readField('not json', 'version')).toBeNull();
    });
});

describe('finding plugins', () => {
    test('a plugin is found by its manifest, never by a list', async () => {
        await manifest('home/.claude/plugin-x', {
            name: 'x',
            version: '1.2.3',
        });
        await manifest('cclio/plugin-cclio', {
            market: 'cclio',
            name: 'cclio',
            version: '0.3.14',
        });

        const found = await findPlugins({ root });

        expect(found.map((one) => one.name)).toEqual(['cclio', 'x']);
        expect(found[1]?.version).toBe('1.2.3');
        expect(found[1]?.dir).toBe('home/.claude/plugin-x');
    });

    test('a marketplace.json beside it makes a plugin registered', async () => {
        await manifest('a', { market: 'x', name: 'x', version: '1.0.0' });
        await manifest('b', { name: 'x-cw', version: '1.0.0' });

        const found = await findPlugins({ root });

        expect(found.find((one) => one.name === 'x')?.marketplace).toBe('x');
        expect(
            found.find((one) => one.name === 'x-cw')?.marketplace,
        ).toBeNull();
    });

    test('node_modules is never walked', async () => {
        await manifest('node_modules/pkg', {
            name: 'vendor',
            version: '1.0.0',
        });

        expect(await findPlugins({ root })).toEqual([]);
    });

    test('cclio installs into the project scope, everything else into user', async () => {
        await manifest('a', {
            market: 'cclio',
            name: 'cclio',
            version: '1.0.0',
        });
        await manifest('b', { market: 'x', name: 'x', version: '1.0.0' });

        const found = await findPlugins({ root });

        expect(found.find((one) => one.name === 'cclio')?.scope).toBe(
            'project',
        );
        expect(found.find((one) => one.name === 'x')?.scope).toBe('user');
    });
});

describe('the release plan', () => {
    test('commits since the version moved mean a bump', () => {
        const planned = planRelease({
            committedVersion: '0.11.11',
            plugin: plugin(),
            touched: 3,
        });

        expect(planned.action).toBe('bump');
        expect(planned.version).toEqual({ from: '0.11.11', to: '0.11.12' });
    });

    test('a quiet tree releases nothing', () => {
        expect(
            planRelease({
                committedVersion: '0.11.11',
                plugin: plugin(),
                touched: 0,
            }).action,
        ).toBe('none');
    });

    test('a bump not yet committed is reported, never bumped twice', () => {
        const planned = planRelease({
            committedVersion: '0.11.10',
            plugin: plugin({ version: '0.11.11' }),
            touched: 4,
        });

        expect(planned.action).toBe('uncommitted');
        expect(planned.version.to).toBe('0.11.11');
        expect(planned.commands).toEqual([]);
    });

    test('a plugin with no commit history yet still plans a bump', () => {
        expect(
            planRelease({
                committedVersion: null,
                plugin: plugin(),
                touched: 1,
            }).action,
        ).toBe('bump');
    });
});

describe('the refresh channel', () => {
    test('a user-scope plugin refreshes its marketplace, then itself', () => {
        expect(refreshCommands(plugin())).toEqual([
            ['claude', 'plugin', 'marketplace', 'update', 'x'],
            ['claude', 'plugin', 'update', 'x@x', '-y'],
        ]);
    });

    test('a project-scope plugin carries the scope flag', () => {
        const commands = refreshCommands(
            plugin({ marketplace: 'cclio', name: 'cclio', scope: 'project' }),
        );

        expect(commands[1]).toEqual([
            'claude',
            'plugin',
            'update',
            'cclio@cclio',
            '-y',
            '--scope',
            'project',
        ]);
    });

    test('an unregistered plugin runs nothing — cw reads it by file', () => {
        expect(refreshCommands(plugin({ marketplace: null }))).toEqual([]);
    });
});

describe('the cw symlink audit', () => {
    test('a deliberately unlinked skill is surfaced, never linked', async () => {
        const source = path.join(root, 'plugin-x/skills');
        const cw = path.join(root, 'plugin-x-cw/skills');

        await fs.mkdir(path.join(source, 'handoff'), { recursive: true });
        await fs.mkdir(path.join(source, 'cmt'), { recursive: true });
        await fs.mkdir(cw, { recursive: true });
        await fs.symlink('../../plugin-x/skills/handoff', `${cw}/handoff`);

        const audit = await auditCwSymlinks({
            cwSkills: cw,
            sourceSkills: source,
        });

        expect(audit.unlinked).toEqual(['cmt']);
        expect(audit.linked).toEqual(['handoff']);
        // ? The point of the audit: it reports and stops.
        expect(await fs.readdir(cw)).toEqual(['handoff']);
    });

    test('a cw-only skill directory is not reported as missing', async () => {
        const source = path.join(root, 'source');
        const cw = path.join(root, 'cw');

        await fs.mkdir(path.join(source, 'pm'), { recursive: true });
        await fs.mkdir(path.join(cw, 'pm'), { recursive: true });
        await fs.mkdir(path.join(cw, 'opus-mode'), { recursive: true });

        const audit = await auditCwSymlinks({
            cwSkills: cw,
            sourceSkills: source,
        });

        expect(audit.unlinked).toEqual([]);
    });

    test('a missing directory audits as empty rather than throwing', async () => {
        const audit = await auditCwSymlinks({
            cwSkills: path.join(root, 'nope'),
            sourceSkills: path.join(root, 'also-nope'),
        });

        expect(audit).toEqual({ linked: [], unlinked: [] });
    });
});

/* Helpers */
async function manifest(
    dir: string,
    fields: { market?: string; name: string; version: string },
) {
    const meta = path.join(root, dir, '.claude-plugin');
    await fs.mkdir(meta, { recursive: true });
    await fs.writeFile(
        path.join(meta, 'plugin.json'),
        JSON.stringify({ name: fields.name, version: fields.version }),
    );

    if (fields.market !== undefined)
        await fs.writeFile(
            path.join(meta, 'marketplace.json'),
            JSON.stringify({ name: fields.market }),
        );
}
