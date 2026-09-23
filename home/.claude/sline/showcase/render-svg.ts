// turns sline's truecolor ansi output (one file per state) into one animated svg:
// the states crossfade once and the last one holds. run after `show.sh stage && show.sh ansi`.
import { readFileSync, writeFileSync } from 'node:fs';

const stage = '/tmp/sline-stage';
const out = new URL('./sline.svg', import.meta.url);
const states = [0, 1, 2].map((i) =>
    readFileSync(`${stage}/s${i}.ansi`, 'utf8'),
);

const fontSize = 18;
const lineHeight = 30;
const charWidth = fontSize * 0.6;
const pad = 28;
const hold = 1.6;
const fade = 0.5;
const fg = '#ebdbb2';

type Run = { text: string; color: string; bold: boolean };

const ESC = String.fromCharCode(27);
const osc8 = new RegExp(`${ESC}\\]8;;[^${ESC}]*${ESC}\\\\`, 'g');
const sgrSplit = new RegExp(`(${ESC}\\[[0-9;]*m)`);
const sgrMatch = new RegExp(`^${ESC}\\[([0-9;]*)m$`);

const escapeXml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// nerd-font private-use glyphs have no font on github's side; a plain hexagon keeps the node icon
const unNerd = (s: string) =>
    s.replace(/[\u{E000}-\u{F8FF}\u{F0000}-\u{FFFFD}]/gu, '⬢');
const cells = (s: string) =>
    [...s].reduce(
        (n, ch) =>
            n +
            (/\p{Extended_Pictographic}/u.test(ch)
                ? 2
                : ch === '\u{FE0F}'
                  ? 0
                  : 1),
        0,
    );

function parseLine(line: string): Run[] {
    const clean = line.replace(osc8, '');
    const runs: Run[] = [];
    let color = fg;
    let bold = false;
    for (const part of clean.split(sgrSplit)) {
        const sgr = part.match(sgrMatch);
        if (!sgr) {
            if (part) runs.push({ bold, color, text: unNerd(part) });
            continue;
        }
        const codes = sgr[1] ? sgr[1].split(';').map(Number) : [0];
        for (let i = 0; i < codes.length; i++) {
            const c = codes[i];
            if (c === 0) {
                color = fg;
                bold = false;
            } else if (c === 1) bold = true;
            else if (c === 38 && codes[i + 1] === 2) {
                color = `rgb(${codes[i + 2]},${codes[i + 3]},${codes[i + 4]})`;
                i += 4;
            } else if (c === 48 && codes[i + 1] === 2) i += 4;
        }
    }
    return runs;
}

// the second line runs ~170 columns; github scales the svg to its column, so it is split before
// the 5h bar — model + cost on one row, the three usage bars on the next — and the text grows
function splitAtBars(line: string): string[] {
    const at = line.indexOf(' 5h ');
    if (at < 0) return [line];
    const bullet = line.lastIndexOf('•', at);
    const cut = line.lastIndexOf(`${ESC}[`, bullet);
    return [line.slice(0, cut), line.slice(bullet + 1)];
}

const layers = states.map((raw) =>
    raw
        .trimEnd()
        .split('\n')
        .flatMap(splitAtBars)
        .map(parseLine)
        .map((runs) => {
            if (runs[0]) runs[0].text = runs[0].text.trimStart();
            return runs;
        })
        .filter((runs) => runs.some((r) => r.text.trim())),
);
const widest = Math.max(
    ...layers.flat().map((runs) => cells(runs.map((r) => r.text).join(''))),
);
const width = Math.ceil(widest * charWidth * 1.02 + pad * 2);
const rows = Math.max(...layers.map((l) => l.length));
const height = pad * 2 + lineHeight * rows - (lineHeight - fontSize);

const total = hold * states.length + fade * (states.length - 1);
const pct = (t: number) => `${((t / total) * 100).toFixed(2)}%`;

const keyframes = states
    .map((_, i) => {
        const inAt = i * (hold + fade);
        const outAt = inAt + hold;
        const last = i === states.length - 1;
        const frames = [
            i === 0 ? '0%{opacity:1}' : `0%,${pct(inAt - fade)}{opacity:0}`,
            i === 0 ? '' : `${pct(inAt)}{opacity:1}`,
            last ? '100%{opacity:1}' : `${pct(outAt)}{opacity:1}`,
            last ? '' : `${pct(outAt + fade)},100%{opacity:0}`,
        ];
        return `@keyframes s${i}{${frames.filter(Boolean).join('')}}`;
    })
    .join('\n  ');

const group = (runs: Run[][], i: number) =>
    `<g class="s s${i}">${runs
        .map(
            (line, row) =>
                `<text x="${pad}" y="${pad + fontSize + row * lineHeight}">${line
                    .map(
                        (r) =>
                            `<tspan fill="${r.color}"${r.bold ? ' font-weight="700"' : ''}>${escapeXml(r.text)}</tspan>`,
                    )
                    .join('')}</text>`,
        )
        .join('')}</g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="sline, the statusline, as a session climbs from fresh to heavy">
<style>
  text{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:${fontSize}px;white-space:pre}
  .s{animation:${total}s ease-in-out 0.3s 1 both}
  ${states.map((_, i) => `.s${i}{animation-name:s${i}}`).join(' ')}
  ${keyframes}
  @media (prefers-reduced-motion: reduce){.s{animation:none;opacity:0}.s${states.length - 1}{opacity:1}}
</style>
<rect width="${width}" height="${height}" rx="10" fill="#282828"/>
${layers.map(group).join('\n')}
</svg>
`;

writeFileSync(out, svg);
console.log(
    `sline.svg ${width}×${height} · ${states.length} states · ${total.toFixed(1)}s`,
);
