import type { Palette } from './palette.ts';
import { glowDot, n } from './paper.ts';

/* v1's paper t-rex (brand/profile/hero.py), ported and polished: native coords face right, feet on y = 151 */

const shape = {
    tail: 'M0 78C30 70 70 58 105 50C125 45 145 44 160 50C172 55 178 64 176 78C172 96 158 106 138 110C118 114 100 110 88 104C60 96 30 88 0 82Z',
    head: 'M150 56C150 38 158 22 172 15L214 9C225 8 232 14 232 23L232 31L204 33L200 37L182 38C176 50 170 62 162 72Z',
    jaw: 'M184 41L224 40C224 47 217 52 207 52L186 54C182 50 182 45 184 41Z',
    thigh: 'M98 92C106 78 134 78 140 96C144 110 136 122 126 128L130 146L146 146L148 151L110 151L113 128C101 120 94 104 98 92Z',
    leg: 'M140 100C150 97 159 108 155 120L151 146L165 146L167 151L136 151L141 124Z',
    arm: 'M166 74C172 78 177 84 175 90L182 92L180 95L173 94L177 98L174 100L168 95C165 89 162 83 159 78Z',
};

const HIP_X = 120;
const FEET = 151;
const SIZE = 1.7;

const at = (list: readonly (readonly [number, number])[], draw: (x: number, y: number) => string) => list.map(([x, y]) => draw(x, y)).join('');

const scarf = (p: Palette) =>
    `<g filter="url(#lift)"><path d="M150 52Q158 48 166 50L172 72Q164 76 156 74Z" fill="${p.dino.scarf}"/><path d="M152 56C140 54 130 62 118 58L117 65C130 70 140 62 152 63Z" fill="${p.dino.scarf}"/><path d="M151 64C142 66 136 74 126 72L126 78C136 80 144 72 152 70Z" fill="${p.dino.scarf}"/><path d="M155 58l12 -3M157 66l12 -3M130 58l0 6M138 66l0 6" stroke="${p.dino.scarfStripe}" stroke-width="1.6" stroke-linecap="round"/></g>`;

const wren = (p: Palette) =>
    `<g transform="translate(196 9)" filter="url(#lift)"><path d="M-8 -3L-13 -10L-10 -1Z" fill="${p.wren.wing}"/><ellipse cx="0" cy="-3.6" rx="6.6" ry="4.8" fill="${p.wren.body}"/><ellipse cx="1" cy="-1.8" rx="4.2" ry="2.6" fill="${p.wren.belly}"/><circle cx="5" cy="-7" r="3.6" fill="${p.wren.body}"/><circle cx="6.2" cy="-7.6" r=".8" fill="${p.dino.eye}"/><path d="M8.2 -7l3 1l-3 1Z" fill="#E6A33E"/></g>`;

const listWren = (p: Palette) =>
    `<g transform="translate(246 -6)" filter="url(#lift)"><path d="M-2 -1Q-10 -14 -2 -15Q1 -8 -1 -1Z" fill="${p.wren.wing}"/><path d="M2 -1Q8 -15 14 -10Q9 -5 3 -1Z" fill="${p.wren.wing}"/><ellipse cx="0" cy="0" rx="6" ry="4.2" fill="${p.wren.body}"/><circle cx="-5.4" cy="-2.4" r="3.2" fill="${p.wren.body}"/><path d="M-8.4 -2l-3 1l3 .8Z" fill="#E6A33E"/><g transform="translate(-14 2) rotate(-8)"><rect x="-6" y="0" width="13" height="18" rx="1.2" fill="${p.flora.cream}"/><path d="M-3.6 4h8M-3.6 8h7M-3.6 12h8" stroke="${p.room.wallShade}" stroke-width="1" stroke-linecap="round"/></g></g>`;

const hanging = (p: Palette, kind: 'lantern' | 'basket') => {
    const string = '<path d="M3 80Q2 90 3 96" stroke="#00000055" stroke-width="1"/>';
    if (kind === 'lantern') {
        const lit = p.isNight ? '#FFD98A' : p.flora.cream;
        return `${string}${p.isNight ? '<circle cx="3" cy="108" r="28" fill="url(#glow)" opacity=".8"/>' : ''}<g filter="url(#lift)"><rect x="-2" y="96" width="10" height="2.6" rx="1" fill="${p.iron}"/><path d="M-4 98.6Q-7 107 -4 116L10 116Q13 107 10 98.6Z" fill="${lit}"/><rect x="-1.5" y="116" width="9" height="2.4" rx="1" fill="${p.iron}"/></g>${p.isNight ? glowDot(3, 107, 1.4) : ''}`;
    }
    return `${string}<path d="M-10 118Q-8 94 3 96Q14 94 16 118" stroke="${p.bridge.rail}" stroke-width="2" fill="none"/><g filter="url(#lift)"><circle cx="-2" cy="112" r="4.6" fill="${p.flora.coral}"/><circle cx="6" cy="111" r="4" fill="${p.flora.marigold}"/><path d="M-12 114h30l-3 15h-24Z" fill="${p.bridge.plank}"/><path d="M-11 119h28M-10 124h26" stroke="${p.bridge.rail}" stroke-width="1" opacity=".6"/></g>`;
};

