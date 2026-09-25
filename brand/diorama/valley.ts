import { dino } from './character.ts';
import { berries, bud, bush, cloud, curl, fern, grassTuft, mushroom, pine, pineRow, rosette, roundTree, stone } from './flora.ts';
import type { Palette } from './palette.ts';
import { letter, textWidth } from './lettering.ts';
import { comma, defs, glowDot, n, ridge, seeded, smooth } from './paper.ts';
import type { Layer, Pt } from './paper.ts';

const W = 1600;
const H = 600;

const sky = (p: Palette) =>
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset=".5" stop-color="${p.sky[1]}"/><stop offset="1" stop-color="${p.sky[2]}"/></linearGradient><rect width="${W}" height="${H}" fill="url(#sky)"/>`;

const sun = (p: Palette, cx: number, cy: number, r: number) => {
    let rays = '';
    for (let i = 0; i < 16; i++) {
        const a = (360 * i) / 16;
        const len = i % 2 ? r * 0.42 : r * 0.62;
        rays += `<path transform="rotate(${a}) translate(0 ${n(-r - 6)})" d="${comma(len, r * 0.2, i % 2 ? 0.12 : -0.08)}" fill="${p.sun.ray}"/>`;
    }
    return `<g transform="translate(${cx} ${cy})" filter="url(#lift)">${rays}<circle r="${r}" fill="${p.sun.disc}"/><circle r="${n(r * 0.66)}" fill="${p.sun.core}" opacity=".7"/></g>`;
};

const moon = (p: Palette, cx: number, cy: number, r: number) =>
    `<circle cx="${cx}" cy="${cy}" r="${r * 3.2}" fill="url(#glow)" opacity=".28"/><g filter="url(#lift)"><path d="M${cx} ${cy - r}A${r} ${r} 0 1 0 ${cx} ${cy + r}A${n(r * 0.72)} ${r} 0 1 1 ${cx} ${cy - r}Z" fill="${p.sun.disc}"/>${curl(cx - r * 0.25, cy + r * 1.35, r * 0.34, p.sun.ray, -1)}</g>`;

const stars = (p: Palette) => {
    const rand = seeded(11);
    let out = '';
    for (let i = 0; i < 70; i++) {
        const x = rand() * W;
        const y = rand() * 300;
        out += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(0.6 + rand() * 1.2)}" fill="#FFF3C4" opacity="${n(0.4 + rand() * 0.5)}"/>`;
    }
    const big: readonly Pt[] = [[260, 70], [520, 44], [760, 110], [980, 56], [1180, 150], [1480, 62], [140, 200], [640, 205]];
    for (const [x, y] of big) {
        const s = 5 + ((x * 7) % 5);
        out += `<path filter="url(#lift)" d="M${x} ${y - s * 1.6}Q${x + s * 0.2} ${y - s * 0.2} ${x + s * 1.6} ${y}Q${x + s * 0.2} ${y + s * 0.2} ${x} ${y + s * 1.6}Q${x - s * 0.2} ${y + s * 0.2} ${x - s * 1.6} ${y}Q${x - s * 0.2} ${y - s * 0.2} ${x} ${y - s * 1.6}Z" fill="#FFF0B8"/>`;
    }
    return `<g opacity="${p.isNight ? 1 : 0}">${out}</g>`;
};

