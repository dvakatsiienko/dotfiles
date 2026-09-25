import { curl } from './flora.ts';
import type { Palette } from './palette.ts';
import { comma, defs, glowDot } from './paper.ts';

const S = 200;

/* each icon draws in a 100 × 100 box centred on the origin */

const trophy = (p: Palette) => {
  const b = p.brass;
  return `<path d="M-26 -28q-22 0 -18 18q4 14 22 14M26 -28q22 0 18 18q-4 14 -22 14" stroke="${b.shade}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-30 -36h60v10q0 36 -30 42q-30 -6 -30 -42Z" fill="${b.base}"/><path d="M-22 -30q0 30 16 38" stroke="${b.lit}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/><path d="M-6 16h12v14h-12Z" fill="${b.shade}"/><rect x="-24" y="28" width="48" height="14" rx="3" fill="${b.base}"/><rect x="-16" y="32" width="32" height="5" rx="1.5" fill="${b.shade}" opacity=".45"/><path d="M0 -24l4.2 8.6l9.4 1.4l-6.8 6.6l1.6 9.4l-8.4 -4.4l-8.4 4.4l1.6 -9.4l-6.8 -6.6l9.4 -1.4Z" fill="${b.lit}"/>`;
};

const alien = (p: Palette) => {
  const skin = p.isNight ? '#6FA87A' : '#8CC47E';
  return `<path d="M-8 -34q-8 -14 -16 -16M8 -34q8 -14 16 -16" stroke="${skin}" stroke-width="3.4" fill="none" stroke-linecap="round"/><circle cx="-24" cy="-50" r="4.6" fill="${p.flora.marigold}"/><circle cx="24" cy="-50" r="4.6" fill="${p.flora.marigold}"/><path d="M-26 22q-6 -44 26 -58q32 14 26 58q-10 16 -26 16q-16 0 -26 -16Z" fill="${skin}"/><ellipse cx="-11" cy="-4" rx="8" ry="11" transform="rotate(20 -11 -4)" fill="${p.dino.eye}"/><ellipse cx="11" cy="-4" rx="8" ry="11" transform="rotate(-20 11 -4)" fill="${p.dino.eye}"/><circle cx="-9" cy="-8" r="2.4" fill="#FFFFFF"/><circle cx="13" cy="-8" r="2.4" fill="#FFFFFF"/><path d="M-6 18q6 5 12 0" stroke="${p.dino.eye}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M-26 38q26 16 52 0v12h-52Z" fill="${skin}" opacity=".85"/><g transform="translate(30 -34)"><rect x="-4" y="-18" width="42" height="28" rx="10" fill="#FFFFFF"/><path d="M4 8l-8 12l16 -10Z" fill="#FFFFFF"/><circle cx="8" cy="-4" r="3" fill="${p.flora.lilac}"/><circle cx="17" cy="-4" r="3" fill="${p.flora.lilac}"/><circle cx="26" cy="-4" r="3" fill="${p.flora.lilac}"/></g>`;
};

const rocket = (p: Palette) =>
  `<g transform="rotate(38)"><path d="M-8 34q8 26 8 26q0 0 8 -26Z" fill="${p.flora.marigold}"/><path d="M-4 34q4 14 4 14q0 0 4 -14Z" fill="#FFF3C4"/><path d="M0 -52q-20 22 -18 62l4 24h28l4 -24q2 -40 -18 -62Z" fill="${p.isNight ? '#D8D3E8' : '#F4F1FA'}"/><path d="M0 -52q-10 11 -14 26h28q-4 -15 -14 -26Z" fill="${p.flora.coral}"/><circle cx="0" cy="-4" r="9" fill="${p.flora.lapis}"/><circle cx="0" cy="-4" r="5.6" fill="${p.sky[1]}"/><path d="M-18 14l-14 22l18 -4ZM18 14l14 22l-18 -4Z" fill="${p.flora.coral}"/><path d="M-14 34h28" stroke="${p.iron}" stroke-width="4"/></g><path d="M-40 -40l3 -7l3 7l7 3l-7 3l-3 7l-3 -7l-7 -3Z" fill="${p.flora.marigold}"/><path d="M36 30l2 -5l2 5l5 2l-5 2l-2 5l-2 -5l-5 -2Z" fill="${p.flora.marigold}"/>`;

const card = (p: Palette) =>
  `<g transform="rotate(-8)"><rect x="-44" y="-30" width="88" height="58" rx="6" fill="#FFFFFF"/><rect x="-44" y="-30" width="88" height="14" rx="6" fill="${p.flora.coral}"/><rect x="-44" y="-22" width="88" height="6" fill="${p.flora.coral}"/><circle cx="-24" cy="4" r="11" fill="${p.flora.lapis}"/><circle cx="-24" cy="0" r="4.6" fill="#FFFFFF"/><path d="M-32 12q8 -8 16 0" fill="#FFFFFF"/><path d="M-4 -2h36M-4 8h28M-4 17h20" stroke="${p.room.wallShade}" stroke-width="4" stroke-linecap="round"/></g><g transform="translate(28 30) rotate(-40)"><rect x="-4" y="-30" width="8" height="40" rx="2" fill="${p.flora.lapis}"/><path d="M-4 10l4 10l4 -10Z" fill="${p.brass.base}"/></g>`;

