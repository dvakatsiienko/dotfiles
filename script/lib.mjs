/* Core */
import * as zx from 'zx';

/**
 * ? Colors, and the handful of shapes every script in here prints.
 */

export const bb = (...args) => zx.chalk.blueBright(...args);
export const yb = (...args) => zx.chalk.yellowBright(...args);
export const mb = (...args) => zx.chalk.magentaBright(...args);
export const gb = (...args) => zx.chalk.greenBright(...args);
export const rb = (...args) => zx.chalk.redBright(...args);
export const dim = (...args) => zx.chalk.dim(...args);
export const bold = (...args) => zx.chalk.bold(...args);

export const new_line = () => zx.echo('');

const RULE = '─';
const WIDTH = 64;

/** Top-of-script banner. */
export function title(text, subtitle) {
    new_line();
    zx.echo(`${bold(gb(text))}${subtitle ? dim(`  ${subtitle}`) : ''}`);
    zx.echo(dim(RULE.repeat(WIDTH)));
}

/** A named phase. Everything after it is indented under it. */
export function step(text) {
    new_line();
    zx.echo(`${bb('▸')} ${bold(text)}`);
}

/** A group heading inside a listing — quieter than a step. */
export function group(text) {
    new_line();
    zx.echo(dim(`  ${text}`));
}

export const ok = (text, detail) =>
    zx.echo(`  ${gb('✓')} ${text}${detail ? dim(`  ${detail}`) : ''}`);

export const skip = (text, detail) =>
    zx.echo(`  ${dim('·')} ${dim(text)}${detail ? dim(`  ${detail}`) : ''}`);

export const warn = (text, detail) =>
    zx.echo(`  ${yb('!')} ${text}${detail ? dim(`  ${detail}`) : ''}`);

export const fail = (text, detail) =>
    zx.echo(`  ${rb('✗')} ${text}${detail ? dim(`  ${detail}`) : ''}`);

export const note = (text) => zx.echo(`    ${dim(text)}`);

/** Closing line. Green when clean, yellow when something needs a human. */
export function done(text, { clean = true } = {}) {
    new_line();
    zx.echo(dim(RULE.repeat(WIDTH)));
    zx.echo(clean ? gb(`✓ ${text}`) : yb(`! ${text}`));
    new_line();
}