const town = (p: Palette, hasGlow = true) => {
    const hill = ridge({ x0: 960, x1: 1330, y: 300, amp: 0, waves: [400], seed: 3, floor: 360, jitter: 0 });
    const mound = `<path d="M960 350Q1010 290 1080 272Q1150 252 1220 270Q1290 288 1330 350Z" fill="${p.town.hill}" filter="url(#lift)"/>`;
    const houses: readonly (readonly [number, number, number, string])[] = [
        [1010, 26, 22, p.town.roof],
        [1040, 22, 26, p.town.roofAlt],
        [1066, 28, 20, p.town.roof],
        [1182, 24, 24, p.town.roofAlt],
        [1210, 30, 20, p.town.roof],
        [1244, 22, 18, p.town.roofAlt],
        [1270, 24, 16, p.town.roof],
    ];
    let hs = '';
    for (const [x, w, h, roof] of houses) {
        const base = 300 - (Math.abs(x - 1140) < 140 ? (140 - Math.abs(x - 1140)) * 0.2 : 0) + 8;
        hs += `<rect x="${x}" y="${n(base - h)}" width="${w}" height="${h}" fill="${p.town.wall}"/><rect x="${x + w * 0.62}" y="${n(base - h)}" width="${n(w * 0.38)}" height="${h}" fill="${p.town.wallShade}"/><path d="M${x - 3} ${n(base - h)}L${x + w / 2} ${n(base - h - w * 0.55)}L${x + w + 3} ${n(base - h)}Z" fill="${roof}"/><rect x="${n(x + w * 0.3)}" y="${n(base - h * 0.62)}" width="${n(w * 0.2)}" height="${n(h * 0.3)}" fill="${p.town.window}"/>`;
        if (p.isNight) hs += glowDot(x + w * 0.4, base - h * 0.47, 1.4);
    }
    const keepX = 1112;
    const keep = `<rect x="${keepX}" y="198" width="54" height="80" fill="${p.town.wall}"/><rect x="${keepX + 34}" y="198" width="20" height="80" fill="${p.town.wallShade}"/><path d="M${keepX - 2} 198h58v-8h-8v5h-8v-5h-9v5h-8v-5h-8v5h-9v-5h-8Z" fill="${p.town.wall}"/><path d="M${keepX + 18} 278v-22a9 9 0 0 1 18 0v22Z" fill="${p.town.window}"/>`;
    const tower = (x: number, top: number, w: number) =>
        `<rect x="${x}" y="${top}" width="${w}" height="${282 - top}" fill="${p.town.wall}"/><rect x="${x + w * 0.6}" y="${top}" width="${n(w * 0.4)}" height="${282 - top}" fill="${p.town.wallShade}"/><path d="M${x - 4} ${top}L${x + w / 2} ${top - w * 1.5}L${x + w + 4} ${top}Z" fill="${p.town.roofAlt}"/><path d="M${x + w / 2} ${top - w * 1.5}v-16" stroke="${p.town.wallShade}" stroke-width="1.6"/><path d="M${x + w / 2} ${top - w * 1.5 - 16}l14 4l-14 5Z" fill="${p.town.flag}"/><rect x="${n(x + w * 0.35)}" y="${top + 12}" width="${n(w * 0.3)}" height="10" rx="3" fill="${p.town.window}"/>${p.isNight ? glowDot(x + w / 2, top + 17, 1.8) : ''}`;
    const glow = p.isNight && hasGlow ? `<ellipse cx="1140" cy="270" rx="200" ry="70" fill="url(#warmth)" opacity=".7"/>` : '';
    return `<g>${glow}${mound}<g filter="url(#lift)">${tower(1090, 206, 22)}${tower(1178, 218, 20)}${keep}${hs}</g><path d="${hill}" fill="none"/></g>`;
};

