import type { Palette } from './palette.ts';
import { comma, n, seeded, smooth } from './paper.ts';

/** a paper pine: stacked serrated tiers, the sun side one shade lighter */
export const pine = (x: number, base: number, h: number, p: Palette, seed = 1) => {
    const rand = seeded(seed);
    const tiers = h > 160 ? 5 : 4;
    const trunk = `<rect x="${n(x - h * 0.03)}" y="${n(base - h * 0.14)}" width="${n(h * 0.06)}" height="${n(h * 0.14)}" fill="${p.pine.trunk}"/>`;
    let body = '';
    for (let k = 0; k < tiers; k++) {
        const t = k / tiers;
        const w = h * 0.5 * (1 - t * 0.78) * (0.94 + rand() * 0.12);
        const yb = base - h * 0.1 - t * h * 0.74;
        const yt = yb - h * (0.36 - t * 0.06);
        const teeth = 4 + Math.round(w / 22);
        let edge = '';
        for (let i = teeth; i >= 0; i--) {
            const ex = x - w / 2 + (w * i) / teeth;
            const dip = i % 2 === 0 ? 0 : h * 0.035;
            edge += `L${n(ex)} ${n(yb - dip + (rand() - 0.5) * 2)}`;
        }
        const d = `M${n(x)} ${n(yt)}Q${n(x + w * 0.18)} ${n(yb - (yb - yt) * 0.45)} ${n(x + w / 2)} ${n(yb)}${edge}Q${n(x - w * 0.18)} ${n(yb - (yb - yt) * 0.45)} ${n(x)} ${n(yt)}Z`;
        const lit = `M${n(x)} ${n(yt)}Q${n(x + w * 0.18)} ${n(yb - (yb - yt) * 0.45)} ${n(x + w / 2)} ${n(yb)}L${n(x + w * 0.08)} ${n(yb - h * 0.03)}Z`;
        body += `<path d="${d}" fill="${k % 2 ? p.pine.body : p.pine.dark}"/><path d="${lit}" fill="${p.pine.lit}" opacity=".85"/>`;
    }
    return `<g filter="url(#lift)">${trunk}${body}</g>`;
};

/** a far row of simple pine triangles along a ridge line */
export const pineRow = (x0: number, x1: number, yAt: (x: number) => number, size: number, fill: string, seed: number) => {
    const rand = seeded(seed);
    let d = '';
    for (let x = x0; x < x1; x += size * (0.42 + rand() * 0.3)) {
        const h = size * (0.7 + rand() * 0.6);
        const y = yAt(x) + rand() * 3;
        const w = h * 0.34;
        d += `M${n(x)} ${n(y - h)}L${n(x + w)} ${n(y)}L${n(x - w)} ${n(y)}Z`;
    }
    return `<path d="${d}" fill="${fill}"/>`;
};

/** petrykivka rosette: comma petals, round heads outward */
export const rosette = (x: number, y: number, r: number, petal: string, heart: string, p: Palette, rot = 0) => {
    const count = 9;
    let petals = '';
    for (let i = 0; i < count; i++) {
        const a = rot + (360 * i) / count;
        petals += `<path transform="rotate(${n(a)}) translate(0 ${n(-r)}) rotate(180)" d="${comma(r * 0.85, r * 0.62, 0.08)}" fill="${petal}"/>`;
    }
    const inner = Array.from({ length: 6 }, (_, i) => {
        const a = ((360 * i) / 6 + rot) * (Math.PI / 180);
        return `<circle cx="${n(Math.cos(a) * r * 0.26)}" cy="${n(Math.sin(a) * r * 0.26)}" r="${n(r * 0.07)}" fill="${p.flora.cream}"/>`;
    }).join('');
    return `<g transform="translate(${n(x)} ${n(y)})">${petals}<circle r="${n(r * 0.42)}" fill="${heart}"/>${inner}</g>`;
};

