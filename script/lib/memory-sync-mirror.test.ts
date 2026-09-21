/**
 * ? the memory-sync mirror renders against a fixture tree, never the live repo — except the
 * ? last block, which checks that every master and section the target map names exists here.
 */

/* Core */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

/* Instruments */
import {
    MARK_END,
    MARK_START,
    budgetOf,
    compact,
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

    test('a subsection is selectable without its siblings', () => {
        const src =
            '# root\n\n## parent\n\n### keep\n\n- a\n\n### drop\n\n- b\n';
        expect(selectSections(src, ['parent', 'keep'])).toBe(
            '# root\n\n## parent\n\n### keep\n\n- a',
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
    const prefs = targets.find((t) => t.path === '/preferences.md');
    const profile = targets.find((t) => t.path === '/profile.md');
    if (!prefs || !profile) throw new Error('fragment targets missing');
    const seed = async (t: (typeof targets)[number]) => {
        for (const [i, s] of t.sources.entries())
            await write(s.file, `# m${i}\n\n- x${i}\n`);
    };

    test('a fragment is fenced by the mirror markers, names each master and tags bullets', async () => {
        await seed(prefs);
        const r = renderTarget(root, prefs);
        expect(r.file).toBe('preferences.formatting.md');
        expect(r.body.startsWith(`${MARK_START}\n`)).toBe(true);
        expect(r.body).toContain('(compact:');
        expect(r.body.endsWith(`${MARK_END}\n`)).toBe(true);
        for (const s of prefs.sources)
            expect(r.body).toContain(`<!-- ${s.file} -->`);
        expect(r.body).toContain('- [stated] x0');
        expect(r.bytes).toBe(Buffer.byteLength(r.body));
    });

    test('sections are picked per source, the whole master reaches cw when none are named', async () => {
        await seed(profile);
        const whole = profile.sources.find((s) => !s.sections);
        const picked = profile.sources.find((s) => s.sections?.[0]);
        if (!whole || !picked?.sections?.[0]) throw new Error('shape missing');
        await write(whole.file, '# w\n\n## cc only\n\n- keep-w\n');
        await write(
            picked.file,
            `# p\n\n## ${picked.sections[0]}\n\n- keep-p\n\n## cc only\n\n- drop-p\n`,
        );
        const body = renderTarget(root, profile).body;
        expect(body).toContain('- [stated] keep-w');
        expect(body).toContain('- [stated] keep-p');
        expect(body).not.toContain('drop-p');
    });

    test('the sha follows the master', async () => {
        await seed(prefs);
        const first = prefs.sources[0];
        if (!first) throw new Error('source missing');
        const a = renderTarget(root, prefs).sha256;
        await write(first.file, 'v2\n');
        expect(renderTarget(root, prefs).sha256).not.toBe(a);
    });
});

describe('manifest', () => {
    test('keys are host paths suffixed with #fragment', async () => {
        for (const t of targets)
            for (const s of t.sources)
                await write(s.file, `# ${s.file}\n\n- l\n`);
        const m = toManifest(targets.map((t) => renderTarget(root, t)));
        expect(Object.keys(m)).toEqual([
            '/preferences.md#formatting',
            '/profile.md#fleet',
        ]);
        expect(m['/profile.md#fleet']?.fragment).toBe('fleet');
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
                    fs.access(path.join(repo, s.file)),
                ).resolves.toBeUndefined();
    });
    test('every named section exists in its master', async () => {
        for (const t of targets)
            for (const s of t.sources) {
                const master = await fs.readFile(
                    path.join(repo, s.file),
                    'utf8',
                );
                for (const name of s.sections ?? [])
                    expect(master, `${s.file} › ${name}`).toMatch(
                        new RegExp(
                            `^#{2,6} ${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
                            'm',
                        ),
                    );
            }
    });

    test('every fragment renders inside its host budget', () => {
        for (const t of targets)
            expect(
                renderTarget(repo, t).chars,
                `${t.path}#${t.fragment}`,
            ).toBeLessThanOrEqual(budgetOf(t));
    });
});
