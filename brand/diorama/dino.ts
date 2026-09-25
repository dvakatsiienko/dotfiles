import type { Palette } from './palette.ts';
import { comma, n, smooth } from './paper.ts';
import type { Pt } from './paper.ts';

/* the silhouette, facing right, origin at the hip joint, feet on y = 102 */

const topLine: Pt[] = [
    [-196, -38],
    [-150, -50],
    [-105, -63],
    [-60, -75],
    [-20, -84],
    [12, -88],
    [42, -84],
    [64, -84],
    [80, -98],
    [90, -114],
    [108, -126],
    [138, -130],
    [170, -128],
    [198, -124],
    [216, -118],
    [224, -106],
];

const underLine: Pt[] = [
    [222, -94],
    [214, -84],
    [194, -77],
    [168, -72],
    [140, -68],
    [116, -64],
    [102, -50],
    [96, -30],
    [88, -8],
    [72, 16],
    [46, 32],
    [14, 36],
    [-18, 28],
    [-52, 8],
    [-96, -16],
    [-140, -32],
    [-178, -39],
];

const silhouette = smooth([...topLine, ...underLine], true);

const bellyInner: Pt[] = [
    [222, -86],
    [196, -84],
    [168, -80],
    [140, -77],
    [116, -75],
    [104, -58],
    [98, -36],
    [88, -12],
    [70, 6],
    [44, 18],
    [14, 22],
    [-18, 15],
    [-52, -4],
    [-96, -27],
    [-140, -42],
    [-192, -46],
];

/** dark tapered stripes across the back, the v1 language kept and sharpened */
const stripes = topLine
    .filter(([x]) => x > -175 && x < 96)
    .map(([x, y]) => {
        const len = 12 + (x + 175) / 12;
        const w = 3 + (x + 175) / 70;
        return `M${n(x - w)} ${n(y - 2)}L${n(x + w)} ${n(y - 2)}L${n(x - w * 0.6)} ${n(y + len)}Z`;
    })
    .join('');

/** a three-segment leg: thigh, shin back to the ankle, then the foot bone forward to the toes */
const leg = ([knee, ankle, toe]: readonly [Pt, Pt, Pt], fill: string, claw: string) => {
    const [kx, ky] = knee;
    const [ax, ay] = ankle;
    const [tx, ty] = toe;
    const foot = `M${tx - 16} 102Q${tx - 16} ${ty - 6} ${tx - 2} ${ty - 7}L${tx + 26} ${ty - 1}Q${tx + 36} ${ty + 3} ${tx + 34} 102Z`;
    const thigh = smooth(
        [
            [-40, 2],
            [-36, -34],
            [2, -52],
            [42, -30],
            [50, 4],
            [kx + 8, ky - 4],
            [kx - 10, ky + 10],
            [-8, 40],
        ],
        true,
    );
    return `<path d="M${kx} ${ky}L${ax} ${ay}" stroke="${fill}" stroke-width="25" stroke-linecap="round"/><path d="M${ax} ${ay}L${tx} ${ty}" stroke="${fill}" stroke-width="15" stroke-linecap="round"/><path d="${foot}" fill="${fill}"/><path d="${thigh}" fill="${fill}"/><path d="M${tx + 14} 102l4-6M${tx + 25} 102l4-6" stroke="${claw}" stroke-width="2.4" stroke-linecap="round"/>`;
};

const arm = (p: Palette) =>
    `<path d="M88 -28Q100 -18 102 -8Q108 -3 114 -8" stroke="${p.dino.shade}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M114 -8l5-4M114 -6l6 0" stroke="${p.dino.claw}" stroke-width="2" stroke-linecap="round"/>`;

const scarf = (p: Palette) => {
    const band = 'M72 -100Q78 -114 90 -117L118 -74Q116 -60 104 -56Z';
    const tailA = 'M82 -106C62 -116 44 -104 26 -112L24 -99C42 -90 60 -100 80 -92Z';
    const tailB = 'M82 -95C66 -98 56 -84 42 -89L40 -77C54 -71 68 -84 82 -84Z';
    const stripe = 'M50 -110l-1 12M40 -109l-1 12M60 -91l-1 11M50 -87l-1 10M80 -106l11 -7M90 -92l11 -8M100 -78l11 -8';
    const fringe = 'M24 -110l-7 -2M24 -105l-7 0M24 -100l-7 2M40 -87l-6 -2M40 -82l-6 0M40 -78l-6 2';
    return `<g filter="url(#lift)"><path d="${tailB}" fill="${p.dino.scarf}"/><path d="${tailA}" fill="${p.dino.scarf}"/><path d="${fringe}" stroke="${p.dino.scarf}" stroke-width="2" stroke-linecap="round"/><path d="${band}" fill="${p.dino.scarf}"/><path d="${stripe}" stroke="${p.dino.scarfStripe}" stroke-width="2.6" stroke-linecap="round" opacity=".9"/></g>`;
};

