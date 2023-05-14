/* Core */
import * as zx from 'zx';

export const bb = (...args) => zx.chalk.blueBright(...args);
export const yb = (...args) => zx.chalk.yellowBright(...args);
export const mb = (...args) => zx.chalk.magentaBright(...args);
export const gb = (...args) => zx.chalk.greenBright(...args);
export const rb = (...args) => zx.chalk.redBright(...args);
export const new_line = () => zx.echo('');
