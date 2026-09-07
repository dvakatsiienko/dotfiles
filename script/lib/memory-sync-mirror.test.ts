/**
 * ? the memory-sync mirror renders against a fixture tree, never the live repo — except the
 * ? last block, which checks that every master the target map names exists here.
 */

/* Core */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

/* Instruments */
import {
    GAZETTE_DIR,
    MARK_END,
    MARK_START,
    compact,
    cwBlock,
    renderGazette,
    renderTarget,
    selectSections,
    tagBullets,
    targets,
    toManifest,
} from './memory-sync-mirror.ts';

let root: string;
const write = async (rel: string, text: string) => {
    const file = path.join(root, rel);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, text);
};

beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'memory-sync-mirror-test-'));
});
afterEach(async () => {
    await fs.rm(root, { force: true, recursive: true });
});

describe('compact', () => {
    test('keeps headers, bullets and marker-led paragraphs whole; drops prose, comments, examples, scope blocks', () => {
        const src = [
            '# title',
            '**scope:** nav\n**not here →** other',
            '<!-- boundary -->',
            'plain prose that explains',
            '- a bullet\n  continued\n  - nested',
            '🚨 **the check is mechanical.** kept\nsecond line kept',
            '**any text is fenced** kept',
            '    ╭── 📋 copy ──╮',
            '    ```\n    payload\n    ```',
            '    ╰── ✂️ end ──╯',
            '    indented example',
            '👀 parsed:\n1. one',
        ].join('\n\n');
        expect(compact(src)).toBe(
            [
                '# title',
                '- a bullet\n  continued\n  - nested',
                '🚨 **the check is mechanical.** kept\nsecond line kept',
                '**any text is fenced** kept',
                '    ╭── 📋 copy ──╮',
                '    ```\n    payload\n    ```',
                '    ╰── ✂️ end ──╯',
            ].join('\n\n'),
        );
    });
});

describe('selectSections', () => {
    test('keeps the title block and the named sections in master order, drops the rest', () => {
        const src =
            '# root\n\nintro\n\n## keep me\n\n- a\n\n## cc only\n\n- b\n\n## also keep\n\n- c\n';
        expect(selectSections(src, ['also keep', 'keep me'])).toBe(
            '# root\n\nintro\n\n## keep me\n\n- a\n\n## also keep\n\n- c',
        );
    });
});

describe('tagBullets', () => {
    test('tags bullets at any depth and leaves the rest byte-identical', () => {
        const src =
            '# t\n\n- a\n  - b\n1. c\nprose - not a bullet\n- [stated] already\n';
        expect(tagBullets(src)).toBe(
            '# t\n\n- [stated] a\n  - [stated] b\n1. c\nprose - not a bullet\n- [stated] already\n',
        );
    });
});

describe('renderTarget', () => {
    test('an entry carries cw frontmatter, the source sha and the verbatim body', async () => {
        const target = targets.find((t) => t.path === '/areas/fleet-vibe.md');
        if (!target?.sources[0]) throw new Error('fleet-vibe target missing');
        await write(target.sources[0], '# vibe\n\n- **slay** = push\n');
        const r = renderTarget(root, target);
        expect(r.file).toBe('areas.fleet-vibe.md');
        expect(r.body).toMatch(/^---\nname: fleet-vibe\n/);
        expect(r.body).toContain(`derived-from: [${target.sources[0]}]`);
        expect(r.body).toContain(`source-sha256: ${r.sha256}`);
        expect(
            r.body.endsWith('\n# vibe\n\n- [stated] **slay** = push\n'),
        ).toBe(true);
        expect(r.bytes).toBe(Buffer.byteLength(r.body));
    });

    test('the sha follows the master', async () => {
        const target = targets.find((t) => t.path === '/areas/dima-signals.md');
        if (!target?.sources[0]) throw new Error('dima-signals target missing');
        await write(target.sources[0], 'v1\n');
        const a = renderTarget(root, target).sha256;
        await write(target.sources[0], 'v2\n');
        expect(renderTarget(root, target).sha256).not.toBe(a);
    });

    test('a fragment is fenced by the mirror markers and names each master', async () => {
        const target = targets.find((t) => t.fragment);
        if (!target) throw new Error('fragment target missing');
        for (const [i, s] of target.sources.entries())
            await write(s, `# m${i}\n\n- x${i}\n`);
        const r = renderTarget(root, target);
        expect(r.file).toBe('preferences.voice-and-formatting.md');
        expect(r.body.startsWith(`${MARK_START}\n`)).toBe(true);
        expect(r.body).toContain('(compact:');
        expect(r.body.endsWith(`${MARK_END}\n`)).toBe(true);
        expect(r.body).not.toMatch(/^---\n/);
        for (const s of target.sources)
            expect(r.body).toContain(`<!-- ${s} -->`);
        expect(r.body).toContain('- [stated] x1');
    });
});

