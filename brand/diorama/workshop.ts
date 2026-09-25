import { basset, bulldog, dalmatian, owl } from './crew.ts';
import { dino } from './character.ts';
import { grassTuft, pine, rosette } from './flora.ts';
import { letter, textWidth } from './lettering.ts';
import type { Palette } from './palette.ts';
import { defs, glowDot, n, seeded } from './paper.ts';
import { dym, lamp, lantern, magicDefs } from './props.ts';

const W = 1600;
const H = 600;
const L = 190;
const R = 1410;
const FLOOR = 532;
const LOFT = 322;
const EAVE = 176;
const PEAK = 44;
const HALL = [566, 1054] as const;

const roofY = (x: number) => (x < 800 ? EAVE - ((x - L) / (800 - L)) * (EAVE - PEAK) : EAVE - ((R - x) / (R - 800)) * (EAVE - PEAK));

const tag = (p: Palette, x: number, y: number, text: string) => {
    const w = textWidth(text, 15) + 22;
    return `<path d="M${x + 8} ${y - 18}V${y}" stroke="${p.iron}" stroke-width="1.2"/><g filter="url(#lift)"><path d="M${x} ${y}h${n(w)}v26h${n(-w)}l-8 -13Z" fill="${p.isNight ? '#C9C3DA' : p.flora.cream}"/><circle cx="${x + 2}" cy="${y + 13}" r="2.6" fill="${p.room.wallShade}"/>${letter(text, x + 10, y + 18, 15, p.isNight ? '#2F2A4A' : '#3A3350')}</g>`;
};

const shell = (p: Palette) => {
    const inner = `M${L + 22} ${FLOOR}V${roofY(L + 22) + 16}L800 ${PEAK + 26}L${R - 22} ${roofY(R - 22) + 16}V${FLOOR}Z`;
    const back = `<path d="${inner}" fill="${p.room.wall}"/>`;
    const logs = (x: number) =>
        Array.from({ length: Math.floor((FLOOR - EAVE) / 15) }, (_, i) => {
            const y = FLOOR - 15 * (i + 1);
            return `<rect x="${x}" y="${y}" width="24" height="15" rx="6" fill="${p.cabin.log}"/><circle cx="${x + 12}" cy="${y + 7.5}" r="6" fill="${p.cabin.logEnd}"/><circle cx="${x + 12}" cy="${y + 7.5}" r="2.8" fill="none" stroke="${p.cabin.ring}" stroke-width="1"/>`;
        }).join('');
    const roof = `<path d="M${L - 40} ${EAVE + 12}L800 ${PEAK - 14}L${R + 40} ${EAVE + 12}L${R + 40} ${EAVE + 34}L800 ${PEAK + 10}L${L - 40} ${EAVE + 34}Z" fill="${p.cabin.roof}"/><path d="M800 ${PEAK - 14}L${R + 40} ${EAVE + 12}L${R + 40} ${EAVE + 34}L800 ${PEAK + 10}Z" fill="${p.cabin.roofLit}"/>${Array.from({ length: 5 }, (_, i) => {
        const t = (i + 1) / 6;
        return `<path d="M${n(L - 40 + (800 - L + 40) * t)} ${n(EAVE + 12 - (EAVE + 26) * t + 10)}v14M${n(R + 40 - (R + 40 - 800) * t)} ${n(EAVE + 12 - (EAVE + 26) * t + 10)}v14" stroke="${p.shadow.color}" stroke-opacity=".2" stroke-width="2"/>`;
    }).join('')}`;
    const chimney = `<rect x="1150" y="${PEAK + 20}" width="40" height="80" fill="${p.cabin.stone}"/><rect x="1144" y="${PEAK + 14}" width="52" height="10" rx="2" fill="${p.cabin.stone}"/>`;
    const smoke = `<g opacity="${p.isNight ? 0.45 : 0.85}">${[0, 1, 2].map((i) => `<circle cx="${1170 + i * 14}" cy="${PEAK - 2 - i * 24}" r="${9 + i * 4}" fill="${p.cabin.smoke}" opacity="${n(0.9 - i * 0.25)}"/>`).join('')}</g>`;
    const floors = `<rect x="${L}" y="${FLOOR}" width="${R - L}" height="18" fill="${p.room.floor}"/><rect x="${L + 22}" y="${LOFT}" width="${HALL[0] - L - 22}" height="14" fill="${p.room.floor}"/><rect x="${HALL[1]}" y="${LOFT}" width="${R - 22 - HALL[1]}" height="14" fill="${p.room.floor}"/><rect x="${HALL[0] - 8}" y="${LOFT}" width="12" height="${FLOOR - LOFT}" fill="${p.room.floorShade}"/><rect x="${HALL[1] - 4}" y="${LOFT}" width="12" height="${FLOOR - LOFT}" fill="${p.room.floorShade}"/><rect x="${L + 22}" y="${FLOOR - 8}" width="${R - L - 44}" height="8" fill="${p.room.wallShade}"/>`;
    return { back, frame: `<g filter="url(#liftHi)">${logs(L)}${logs(R - 24)}${floors}</g>`, roof: `${smoke}<g filter="url(#liftHi)">${chimney}${roof}</g>` };
};

