import { curl } from './flora.ts';
import { letter, textWidth } from './lettering.ts';
import type { Palette } from './palette.ts';
import { comma, glowDot, n } from './paper.ts';

/** the brass lamp from the creek; origin at the centre of its foot, spout to the right */
export const lamp = (p: Palette, x: number, y: number, scale = 1) => {
    const b = p.brass;
    const handle = `<path d="M-46 -32C-80 -36 -84 -4 -50 -17" stroke="${b.shade}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    const spout = `<path d="M40 -28C66 -26 84 -40 98 -57L108 -62L104 -52C90 -33 70 -17 44 -15Z" fill="${b.base}"/><path d="M60 -26C76 -30 88 -42 98 -55" stroke="${b.lit}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    const bowl = `<path d="M-50 -36C-50 -8 44 -6 54 -34Z" fill="${b.base}"/><path d="M-42 -30C-38 -18 -20 -13 -2 -13" stroke="${b.lit}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/><path d="M-30 -14C-10 -6 30 -8 46 -24" stroke="${b.shade}" stroke-width="2" fill="none" opacity=".5"/>`;
    const rim = `<ellipse cx="2" cy="-36" rx="53" ry="7" fill="${b.lit}"/><ellipse cx="2" cy="-37" rx="44" ry="4.2" fill="${b.base}"/>`;
    const lid = `<path d="M-22 -40Q2 -68 26 -40Z" fill="${b.base}"/><path d="M-14 -44Q0 -60 10 -52" stroke="${b.lit}" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="2" cy="-64" r="5.2" fill="${b.lit}"/><path d="M2 -69v-6" stroke="${b.shade}" stroke-width="2.4" stroke-linecap="round"/>`;
    const foot = `<path d="M-10 -12L-14 -4L18 -4L14 -12Z" fill="${b.shade}"/><ellipse cx="2" cy="-2" rx="30" ry="6" fill="${b.base}"/><ellipse cx="2" cy="-4" rx="24" ry="3" fill="${b.lit}" opacity=".6"/>`;
    const ornament = `<g transform="translate(2 -24)">${[0, 60, 120, 180, 240, 300].map((a) => `<path transform="rotate(${a}) translate(0 -5) rotate(180)" d="${comma(5, 3.4)}" fill="${b.shade}"/>`).join('')}<circle r="3.4" fill="${b.gem}"/></g>`;
    return `<g transform="translate(${n(x)} ${n(y)}) scale(${scale})" filter="url(#lift)">${handle}${foot}${bowl}${ornament}${spout}${rim}${lid}</g>`;
};

/** Dym, the djinni; asleep he is a curl of smoke, awake a lavender shape with two glints for eyes. origin at the spout tip */
export const dym = (p: Palette, x: number, y: number, isAwake: boolean, scale = 1) => {
    const m = p.magic;
    if (!isAwake) return `<g transform="translate(${n(x)} ${n(y)}) scale(${scale})" opacity=".85">${curl(0, 0, 9, m.smoke)}${curl(6, -22, 7, m.smoke, -1)}${curl(2, -40, 5, m.smoke)}</g>`;
    const trail = `<path d="M0 0C-6 -14 10 -22 4 -36C0 -46 14 -54 18 -62" stroke="${m.smoke}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>`;
    const body = `<path d="M18 -60C2 -64 -2 -86 10 -100C18 -110 36 -110 44 -98C54 -84 44 -64 28 -60Z" fill="${m.smoke}"/><path d="M14 -94C18 -104 32 -106 38 -98" stroke="${m.core}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
    const face = `<path d="M16 -86q4 -2.4 8 0M30 -86q4 -2.4 8 0" stroke="${m.core}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    const arms = `<path d="M10 -70Q0 -66 -4 -58M42 -70Q52 -64 50 -54" stroke="${m.smoke}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`;
    const tuft = `<path transform="translate(27 -108)" d="${comma(12, 6, 0.3)}" fill="${m.smoke}"/>`;
    return `<g transform="translate(${n(x)} ${n(y)}) scale(${scale})"><circle cx="26" cy="-84" r="54" fill="url(#magic)" opacity=".8"/>${trail}${arms}${tuft}<g filter="url(#lift)">${body}</g>${face}</g>`;
};

export const magicDefs = (p: Palette) =>
    `<radialGradient id="magic"><stop offset="0" stop-color="${p.magic.core}" stop-opacity="${p.isNight ? 0.55 : 0.3}"/><stop offset="1" stop-color="${p.magic.smoke}" stop-opacity="0"/></radialGradient>`;

/** a paper lantern with one firefly inside; origin at the hook */
export const lantern = (p: Palette, x: number, y: number, scale = 1) => {
    const lit = p.isNight ? '#FFD98A' : '#F7E7C4';
    return `<g transform="translate(${n(x)} ${n(y)}) scale(${scale})">${p.isNight ? '<circle cx="0" cy="34" r="60" fill="url(#glow)" opacity=".85"/>' : ''}<path d="M0 0v8" stroke="${p.iron}" stroke-width="2"/><g filter="url(#lift)"><rect x="-10" y="8" width="20" height="6" rx="2" fill="${p.iron}"/><path d="M-14 14Q-22 34 -14 54L14 54Q22 34 14 14Z" fill="${lit}"/><path d="M-6 15Q-9 34 -6 53M6 15Q9 34 6 53M-16 26Q0 29 16 26M-17 42Q0 45 17 42" stroke="${p.flora.coral}" stroke-width="1.1" fill="none" opacity=".5"/><rect x="-9" y="54" width="18" height="5" rx="2" fill="${p.iron}"/><path d="M0 59v7" stroke="${p.iron}" stroke-width="2"/><circle cx="0" cy="68" r="2.6" fill="${p.flora.coral}"/></g>${glowDot(2, 34, p.isNight ? 2.6 : 1.6)}</g>`;
};

/** a wall bracket with a petrykivka scroll under the arm; origin at the wall, the arm reaches `len` to the right */
export const bracket = (p: Palette, x: number, y: number, len: number) =>
    `<g transform="translate(${n(x)} ${n(y)})" filter="url(#lift)"><rect x="-4" y="-14" width="10" height="40" rx="3" fill="${p.iron}"/><path d="M0 0H${len}" stroke="${p.iron}" stroke-width="5" stroke-linecap="round"/><path d="M4 22C${n(len * 0.2)} 20 ${n(len * 0.42)} 12 ${n(len * 0.62)} 2" stroke="${p.iron}" stroke-width="3.2" fill="none" stroke-linecap="round"/>${curl(len * 0.28, 16, 7, p.iron)}<circle cx="${len}" cy="0" r="4" fill="${p.iron}"/></g>`;

/** a lettered paper plaque, centred on x */
export const plaque = (p: Palette, x: number, y: number, title: string, sub: string) => {
    const w = Math.max(textWidth(title, 30), textWidth(sub, 13)) + 40;
    const ink = p.isNight ? '#2F2A4A' : '#3A3350';
    const face = p.isNight ? '#C9C3DA' : p.flora.cream;
    return `<g filter="url(#lift)"><rect x="${n(x - w / 2)}" y="${y}" width="${n(w)}" height="66" rx="8" fill="${face}"/><rect x="${n(x - w / 2 + 5)}" y="${y + 5}" width="${n(w - 10)}" height="56" rx="5" fill="none" stroke="${p.flora.coral}" stroke-width="1.2" stroke-dasharray="4 4" opacity=".6"/>${letter(title, x, y + 36, 30, ink, 'middle')}${letter(sub, x, y + 54, 13, p.isNight ? '#5B557A' : '#6A6480', 'middle')}</g>`;
};
