import { dino } from './character.ts';
import { bud, cloud, grassTuft, rosette } from './flora.ts';
import { letter } from './lettering.ts';
import type { Palette } from './palette.ts';
import { defs, glowDot, n, ridge, seeded } from './paper.ts';
import type { Layer } from './paper.ts';
import { lantern } from './props.ts';
import type { AppName } from './signs.ts';
import { appAccent, appNames, signGroup } from './signs.ts';

const W = 1600;
const H = 600;
const BASE = 472;

const faces = {
    day: ['#E4ECF3', '#DFEADF', '#E7E2F2', '#F2E5E2', '#F3EDD9'],
    night: ['#3F4668', '#37485A', '#3E3A62', '#4A3C58', '#48453A'],
};

const awning = (p: Palette, x: number, y: number, w: number, accent: string) => {
    const stripes = 8;
    const sw = w / stripes;
    let d = '';
    for (let i = 0; i < stripes; i += 2) d += `<rect x="${n(x + i * sw)}" y="${y}" width="${n(sw)}" height="30" fill="${accent}"/>`;
    let scallop = `M${x} ${y + 30}`;
    for (let i = 0; i < stripes; i++) scallop += `a${n(sw / 2)} ${n(sw / 2.4)} 0 0 0 ${n(sw)} 0`;
    return `<g filter="url(#lift)"><rect x="${x}" y="${y}" width="${w}" height="30" fill="${p.flora.cream}"/>${d}<path d="${scallop}Z" fill="${p.flora.cream}"/><path d="${scallop}" fill="none" stroke="${accent}" stroke-width="3"/></g>`;
};

/** two shelves of small wares in the shop's colours */
const goods = (p: Palette, x: number, y: number, accent: string, seed: number) => {
    const rand = seeded(seed + 40);
    const colors = [accent, p.flora.coral, p.flora.marigold, p.flora.lapis, p.flora.lilac];
    let out = '';
    for (const shelfY of [y + 52, y + 104]) {
        out += `<rect x="${x + 4}" y="${shelfY}" width="102" height="5" rx="1.5" fill="${p.room.floor}"/>`;
        let cx = x + 10;
        while (cx < x + 96) {
            const w = 12 + rand() * 12;
            const h = 14 + rand() * 22;
            const kind = Math.floor(rand() * 3);
            const c = colors[Math.floor(rand() * colors.length)] ?? accent;
            if (kind === 0) out += `<rect x="${n(cx)}" y="${n(shelfY - h)}" width="${n(w)}" height="${n(h)}" rx="2" fill="${c}"/>`;
            if (kind === 1) out += `<circle cx="${n(cx + w / 2)}" cy="${n(shelfY - w / 2)}" r="${n(w / 2)}" fill="${c}"/>`;
            if (kind === 2) out += `<path d="M${n(cx)} ${shelfY}L${n(cx + w / 2)} ${n(shelfY - h)}L${n(cx + w)} ${shelfY}Z" fill="${c}"/>`;
            cx += w + 4;
        }
    }
    return out;
};

