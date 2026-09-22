/**
 * jev:router on|off|status — the skill router's kill switch. `off` writes
 * `~/.claude/shelf/jev/router.off` and the UserPromptSubmit hook exits before any jev call;
 * `on` removes it. `status` says which, plus today's latency off route.log.
 */

/* Core */
import { rmSync, writeFileSync } from 'node:fs';

/* Instruments */
import {
    ROUTER_OFF,
    isRouterOff,
    latencyStats,
    routeRead,
    routerHealth,
} from './lib/jev-report.ts';

const verb = process.argv[2];
if (verb === 'off') writeFileSync(ROUTER_OFF, `${new Date().toISOString()}\n`);
else if (verb === 'on') rmSync(ROUTER_OFF, { force: true });
else if (verb !== 'status') {
    console.error('usage: pnpm jev:router on|off|status');
    process.exit(2);
}
const today = new Date().toISOString().slice(0, 10);
console.log(routerHealth(isRouterOff(), latencyStats(routeRead(today))));