const cabin = (p: Palette, x: number, base: number, hasSmoke = true) => {
    const w = 176;
    const logH = 13;
    const rows = 7;
    const top = base - logH * rows;
    let logs = '';
    for (let i = 0; i < rows; i++) {
        const y = base - logH * (i + 1);
        logs += `<rect x="${x}" y="${y}" width="${w}" height="${logH}" rx="6" fill="${p.cabin.log}"/><path d="M${x + 6} ${y + 3}H${x + w - 6}" stroke="${p.cabin.logLit}" stroke-width="2.4" stroke-linecap="round"/>`;
        for (const ex of [x - 4, x + w + 4]) logs += `<circle cx="${ex}" cy="${y + logH / 2}" r="7.4" fill="${p.cabin.logEnd}"/><circle cx="${ex}" cy="${y + logH / 2}" r="3.6" fill="none" stroke="${p.cabin.ring}" stroke-width="1.2"/>`;
    }
    const peak = top - 70;
    const gable = `<path d="M${x + 4} ${top}L${x + w / 2} ${peak + 8}L${x + w - 4} ${top}Z" fill="${p.cabin.logLit}"/><path d="${Array.from({ length: 5 }, (_, i) => {
        const y = top - 12 * (i + 1);
        const half = (w / 2 - 4) * (1 - (12 * (i + 1)) / (top - peak - 8));
        return `M${n(x + w / 2 - half + 4)} ${y}H${n(x + w / 2 + half - 4)}`;
    }).join('')}" stroke="${p.cabin.log}" stroke-width="2"/>`;
    const roof = `<path d="M${x - 22} ${top + 8}L${x + w / 2} ${peak - 6}L${x + w / 2} ${peak + 8}L${x - 6} ${top + 14}Z" fill="${p.cabin.roof}"/><path d="M${x + w + 22} ${top + 8}L${x + w / 2} ${peak - 6}L${x + w / 2} ${peak + 8}L${x + w + 6} ${top + 14}Z" fill="${p.cabin.roofLit}"/>`;
    const chimney = `<rect x="${x + w * 0.7}" y="${peak + 8}" width="22" height="46" fill="${p.cabin.stone}"/><path d="M${x + w * 0.7} ${peak + 20}h22M${x + w * 0.7} ${peak + 34}h22M${x + w * 0.7 + 8} ${peak + 8}v12M${x + w * 0.7 + 14} ${peak + 20}v14" stroke="${p.shadow.color}" stroke-opacity=".25" stroke-width="1.2"/><rect x="${x + w * 0.7 - 3}" y="${peak + 4}" width="28" height="7" rx="2" fill="${p.cabin.stone}"/>`;
    const smoke = `<g opacity="${p.isNight ? 0.4 : 0.85}">${[0, 1, 2, 3].map((i) => `<circle cx="${n(x + w * 0.7 + 11 + Math.sin(i * 1.4) * 8 + i * 6)}" cy="${peak - 6 - i * 22}" r="${7 + i * 3}" fill="${p.cabin.smoke}" opacity="${n(0.9 - i * 0.2)}"/>`).join('')}${curl(x + w * 0.7 + 40, peak - 70, 10, p.cabin.smoke)}</g>`;
    const door = `<path d="M${x + 38} ${base}V${base - 58}a18 18 0 0 1 36 0V${base}Z" fill="${p.cabin.door}"/><path d="M${x + 56} ${base - 70}V${base}" stroke="${p.shadow.color}" stroke-opacity=".3" stroke-width="1.4"/><circle cx="${x + 66}" cy="${base - 28}" r="2.4" fill="${p.flora.marigold}"/>`;
    const winX = x + 104;
    const winY = base - 66;
    const glass = p.isNight ? '#FFC766' : p.cabin.window;
    const win = `${p.isNight ? `<circle cx="${winX + 22}" cy="${winY + 18}" r="70" fill="url(#warmth)"/>` : ''}<rect x="${winX - 4}" y="${winY - 4}" width="52" height="44" rx="3" fill="${p.cabin.frame}"/><rect x="${winX}" y="${winY}" width="44" height="36" fill="${glass}"/><path d="M${winX + 22} ${winY}v36M${winX} ${winY + 18}h44" stroke="${p.cabin.frame}" stroke-width="3"/>${p.isNight ? '' : `<path d="M${winX + 4} ${winY + 14}l10 -10M${winX + 26} ${winY + 32}l14 -14" stroke="#FFFFFF" stroke-width="2.2" opacity=".6"/>`}<rect x="${winX - 8}" y="${winY + 40}" width="60" height="10" rx="2" fill="${p.cabin.log}"/>${rosette(winX + 6, winY + 38, 7, p.flora.coral, p.flora.marigold, p, 10)}${rosette(winX + 24, winY + 36, 8, p.flora.lapis, p.flora.cream, p)}${rosette(winX + 42, winY + 38, 7, p.flora.marigold, p.flora.coral, p, 20)}`;
    const found = `<rect x="${x - 10}" y="${base}" width="${w + 20}" height="9" rx="3" fill="${p.cabin.stone}"/>`;
    const step = `<rect x="${x + 30}" y="${base + 6}" width="52" height="8" rx="2" fill="${p.cabin.logEnd}"/>`;
    const pile = Array.from({ length: 6 }, (_, i) => {
        const row = i < 3 ? 0 : i < 5 ? 1 : 2;
        const col = i < 3 ? i : i < 5 ? i - 3 : 0;
        const cx = x + w + 30 + col * 15 + row * 7.5;
        const cy = base + 2 - row * 13;
        return `<circle cx="${cx}" cy="${cy}" r="7.6" fill="${p.cabin.logEnd}"/><circle cx="${cx}" cy="${cy}" r="3.4" fill="none" stroke="${p.cabin.ring}" stroke-width="1.2"/>`;
    }).join('');
    return `<g>${hasSmoke ? smoke : ''}<g filter="url(#liftHi)">${chimney}${gable}${roof}${logs}${found}</g><g filter="url(#lift)">${door}${win}${step}${pile}</g></g>`;
};

const ribbon = (center: readonly Pt[], widthAt: (y: number) => number) => {
    const left: Pt[] = [];
    const right: Pt[] = [];
    center.forEach(([x, y], i) => {
        const [px, py] = center[Math.max(0, i - 1)] as Pt;
        const [nx, ny] = center[Math.min(center.length - 1, i + 1)] as Pt;
        const dx = nx - px;
        const dy = ny - py;
        const len = Math.hypot(dx, dy) || 1;
        const w = widthAt(y) / 2;
        left.push([x - (dy / len) * w, y + (dx / len) * w]);
        right.push([x + (dy / len) * w, y - (dx / len) * w]);
    });
    return `${smooth(left)}L${smooth([...right].reverse()).slice(1)}Z`;
};

