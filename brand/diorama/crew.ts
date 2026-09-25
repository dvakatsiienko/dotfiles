import type { Palette } from './palette.ts';
import { n } from './paper.ts';

/* the crew, each about 70 tall, origin at the feet; night keeps the hues and drops the value a step */

const tone = (p: Palette, day: string, night: string) => (p.isNight ? night : day);

const eyes = (p: Palette, x: number, y: number, gap: number, r: number) =>
    `<circle cx="${n(x - gap)}" cy="${y}" r="${r}" fill="${p.dino.eye}"/><circle cx="${n(x + gap)}" cy="${y}" r="${r}" fill="${p.dino.eye}"/><circle cx="${n(x - gap + r * 0.35)}" cy="${n(y - r * 0.35)}" r="${n(r * 0.35)}" fill="#FFFFFF"/><circle cx="${n(x + gap + r * 0.35)}" cy="${n(y - r * 0.35)}" r="${n(r * 0.35)}" fill="#FFFFFF"/>`;

/** the owl plans the day, on a perch */
export const owl = (p: Palette, x: number, y: number) => {
    const body = tone(p, '#8C7A6B', '#5E5260');
    const belly = tone(p, '#E8DCC8', '#A89C9A');
    return `<g transform="translate(${n(x)} ${n(y)})" filter="url(#lift)"><path d="M-22 0h44M0 0v-8" stroke="${p.room.floorShade}" stroke-width="5" stroke-linecap="round"/><path d="M-18 -10Q-22 -46 -14 -60L-8 -52Q0 -56 8 -52L14 -60Q22 -46 18 -10Q0 -2 -18 -10Z" fill="${body}"/><path d="M-11 -12Q-12 -34 0 -38Q12 -34 11 -12Q0 -8 -11 -12Z" fill="${belly}"/><path d="M-9 -26q9 4 18 0M-8 -19q8 4 16 0" stroke="${body}" stroke-width="1.4" fill="none" opacity=".6"/><circle cx="-7" cy="-44" r="7.4" fill="#FFFFFF"/><circle cx="7" cy="-44" r="7.4" fill="#FFFFFF"/>${eyes(p, 0, -44, 7, 3.4)}<path d="M-3 -38l3 5l3 -5Z" fill="${p.flora.marigold}"/><path d="M-10 -2l-3 3M-6 -2l0 3M6 -2l0 3M10 -2l3 3" stroke="${p.flora.marigold}" stroke-width="1.6" stroke-linecap="round"/></g>`;
};

/** the bulldog builds; sits at the bench with a slate */
export const bulldog = (p: Palette, x: number, y: number) => {
    const coat = tone(p, '#D2A679', '#8A6E58');
    const muzzle = tone(p, '#5B4638', '#3A2D28');
    return `<g transform="translate(${n(x)} ${n(y)})" filter="url(#lift)"><path d="M-24 0Q-28 -34 -8 -40L14 -40Q30 -32 26 0Z" fill="${coat}"/><path d="M-10 0Q-10 -18 0 -20Q10 -18 10 0Z" fill="${p.flora.cream}" opacity=".7"/><path d="M-20 -46Q-24 -70 0 -72Q24 -70 20 -46Q18 -34 0 -34Q-18 -34 -20 -46Z" fill="${coat}"/><path d="M-22 -66l-8 -8l2 12ZM22 -66l8 -8l-2 12Z" fill="${muzzle}"/><path d="M-10 -46Q0 -52 10 -46Q10 -36 0 -36Q-10 -36 -10 -46Z" fill="${muzzle}"/><ellipse cx="0" cy="-49" rx="4" ry="2.6" fill="${p.dino.eye}"/>${eyes(p, 0, -58, 7, 2.6)}<g transform="translate(6 -10) rotate(-12)"><rect x="-4" y="-16" width="34" height="22" rx="3" fill="${p.iron}"/><rect x="-1" y="-13" width="28" height="16" rx="2" fill="${tone(p, '#9FD0DD', '#6FB3C9')}"/><path d="M2 -9h12M2 -5h18M2 -1h9" stroke="${p.iron}" stroke-width="1.4"/></g></g>`;
};

