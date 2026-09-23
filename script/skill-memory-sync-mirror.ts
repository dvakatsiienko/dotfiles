/**
 * skill:memory-sync-mirror — renders the cc masters into cw's three auto-loaded destinations under
 * `home/.claude/shelf/memory-sync-mirror/`: one fragment per destination, `manifest.json`, and
 * `map.md` — the human routing table. cw's `x-cw:memory-sync` runs this, splices every memory
 * fragment whose `source-sha256` moved, and hands dima the `instructions` fragment as a paste block.
 * by hand: `pnpm skill:memory-sync-mirror`. logic lives in `script/lib/memory-sync-mirror.ts`;
 * routing lives in the masters as `<!-- sync: <dest> -->` tags.
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
    toMap,
} from './lib/memory-sync-mirror.ts';
import { done, ok, step, title, warn } from './lib/print.ts';

const ROOT = join(homedir(), 'frame');
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
    const label = `${r.path}#${r.fragment}${target.paste ? ' (paste)' : ''}`;
    const size = `${r.chars} / ${budget} chars · ${r.routed.length} sections`;
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
writeFileSync(join(OUT, 'map.md'), toMap(rendered));
done(`${rendered.length} fragments · manifest.json · map.md`, {
    clean: oversized === 0,
});
if (oversized) process.exit(1);