const pathLine: readonly Pt[] = [
    [322, 454],
    [356, 474],
    [440, 496],
    [580, 514],
    [760, 528],
    [940, 534],
    [1080, 528],
    [1164, 508],
    [1194, 478],
    [1180, 444],
    [1156, 408],
    [1146, 374],
    [1142, 340],
    [1140, 318],
];
const pathWidth = (y: number) => Math.max(3, 5 + (y - 336) * 0.2);

const creekLine: readonly Pt[] = [
    [1034, 338],
    [960, 360],
    [860, 382],
    [740, 404],
    [640, 428],
    [560, 466],
    [506, 512],
    [470, 560],
    [452, 612],
];
const creekWidth = (y: number) => 5 + (y - 336) * 0.22;

const bridge = (p: Palette, x: number, y: number) => {
    let planks = '';
    for (let i = 0; i < 9; i++) planks += `<rect x="${x - 40 + i * 9}" y="${n(y - 6 - Math.sin((i / 8) * Math.PI) * 8)}" width="8" height="12" rx="1.5" fill="${p.bridge.plank}"/>`;
    const rail = (dy: number) => `<path d="M${x - 44} ${y - 4 + dy}Q${x} ${y - 30 + dy} ${x + 44} ${y - 4 + dy}" stroke="${p.bridge.rail}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    const posts = [-40, -14, 14, 40].map((dx) => `<path d="M${x + dx} ${n(y - 4 - Math.cos((dx / 44) * (Math.PI / 2)) * 8)}v-18" stroke="${p.bridge.rail}" stroke-width="3" stroke-linecap="round"/>`).join('');
    return `<g filter="url(#lift)">${planks}${posts}${rail(-18)}</g>`;
};

const signpost = (p: Palette, x: number, base: number) => {
    const ink = p.isNight ? '#3B3552' : '#5A4232';
    const plank = p.isNight ? '#B9B2C8' : p.flora.cream;
    const right = textWidth('lanternhill', 14) + 18;
    const left = textWidth('the cabin', 14) + 18;
    return `<g filter="url(#lift)"><rect x="${x - 3.5}" y="${base - 90}" width="7" height="90" rx="2" fill="${p.bridge.rail}"/><path d="M${x - 6} ${base - 84}h${n(right)}l12 12l-12 12h${n(-right)}Z" fill="${plank}"/><path d="M${x + 6} ${base - 54}h${n(-left)}l-12 11l12 11h${n(left)}Z" fill="${plank}"/>${letter('lanternhill', x + 3, base - 67, 14, ink)}${letter('the cabin', x - left + 9, base - 38, 14, ink)}${grassTuft(x, base, 18, p.flora.grass, 4)}</g>`;
};

const fence = (p: Palette) => {
    let posts = '';
    for (let i = 0; i < 6; i++) {
        const x = 30 + i * 30;
        const y = 470 - i * 3;
        posts += `<rect x="${x}" y="${y - 30}" width="6" height="32" rx="2" fill="${p.bridge.rail}"/>`;
    }
    return `<g filter="url(#lift)"><path d="M26 452L196 437M26 466L196 451" stroke="${p.bridge.plank}" stroke-width="5" stroke-linecap="round"/>${posts}</g>`;
};

const meadowFlowers = (p: Palette) => {
    const rand = seeded(31);
    const colors = [p.flora.coral, p.flora.marigold, p.flora.lapis, p.flora.lilac, p.flora.cream];
    let out = '';
    for (let i = 0; i < 18; i++) {
        const x = 220 + rand() * 1180;
        const y = 420 + rand() * 170;
        const onPath = Math.abs(y - (500 + (x - 300) * 0.04)) < 26 && x < 1100;
        if (onPath) continue;
        const r = 2 + (y - 420) / 60;
        out += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${colors[i % colors.length]}"/>`;
    }
    return `<g opacity="${p.isNight ? 0.55 : 0.95}">${out}</g>`;
};

const birds = (p: Palette) =>
    p.isNight
        ? ''
        : `<path d="M700 180q8 -7 14 0q6 -7 14 0M742 160q6 -5 10 0q5 -5 10 0M1010 96q7 -6 12 0q5 -6 12 0" stroke="${p.pine.dark}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>`;

