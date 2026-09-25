import glyphs from './fonts/glyphs.json' with { type: 'json' };
import { n } from './paper.ts';

const font: Font = glyphs;

export const textWidth = (text: string, size: number) => [...text].reduce((w, ch) => w + (font.glyphs[ch]?.adv ?? 0), 0) * (size / font.unitsPerEm);

/** Young Serif lettering as plain paths; `y` is the baseline */
export const letter = (text: string, x: number, y: number, size: number, fill: string, align: 'start' | 'middle' = 'start') => {
    const scale = size / font.unitsPerEm;
    let cursor = 0;
    let d = '';
    for (const ch of text) {
        const glyph = font.glyphs[ch];
        if (!glyph) continue;
        if (glyph.d) d += `<path transform="translate(${cursor})" d="${glyph.d}"/>`;
        cursor += glyph.adv;
    }
    const x0 = align === 'middle' ? x - (cursor * scale) / 2 : x;
    return `<g transform="translate(${n(x0)} ${n(y)}) scale(${scale})" fill="${fill}">${d}</g>`;
};

/* Types */

interface Font {
    unitsPerEm: number;
    glyphs: Record<string, { d: string; adv: number } | undefined>;
}