const wren = (p: Palette) =>
    `<g transform="translate(132 -129)" filter="url(#lift)"><path d="M-12 -6L-22 -17L-17 -3Z" fill="${p.wren.wing}"/><ellipse cx="0" cy="-6" rx="11" ry="8" fill="${p.wren.body}"/><ellipse cx="2" cy="-3" rx="7" ry="4.5" fill="${p.wren.belly}"/><path d="M-8 -9Q0 -14 6 -7Q-2 -5 -8 -9Z" fill="${p.wren.wing}"/><circle cx="8" cy="-12" r="6" fill="${p.wren.body}"/><circle cx="10" cy="-13" r="1.3" fill="${p.dino.eye}"/><path d="M13 -12l5 1.5l-5 1.5Z" fill="#E6A33E"/></g>`;

const lantern = (p: Palette) => {
    const lit = p.isNight ? '#FFD98A' : p.flora.cream;
    return `<g><path d="M-184 -32Q-188 -12 -186 0" stroke="${p.dino.shade}" stroke-width="1.6" fill="none"/>${p.isNight ? `<circle cx="-186" cy="20" r="46" fill="url(#glow)" opacity=".75"/>` : ''}<rect x="-194" y="0" width="16" height="4" rx="1.5" fill="${p.dino.claw}"/><path d="M-196 4Q-201 19 -196 33L-176 33Q-171 19 -176 4Z" fill="${lit}"/><path d="M-190 5Q-192 19 -190 32M-182 5Q-180 19 -182 32" stroke="${p.flora.coral}" stroke-width="1" opacity=".55" fill="none"/><rect x="-193" y="33" width="14" height="3.5" rx="1.5" fill="${p.dino.claw}"/></g>`;
};

const stances = {
    walk: { far: [[-4, 38], [-34, 72], [-22, 94]], near: [[36, 36], [20, 74], [40, 94]] },
    stand: { far: [[6, 40], [-8, 74], [4, 94]], near: [[30, 38], [16, 74], [32, 94]] },
} as const satisfies Record<string, Record<'far' | 'near', readonly [Pt, Pt, Pt]>>;

const basket = (p: Palette) =>
    `<g transform="translate(-186 -32)"><path d="M-2 0Q-4 14 -2 22" stroke="${p.dino.shade}" stroke-width="1.6" fill="none"/><path d="M-26 44Q-24 8 -2 22Q22 8 22 44" stroke="${p.bridge.rail}" stroke-width="3.4" fill="none"/><g filter="url(#lift)"><circle cx="-12" cy="36" r="8" fill="${p.flora.coral}"/><circle cx="2" cy="34" r="7" fill="${p.flora.marigold}"/><path d="M8 38q6 -16 16 -12q-4 10 -16 12Z" fill="${p.flora.leafLit}"/><path d="M-30 40h56l-6 28h-44Z" fill="${p.bridge.plank}"/><path d="M-28 48h52M-26 56h48M-25 63h46" stroke="${p.bridge.rail}" stroke-width="1.6" opacity=".6"/></g></g>`;

const listWren = (p: Palette) =>
    `<g transform="translate(236 -168)" filter="url(#lift)"><path d="M-4 -2Q-18 -24 -4 -26Q2 -14 -2 -2Z" fill="${p.wren.wing}"/><path d="M4 -2Q14 -26 24 -18Q16 -8 6 -2Z" fill="${p.wren.wing}"/><ellipse cx="0" cy="0" rx="10" ry="7" fill="${p.wren.body}"/><ellipse cx="1" cy="3" rx="6" ry="3.6" fill="${p.wren.belly}"/><circle cx="-9" cy="-4" r="5.4" fill="${p.wren.body}"/><circle cx="-11" cy="-5" r="1.2" fill="${p.dino.eye}"/><path d="M-14 -3l-5 1.6l5 1.4Z" fill="#E6A33E"/><g transform="translate(-24 4) rotate(-8)"><rect x="-10" y="0" width="22" height="30" rx="2" fill="${p.flora.cream}"/><path d="M-6 7h14M-6 13h12M-6 19h14M-6 25h8" stroke="${p.room.wallShade}" stroke-width="1.6" stroke-linecap="round"/></g></g>`;