/** the basset reviews, magnifier in paw */
export const basset = (p: Palette, x: number, y: number) => {
    const coat = tone(p, '#B97D4E', '#7A5540');
    const white = tone(p, '#F1E9DC', '#A9A09A');
    return `<g transform="translate(${n(x)} ${n(y)})" filter="url(#lift)"><path d="M-22 0Q-26 -30 -6 -36L12 -36Q28 -28 24 0Z" fill="${coat}"/><path d="M-6 0Q-6 -20 4 -22Q12 -20 12 0Z" fill="${white}"/><path d="M-16 -44Q-18 -70 2 -72Q22 -70 20 -46Q18 -34 2 -32Q-14 -34 -16 -44Z" fill="${coat}"/><path d="M-4 -52Q2 -58 8 -52L10 -38Q2 -34 -6 -38Z" fill="${white}"/><path d="M-16 -62Q-30 -56 -26 -30Q-20 -28 -14 -44Z" fill="${tone(p, '#7A4E30', '#4E3528')}"/><path d="M18 -62Q32 -56 28 -30Q22 -28 16 -44Z" fill="${tone(p, '#7A4E30', '#4E3528')}"/><ellipse cx="2" cy="-42" rx="4" ry="2.6" fill="${p.dino.eye}"/>${eyes(p, 2, -55, 6, 2.4)}<path d="M-4 -60q-2 -2 -6 -1M8 -60q2 -2 6 -1" stroke="${p.dino.eye}" stroke-width="1.2" fill="none"/><g transform="translate(26 -30)"><path d="M-10 12L-2 2" stroke="${p.room.floorShade}" stroke-width="4" stroke-linecap="round"/><circle cx="4" cy="-4" r="10" fill="#D8EEF5" opacity=".75"/><circle cx="4" cy="-4" r="10" fill="none" stroke="${p.brass.base}" stroke-width="3"/></g></g>`;
};

/** the dalmatian verifies, clipboard up */
export const dalmatian = (p: Palette, x: number, y: number) => {
    const coat = tone(p, '#F6F3EE', '#B7B3C4');
    const spot = tone(p, '#2E2A36', '#1E1B26');
    return `<g transform="translate(${n(x)} ${n(y)})" filter="url(#lift)"><path d="M-20 0Q-24 -32 -4 -38L12 -38Q26 -30 22 0Z" fill="${coat}"/><circle cx="-10" cy="-14" r="3" fill="${spot}"/><circle cx="8" cy="-24" r="2.6" fill="${spot}"/><circle cx="14" cy="-8" r="2.2" fill="${spot}"/><path d="M-16 -46Q-18 -72 2 -72Q20 -70 18 -46Q16 -36 2 -36Q-14 -36 -16 -46Z" fill="${coat}"/><path d="M-16 -64Q-26 -58 -22 -44Q-16 -44 -12 -54Z" fill="${spot}"/><path d="M16 -64Q26 -58 22 -44Q16 -44 12 -54Z" fill="${spot}"/><circle cx="-4" cy="-66" r="2.4" fill="${spot}"/><circle cx="10" cy="-62" r="2" fill="${spot}"/><ellipse cx="2" cy="-44" rx="3.6" ry="2.4" fill="${spot}"/>${eyes(p, 2, -55, 6, 2.4)}<g transform="translate(-26 -26) rotate(-8)"><rect x="-12" y="-16" width="24" height="30" rx="2" fill="${p.room.floor}"/><rect x="-9" y="-12" width="18" height="23" fill="#FFFFFF"/><path d="M-6 -6l2 2l4 -4M-6 2l2 2l4 -4" stroke="${p.hill.edge}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M3 -5h4M3 3h4" stroke="${p.room.wallShade}" stroke-width="1.6"/></g></g>`;
};
