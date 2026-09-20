/* Instruments */
import { bb, bold, dim, gb, mb, rb, yb } from './print.ts';

// one colour per lane, the same in every jev script, so the eye learns it once
const laneColor: Record<string, (text: string) => string> = {
    answer: gb,
    drop: dim,
    flowlog: bb,
    fold: yb,
    memory: bb,
    rule: yb,
    story: mb,
    ticket: mb,
};

const confColor = (conf: number) => (conf >= 70 ? gb : conf >= 30 ? yb : rb);

/** `lane  conf  [ranked probabilities]  text` — lane painted, conf bold, the rest dim */
export const laneLine = (
    lane: string,
    confidence: number,
    probabilities: Record<string, number>,
    text: string,
    width = 90,
) => {
    const conf = Math.round(confidence * 100);
    const ranked = Object.entries(probabilities)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k} ${Math.round(v * 100)}`)
        .join('  ');
    const paint = laneColor[lane] ?? bb;
    return `${paint(lane.padEnd(8))} ${confColor(conf)(bold(String(conf).padStart(3)))}  ${dim(`[${ranked}]`)}  ${text.slice(0, width)}`;
};

export const tailLine = (count: number, unit: string, tokens: number) =>
    dim(`${count} ${unit} · ${tokens} input tokens`);