export const rex = ({ p, x, y, scale = 1, isFlipped = false, hasWren = false, hasLantern = false, hasBasket = false, hasList = false, hasScarf = false }: DinoSpec) => {
    const hide = p.dino.hide;
    const dark = p.dino.shade;
    const lit = p.dino.lit;
    const tooth = p.dino.claw;
    const spikes = at(
        [
            [40, 70],
            [60, 64],
            [80, 59],
            [100, 53],
            [120, 48],
            [140, 47],
            [158, 24],
        ],
        (sx, sy) => `<path fill="${dark}" d="M${sx} ${sy}l5-8 5 8z"/>`,
    );
    const stripes = at(
        [
            [26, 74],
            [42, 70],
            [60, 64],
            [78, 58],
            [96, 54],
            [120, 50],
        ],
        (sx, sy) => `<path d="M${sx} ${sy}q4 8 0 16" stroke="${dark}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`,
    );
    const freckles = at(
        [
            [30, 80],
            [52, 74],
            [70, 72],
            [88, 67],
            [62, 84],
            [84, 80],
            [108, 63],
            [130, 59],
            [146, 61],
            [118, 74],
            [100, 89],
        ],
        (fx, fy) => `<circle cx="${fx}" cy="${fy}" r="1.5" fill="${dark}" opacity=".6"/>`,
    );
    const bodyLight = `<path fill="${lit}" d="M8 78C40 70 78 58 108 51C128 46 146 45 158 50C146 50 128 52 108 57C78 64 40 74 8 81Z"/>${[112, 120, 128, 136, 144].map((bx) => `<path d="M${bx} 99q2 5 0 9" stroke="${dark}" stroke-width="1.4" fill="none" opacity=".35"/>`).join('')}`;
    const headLight = `<path fill="${lit}" d="M160 50C160 36 166 24 176 19L212 13C218 12 222 14 224 17L178 23C170 28 166 38 164 50Z" opacity=".8"/>${at(
        [
            [168, 30],
            [176, 36],
            [172, 46],
            [184, 28],
        ],
        (hx, hy) => `<circle cx="${hx}" cy="${hy}" r="1.4" fill="${dark}" opacity=".6"/>`,
    )}<path d="M160 58q-4 6-2 12M166 56q-4 6-2 12" stroke="${dark}" stroke-width="1.4" fill="none" opacity=".6"/>`;
    const mouth = `<path fill="#5a1f1c" d="M184 38L224 38L222 43C216 48 200 50 186 50Z"/><path fill="#d9737a" d="M192 46q8-4 16 0q-8 4-16 0z"/>`;
    const teeth = `<path fill="${tooth}" d="M190 38l3 5 3-5zM200 38l3 5 3-5zM210 37l3 5 3-5zM192 42l3-4 3 4zM204 42l3-4 3 4z"/>`;
    const face = `<circle cx="206" cy="20" r="3" fill="${p.dino.eye}"/><circle cx="207" cy="19" r="1" fill="#fff"/><circle cx="226" cy="18" r="1.3" fill="${p.dino.eye}"/><path d="M198 15l14-2" stroke="${p.dino.eye}" stroke-width="2" stroke-linecap="round"/>`;
    const thighMarks = `<path d="M104 102q12-14 30-4" stroke="${dark}" stroke-width="2" fill="none" opacity=".6"/><path d="M112 88q10-8 22-2" stroke="${lit}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    const claws = `<path fill="${tooth}" d="M146 151l3-4 2 4zM152 151l3-4 2 4zM161 151l3-4 2 4zM167 151l3-4 2 4zM182 92l3 1-2 2zM177 98l3 2-3 1z"/>`;
    const rim = p.isNight ? `<path d="M8 78C40 70 78 58 108 51C128 46 146 45 158 50" stroke="#F2994A" stroke-width="1.6" fill="none" opacity=".35"/>` : '';
    const shadow = `<ellipse cx="128" cy="152" rx="74" ry="5" fill="${p.shadow.color}" opacity="${p.shadow.opacity * 0.8}"/>`;
    const body = [
        shadow,
        spikes,
        `<path fill="${dark}" filter="url(#lift)" d="${shape.leg}"/>`,
        `<path fill="${dark}" filter="url(#lift)" d="${shape.arm}"/>`,
        hasLantern ? hanging(p, 'lantern') : '',
        hasBasket ? hanging(p, 'basket') : '',
        `<path fill="${hide}" filter="url(#liftHi)" d="${shape.tail}"/>`,
        `<path fill="${p.dino.belly}" d="M104 96C120 104 140 104 156 94C150 104 138 110 122 110C112 108 106 102 104 96Z"/>`,
        stripes,
        bodyLight,
        freckles,
        rim,
        mouth,
        `<path fill="${dark}" filter="url(#lift)" d="${shape.jaw}"/>`,
        teeth,
        `<path fill="${hide}" filter="url(#lift)" d="${shape.head}"/>`,
        face,
        headLight,
        `<path fill="${hide}" filter="url(#lift)" d="${shape.thigh}"/>`,
        thighMarks,
        claws,
        hasScarf ? scarf(p) : '',
        hasWren ? wren(p) : '',
        hasList ? listWren(p) : '',
    ].join('');
    const flip = isFlipped ? ' scale(-1 1)' : '';
    return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(scale * SIZE)})${flip} translate(${-HIP_X} ${n(102 / SIZE - FEET)})">${body}</g>`;
};

/* Types */

export interface DinoSpec {
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
    stance?: 'walk' | 'stand';
}