const fireflies = (p: Palette) => {
    if (!p.isNight) return '';
    const rand = seeded(23);
    let out = '';
    for (let i = 0; i < 34; i++) {
        const x = 120 + rand() * 1380;
        const y = 330 + rand() * 230;
        out += glowDot(x, y, 1.2 + rand() * 1.3);
    }
    return out;
};

const foreground = (p: Palette, side: 'left' | 'right') => {
    const flip = side === 'right';
    const x = (v: number) => (flip ? W - v : v);
    return [
        fern(x(60), 614, 150, p, flip ? 3 : 1),
        bush(x(170), 612, 110, p, flip ? 6 : 4),
        fern(x(8), 606, 110, p, flip ? 8 : 7),
        `<path d="M${x(132)} 612Q${x(128)} 580 ${x(136)} 556" stroke="${p.flora.stem}" stroke-width="2" fill="none"/>`,
        flip ? berries(x(134), 548, 9, p, 5) : bud(x(136), 556, 20, p.flora.lilac, p, -8),
    ].join('');
};

export const valley = (p: Palette) => {
    const rand = seeded(5);
    const backHillY = (x: number) => 352 + Math.sin(x / 260) * 10;
    const tufts = Array.from({ length: 40 }, (_, i) => {
        const x = 40 + rand() * 1520;
        const y = 460 + rand() * 130;
        return grassTuft(x, y, 10 + rand() * 12, i % 3 ? p.flora.grass : p.hill.edge, i);
    }).join('');
    const body = [
        sky(p),
        stars(p),
        p.isNight ? moon(p, 1330, 104, 34) : sun(p, 1330, 104, 40),
        `<g opacity="${p.isNight ? 0.35 : 1}">${cloud(250, 110, 150, p, 1)}${cloud(560, 70, 110, p, 2)}${cloud(930, 128, 130, p, 3)}</g>`,
        p.isNight ? '' : cloud(1520, 190, 90, p, 4),
        p.isNight ? '' : cloud(80, 250, 80, p, 6),
        `<path d="${ridge({ x0: -20, x1: W, y: 262, amp: 26, waves: [520, 230], seed: 8, floor: 420 })}" fill="${p.mountain[0]}"/>`,
        `<path d="${ridge({ x0: -20, x1: W, y: 292, amp: 18, waves: [380, 170], seed: 9, floor: 420 })}" fill="${p.mountain[1]}"/>`,
        town(p),
        `<g filter="url(#lift)"><path d="${ridge({ x0: -20, x1: W, y: 322, amp: 10, waves: [300, 120], seed: 10, floor: 460 })}" fill="${p.ridge.far}"/>${pineRow(-10, 960, (x) => 322 + Math.sin(x / 90) * 6, 30, p.ridge.pines, 12)}${pineRow(1330, W + 10, (x) => 324 + Math.sin(x / 90) * 6, 30, p.ridge.pines, 13)}</g>`,
        `<path filter="url(#lift)" d="${ridge({ x0: -20, x1: W, y: 356, amp: 9, waves: [420, 190], seed: 14, floor: H })}" fill="${p.hill.back}"/>`,
        `<path filter="url(#lift)" d="M-20 ${backHillY(0) + 40}${smooth(Array.from({ length: 18 }, (_, i) => [i * 100 - 20, 404 + Math.sin(i * 0.9) * 8] as const)).replace(/^M[^C]+/, '')}L1680 ${H}L-20 ${H}Z" fill="${p.hill.mid}"/>`,
        `<path filter="url(#lift)" d="${ridge({ x0: -20, x1: W, y: 470, amp: 12, waves: [500, 210], seed: 15, floor: H })}" fill="${p.hill.front}"/>`,
        pine(470, 440, 118, p, 21),
        pine(1300, 420, 132, p, 22),
        pine(1368, 432, 166, p, 23),
        `<path filter="url(#lift)" d="${ribbon(creekLine, creekWidth)}" fill="${p.creek.water}"/>`,
        `<path d="${smooth(creekLine.map(([x, y]) => [x + 3, y - 1] as const))}" stroke="${p.creek.shine}" stroke-width="2" fill="none" stroke-dasharray="14 22" opacity=".8"/>`,
        cabin(p, 214, 446),
        pine(150, 452, 170, p, 24),
        `<path filter="url(#lift)" d="${ribbon(pathLine, pathWidth)}" fill="${p.path.dirt}"/>`,
        `<path d="${smooth(pathLine)}" stroke="${p.path.edge}" stroke-width="1.6" fill="none" stroke-dasharray="2 16" opacity=".8"/>`,
        bridge(p, 520, 510),
        signpost(p, 404, 488),
        roundTree(610, 420, 70, p, 41),
        roundTree(655, 414, 52, p, 42),
        roundTree(1010, 380, 44, p, 43),
        roundTree(1262, 404, 58, p, 44),
        fence(p),
        meadowFlowers(p),
        birds(p),
        stone(640, 560, 34, p),
        stone(676, 566, 20, p),
        stone(1270, 548, 28, p),
        mushroom(760, 570, 14, p.flora.coral, p),
        mushroom(782, 574, 10, p.flora.marigold, p),
        tufts,
        dino({ p, x: p.isNight ? 930 : 860, y: 446, scale: 0.86, isFlipped: p.isNight, hasWren: !p.isNight, hasLantern: p.isNight, hasScarf: p.isNight }),
        pine(-10, 560, 470, p, 31),
        pine(96, 520, 330, p, 32),
        pine(1510, 530, 440, p, 33),
        pine(1610, 560, 360, p, 34),
        pine(1446, 540, 250, p, 35),
        foreground(p, 'left'),
        foreground(p, 'right'),
        fireflies(p),
        `<rect width="${W}" height="${H}" filter="url(#grain)"/>`,
    ].join('');
    return `${defs(p)}<clipPath id="frame"><rect width="${W}" height="${H}" rx="22"/></clipPath><g clip-path="url(#frame)">${body}</g>`;
};