const shop = (p: Palette, app: AppName, i: number, x: number, w: number) => {
    const face = (p.isNight ? faces.night : faces.day)[i] ?? '#E4ECF3';
    const accent = appAccent(p, app);
    const h = 300 + ((i * 37) % 3) * 22;
    const top = BASE - h;
    const isGable = i % 2 === 0;
    const roof = isGable
        ? `<path d="M${x - 10} ${top + 2}L${x + w / 2} ${top - 70}L${x + w + 10} ${top + 2}Z" fill="${i % 4 === 0 ? p.town.roof : p.town.roofAlt}"/><circle cx="${x + w / 2}" cy="${top - 28}" r="13" fill="${p.room.trim}"/><circle cx="${x + w / 2}" cy="${top - 28}" r="8" fill="${p.isNight ? '#FFC766' : p.cabin.window}"/>`
        : `<rect x="${x - 8}" y="${top - 14}" width="${w + 16}" height="18" rx="3" fill="${p.room.trim}"/><rect x="${x + w * 0.7}" y="${top - 52}" width="24" height="40" fill="${p.cabin.stone}"/>`;
    const body = `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${face}"/><rect x="${x + w - 16}" y="${top}" width="16" height="${h}" fill="${p.shadow.color}" opacity=".08"/><rect x="${x}" y="${BASE - 14}" width="${w}" height="14" fill="${p.cabin.stone}"/>`;
    const upper = [0, 1]
        .map((k) => {
            const wx = x + 116 + k * 58;
            const lit = p.isNight && (i + k) % 2 === 0;
            return `<rect x="${wx - 4}" y="${top + 44}" width="44" height="58" rx="4" fill="${p.room.trim}"/><rect x="${wx}" y="${top + 48}" width="36" height="50" rx="2" fill="${lit ? '#FFC766' : p.isNight ? '#2A3052' : p.cabin.window}"/><path d="M${wx + 18} ${top + 48}v50" stroke="${p.room.trim}" stroke-width="3"/><rect x="${wx - 6}" y="${top + 100}" width="48" height="8" rx="2" fill="${p.room.floor}"/>${rosette(wx + 8, top + 100, 6, accent, p.flora.cream, p, k * 20)}${rosette(wx + 28, top + 99, 7, p.flora.coral, p.flora.marigold, p)}`;
        })
        .join('');
    const winX = x + 18;
    const winY = BASE - 168;
    const display = p.isNight
        ? `<rect x="${winX}" y="${winY}" width="122" height="130" rx="4" fill="${p.room.floorShade}"/>${Array.from({ length: 6 }, (_, k) => `<path d="M${winX + 10 + k * 20} ${winY + 4}v122" stroke="${p.room.floor}" stroke-width="2"/>`).join('')}`
        : `<rect x="${winX}" y="${winY}" width="122" height="130" rx="4" fill="${p.room.trim}"/><rect x="${winX + 6}" y="${winY + 6}" width="110" height="118" rx="2" fill="#F3F8FB"/>${goods(p, winX + 6, winY + 6, accent, i)}<path d="M${winX + 12} ${winY + 18}l18 -10M${winX + 86} ${winY + 116}l22 -14" stroke="#FFFFFF" stroke-width="3" opacity=".8"/>`;
    const doorX = x + 158;
    const door = `<path d="M${doorX} ${BASE - 14}V${BASE - 112}a28 28 0 0 1 56 0V${BASE - 14}Z" fill="${p.room.trim}"/><path d="M${doorX + 5} ${BASE - 14}V${BASE - 110}a23 23 0 0 1 46 0V${BASE - 14}Z" fill="${accent}" opacity="${p.isNight ? 0.55 : 0.85}"/><circle cx="${doorX + 44}" cy="${BASE - 60}" r="3" fill="${p.brass.base}"/>`;
    const sign = `<g transform="translate(${x - 12} ${top + 40}) scale(.46)">${signGroup(p, app)}</g>`;
    const pots = `${bud(doorX - 12, BASE - 16, 14, accent, p, -8)}${rosette(x + w - 8, BASE - 30, 9, p.flora.marigold, p.flora.coral, p)}`;
    return { facade: `<g><g filter="url(#liftHi)">${roof}${body}</g><g filter="url(#lift)">${upper}${display}${door}</g>${awning(p, winX - 6, winY - 40, 134, accent)}${pots}</g>`, sign };
};

const bunting = (p: Palette) => {
    const colors = [p.flora.coral, p.flora.marigold, p.flora.lapis, p.flora.lilac, p.flora.leafLit];
    let out = '';
    const spans = [
        [150, 120, 410, 150],
        [410, 150, 660, 118],
        [660, 118, 900, 152],
        [900, 152, 1150, 124],
    ] as const;
    spans.forEach(([x0, y0, x1, y1], s) => {
        const sag = 36;
        out += `<path d="M${x0} ${y0}Q${(x0 + x1) / 2} ${(y0 + y1) / 2 + sag * 2} ${x1} ${y1}" stroke="${p.iron}" stroke-width="1.6" fill="none"/>`;
        for (let k = 1; k < 9; k++) {
            const t = k / 9;
            const bx = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2) + t ** 2 * x1;
            const by = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * ((y0 + y1) / 2 + sag * 2) + t ** 2 * y1;
            out += `<path d="M${n(bx - 8)} ${n(by)}L${n(bx + 8)} ${n(by)}L${n(bx)} ${n(by + 18)}Z" fill="${colors[(k + s) % colors.length]}" opacity="${p.isNight ? 0.6 : 1}"/>`;
        }
    });
    return `<g filter="url(#lift)">${out}</g>`;
};