/** a tulip bud of three strokes */
export const bud = (x: number, y: number, s: number, color: string, p: Palette, tilt = 0) =>
    `<g transform="translate(${n(x)} ${n(y)}) rotate(${tilt})"><path transform="rotate(-24)" d="${comma(s, s * 0.55, 0.12)}" fill="${color}"/><path transform="rotate(24)" d="${comma(s, s * 0.55, -0.12)}" fill="${color}"/><path d="${comma(s * 1.12, s * 0.6)}" fill="${p.flora.cream}" opacity=".35"/><path d="${comma(s * 1.05, s * 0.5)}" fill="${color}"/></g>`;

/** kalyna: a cluster of berries */
export const berries = (x: number, y: number, s: number, p: Palette, seed: number) => {
    const rand = seeded(seed);
    let out = '';
    for (let i = 0; i < 9; i++) {
        const a = rand() * Math.PI * 2;
        const d = rand() * s;
        const bx = x + Math.cos(a) * d;
        const by = y + Math.sin(a) * d * 0.7;
        out += `<circle cx="${n(bx)}" cy="${n(by)}" r="${n(s * 0.36)}" fill="${p.flora.coral}"/><circle cx="${n(bx - s * 0.1)}" cy="${n(by - s * 0.12)}" r="${n(s * 0.09)}" fill="${p.flora.cream}" opacity=".7"/>`;
    }
    return out;
};

/** the petrykivka feather leaf: a curved stem with small commas along both sides */
export const featherLeaf = (x: number, y: number, len: number, angle: number, p: Palette) => {
    let strokes = '';
    const count = Math.max(5, Math.round(len / 7));
    for (let i = 1; i <= count; i++) {
        const t = i / (count + 1);
        const sy = -len * t;
        const sx = Math.sin(t * Math.PI) * len * 0.12;
        const s = len * 0.3 * (1 - t * 0.7);
        const color = i % 2 ? p.flora.leaf : p.flora.leafLit;
        strokes += `<path transform="translate(${n(sx)} ${n(sy)}) rotate(-58)" d="${comma(s, s * 0.42, -0.15)}" fill="${color}"/><path transform="translate(${n(sx)} ${n(sy)}) rotate(58)" d="${comma(s, s * 0.42, 0.15)}" fill="${color}"/>`;
    }
    const stem = `<path d="M0 0Q${n(len * 0.16)} ${n(-len * 0.5)} 0 ${n(-len)}" stroke="${p.flora.stem}" stroke-width="${n(Math.max(1.2, len * 0.025))}" fill="none" stroke-linecap="round"/>`;
    return `<g transform="translate(${n(x)} ${n(y)}) rotate(${angle})">${stem}${strokes}<path transform="translate(0 ${n(-len)})" d="${comma(len * 0.16, len * 0.08)}" fill="${p.flora.leafLit}"/></g>`;
};

/** a curl tendril, the kucheryk */
export const curl = (x: number, y: number, s: number, color: string, flip = 1) => {
    const pts: [number, number][] = [];
    for (let t = 0; t <= 1; t += 0.05) {
        const a = t * Math.PI * 2.2;
        const r = s * (1 - t * 0.78);
        pts.push([x + flip * (Math.sin(a) * r), y - s * 1.6 * t + (1 - Math.cos(a)) * r * 0.5]);
    }
    return `<path d="${smooth(pts)}" stroke="${color}" stroke-width="${n(s * 0.12)}" fill="none" stroke-linecap="round"/>`;
};

export const grassTuft = (x: number, y: number, h: number, color: string, seed: number) => {
    const rand = seeded(seed);
    let d = '';
    const blades = 5 + Math.floor(rand() * 4);
    for (let i = 0; i < blades; i++) {
        const lean = (rand() - 0.5) * h * 0.9;
        const bh = h * (0.55 + rand() * 0.5);
        const bx = x + (i - blades / 2) * h * 0.09;
        d += `M${n(bx - h * 0.04)} ${n(y)}Q${n(bx + lean * 0.3)} ${n(y - bh * 0.6)} ${n(bx + lean)} ${n(y - bh)}Q${n(bx + lean * 0.2 + h * 0.03)} ${n(y - bh * 0.5)} ${n(bx + h * 0.05)} ${n(y)}Z`;
    }
    return `<path d="${d}" fill="${color}"/>`;
};