const campfire = (p: Palette, x: number, y: number, hasGlow = true) => {
    const stones = Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return `<ellipse cx="${n(x + Math.cos(a) * 34)}" cy="${n(y + Math.sin(a) * 9)}" rx="10" ry="7" fill="${i % 2 ? p.stone.face : p.stone.lit}"/>`;
    }).join('');
    const logs = `<path d="M${x - 26} ${y + 2}L${x + 22} ${y - 10}M${x - 20} ${y - 10}L${x + 26} ${y + 2}" stroke="${p.bridge.plank}" stroke-width="9" stroke-linecap="round"/>`;
    const tripod = `<path d="M${x - 40} ${y + 6}L${x} ${y - 96}L${x + 40} ${y + 6}M${x} ${y - 96}L${x + 4} ${y + 8}" stroke="${p.bridge.rail}" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M${x} ${y - 94}V${y - 62}" stroke="${p.iron}" stroke-width="2"/><g filter="url(#lift)"><path d="M${x - 18} ${y - 36}q-4 -26 18 -26q22 0 18 26Z" fill="${p.iron}"/><path d="M${x + 18} ${y - 50}l14 -8" stroke="${p.iron}" stroke-width="5" stroke-linecap="round"/></g>`;
    const fire = p.isNight
        ? `${hasGlow ? `<circle cx="${x}" cy="${y - 20}" r="170" fill="url(#warmth)"/>` : ''}<path d="M${x - 22} ${y - 4}q-6 -36 14 -56q-2 20 10 26q4 -20 18 -30q10 32 -6 60Z" fill="#F29A4B"/><path d="M${x - 8} ${y - 4}q0 -22 12 -32q6 16 12 32Z" fill="#FFD27A"/>${glowDot(x - 30, y - 70, 1.4)}${glowDot(x + 16, y - 88, 1.1)}`
        : `${curl(x + 6, y - 20, 9, p.cabin.smoke)}`;
    return `<g filter="url(#lift)">${stones}${logs}</g>${fire}${tripod}`;
};

const logSeat = (p: Palette, x: number, y: number, w: number) =>
    `<g filter="url(#lift)"><rect x="${x - w / 2}" y="${y - 20}" width="${w}" height="20" rx="10" fill="${p.cabin.log}"/><ellipse cx="${x + w / 2 - 6}" cy="${y - 10}" rx="7" ry="10" fill="${p.cabin.logEnd}"/><path d="M${x - w / 2 + 10} ${y - 14}H${x + w / 2 - 16}" stroke="${p.cabin.logLit}" stroke-width="2.4" stroke-linecap="round"/></g>`;

