# AGENTS.md: hotkeys

what is bound, what actually gets pressed, and the page that shows both. the recording daemon is
the one thing living elsewhere — `schedule/jobs/x-monitor-hotkey-stats/` — because a plist belongs
under `schedule/`; every reader and tool stays here.

## the contract

📌 **`manual.ts` is the single source for the hand-kept apps.** raycast, cleanshot and 1password
seal their shortcuts, so those rows are typed there by hand. change a binding in that file and
nothing else needs touching: the live job sees its mtime move, reruns the scan, and the map and
`hotkeys:top` follow. **nothing is remembered anywhere else** — no second list, no cache.

## the pieces

- `scan.ts` — reads the six sources named in `sources.ts`; stdout is json, and `top.ts` parses it
- `live.ts` — the always-on watcher: rewrites `presses.js` on a press, reruns the scan on a config change
- `map.html` — opened off disk, so every seed arrives as a `<script>`; `fetch` is blocked over `file://`
- `macos-audit.ts` — diffs the three system domains against `macos/`, exit 1 on drift