const street = (p: Palette) => {
    const rand = seeded(17);
    let stones = '';
    for (let row = 0; row < 6; row++) {
        const y = BASE + 26 + row * 18 + row * row * 1.2;
        const sw = 34 + row * 8;
        for (let x = -20 + (row % 2) * (sw / 2); x < W; x += sw + 6) stones += `<rect x="${n(x + rand() * 4)}" y="${n(y)}" width="${sw}" height="${12 + row * 1.6}" rx="${6 + row}" fill="${p.stone.lit}" opacity=".75"/>`;
    }
    const shade = `<rect y="${BASE + 18}" width="1250" height="22" fill="${p.shadow.color}" opacity=".1"/>`;
    const moss = Array.from({ length: 14 }, (_, i) => grassTuft(60 + i * 110 + rand() * 40, BASE + 20, 10, p.flora.grass, i + 60)).join('');
    return `<rect y="${BASE}" width="${W}" height="18" fill="${p.stone.lit}"/><rect y="${BASE + 18}" width="${W}" height="${H - BASE}" fill="${p.stone.face}"/>${stones}${shade}${moss}`;
};

const lamppost = (p: Palette, x: number) =>
    `<g filter="url(#lift)"><rect x="${x - 4}" y="${BASE - 190}" width="8" height="200" rx="3" fill="${p.iron}"/><rect x="${x - 12}" y="${BASE + 4}" width="24" height="10" rx="3" fill="${p.iron}"/><path d="M${x} ${BASE - 186}q0 -20 24 -20" stroke="${p.iron}" stroke-width="5" fill="none" stroke-linecap="round"/></g>${lantern(p, x + 24, BASE - 206, 1)}`;

const cart = (p: Palette, x: number) => {
    const blooms = p.isNight
        ? `<path d="M${x - 70} ${BASE - 40}q70 -30 140 0Z" fill="${p.room.floorShade}"/>`
        : [
              rosette(x - 50, BASE - 52, 13, p.flora.coral, p.flora.marigold, p),
              rosette(x - 18, BASE - 62, 15, p.flora.lapis, p.flora.cream, p, 10),
              rosette(x + 16, BASE - 54, 13, p.flora.marigold, p.flora.coral, p, 20),
              rosette(x + 48, BASE - 60, 12, p.flora.lilac, p.flora.cream, p, 5),
              bud(x + 60, BASE - 44, 16, p.flora.coral, p, 12),
          ].join('');
    return `<g filter="url(#lift)"><rect x="${x - 76}" y="${BASE - 44}" width="152" height="46" rx="6" fill="${p.bridge.plank}"/><path d="M${x - 70} ${BASE - 30}h140M${x - 70} ${BASE - 16}h140" stroke="${p.bridge.rail}" stroke-width="2" opacity=".5"/><circle cx="${x - 46}" cy="${BASE + 10}" r="20" fill="${p.bridge.rail}"/><circle cx="${x - 46}" cy="${BASE + 10}" r="7" fill="${p.bridge.plank}"/><circle cx="${x + 46}" cy="${BASE + 10}" r="20" fill="${p.bridge.rail}"/><circle cx="${x + 46}" cy="${BASE + 10}" r="7" fill="${p.bridge.plank}"/><path d="M${x + 76} ${BASE - 30}l40 -20" stroke="${p.bridge.rail}" stroke-width="5" stroke-linecap="round"/></g>${blooms}`;
};

