import { rosette } from './flora.ts';
import { letter } from './lettering.ts';
import type { Palette } from './palette.ts';
import { defs, glowDot, n, seeded } from './paper.ts';
import { bracket, dym, lamp, lantern, magicDefs, plaque } from './props.ts';

const W = 480;
const H = 300;

const frameClip = (body: string, p: Palette) =>
    `${defs(p)}<defs>${magicDefs(p)}<clipPath id="tile"><rect width="${W}" height="${H}" rx="16"/></clipPath></defs><g clip-path="url(#tile)">${body}<rect width="${W}" height="${H}" filter="url(#grain)"/></g>`;

const skyRect = (p: Palette, x: number, y: number, w: number, h: number, id: string) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[2]}"/></linearGradient><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/>`;

const nightSpecks = (p: Palette, x: number, y: number, w: number, h: number, seed: number) => {
    if (!p.isNight) return '';
    const rand = seeded(seed);
    return Array.from({ length: 14 }, () => `<circle cx="${n(x + rand() * w)}" cy="${n(y + rand() * h)}" r="${n(0.6 + rand())}" fill="#FFF3C4" opacity=".8"/>`).join('');
};

const windowView = (p: Palette, x: number, y: number, w: number, h: number) => {
    const pines = [0.18, 0.42, 0.7, 0.9]
        .map((t, i) => {
            const px = x + w * t;
            const ph = h * (0.36 + (i % 2) * 0.14);
            return `<path d="M${n(px)} ${n(y + h - ph)}L${n(px + ph * 0.26)} ${y + h}L${n(px - ph * 0.26)} ${y + h}Z" fill="${p.pine.body}"/>`;
        })
        .join('');
    const hill = `<path d="M${x} ${n(y + h * 0.8)}Q${n(x + w / 2)} ${n(y + h * 0.62)} ${x + w} ${n(y + h * 0.78)}V${y + h}H${x}Z" fill="${p.hill.back}"/>`;
    const sky = p.isNight
        ? `<circle cx="${n(x + w * 0.72)}" cy="${n(y + h * 0.24)}" r="9" fill="${p.sun.disc}"/><circle cx="${n(x + w * 0.72 + 4)}" cy="${n(y + h * 0.24 - 3)}" r="8" fill="${p.sky[0]}"/>`
        : `<circle cx="${n(x + w * 0.3)}" cy="${n(y + h * 0.28)}" r="9" fill="#FFFFFF"/><circle cx="${n(x + w * 0.3 + 11)}" cy="${n(y + h * 0.3)}" r="7" fill="#FFFFFF"/><rect x="${n(x + w * 0.3 - 9)}" y="${n(y + h * 0.3)}" width="27" height="7" rx="3.5" fill="#FFFFFF"/>`;
    return `<clipPath id="win"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#win)">${skyRect(p, x, y, w, h, 'winSky')}${nightSpecks(p, x, y, w, h * 0.5, 4)}${sky}${hill}${pines}</g>`;
};