const fleetRoom = (p: Palette) => {
    const desk = `<g filter="url(#lift)"><rect x="232" y="470" width="190" height="12" rx="3" fill="${p.room.floor}"/><rect x="242" y="482" width="10" height="50" fill="${p.room.floorShade}"/><rect x="402" y="482" width="10" height="50" fill="${p.room.floorShade}"/></g>`;
    const window = `<g filter="url(#lift)"><rect x="252" y="352" width="92" height="84" rx="5" fill="${p.room.trim}"/><rect x="258" y="358" width="80" height="72" fill="${p.isNight ? '#2A3264' : p.cabin.window}"/><path d="M298 358v72M258 394h80" stroke="${p.room.trim}" stroke-width="4"/>${p.isNight ? `<circle cx="320" cy="376" r="7" fill="${p.sun.disc}"/><circle cx="324" cy="373" r="6" fill="#2A3264"/>` : `<path d="M266 380l12 -12M302 424l16 -16" stroke="#FFFFFF" stroke-width="3" opacity=".6"/>`}</g>`;
    return `${window}${desk}${lamp(p, 300, 470, 0.62)}${dym(p, 300 + 104 * 0.62, 470 - 60 * 0.62, p.isNight, 0.7)}${owl(p, 472, 402)}${bulldog(p, 470, FLOOR)}${basset(p, 530, FLOOR)}${dalmatian(p, 238, FLOOR)}${tag(p, 380, 346, 'fleet')}`;
};

const machineRoom = (p: Palette) => {
    const wheel = (x: number, y: number, r: number) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${p.iron}" stroke-width="4"/><circle cx="${x}" cy="${y}" r="${n(r * 0.3)}" fill="${p.brass.base}"/><path d="M${x - r} ${y}h${r * 2}M${x} ${y - r}v${r * 2}" stroke="${p.iron}" stroke-width="2"/>`;
    const barrel = `<g filter="url(#lift)"><path d="M250 ${LOFT}q-6 -34 0 -64h56q6 30 0 64Z" fill="${p.bridge.plank}"/><path d="M247 ${LOFT - 14}h62M247 ${LOFT - 50}h62" stroke="${p.iron}" stroke-width="3.5"/><rect x="258" y="${LOFT - 40}" width="40" height="18" rx="2" fill="${p.flora.cream}"/>${letter('brew', 278, LOFT - 26, 12, '#3A3350', 'middle')}</g>`;
    const kettle = `<path d="M470 ${LOFT - 120}V${LOFT - 64}" stroke="${p.room.floorShade}" stroke-width="2"/><g filter="url(#lift)"><path d="M452 ${LOFT - 40}q-4 -26 18 -26q22 0 18 26Z" fill="${p.flora.lapis}"/><path d="M488 ${LOFT - 54}l14 -8" stroke="${p.flora.lapis}" stroke-width="5" stroke-linecap="round"/><path d="M458 ${LOFT - 64}q12 -10 24 0" stroke="${p.iron}" stroke-width="2.5" fill="none"/></g>`;
    const ropes = `<path d="M396 ${LOFT - 104}L470 ${LOFT - 120}M356 ${LOFT - 70}L396 ${LOFT - 104}M356 ${LOFT - 70}V${LOFT}" stroke="${p.room.floorShade}" stroke-width="2"/>`;
    return `${barrel}${ropes}<g filter="url(#lift)">${wheel(396, LOFT - 104, 18)}${wheel(356, LOFT - 70, 12)}</g>${kettle}${tag(p, 250, 214, 'machine')}`;
};

