/**
 * skill:memory-sync-mirror — renders the cc masters into cw memory entries under
 * `home/.claude/shelf/memory-sync-mirror/` plus a `manifest.json`. cw's `x-cw:memory-sync` runs this,
 * reads the manifest, and overwrites every entry whose `source-sha256` moved. by hand:
 * `pnpm skill:memory-sync-mirror`. logic and the target map live in `script/lib/memory-sync-mirror.ts`.
 */

/* Core */
import { mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/* Instruments */
import {
    CW_ENTRY_CAP,
    FRAGMENT_CAP,
    renderAll,
    toManifest,
} from './lib/memory-sync-mirror.ts';
import { done, ok, step, title, warn } from './lib/print.ts';

const ROOT = join(homedir(), 'dotfiles');
const OUT = join(ROOT, 'home/.claude/shelf/memory-sync-mirror');

title('skill:memory-sync-mirror', OUT.replace(homedir(), '~'));
mkdirSync(OUT, { recursive: true });

step('entries');
const rendered = renderAll(ROOT);
let oversized = 0;
for (const r of rendered) {
    writeFileSync(join(OUT, r.file), r.body);
    const label = `${r.path}${r.fragment ? `#${r.fragment}` : ''}`;
    const size = `${r.chars} chars · ${r.bytes} b`;
    if (r.fragment && r.chars > FRAGMENT_CAP) {
        oversized++;
        warn(
            label,
            `${size} — above the fragment cap; /preferences.md will refuse the splice`,
        );
    } else if (r.bytes > CW_ENTRY_CAP) {
        oversized++;
        warn(label, `${size} — above the entry cap; cw will refuse the write`);
    } else ok(label, size);
}

writeFileSync(
    join(OUT, 'manifest.json'),
    `${JSON.stringify(toManifest(rendered), null, 4)}\n`,
);
done(`${rendered.length} entries · manifest.json`, { clean: oversized === 0 });