export const stone = (x: number, y: number, w: number, p: Palette) =>
    `<g filter="url(#lift)"><path d="M${n(x - w / 2)} ${n(y)}Q${n(x - w / 2)} ${n(y - w * 0.42)} ${n(x - w * 0.05)} ${n(y - w * 0.46)}Q${n(x + w / 2)} ${n(y - w * 0.44)} ${n(x + w / 2)} ${n(y)}Z" fill="${p.stone.face}"/><path d="M${n(x - w * 0.2)} ${n(y - w * 0.4)}Q${n(x + w * 0.3)} ${n(y - w * 0.46)} ${n(x + w * 0.38)} ${n(y - w * 0.18)}Q${n(x + w * 0.1)} ${n(y - w * 0.3)} ${n(x - w * 0.2)} ${n(y - w * 0.4)}Z" fill="${p.stone.lit}"/></g>`;

export const mushroom = (x: number, y: number, s: number, cap: string, p: Palette) =>
    `<g filter="url(#lift)"><path d="M${n(x - s * 0.18)} ${n(y)}L${n(x - s * 0.13)} ${n(y - s * 0.55)}L${n(x + s * 0.13)} ${n(y - s * 0.55)}L${n(x + s * 0.18)} ${n(y)}Z" fill="${p.flora.cream}"/><path d="M${n(x - s * 0.55)} ${n(y - s * 0.5)}Q${n(x - s * 0.5)} ${n(y - s * 1.1)} ${n(x)} ${n(y - s * 1.1)}Q${n(x + s * 0.5)} ${n(y - s * 1.1)} ${n(x + s * 0.55)} ${n(y - s * 0.5)}Z" fill="${cap}"/><circle cx="${n(x - s * 0.2)}" cy="${n(y - s * 0.8)}" r="${n(s * 0.09)}" fill="${p.flora.cream}"/><circle cx="${n(x + s * 0.18)}" cy="${n(y - s * 0.72)}" r="${n(s * 0.07)}" fill="${p.flora.cream}"/></g>`;

/** a paper cloud: a union of puffs on a flat underside, a shade layer cut one step lower */
export const cloud = (x: number, y: number, w: number, p: Palette, seed: number) => {
    const rand = seeded(seed);
    const puffs = [
        [-0.34, 0.16],
        [-0.14, 0.3],
        [0.1, 0.26],
        [0.3, 0.15],
    ].map(([dx, r]) => [x + (dx ?? 0) * w, y - (r ?? 0) * w * 0.35, (r ?? 0) * w * (0.9 + rand() * 0.2)] as const);
    const layer = (dy: number, fill: string) =>
        `<g fill="${fill}">${puffs.map(([cx, cy, r]) => `<circle cx="${n(cx)}" cy="${n(cy + dy)}" r="${n(r)}"/>`).join('')}<rect x="${n(x - w * 0.46)}" y="${n(y - w * 0.1 + dy)}" width="${n(w * 0.92)}" height="${n(w * 0.1)}" rx="${n(w * 0.05)}"/></g>`;
    const clipId = `cl${seed}`;
    return `<clipPath id="${clipId}"><rect x="${n(x - w)}" y="${n(y - w)}" width="${n(w * 2)}" height="${n(w)}"/></clipPath><g filter="url(#lift)" clip-path="url(#${clipId})">${layer(5, p.cloud.shade)}${layer(0, p.cloud.face)}</g>`;
};

