/**
 * ? The plugin release ritual, as data.
 * ?
 * ? Three plugins live in this repo and each releases differently: `x` and
 * ? `cclio` are registered marketplaces the CLI refreshes, `x-cw` is a file set
 * ? cw reads directly and so only ever gets a version bump. That difference used
 * ? to live as prose plus vigilance, and it ran by hand eleven times in one day.
 * ?
 * ? What can be derived is derived: the plugin list comes from walking for
 * ? `.claude-plugin/plugin.json`, and whether a plugin is registered comes from
 * ? whether a `marketplace.json` sits beside it. Only the install scope is
 * ? hand-held, because nothing in the tree records it.
 * ?
 * ? Every root is a parameter with a default, so the walk and the audit can be
 * ? pointed at a fixture.
 */

/* Core */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { repoRoot } from './manifest.ts';

/* Types */
export type Scope = 'project' | 'user';

export type Plugin = {
    dir: string;
    manifest: string;
    /** null when no marketplace.json sits beside it — cw consumes those by file. */
    marketplace: string | null;
    name: string;
    scope: Scope;
    version: string;
};

export type Action = 'bump' | 'none' | 'uncommitted';

export type Release = {
    /** argv arrays, never shell strings — nothing here needs quoting rules. */
    commands: string[][];
    action: Action;
    plugin: Plugin;
    /** Commits touching the plugin since its version last moved. */
    touched: number;
    version: { from: string; to: string };
};

export type Audit = { linked: string[]; unlinked: string[] };

/**
 * ? The one fact no file in the tree carries. `cclio` installs into the repo it
 * ? coordinates from, everything else into the user scope — and a wrong scope
 * ? updates a plugin the session is not running.
 */
export const scopes = new Map<string, Scope>([['cclio', 'project']]);

const IGNORED_DIRS = new Set(['.git', 'dist', 'node_modules']);

export function bumpPatch(version: string) {
    const parts = version.split('.');
    const patch = Number(parts.at(-1));
    if (parts.length !== 3 || !Number.isInteger(patch))
        throw new Error(`Not a semver version: ${version}`);

    return [...parts.slice(0, 2), patch + 1].join('.');
}

/** `version` and `name` are read the same way from two different manifests. */
export function readField(manifest: string, field: string): string | null {
    try {
        const parsed: unknown = JSON.parse(manifest);
        if (typeof parsed !== 'object' || parsed === null) return null;

        const value = (parsed as Record<string, unknown>)[field];
        return typeof value === 'string' ? value : null;
    } catch {
        return null;
    }
}

/** Every plugin in the tree, found by its manifest rather than by a list. */
export async function findPlugins({ root = repoRoot } = {}): Promise<Plugin[]> {
    const found: Plugin[] = [];
    await walk(root, root, found);
    return found.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * ? A plugin is stale when the tree moved and the version did not. The boundary
 * ? is the last commit that touched the `version` line, never a timestamp: a
 * ? bump riding along with the change it describes is the normal shape here, and
 * ? that commit is the release, not a thing needing one.
 */
export function planRelease(options: {
    committedVersion: string | null;
    plugin: Plugin;
    touched: number;
}): Release {
    const { committedVersion, plugin, touched } = options;
    const version = { from: plugin.version, to: plugin.version };

    if (committedVersion !== null && committedVersion !== plugin.version)
        return {
            action: 'uncommitted',
            commands: [],
            plugin,
            touched,
            version,
        };

    if (touched === 0)
        return { action: 'none', commands: [], plugin, touched, version };

    return {
        action: 'bump',
        commands: refreshCommands(plugin),
        plugin,
        touched,
        version: { from: plugin.version, to: bumpPatch(plugin.version) },
    };
}

/**
 * ? `-y` because this runs as a child process: the CLI refuses its confirmation
 * ? prompt without a TTY, and a release that hangs waiting for one is worse than
 * ? no release at all.
 */
export function refreshCommands(plugin: Plugin): string[][] {
    if (plugin.marketplace === null) return [];

    return [
        ['claude', 'plugin', 'marketplace', 'update', plugin.marketplace],
        [
            'claude',
            'plugin',
            'update',
            `${plugin.name}@${plugin.marketplace}`,
            '-y',
            ...(plugin.scope === 'user' ? [] : ['--scope', plugin.scope]),
        ],
    ];
}

/**
 * ? Surfaced, never fixed. Which `x` skills reach the desktop is Dima's
 * ? curation — auto-linking every new skill would quietly grow a set he chose to
 * ? keep small, and the point of the audit is that he sees the choice.
 */
export async function auditCwSymlinks(options: {
    cwSkills: string;
    sourceSkills: string;
}): Promise<Audit> {
    const source = await dirNames(options.sourceSkills);
    const mirrored = new Set(await dirNames(options.cwSkills));

    return {
        linked: source.filter((name) => mirrored.has(name)),
        unlinked: source.filter((name) => !mirrored.has(name)),
    };
}

/* Helpers */
async function walk(dir: string, root: string, out: Plugin[]) {
    for (const entry of await entriesOf(dir)) {
        if (!entry.isDirectory() || IGNORED_DIRS.has(entry.name)) continue;

        const child = join(dir, entry.name);
        if (entry.name !== '.claude-plugin') {
            await walk(child, root, out);
            continue;
        }

        const plugin = await readPlugin(child, dir, root);
        if (plugin !== null) out.push(plugin);
    }
}

async function readPlugin(
    metaDir: string,
    dir: string,
    root: string,
): Promise<Plugin | null> {
    const manifest = join(metaDir, 'plugin.json');
    const raw = await readOrNull(manifest);
    if (raw === null) return null;

    const name = readField(raw, 'name');
    const version = readField(raw, 'version');
    if (name === null || version === null) return null;

    const market = await readOrNull(join(metaDir, 'marketplace.json'));

    return {
        dir: relative(root, dir),
        manifest: relative(root, manifest),
        marketplace: market === null ? null : readField(market, 'name'),
        name,
        scope: scopes.get(name) ?? 'user',
        version,
    };
}

async function entriesOf(dir: string) {
    try {
        return await readdir(dir, { withFileTypes: true });
    } catch {
        return [];
    }
}

async function dirNames(path: string) {
    return (await entriesOf(path))
        .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
        .map((entry) => entry.name)
        .sort();
}

async function readOrNull(path: string) {
    try {
        return await readFile(path, 'utf8');
    } catch {
        return null;
    }
}

function relative(root: string, path: string) {
    return path === root ? '.' : path.replace(`${root}/`, '');
}
