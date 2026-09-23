/**
 * memory-sync:copy — renders `account / profile / instructions` fresh and puts it on the clipboard.
 * dima runs it himself right before he pastes, so the block never waits on a clipboard his other
 * work overwrites. `pnpm memory-sync:copy`, then settings › account › profile › instructions for
 * claude → select all → paste.
 */

/* Core */
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

/* Instruments */
import { render, target } from './lib/memory-sync-mirror.ts';
import { done, fail, ok, step, title } from './lib/print.ts';

const r = render(join(homedir(), 'frame'));

title('memory-sync:copy', 'account / profile / instructions → clipboard');
step('the block');
if (r.chars > target.cap) {
    fail(
        'over the cap',
        `${r.chars} / ${target.cap} chars — the field refuses it`,
    );
    process.exit(1);
}
const copied = spawnSync('pbcopy', { input: r.body });
if (copied.status !== 0) {
    fail('pbcopy failed', String(copied.stderr));
    process.exit(1);
}
ok(
    'on your clipboard',
    `${r.chars} / ${target.cap} chars · stamp ${r.sha256.slice(0, 8)}`,
);

done(
    'paste now: settings › account › profile › instructions for claude → select all → paste',
);