export const oles = ({ p, x, y, scale = 1, isFlipped = false, hasWren = false, hasLantern = false, hasBasket = false, hasList = false, hasScarf = false, stance = 'walk' }: OlesSpec) => {
    const legs = stances[stance];
    const clip = `oles-${n(x)}`;
    const teeth = Array.from({ length: 8 }, (_, i) => {
        const tx = 146 + i * 9.4;
        const ty = -91 - i * 0.5;
        return `<path d="M${n(tx)} ${n(ty)}l3.2 5.4l3.2 -5.4Z" fill="${p.dino.claw}"/>`;
    }).join('');
    const face = `<path d="M220 -96C196 -90 168 -88 140 -88L140 -86C168 -84 194 -84 216 -88Z" fill="${p.dino.eye}" opacity=".85"/>${teeth}<path d="M221 -96C194 -91 166 -89 136 -89" stroke="${p.dino.shade}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M122 -108Q134 -94 132 -78" stroke="${p.dino.shade}" stroke-width="2.2" fill="none" opacity=".55" stroke-linecap="round"/><path d="M145 -118Q158 -128 176 -121Q166 -119 158 -114Z" fill="${p.dino.shade}"/><ellipse cx="161" cy="-111" rx="6.6" ry="4.2" fill="#E8B04A"/><ellipse cx="162" cy="-111" rx="1.9" ry="3.8" fill="${p.dino.eye}"/><circle cx="159.6" cy="-112.6" r="1.1" fill="#FFFFFF" opacity=".85"/><path d="M146 -117Q160 -126 178 -121" stroke="${p.dino.spot}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="${comma(5, 3.4, 0.3)}" transform="translate(212 -114) rotate(-70)" fill="${p.dino.shade}"/><g fill="${p.dino.shade}" opacity=".35"><circle cx="186" cy="-106" r="1.6"/><circle cx="194" cy="-110" r="1.4"/><circle cx="180" cy="-114" r="1.2"/><circle cx="200" cy="-104" r="1.3"/><circle cx="118" cy="-118" r="1.6"/><circle cx="110" cy="-108" r="1.4"/></g>`;
    const dots = `<path d="${stripes}" fill="${p.dino.spot}" opacity=".8"/>`;
    const body = `<clipPath id="${clip}"><path d="${silhouette}"/></clipPath><path d="${silhouette}" fill="${p.dino.hide}"/><g clip-path="url(#${clip})"><path d="${smooth(topLine.map(([a, b]) => [a, b + 12] as const))}L240 -160L-240 -160Z" fill="${p.dino.lit}" opacity=".6"/><path d="${smooth(bellyInner)}L-230 40L240 40Z" fill="${p.dino.belly}"/><path d="${smooth(bellyInner.map(([a, b]) => [a, b + 4] as const))}" stroke="${p.dino.hide}" stroke-width="1.2" fill="none" opacity=".3" stroke-dasharray="3 6"/>${dots}</g>`;
    const shadow = `<ellipse cx="10" cy="103" rx="140" ry="9" fill="${p.shadow.color}" opacity="${p.shadow.opacity * 0.8}"/>`;
    const flip = isFlipped ? ' scale(-1 1)' : '';
    return `<g transform="translate(${n(x)} ${n(y)}) scale(${scale})${flip}">${shadow}${leg(legs.far, p.dino.shade, p.dino.spot)}${hasLantern ? lantern(p) : ''}${hasBasket ? basket(p) : ''}<g filter="url(#liftHi)">${body}</g><g filter="url(#lift)">${leg(legs.near, p.dino.hide, p.dino.shade)}</g>${arm(p)}${hasScarf ? scarf(p) : ''}${face}${hasWren ? wren(p) : ''}${hasList ? listWren(p) : ''}</g>`;
};

/* Types */

interface OlesSpec {
    p: Palette;
    x: number;
    y: number;
    scale?: number;
    isFlipped?: boolean;
    hasWren?: boolean;
    hasLantern?: boolean;
    hasBasket?: boolean;
    hasList?: boolean;
    hasScarf?: boolean;
    stance?: keyof typeof stances;
}