const well = (p: Palette, x: number, y: number) =>
    `<g filter="url(#liftHi)"><path d="M${x - 44} ${y}V${y - 44}H${x + 44}V${y}Z" fill="${p.stone.face}"/><path d="M${x - 44} ${y - 30}h88M${x - 44} ${y - 14}h88M${x - 20} ${y - 44}v14M${x + 14} ${y - 30}v16" stroke="${p.shadow.color}" stroke-opacity=".2" stroke-width="1.6"/><ellipse cx="${x}" cy="${y - 44}" rx="44" ry="8" fill="${p.stone.lit}"/><path d="M${x - 36} ${y - 44}V${y - 118}M${x + 36} ${y - 44}V${y - 118}" stroke="${p.bridge.rail}" stroke-width="6"/><path d="M${x - 56} ${y - 108}L${x} ${y - 146}L${x + 56} ${y - 108}Z" fill="${p.cabin.roof}"/><path d="M${x} ${y - 146}L${x + 56} ${y - 108}L${x + 50} ${y - 104}L${x} ${y - 136}Z" fill="${p.cabin.roofLit}"/><path d="M${x - 36} ${y - 96}H${x + 36}" stroke="${p.bridge.rail}" stroke-width="4"/><path d="M${x + 4} ${y - 96}V${y - 70}" stroke="${p.iron}" stroke-width="1.6"/><path d="M${x - 8} ${y - 70}h24l-3 18h-18Z" fill="${p.bridge.plank}"/></g>`;

const garden = (p: Palette, x: number, y: number) => {
    const rows = [0, 1, 2]
        .map((r) => {
            const ry = y + r * 14;
            const heads = Array.from({ length: 5 }, (_, i) => `<circle cx="${x + 18 + i * 30 + (r % 2) * 14}" cy="${ry - 4}" r="${7 + (i % 2)}" fill="${i % 2 ? p.flora.leafLit : p.flora.leaf}"/>`).join('');
            return `<rect x="${x}" y="${ry - 4}" width="170" height="10" rx="5" fill="${p.room.floorShade}" opacity=".55"/>${heads}`;
        })
        .join('');
    const sun = `<path d="M${x + 186} ${y + 30}V${y - 70}" stroke="${p.flora.stem}" stroke-width="3"/><path transform="translate(${x + 186} ${y - 20}) rotate(-50)" d="${comma(20, 9)}" fill="${p.flora.leaf}"/>${rosette(x + 186, y - 76, 13, p.flora.marigold, p.room.floorShade, p)}`;
    return `<g filter="url(#lift)">${rows}</g>${sun}`;
};

const clothesline = (p: Palette, x0: number, x1: number, y: number) => {
    const mid = (x0 + x1) / 2;
    const scarf = p.isNight ? '' : `<g filter="url(#lift)"><path d="M${mid - 40} ${y + 12}h30v62l-6 8l-6 -8l-6 8l-6 -8l-6 8Z" fill="${p.dino.scarf}"/><path d="M${mid - 40} ${y + 30}h30M${mid - 40} ${y + 52}h30" stroke="${p.dino.scarfStripe}" stroke-width="3"/></g>`;
    const cloth = `<g filter="url(#lift)"><path d="M${mid + 10} ${y + 12}h44v40q-22 8 -44 0Z" fill="${p.flora.cream}"/><path d="M${mid + 14} ${y + 24}h36" stroke="${p.flora.coral}" stroke-width="2.4" opacity=".7"/></g>`;
    return `<path d="M${x0} ${y + 64}V${y - 10}M${x1} ${y + 64}V${y - 10}" stroke="${p.bridge.rail}" stroke-width="5" stroke-linecap="round"/><path d="M${x0} ${y}Q${mid} ${y + 22} ${x1} ${y}" stroke="${p.room.trim}" stroke-width="1.6" fill="none"/>${scarf}${cloth}<path d="M${mid - 36} ${y + 12}v-6M${mid - 14} ${y + 13}v-6M${mid + 16} ${y + 13}v-6M${mid + 48} ${y + 12}v-6" stroke="${p.bridge.plank}" stroke-width="3"/>`;
};

const homePath: readonly Pt[] = [
    [520, 492],
    [590, 530],
    [720, 560],
    [900, 566],
    [1080, 556],
    [1250, 520],
    [1400, 488],
    [1520, 470],
    [1640, 460],
];

const homeCreek: readonly Pt[] = [
    [1034, 338],
    [1180, 372],
    [1340, 404],
    [1470, 424],
    [1640, 436],
];

