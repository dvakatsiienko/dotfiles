/* Core */
import * as zx from 'zx';

/**
 * ? Colors, and the handful of shapes every script in here prints.
 */

type Paint = (...args: unknown[]) => string;

export const bb: Paint = (...args) => zx.chalk.blueBright(...args);
export const yb: Paint = (...args) => zx.chalk.yellowBright(...args);
export const mb: Paint = (...args) => zx.chalk.magentaBright(...args);
export const gb: Paint = (...args) => zx.chalk.greenBright(...args);
export const rb: Paint = (...args) => zx.chalk.redBright(...args);
export const dim: Paint = (...args) => zx.chalk.dim(...args);
export const bold: Paint = (...args) => zx.chalk.bold(...args);

export const new_line = () => zx.echo('');

const RULE = '─';
const WIDTH = 64;

/** Top-of-script banner. */
export function title(text: string, subtitle?: string) {
    new_line();
    zx.echo(`${bold(gb(text))}${subtitle ? dim(`  ${subtitle}`) : ''}`);
    zx.echo(dim(RULE.repeat(WIDTH)));
}

/** A named phase. Everything after it is indented under it. */
export function step(text: string) {
    new_line();
    zx.echo(`${bb('▸')} ${bold(text)}`);
}

/** A group heading inside a listing — quieter than a step. */
export function group(text: string) {
    new_line();
    zx.echo(dim(`  ${text}`));
}

export const ok = (text: string, detail?: string) =>
    zx.echo(`  ${gb('✓')} ${text}${detail ? dim(`  ${detail}`) : ''}`);

export const skip = (text: string, detail?: string) =>
    zx.echo(`  ${dim('·')} ${dim(text)}${detail ? dim(`  ${detail}`) : ''}`);

export const warn = (text: string, detail?: string) =>
    zx.echo(`  ${yb('!')} ${text}${detail ? dim(`  ${detail}`) : ''}`);

export const fail = (text: string, detail?: string) =>
    zx.echo(`  ${rb('✗')} ${text}${detail ? dim(`  ${detail}`) : ''}`);

export const note = (text: string) => zx.echo(`    ${dim(text)}`);

/** Closing line. Green when clean, yellow when something needs a human. */
export function done(text: string, { clean = true }: { clean?: boolean } = {}) {
    new_line();
    zx.echo(dim(RULE.repeat(WIDTH)));
    zx.echo(clean ? gb(`✓ ${text}`) : yb(`! ${text}`));
    new_line();
}