const ledger = (p: Palette) => {
  const coin = (x: number, y: number) =>
    `<ellipse cx="${x}" cy="${y}" rx="13" ry="4.6" fill="${p.brass.shade}"/><ellipse cx="${x}" cy="${y - 2.4}" rx="13" ry="4.6" fill="${p.brass.base}"/>`;
  return `<path d="M-46 -26q23 -8 46 0v56q-23 -8 -46 0Z" fill="#FFFFFF"/><path d="M46 -26q-23 -8 -46 0v56q23 -8 46 0Z" fill="#F4F6FA"/><path d="M-38 -12h28M-38 -2h24M-38 8h28M-38 18h20" stroke="${p.room.wallShade}" stroke-width="3" stroke-linecap="round"/><path d="M8 18l10 -12l8 6l14 -20" stroke="${p.hill.edge}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 -14h8v8" stroke="${p.hill.edge}" stroke-width="4" fill="none" stroke-linecap="round"/>${coin(-26, 46)}${coin(-26, 40)}${coin(-26, 34)}${coin(0, 46)}`;
};

const apps = {
  cv: { accent: 'coral', board: ['#F6E2DC', '#4A3550'], icon: card },
  financial: { accent: 'marigold', board: ['#F6EDCB', '#46402E'], icon: ledger },
  'space-explorer': { accent: 'lilac', board: ['#E6E1F5', '#39345E'], icon: rocket },
  'trophy-sys': { accent: 'lapis', board: ['#DCE8F5', '#343C62'], icon: trophy },
  'x-com-chat': { accent: 'leafLit', board: ['#DDEFE0', '#2F4250'], icon: alien },
} as const;

/** the shop sign: a thin bracket, two short chains, and a board whose icon fills most of it */
export const signGroup = (p: Palette, app: AppName) => {
  const { board, icon } = apps[app];
  const face = p.isNight ? board[1] : board[0];
  const rim = p.isNight ? '#5A6290' : p.room.trim;
  const arm = `<path d="M8 18H176" stroke="${p.iron}" stroke-width="5" stroke-linecap="round"/><rect x="2" y="6" width="9" height="30" rx="3" fill="${p.iron}"/><path d="M11 32C40 30 64 24 88 18" stroke="${p.iron}" stroke-width="3" fill="none" stroke-linecap="round"/>${curl(40, 30, 6, p.iron)}<circle cx="176" cy="18" r="4" fill="${p.iron}"/>`;
  const chains = `<path d="M44 18v18M156 18v18" stroke="${p.iron}" stroke-width="2.4" stroke-dasharray="4 2"/>`;
  const boardShape = `<rect x="16" y="36" width="168" height="152" rx="18" fill="${rim}"/><rect x="24" y="44" width="152" height="136" rx="12" fill="${face}"/>`;
  const corners = [
    [34, 54, 45],
    [166, 54, 135],
    [34, 170, -45],
    [166, 170, -135],
  ]
    .map(
      ([x, y, a]) =>
        `<path transform="translate(${x} ${y}) rotate(${a})" d="${comma(9, 4.4)}" fill="${p.flora.coral}" opacity=".55"/>`,
    )
    .join('');
  const lit = p.isNight
    ? `<circle cx="100" cy="112" r="92" fill="url(#glow)" opacity=".35"/>${glowDot(172, 12, 2.6)}`
    : '';
  return `${lit}<g filter="url(#lift)">${arm}</g>${chains}<g filter="url(#liftHi)">${boardShape}</g>${corners}<g transform="translate(100 114) scale(1.12)" filter="url(#lift)">${icon(p)}</g>`;
};

export const appSign = (app: AppName) => (p: Palette) =>
    `${defs(p)}${signGroup(p, app)}<clipPath id="board"><rect x="16" y="36" width="168" height="152" rx="18"/></clipPath><rect x="16" y="36" width="168" height="152" filter="url(#grain)" clip-path="url(#board)"/>`;

export const appIcon = (p: Palette, app: AppName) => apps[app].icon(p);
export const appAccent = (p: Palette, app: AppName) => p.flora[apps[app].accent];

/** the readme's row order */
export const appNames = ['trophy-sys', 'x-com-chat', 'space-explorer', 'cv', 'financial'] as const satisfies readonly AppName[];
export const signSize = { h: S, w: S };

/* Types */

export type AppName = keyof typeof apps;

