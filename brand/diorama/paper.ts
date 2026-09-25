import type { Palette } from './palette.ts';

export const n = (v: number) => Math.round(v * 10) / 10;

export const seeded = (seed: number) => {
    let s = seed >>> 0;
    return () => {
        s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
        return s / 2 ** 32;
    };
};

export const smooth = (pts: readonly Pt[], isClosed = false, tension = 1) => {
    const at = (i: number): Pt => {
        const len = pts.length;
        const k = isClosed ? (i + len) % len : Math.max(0, Math.min(len - 1, i));
        return pts[k] as Pt;
    };
    const [x0, y0] = at(0);
    let d = `M${n(x0)} ${n(y0)}`;
    const last = isClosed ? pts.length : pts.length - 1;
    for (let i = 0; i < last; i++) {
        const [ax, ay] = at(i - 1);
        const [bx, by] = at(i);
        const [cx, cy] = at(i + 1);
        const [dx, dy] = at(i + 2);
        const t = tension / 6;
        d += `C${n(bx + (cx - ax) * t)} ${n(by + (cy - ay) * t)} ${n(cx - (dx - bx) * t)} ${n(cy - (dy - by) * t)} ${n(cx)} ${n(cy)}`;
    }
    return isClosed ? `${d}Z` : d;
};

/** a hand-cut hill line from x0 to x1, closed down to `floor` */
export const ridge = ({ x0, x1, y, amp, waves, seed, floor, step = 26, jitter = 1.6 }: RidgeSpec) => {
    const rand = seeded(seed);
    const phases = waves.map(() => rand() * Math.PI * 2);
    const pts: Pt[] = [];
    for (let x = x0; x <= x1 + step; x += step) {
        const wave = waves.reduce((sum, w, i) => sum + Math.sin((x / w) * Math.PI * 2 + (phases[i] ?? 0)) / (i + 1), 0);
        pts.push([x, y + wave * amp + (rand() - 0.5) * jitter]);
    }
    const line = smooth(pts);
    return `${line}L${n(x1 + step)} ${floor}L${x0} ${floor}Z`;
};

/** the petrykivka seed stroke: a round head at the origin, tapering to a curved tail of `len` along -y */
export const comma = (len: number, width: number, bend = 0) => {
    const w = width / 2;
    const tipX = bend * len;
    return `M${n(-w)} 0C${n(-w)} ${n(-len * 0.35)} ${n(tipX - w * 0.2)} ${n(-len * 0.8)} ${n(tipX)} ${n(-len)}C${n(tipX + w * 0.35)} ${n(-len * 0.75)} ${n(w)} ${n(-len * 0.35)} ${n(w)} 0A${n(w)} ${n(w)} 0 0 1 ${n(-w)} 0Z`;
};

export const defs = (p: Palette) => `<defs>
<filter id="lift" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="2.5" stdDeviation="2.4" flood-color="${p.shadow.color}" flood-opacity="${p.shadow.opacity}"/></filter>
<filter id="liftHi" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="${p.shadow.color}" flood-opacity="${p.shadow.opacity * 1.2}"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 ${p.isNight ? 1 : 0.35}  0 0 0 0 ${p.isNight ? 1 : 0.3}  0 0 0 0 ${p.isNight ? 1 : 0.25}  0 0 0 ${p.isNight ? 0.05 : 0.07} 0"/></filter>
<radialGradient id="glow"><stop offset="0" stop-color="${p.glow}" stop-opacity=".9"/><stop offset=".35" stop-color="${p.glow}" stop-opacity=".35"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></radialGradient>
<radialGradient id="warmth"><stop offset="0" stop-color="#FFB347" stop-opacity=".5"/><stop offset="1" stop-color="#FFB347" stop-opacity="0"/></radialGradient>
</defs>`;

export const glowDot = (x: number, y: number, r: number) =>
    `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r * 5)}" fill="url(#glow)"/><circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="#FFF6D0"/>`;

export const svg = (w: number, h: number, title: string, body: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img"><title>${title}</title>${body}</svg>\n`;

/* Types */

export type Pt = readonly [number, number];

/** one paper sheet of a scene; `depth` is its distance behind the front edge */
export interface Layer {
    name: string;
    depth: number;
    body: string;
}

interface RidgeSpec {
    x0: number;
    x1: number;
    y: number;
    amp: number;
    waves: readonly number[];
    seed: number;
    floor: number;
    step?: number;
    jitter?: number;
}
