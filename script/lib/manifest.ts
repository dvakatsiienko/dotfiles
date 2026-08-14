/**
 * ? The symlink engine.
 * ?
 * ? The mirror rule: a path under home/ IS the path under ~. The manifest is
 * ? derived by walking the tree, never hand-maintained — add a file to home/
 * ? and it gets linked, with no list to update.
 * ?
 * ? Directory vs file granularity is derived too. A directory is linked
 * ? wholesale unless the matching path in ~ is already a real directory, which
 * ? means it holds content this repo doesn't own (~/.config, ~/.ssh, ~/.claude
 * ? and its caches) — then we descend and link the leaves instead.
 * ?
 * ? Every root is a parameter with a default, so the walk can be pointed at a
 * ? fixture in tests (and, later, at a clone living anywhere).
 */

/* Core */
import * as zx from 'zx';

export const homedir = zx.os.homedir();
export const repo_root = zx.path.resolve(import.meta.dirname, '../..');
export const mirror_root = `${repo_root}/home`;

// ? Stored in home/ but never linked into ~: these are referenced by absolute
// ? path (the plugin marketplace entry in settings.json, the desk sync script)
// ? rather than found by anything looking inside ~/.claude.
export const no_link = new Set([
    '.claude/plugin-x',
    '.claude/mcp-handoff-desktop',
    '.claude/skills-desk',
]);

const ignored_names = new Set(['.DS_Store']);

export type Entry = {
    kind: 'dir' | 'file';
    rel: string;
    source: string;
    target: string;
};

type WalkConfig = {
    ignored: Set<string>;
    mirror: string;
    skip: Set<string>;
    target: string;
};

export async function build_manifest(
    options: Partial<WalkConfig> = {},
): Promise<Entry[]> {
    const config: WalkConfig = {
        ignored: ignored_names,
        mirror: mirror_root,
        skip: no_link,
        target: homedir,
        ...options,
    };

    const entries: Entry[] = [];
    await walk('', entries, config);

    // ? Group by destination directory so the report reads as one block per place.
    return entries.sort((a, b) => {
        const by_dir = zx.path
            .dirname(a.rel)
            .localeCompare(zx.path.dirname(b.rel));
        return by_dir !== 0 ? by_dir : a.rel.localeCompare(b.rel);
    });
}

export function to_tilde(path: string) {
    return path.replace(homedir, '~');
}

export async function lstat_or_null(path: string) {
    try {
        return await zx.fs.lstat(path);
    } catch {
        return null;
    }
}

async function walk(rel: string, out: Entry[], config: WalkConfig) {
    const dir = rel ? `${config.mirror}/${rel}` : config.mirror;

    for (const entry of await zx.fs.readdir(dir, { withFileTypes: true })) {
        if (config.ignored.has(entry.name)) continue;

        const child_rel = rel ? `${rel}/${entry.name}` : entry.name;
        if (config.skip.has(child_rel)) continue;

        const record: Entry = {
            kind: entry.isDirectory() ? 'dir' : 'file',
            rel: child_rel,
            source: `${config.mirror}/${child_rel}`,
            target: `${config.target}/${child_rel}`,
        };

        if (entry.isDirectory()) {
            const stats = await lstat_or_null(record.target);

            // ? A real directory in ~ holds content we don't own — descend past it.
            if (stats?.isDirectory() && !stats.isSymbolicLink()) {
                await walk(child_rel, out, config);
                continue;
            }
        }

        out.push(record);
    }
}