/** the market as paper sheets, back to front */
export const marketLayers = (p: Palette, { hasFireflies = true } = {}): readonly Layer[] => {
    const rand = seeded(3);
    const stars = p.isNight ? Array.from({ length: 60 }, () => `<circle cx="${n(rand() * W)}" cy="${n(rand() * 220)}" r="${n(0.6 + rand())}" fill="#FFF3C4" opacity="${n(0.4 + rand() * 0.5)}"/>`).join('') : '';
    const castle = `<g filter="url(#lift)"><path d="${ridge({ x0: -20, x1: W, y: 250, amp: 20, waves: [480, 200], seed: 2, floor: 420 })}" fill="${p.mountain[1]}"/><path d="M620 250Q800 150 980 250Z" fill="${p.town.hill}"/><rect x="760" y="128" width="80" height="100" fill="${p.town.wall}"/><rect x="740" y="112" width="26" height="120" fill="${p.town.wall}"/><rect x="834" y="100" width="26" height="130" fill="${p.town.wallShade}"/><path d="M736 112L753 76L770 112ZM830 100L847 60L864 100Z" fill="${p.town.roofAlt}"/><path d="M847 60v-14" stroke="${p.town.wallShade}" stroke-width="2"/><path d="M847 46l14 5l-14 5Z" fill="${p.town.flag}"/><path d="M790 228v-26a10 10 0 0 1 20 0v26Z" fill="${p.town.window}"/>${p.isNight ? glowDot(753, 130, 1.8) + glowDot(847, 120, 1.8) : ''}</g>`;
    const sky = `<linearGradient id="msky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset=".6" stop-color="${p.sky[1]}"/><stop offset="1" stop-color="${p.sky[2]}"/></linearGradient><rect width="${W}" height="${H}" fill="url(#msky)"/>`;
    const shops = appNames.map((app, i) => shop(p, app, i, 40 + i * 244, 232));
    const fireflies = p.isNight && hasFireflies ? Array.from({ length: 26 }, () => glowDot(40 + rand() * 1500, 120 + rand() * 360, 1.1 + rand() * 1.3)).join('') : '';
    const plaque = `<g filter="url(#lift)"><rect x="1330" y="150" width="220" height="64" rx="10" fill="${p.isNight ? '#C9C3DA' : p.flora.cream}"/>${letter('lanternhill market', 1440, 180, 20, p.isNight ? '#2F2A4A' : '#3A3350', 'middle')}${letter('open while the fireflies are', 1440, 202, 12, p.isNight ? '#5B557A' : '#6A6480', 'middle')}</g><path d="M1350 214v262M1530 214v262" stroke="${p.iron}" stroke-width="5"/>`;
    return [
        { name: 'sky', depth: 9, body: `${sky}${stars}` },
        { name: 'clouds', depth: 8.5, body: `<g opacity="${p.isNight ? 0.3 : 1}">${cloud(300, 70, 130, p, 1)}${cloud(1180, 60, 110, p, 2)}${cloud(1480, 150, 90, p, 3)}</g>` },
        { name: 'castle', depth: 6, body: castle },
        { name: 'street', depth: 3, body: street(p) },
        { name: 'shops', depth: 2.6, body: shops.map((s) => s.facade).join('') },
        { name: 'signs', depth: 2.2, body: shops.map((s) => s.sign).join('') },
        { name: 'bunting', depth: 2, body: bunting(p) },
        { name: 'props', depth: 1.4, body: [plaque, lamppost(p, 1272), cart(p, 1470)].join('') },
        { name: 'oles', depth: 1.2, body: p.isNight ? '' : dino({ p, x: 1390, y: 486, scale: 0.78, isFlipped: true, stance: 'stand', hasBasket: true, hasList: true }) },
        { name: 'foreground', depth: 0, body: fireflies },
    ];
};

export const market = (p: Palette) =>
    `${defs(p)}<clipPath id="mframe"><rect width="${W}" height="${H}" rx="22"/></clipPath><g clip-path="url(#mframe)">${marketLayers(p)
        .map((l) => l.body)
        .join('')}<rect width="${W}" height="${H}" filter="url(#grain)"/></g>`;