/** the homestead as paper sheets, back to front; `depth` is the sheet's distance behind the front edge */
/** `hasGlow: false` drops the painted warm halos; the stage lights those spots with real point lights instead */
export const homesteadLayers = (p: Palette, { hasFireflies = true, hasSmoke = true, hasGlow = true } = {}): readonly Layer[] => {
    const rand = seeded(7);
    const tufts = Array.from({ length: 30 }, (_, i) => grassTuft(40 + rand() * 1520, 470 + rand() * 120, 10 + rand() * 12, i % 3 ? p.flora.grass : p.hill.edge, i)).join('');
    return [
        {
            name: 'sky',
            depth: 9,
            body: [sky(p), stars(p), p.isNight ? moon(p, 1360, 96, 32) : sun(p, 1360, 100, 38)].join(''),
        },
        { name: 'clouds', depth: 8.5, body: `<g opacity="${p.isNight ? 0.35 : 1}">${cloud(260, 96, 140, p, 1)}${cloud(700, 64, 110, p, 2)}${cloud(1020, 140, 120, p, 3)}</g>` },
        {
            name: 'mountains',
            depth: 7,
            body: `<path d="${ridge({ x0: -20, x1: W, y: 262, amp: 26, waves: [520, 230], seed: 8, floor: 420 })}" fill="${p.mountain[0]}"/><path d="${ridge({ x0: -20, x1: W, y: 292, amp: 18, waves: [380, 170], seed: 9, floor: 420 })}" fill="${p.mountain[1]}"/>`,
        },
        { name: 'town', depth: 6, body: town(p, hasGlow) },
        {
            name: 'ridge',
            depth: 5,
            body: `<g filter="url(#lift)"><path d="${ridge({ x0: -20, x1: W, y: 322, amp: 10, waves: [300, 120], seed: 10, floor: 460 })}" fill="${p.ridge.far}"/>${pineRow(-10, 960, (x) => 322 + Math.sin(x / 90) * 6, 30, p.ridge.pines, 12)}${pineRow(1330, W + 10, (x) => 324 + Math.sin(x / 90) * 6, 30, p.ridge.pines, 13)}</g>`,
        },
        {
            name: 'backhill',
            depth: 4,
            body: [`<path filter="url(#lift)" d="${ridge({ x0: -20, x1: W, y: 360, amp: 9, waves: [420, 190], seed: 14, floor: H })}" fill="${p.hill.back}"/>`, `<path filter="url(#lift)" d="${ribbon(homeCreek, creekWidth)}" fill="${p.creek.water}"/>`, pine(1250, 410, 150, p, 22)].join(''),
        },
        {
            name: 'yard',
            depth: 2.4,
            body: [
                `<path filter="url(#lift)" d="${ridge({ x0: -20, x1: W, y: 440, amp: 10, waves: [520, 230], seed: 15, floor: H })}" fill="${p.hill.front}"/>`,
                pine(250, 470, 190, p, 24),
                `<g transform="translate(420 488) scale(1.3)">${cabin(p, 0, 0, hasSmoke)}</g>`,
                p.isNight && hasGlow ? lanternPost() : '',
                `<path filter="url(#lift)" d="${ribbon(homePath, (y) => 10 + (y - 440) * 0.4)}" fill="${p.path.dirt}"/>`,
                clothesline(p, 150, 330, 392),
                garden(p, 120, 530),
                roundTree(830, 470, 110, p, 45),
                roundTree(905, 478, 84, p, 46),
                logSeat(p, 700, 500, 80),
                campfire(p, 790, 504, hasGlow),
                logSeat(p, 880, 510, 70),
                well(p, 1470, 520),
                signpost(p, 640, 512),
                meadowFlowers(p),
                tufts,
            ].join(''),
        },
        { name: 'oles', depth: 1.6, body: dino({ p, x: 1120, y: 436, scale: 0.9, isFlipped: true, stance: 'stand', hasWren: !p.isNight, hasScarf: p.isNight }) },
        { name: 'edge', depth: 0.8, body: [pine(-10, 560, 470, p, 31), pine(90, 540, 300, p, 32), pine(1610, 560, 420, p, 34)].join('') },
        { name: 'foreground', depth: 0, body: [foreground(p, 'left'), foreground(p, 'right'), hasFireflies ? fireflies(p) : ''].join('') },
    ];
};

export const homestead = (p: Palette) =>
    `${defs(p)}<clipPath id="frame"><rect width="${W}" height="${H}" rx="22"/></clipPath><g clip-path="url(#frame)">${homesteadLayers(p)
        .map((l) => l.body)
        .join('')}<rect width="${W}" height="${H}" filter="url(#grain)"/></g>`;

/** one sheet of a scene as its own svg, transparent around it */
export const sheetSvg = (p: Palette, layer: Layer) => `${defs(p)}${layer.body}`;

const lanternPost = () => `<circle cx="690" cy="430" r="80" fill="url(#warmth)" opacity=".7"/>${glowDot(690, 430, 2.4)}`;