export const tourFrame = (p: Palette) => {
    const wall = `<rect width="${W}" height="${H}" fill="${p.room.wall}"/><rect y="196" width="${W}" height="${H - 196}" fill="${p.room.wallShade}"/><path d="M0 196H${W}" stroke="${p.room.trim}" stroke-width="5"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${20 + i * 40} 200V${H}" stroke="${p.room.wall}" stroke-width="1.5" opacity=".5"/>`).join('')}`;
    const win = `<g filter="url(#lift)"><rect x="30" y="34" width="136" height="124" rx="6" fill="${p.room.trim}"/>${windowView(p, 38, 42, 120, 108)}<path d="M98 42V150M38 96H158" stroke="${p.room.trim}" stroke-width="5"/><rect x="22" y="156" width="152" height="10" rx="3" fill="${p.room.trim}"/></g>${
        p.isNight ? '' : `<g transform="translate(140 156)" filter="url(#lift)"><ellipse cx="0" cy="-7" rx="9" ry="6.5" fill="${p.wren.body}"/><ellipse cx="2" cy="-5" rx="5.5" ry="3.4" fill="${p.wren.belly}"/><circle cx="7" cy="-12" r="4.6" fill="${p.wren.body}"/><circle cx="8.5" cy="-13" r="1.1" fill="${p.dino.eye}"/><path d="M11 -12l4 1l-4 1.2Z" fill="#E6A33E"/><path d="M-8 -8L-15 -16L-12 -5Z" fill="${p.wren.wing}"/></g>`
    }`;
    const shelf = `<g filter="url(#lift)"><rect x="318" y="150" width="136" height="9" rx="2" fill="${p.room.floor}"/><path d="M332 159l10 14M440 159l-10 14" stroke="${p.room.floorShade}" stroke-width="4" stroke-linecap="round"/><rect x="330" y="118" width="11" height="32" rx="2" fill="${p.flora.lapis}"/><rect x="343" y="112" width="10" height="38" rx="2" fill="${p.flora.coral}"/><rect x="355" y="122" width="12" height="28" rx="2" fill="${p.flora.marigold}"/><rect x="369" y="126" width="9" height="24" rx="2" transform="rotate(-14 373 150)" fill="${p.flora.lilac}"/><path d="M418 150h26l-4 -20h-18Z" fill="${p.flora.coral}"/>${rosette(431, 116, 10, p.flora.marigold, p.flora.coral, p)}${rosette(420, 126, 7, p.flora.lapis, p.flora.cream, p, 15)}</g>`;
    const tools = `<g filter="url(#lift)"><circle cx="352" cy="176" r="2.4" fill="${p.iron}"/><path d="M352 176v26" stroke="${p.room.floorShade}" stroke-width="4" stroke-linecap="round"/><rect x="342" y="170" width="20" height="8" rx="2" fill="${p.iron}"/><circle cx="398" cy="176" r="2.4" fill="${p.iron}"/><path d="M398 180v18" stroke="${p.iron}" stroke-width="4" stroke-linecap="round"/><path d="M391 198a7 7 0 1 0 14 0l-4 0l-3 -4l-3 4Z" fill="${p.iron}"/></g>`;
    const bench = `<g filter="url(#liftHi)"><rect x="14" y="238" width="452" height="16" rx="3" fill="${p.room.floor}"/><rect x="14" y="238" width="452" height="4" rx="2" fill="${p.cabin.logLit}"/><rect x="30" y="254" width="14" height="50" fill="${p.room.floorShade}"/><rect x="436" y="254" width="14" height="50" fill="${p.room.floorShade}"/><rect x="44" y="254" width="392" height="10" fill="${p.room.floorShade}" opacity=".6"/></g>`;
    const bits = `<g filter="url(#lift)"><circle cx="84" cy="230" r="9" fill="none" stroke="${p.iron}" stroke-width="4" stroke-dasharray="4 3"/><circle cx="84" cy="230" r="3" fill="${p.iron}"/><rect x="376" y="214" width="26" height="24" rx="4" fill="${p.flora.lapis}"/><path d="M402 220q10 2 6 12" stroke="${p.flora.lapis}" stroke-width="3" fill="none"/><path d="M110 234l18 -4" stroke="${p.room.floorShade}" stroke-width="3" stroke-linecap="round"/></g>`;
    const glow = p.isNight ? `<circle cx="230" cy="190" r="150" fill="url(#warmth)" opacity=".8"/>` : '';
    const body = [wall, glow, win, shelf, tools, plaque(p, 386, 30, 'frame', 'the machine as data'), bench, bits, lamp(p, 170, 236, 1.08), dym(p, 170 + 104 * 1.08, 236 - 60 * 1.08, p.isNight, 0.95)].join('');
    return frameClip(body, p);
};

const firefly = (p: Palette, x: number, y: number, s: number) =>
    `<g transform="translate(${n(x)} ${n(y)}) scale(${s})"><ellipse cx="-3" cy="-6" rx="6" ry="3.4" transform="rotate(-30 -3 -6)" fill="#FFFFFF" opacity=".7"/><ellipse cx="3" cy="-6" rx="6" ry="3.4" transform="rotate(30 3 -6)" fill="#FFFFFF" opacity=".7"/><ellipse cx="0" cy="0" rx="4" ry="7" fill="${p.iron}"/><circle cx="0" cy="-8" r="3.2" fill="${p.iron}"/><ellipse cx="0" cy="5" rx="3.6" ry="4" fill="${p.glow}"/></g>`;

export const tourBytes = (p: Palette) => {
    const sky = skyRect(p, 0, 0, W, H, 'tbSky') + nightSpecks(p, 180, 10, 300, 110, 9);
    const walls = p.isNight ? ['#454B70', '#3F4A62', '#4C4566', '#443F66'] : ['#E4ECF3', '#DFEADF', '#F0E4E2', '#E5E2F0'];
    const roofs = [
        [190, 118, 70, p.town.roof, walls[0]],
        [262, 104, 60, p.town.roofAlt, walls[1]],
        [326, 126, 80, p.town.roof, walls[2]],
        [410, 110, 70, p.town.roofAlt, walls[3]],
    ] as const;
    const town = roofs
        .map(([x, top, w, roof, face]) => {
            const win = p.isNight ? `${glowDot(x + w / 2, top + 36, 1.6)}` : '';
            return `<rect x="${x}" y="${top}" width="${w}" height="${H - top}" fill="${face}"/><rect x="${x + w * 0.66}" y="${top}" width="${n(w * 0.34)}" height="${H - top}" fill="${p.shadow.color}" opacity=".08"/><path d="M${x - 5} ${top}L${x + w / 2} ${top - w * 0.5}L${x + w + 5} ${top}Z" fill="${roof}"/><rect x="${n(x + w * 0.4)}" y="${top + 26}" width="${n(w * 0.2)}" height="18" rx="3" fill="${p.town.window}"/>${win}`;
        })
        .join('');
    const tower = `<rect x="300" y="60" width="22" height="80" fill="${p.town.wall}"/><path d="M296 60L311 28L326 60Z" fill="${p.town.roofAlt}"/><path d="M311 28v-12" stroke="${p.town.wallShade}" stroke-width="1.6"/><path d="M311 16l12 4l-12 4Z" fill="${p.town.flag}"/>`;
    const wall = `<g filter="url(#liftHi)"><rect x="-4" y="0" width="150" height="${H}" fill="${p.stoneWall.face}"/>${Array.from({ length: 11 }, (_, r) => {
        const y = 12 + r * 26;
        return `<path d="M0 ${y}H146" stroke="${p.stoneWall.joint}" stroke-width="2"/>${Array.from({ length: 3 }, (_, c) => `<path d="M${(r % 2 ? 26 : 0) + c * 52} ${y}v26" stroke="${p.stoneWall.joint}" stroke-width="2"/>`).join('')}`;
    }).join('')}<rect x="138" y="0" width="10" height="${H}" fill="${p.stoneWall.lit}"/><rect x="30" y="150" width="70" height="80" rx="4" fill="${p.room.trim}"/><rect x="36" y="156" width="58" height="68" fill="${p.isNight ? '#FFC766' : p.cabin.window}"/><path d="M65 156v68M36 190h58" stroke="${p.room.trim}" stroke-width="4"/><rect x="24" y="228" width="82" height="12" rx="3" fill="${p.room.floor}"/></g>${rosette(40, 226, 9, p.flora.coral, p.flora.marigold, p)}${rosette(64, 222, 11, p.flora.lapis, p.flora.cream, p, 12)}${rosette(90, 226, 9, p.flora.marigold, p.flora.coral, p, 24)}`;
    const cobbles = `<rect y="266" width="${W}" height="34" fill="${p.stone.face}"/>${Array.from({ length: 22 }, (_, i) => `<rect x="${(i % 11) * 46 + (i > 10 ? 23 : 0) - 10}" y="${i > 10 ? 284 : 270}" width="40" height="13" rx="6" fill="${p.stone.lit}" opacity=".7"/>`).join('')}`;
    const sign = `<path d="M198 58v20M318 58v20" stroke="${p.iron}" stroke-width="2"/><g filter="url(#liftHi)"><rect x="178" y="78" width="160" height="78" rx="12" fill="${p.isNight ? '#C9C3DA' : p.flora.cream}"/><rect x="184" y="84" width="148" height="66" rx="8" fill="none" stroke="${p.flora.lapis}" stroke-width="1.6" opacity=".7"/>${letter('bytes', 272, 126, 32, p.isNight ? '#2F2A4A' : '#3A3350', 'middle')}${firefly(p, 204, 116, 1.25)}</g>${letter('the apps', 258, 144, 11, p.isNight ? '#5B557A' : '#6A6480', 'middle')}`;
    const glow = p.isNight ? `<circle cx="120" cy="190" r="90" fill="url(#warmth)" opacity=".7"/>` : '';
    const body = [sky, tower, town, glow, cobbles, wall, bracket(p, 146, 58, 238), sign, lantern(p, 380, 58, 1.1)].join('');
    return frameClip(body, p);
};

export const tileSize = { w: W, h: H };