describe('gazette', () => {
    const post = (cw: string[]) =>
        `---\ntitle: t\ncw: |\n${cw.map((l) => `  ${l}`).join('\n')}\n---\n\nbody\n`;

    test('cwBlock extracts the three lines verbatim', () => {
        expect(
            cwBlock(post(['one', 'live / next: two', 'worth a line: three'])),
        ).toEqual(['one', 'live / next: two', 'worth a line: three']);
        expect(cwBlock('---\ntitle: t\n---\n')).toEqual([]);
    });

    test('renders the 5 freshest, freshest first, with byte counts, and skips _recent.md', async () => {
        for (let d = 1; d <= 9; d++)
            await write(
                `${GAZETTE_DIR}/2026-09-0${d}-day-${d}.md`,
                post([`shipped ${d}`, 'l', 'w']),
            );
        await write(`${GAZETTE_DIR}/_recent.md`, 'not a post');
        const r = renderGazette(root);
        const headers = [...r.body.matchAll(/^## (\S+) · (\S+) · (\d+)b$/gm)];
        expect(headers.map((h) => h[1])).toEqual([
            '2026-09-09',
            '2026-09-08',
            '2026-09-07',
            '2026-09-06',
            '2026-09-05',
        ]);
        expect(headers[0]?.[3]).toBe(
            String(Buffer.byteLength(post(['shipped 9', 'l', 'w']))),
        );
        expect(r.body).toContain('- [stated] shipped 9');
        expect(r.body).not.toContain('shipped 2');
    });
});

describe('manifest', () => {
    test('keys are cw paths, fragments suffixed with #name', async () => {
        for (const t of targets)
            for (const s of t.sources) await write(s, `# ${s}\n\n- l\n`);
        await write(`${GAZETTE_DIR}/2026-09-01-a.md`, '---\ncw: |\n  a\n---\n');
        const rendered = [
            ...targets.map((t) => renderTarget(root, t)),
            renderGazette(root),
        ];
        const m = toManifest(rendered);
        expect(Object.keys(m)).toContain('/areas/fleet-identity.md');
        expect(Object.keys(m)).toContain(
            '/preferences.md#voice-and-formatting',
        );
        expect(Object.keys(m)).toContain('/areas/fleet-cclio-gazette.md');
        expect(m['/preferences.md#voice-and-formatting']?.fragment).toBe(
            'voice-and-formatting',
        );
        for (const v of Object.values(m))
            expect(v.sha256).toMatch(/^[0-9a-f]{64}$/);
    });
});

describe('the live target map', () => {
    const repo = path.join(import.meta.dirname, '..', '..');
    test('every master it names exists in this repo', async () => {
        for (const t of targets)
            for (const s of t.sources)
                await expect(
                    fs.access(path.join(repo, s)),
                ).resolves.toBeUndefined();
    });
    test('every entry has a description; fragments have none', () => {
        for (const t of targets)
            if (t.fragment) expect(t.description).toBe('');
            else expect(t.description.length, t.path).toBeGreaterThan(20);
    });
});