/** a round paper tree: a lollipop crown cut from two greens, a feather of lighter leaves on the sun side */
export const roundTree = (x: number, base: number, h: number, p: Palette, seed: number) => {
    const rand = seeded(seed);
    const r = h * 0.34;
    const cy = base - h + r;
    const bumps = Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return `<circle cx="${n(x + Math.cos(a) * r * 0.55)}" cy="${n(cy + Math.sin(a) * r * 0.5)}" r="${n(r * (0.55 + rand() * 0.12))}"/>`;
    }).join('');
    return `<g filter="url(#lift)"><path d="M${n(x - h * 0.03)} ${base}L${n(x - h * 0.02)} ${n(cy)}L${n(x + h * 0.02)} ${n(cy)}L${n(x + h * 0.03)} ${base}Z" fill="${p.pine.trunk}"/><g fill="${p.flora.leaf}">${bumps}</g><circle cx="${n(x + r * 0.3)}" cy="${n(cy - r * 0.25)}" r="${n(r * 0.5)}" fill="${p.flora.leafLit}" opacity=".7"/></g>`;
};

/** a fern: arching fronds, each with paired leaflets shrinking toward the tip */
export const fern = (x: number, y: number, h: number, p: Palette, seed: number) => {
    const rand = seeded(seed);
    const fronds = 7;
    let out = '';
    for (let f = 0; f < fronds; f++) {
        const spread = (f / (fronds - 1) - 0.5) * 2;
        const angle = spread * 62 + (rand() - 0.5) * 8;
        const len = h * (0.72 + (1 - Math.abs(spread)) * 0.28) * (0.9 + rand() * 0.15);
        const bend = spread * 0.35 + 0.05;
        const at = (t: number) => [bend * len * t * t, -len * t] as const;
        const [tx, ty] = at(1);
        let frond = `<path d="M0 0Q${n(bend * len * 0.2)} ${n(-len * 0.5)} ${n(tx)} ${n(ty)}" stroke="${p.flora.stem}" stroke-width="${n(Math.max(1, h * 0.012))}" fill="none"/>`;
        const pairs = Math.round(len / 9);
        for (let i = 1; i <= pairs; i++) {
            const t = i / (pairs + 1);
            const [px, py] = at(t);
            const tangent = (Math.atan2(-len, 2 * bend * len * t) * 180) / Math.PI + 90;
            const pl = len * 0.2 * (1 - t * 0.75);
            const color = (i + f) % 3 ? p.flora.leaf : p.flora.leafLit;
            frond += `<path transform="translate(${n(px)} ${n(py)}) rotate(${n(tangent - 72)})" d="${comma(pl, pl * 0.36, 0.1)}" fill="${color}"/><path transform="translate(${n(px)} ${n(py)}) rotate(${n(tangent + 72)})" d="${comma(pl, pl * 0.36, -0.1)}" fill="${color}"/>`;
        }
        out += `<g transform="rotate(${n(angle)})">${frond}</g>`;
    }
    return `<g transform="translate(${n(x)} ${n(y)})" filter="url(#lift)">${out}</g>`;
};

/** a leafy mound of seed strokes, darker at the heart */
export const bush = (x: number, y: number, w: number, p: Palette, seed: number) => {
    const rand = seeded(seed);
    let out = `<ellipse cx="0" cy="${n(-w * 0.18)}" rx="${n(w * 0.46)}" ry="${n(w * 0.26)}" fill="${p.flora.stem}"/>`;
    for (let i = 0; i < 30; i++) {
        const a = -80 + rand() * 160;
        const r = w * (0.14 + rand() * 0.2);
        const ox = (rand() - 0.5) * w * 0.6;
        const oy = -rand() * w * 0.2;
        const color = [p.flora.leaf, p.flora.leafLit, p.flora.leaf, p.flora.grass][i % 4] ?? p.flora.leaf;
        out += `<path transform="translate(${n(ox)} ${n(oy)}) rotate(${n(a)})" d="${comma(r, r * 0.42, (rand() - 0.5) * 0.3)}" fill="${color}"/>`;
    }
    return `<g transform="translate(${n(x)} ${n(y)})" filter="url(#lift)">${out}</g>`;
};
