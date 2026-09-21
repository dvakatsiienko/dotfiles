/**
 * skill:memory-sync-mirror — renders the cc masters into the two cw memory fragments under
 * `home/.claude/shelf/memory-sync-mirror/` plus a `manifest.json`. cw's `x-cw:memory-sync` runs this,
 * reads the manifest, and splices every fragment whose `source-sha256` moved. by hand:
 * `pnpm skill:memory-sync-mirror`. logic and the target map live in `script/lib/memory-sync-mirror.ts`.
 */

/* Core */
import { mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/* Instruments */
import {
    budgetOf,
    renderAll,
    targets,
    toManifest,
} from './lib/memory-sync-mirror.ts';
import { done, ok, step, title, warn } from './lib/print.ts';

const ROOT = join(homedir(), 'dotfiles');
const OUT = join(ROOT, 'home/.claude/shelf/memory-sync-mirror');

title('skill:memory-sync-mirror', OUT.replace(homedir(), '~'));
mkdirSync(OUT, { recursive: true });

step('fragments');
const rendered = renderAll(ROOT);
let oversized = 0;
for (const r of rendered) {
    writeFileSync(join(OUT, r.file), r.body);
    const target = targets.find(
        (t) => t.path === r.path && t.fragment === r.fragment,
    );
    if (!target) throw new Error(`no target for ${r.path}`);
    const budget = budgetOf(target);
    const label = `${r.path}#${r.fragment}`;
    const size = `${r.chars} / ${budget} chars`;
    if (r.chars > budget) {
        oversized++;
        warn(
            label,
            `${size} — ${r.chars - budget} over; cw stores it and truncates the tail silently at load`,
        );
    } else ok(label, size);
}

writeFileSync(
    join(OUT, 'manifest.json'),
    `${JSON.stringify(toManifest(rendered), null, 4)}\n`,
);
done(`${rendered.length} fragments · manifest.json`, {
    clean: oversized === 0,
});
if (oversized) process.exit(1);
