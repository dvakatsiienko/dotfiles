/**
 * ? the memory-sync mirror renders against a fixture tree, never the live repo — except the
 * ? last block, which checks the live masters: every tag valid, every fragment inside its budget.
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
    ORDER,
    budgetOf,
    compact,
    listMasters,
    parseMaster,
    renderTarget,
    selectFor,
    tagBullets,
    targets,
    toManifest,
    toMap,
} from './memory-sync-mirror.ts';

let root: string;
const write = async (rel: string, text: string) => {
    const file = path.join(root, rel);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, text);
};
const target = (dest: string) => {
    const t = targets.find((x) => x.dest === dest);
    if (!t) throw new Error(`no ${dest} target`);
    return t;
};

beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'memory-sync-mirror-test-'));
    // every ORDER master must exist — a missing one fails the render, never skips silently
    for (const file of ORDER) await write(file, `# ${path.basename(file)}\n`);
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
            '    indented example',
            '1. **Precision first.** a numbered invariant\n2. **Verified or labelled.**',
        ].join('\n\n');
        expect(compact(src)).toBe(
            [
                '# title',
                '- a bullet\n  continued\n  - nested',
                '🚨 **the check is mechanical.** kept\nsecond line kept',
                '**any text is fenced** kept',
                '1. **Precision first.** a numbered invariant\n2. **Verified or labelled.**',
            ].join('\n\n'),
        );
    });
});

describe('tags', () => {
    test('a tag routes its section and every subsection; a child tag overrides', () => {
        const parts = parseMaster(
            '# t\n\n## a\n<!-- sync: field -->\n\n- a\n\n### a1\n\n- a1\n\n### a2\n<!-- sync: none -->\n\n- a2\n\n## b\n\n- b\n',
        );
        expect(parts.map((p) => [p.title, p.eff])).toEqual([
            ['t', undefined],
            ['a', 'field'],
            ['a1', 'field'],
            ['a2', 'none'],
            ['b', undefined],
        ]);
    });

    test('a tag before the first heading routes the whole file', () => {
        const parts = parseMaster(
            '<!-- sync: prefs -->\n\n**bold lead**\n\n## x\n\n- x\n',
        );
        expect(parts.every((p) => p.eff === 'prefs')).toBe(true);
    });

    test('an unknown tag fails loud', () => {
        expect(() =>
            parseMaster('## a\n<!-- sync: feild -->\n', 'rules/x.md'),
        ).toThrow('rules/x.md: unknown sync tag «feild»');
    });

    test('selection drops the tag line, pulls ancestor headings, keeps a prose-only leaf', () => {
        const { text, sections } = selectFor(
            '# t\n\n## parent\n\nparent prose\n\n### kept\n<!-- sync: field -->\n\nleaf prose only\n\n### other\n\n- no\n',
            'field',
        );
        expect(text).toBe('# t\n\n## parent\n\n### kept\n\nleaf prose only');
        expect(sections).toEqual(['kept']);
    });
});

describe('tagBullets', () => {
    test('tags bullets at any depth and leaves the rest byte-identical', () => {
        expect(tagBullets('- a\n  - b\n1. c\n- [stated] d\n')).toBe(
            '- [stated] a\n  - [stated] b\n1. c\n- [stated] d\n',
        );
    });
});

describe('renderTarget', () => {
    test('masters render in ORDER, then unlisted rules alphabetically', async () => {
        await write('home/.claude/rules/zeta.md', '# z\n');
        await write('home/.claude/rules/alpha.md', '# a\n');
        const masters = listMasters(root);
        expect(masters.slice(-2)).toEqual([
            'home/.claude/rules/alpha.md',
            'home/.claude/rules/zeta.md',
        ]);
    });

    test('a memory fragment is fenced, names its masters and tags bullets; the paste one does not tag', async () => {
        await write(
            'home/.claude/rules/alpha.md',
            '# a\n\n## mem\n<!-- sync: prefs -->\n\n- m\n\n## box\n<!-- sync: field -->\n\n- b\n',
        );
        const prefs = renderTarget(root, target('prefs'));
        expect(prefs.body.startsWith(`${MARK_START}\n`)).toBe(true);
        expect(prefs.body.endsWith(`${MARK_END}\n`)).toBe(true);
        expect(prefs.body).toContain('<!-- home/.claude/rules/alpha.md -->');
        expect(prefs.body).toContain('- [stated] m');
        expect(prefs.body).not.toContain('- b');
        const field = renderTarget(root, target('field'));
        expect(field.body).toContain('\n- b');
        expect(field.body).not.toContain('[stated]');
        expect(field.file).toBe('instructions.core.md');
    });

    test('the sha follows the tags, not only the prose', async () => {
        await write('home/.claude/rules/alpha.md', '# a\n\n## x\n\n- x\n');
        const before = renderTarget(root, target('prefs')).sha256;
        await write(
            'home/.claude/rules/alpha.md',
            '# a\n\n## x\n<!-- sync: prefs -->\n\n- x\n',
        );
        expect(renderTarget(root, target('prefs')).sha256).not.toBe(before);
    });
});

describe('manifest and map', () => {
    test('keys are destination paths suffixed with #fragment; the map lists every route', async () => {
        await write(
            'home/.claude/rules/alpha.md',
            '# a\n\n## one\n<!-- sync: profile -->\n\n- x\n',
        );
        const rendered = targets.map((t) => renderTarget(root, t));
        const m = toManifest(rendered);
        expect(Object.keys(m)).toEqual([
            'instructions#core',
            '/preferences.md#habits',
            '/profile.md#fleet',
        ]);
        expect(m['instructions#core']?.paste).toBe(true);
        expect(m['/profile.md#fleet']?.sources).toEqual([
            'home/.claude/rules/alpha.md',
        ]);
        expect(toMap(rendered)).toContain(
            '- `home/.claude/rules/alpha.md` › one',
        );
    });
});

describe('the live masters', () => {
    const repo = path.join(import.meta.dirname, '..', '..');
    test('every tag parses and every fragment renders inside its budget', () => {
        for (const t of targets)
            expect(
                renderTarget(repo, t).chars,
                `${t.path}#${t.fragment}`,
            ).toBeLessThanOrEqual(budgetOf(t));
    });
});