const chordsHall = (p: Palette) => {
    const rug = `<ellipse cx="760" cy="${FLOOR + 2}" rx="160" ry="14" fill="${p.flora.coral}" opacity=".85"/><ellipse cx="760" cy="${FLOOR + 2}" rx="120" ry="9" fill="none" stroke="${p.flora.marigold}" stroke-width="3" stroke-dasharray="10 8"/>`;
    const pipes = Array.from({ length: 9 }, (_, i) => {
        const x = 880 + i * 18;
        const h = 150 + Math.sin(i * 0.7) * 30 + (i % 2 ? -10 : 18);
        return `<rect x="${x}" y="${n(446 - h)}" width="14" height="${n(h)}" rx="3" fill="${i % 2 ? p.brass.base : p.brass.lit}"/><path d="M${x + 3} ${n(446 - h + 18)}h8" stroke="${p.brass.shade}" stroke-width="3" stroke-linecap="round"/>`;
    }).join('');
    const organ = `<g filter="url(#liftHi)">${pipes}<rect x="862" y="440" width="186" height="92" rx="6" fill="${p.room.floor}"/><rect x="870" y="448" width="170" height="24" rx="3" fill="${p.room.floorShade}"/>${Array.from({ length: 14 }, (_, i) => `<rect x="${874 + i * 12}" y="452" width="10" height="16" rx="1.5" fill="${i % 3 === 1 ? p.iron : '#F7F4EE'}"/>`).join('')}${rosette(955, 504, 14, p.flora.coral, p.flora.marigold, p)}</g><g filter="url(#lift)">${Array.from({ length: 5 }, (_, i) => `<path d="M${870 - i * 3} ${458 + i * 3}L${820 - i * 4} ${452 + i * 5}" stroke="${p.bridge.rail}" stroke-width="3.2" stroke-linecap="round"/><circle cx="${820 - i * 4}" cy="${452 + i * 5}" r="4" fill="${p.flora.marigold}"/>`).join('')}</g>`;
    const hallWindow = `<g filter="url(#lift)"><path d="M720 290v-80a40 40 0 0 1 80 0v80Z" fill="${p.room.trim}"/><path d="M727 284v-74a33 33 0 0 1 66 0v74Z" fill="${p.isNight ? '#2A3264' : p.cabin.window}"/><path d="M760 176v108M727 240h66" stroke="${p.room.trim}" stroke-width="4"/>${p.isNight ? glowDot(742, 206, 1.3) + glowDot(776, 226, 1.1) : ''}</g>`;
    const notes = `<g fill="${p.flora.lapis}" opacity="${p.isNight ? 0.9 : 0.75}">${[
        [960, 220],
        [1000, 190],
        [930, 170],
    ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/><path d="M${(x ?? 0) + 4} ${y}v-18l8 4" stroke="${p.flora.lapis}" stroke-width="2" fill="none"/>`)
        .join('')}</g>`;
    return `${hallWindow}${rug}${organ}${notes}${dino({ p, x: 668, y: FLOOR - 96 * 0.9, scale: 0.9, stance: 'stand', hasWren: !p.isNight })}${tag(p, 600, 200, 'chords')}`;
};

const mirrorRoom = (p: Palette) => {
    const mirror = `<g filter="url(#liftHi)"><ellipse cx="1150" cy="${LOFT - 64}" rx="38" ry="56" fill="${p.brass.base}"/><ellipse cx="1150" cy="${LOFT - 64}" rx="31" ry="49" fill="${p.isNight ? '#39417A' : '#CFE3EE'}"/><path d="M1134 ${LOFT - 92}l18 -14M1140 ${LOFT - 60}l24 -20" stroke="#FFFFFF" stroke-width="3" opacity=".6"/><rect x="1144" y="${LOFT - 8}" width="12" height="8" fill="${p.brass.shade}"/></g>`;
    const stand = `<g filter="url(#lift)"><path d="M1290 ${LOFT}v-120M1270 ${LOFT}h40M1276 ${LOFT - 116}h28" stroke="${p.room.floorShade}" stroke-width="5" stroke-linecap="round"/><path d="M1280 ${LOFT - 112}q-10 30 -4 60l10 0q-4 -30 8 -60Z" fill="${p.dino.scarf}"/><path d="M1276 ${LOFT - 70}h12M1278 ${LOFT - 90}h12" stroke="${p.dino.scarfStripe}" stroke-width="2.4"/></g>`;
    return `${mirror}${stand}${tag(p, 1220, 214, 'mirror')}`;
};

const doorRoom = (p: Palette) => {
    const door = `<g filter="url(#lift)"><path d="M1300 ${FLOOR}V${FLOOR - 140}a38 38 0 0 1 76 0V${FLOOR}Z" fill="${p.room.trim}"/><path d="M1306 ${FLOOR}V${FLOOR - 138}a32 32 0 0 1 64 0V${FLOOR}Z" fill="${p.cabin.door}"/><circle cx="1312" cy="${FLOOR - 70}" r="3.4" fill="${p.brass.base}"/></g>`;
    const key = `<g filter="url(#lift)"><circle cx="1256" cy="${FLOOR - 118}" r="3" fill="${p.iron}"/><path d="M1256 ${FLOOR - 115}v14" stroke="${p.brass.shade}" stroke-width="1.6"/><circle cx="1256" cy="${FLOOR - 96}" r="6" fill="none" stroke="${p.brass.base}" stroke-width="3"/><path d="M1256 ${FLOOR - 90}v20M1256 ${FLOOR - 76}h6M1256 ${FLOOR - 70}h5" stroke="${p.brass.base}" stroke-width="3"/></g>`;
    const hearth = `<g filter="url(#liftHi)"><rect x="1096" y="${FLOOR - 118}" width="120" height="118" fill="${p.cabin.stone}"/><rect x="1086" y="${FLOOR - 126}" width="140" height="12" rx="2" fill="${p.room.floor}"/><path d="M1116 ${FLOOR}V${FLOOR - 58}a40 40 0 0 1 80 0V${FLOOR}Z" fill="${p.room.floorShade}"/></g>${
        p.isNight
            ? `<circle cx="1156" cy="${FLOOR - 30}" r="90" fill="url(#warmth)"/><path d="M1134 ${FLOOR - 6}q-4 -30 14 -46q-2 18 10 22q4 -16 16 -26q8 26 -4 50Z" fill="#F29A4B"/><path d="M1146 ${FLOOR - 6}q0 -18 10 -26q4 14 10 26Z" fill="#FFD27A"/>`
            : `<path d="M1136 ${FLOOR - 6}h40" stroke="${p.bridge.rail}" stroke-width="7" stroke-linecap="round"/>`
    }${rosette(1110, FLOOR - 138, 9, p.flora.coral, p.flora.marigold, p)}${lantern(p, 1196, FLOOR - 128, 0.6)}`;
    const mat = `<rect x="1280" y="${FLOOR - 4}" width="100" height="8" rx="3" fill="${p.flora.lapis}" opacity=".8"/>`;
    return `${hearth}${door}${key}${mat}${tag(p, 1240, 346, 'link it')}`;
};

export const workshop = (p: Palette) => {
    const rand = seeded(9);
    const sky = `<linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[2]}"/></linearGradient><rect width="${W}" height="${H}" fill="url(#wsky)"/>`;
    const stars = p.isNight ? Array.from({ length: 50 }, () => `<circle cx="${n(rand() * W)}" cy="${n(rand() * 300)}" r="${n(0.6 + rand())}" fill="#FFF3C4" opacity="${n(0.4 + rand() * 0.5)}"/>`).join('') : '';
    const ground = `<path d="M0 ${FLOOR + 8}Q400 ${FLOOR - 10} 800 ${FLOOR + 4}T1600 ${FLOOR}V${H}H0Z" fill="${p.hill.front}" filter="url(#lift)"/>${Array.from({ length: 16 }, (_, i) => grassTuft(40 + i * 100 + rand() * 40, 570 + rand() * 20, 14, p.flora.grass, i + 80)).join('')}`;
    const { back, frame, roof } = shell(p);
    const hallGlow = p.isNight ? `<circle cx="760" cy="420" r="260" fill="url(#warmth)" opacity=".6"/>` : '';
    const body = [
        sky,
        stars,
        pine(80, 560, 380, p, 3),
        pine(1520, 560, 400, p, 4),
        pine(150, 540, 250, p, 5),
        pine(1460, 540, 240, p, 6),
        ground,
        back,
        hallGlow,
        machineRoom(p),
        mirrorRoom(p),
        chordsHall(p),
        frame,
        fleetRoom(p),
        doorRoom(p),
        roof,
        `<rect width="${W}" height="${H}" filter="url(#grain)"/>`,
    ].join('');
    return `${defs(p)}<defs>${magicDefs(p)}</defs><clipPath id="wframe"><rect width="${W}" height="${H}" rx="22"/></clipPath><g clip-path="url(#wframe)">${body}</g>`;
};
