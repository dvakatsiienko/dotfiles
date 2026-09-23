---
name: memory-sync
description: dima runs /memory-sync to mirror the frame masters into cw — memory splices plus the instructions-box paste block, a byte-compare against the rendered manifest, no judgment. Args: <destination> · dry. cw-only.
disable-model-invocation: true
---

# memory-sync — mirror the cc masters into cw

cc is the source of truth. cw auto-loads three destinations, and each gets a **verbatim** render:

- `instructions` — dima's «instructions for claude» box (claude.ai settings → profile). 32 768
  chars, loads on every surface incl. plain chat. **only dima can write it**: this skill prints it
  as a paste block.
- `/preferences.md` — 16 384 chars injected, cw writes the mirror block.
- `/profile.md` — 8 192 chars injected, cw writes the mirror block.

**no paraphrase, no routing decisions, no prose** — a line you would want to reword is a change
for the master, relayed to dima, never made here. every memory write still follows
`memory-update` mechanics: read first, version token, one write per entry.

## routing lives in the masters

a line `<!-- sync: field | prefs | profile | none -->` directly under a heading in `CLAUDE.md` or
`rules/*.md` sends that section and its subsections to one destination; a tag before the first
heading routes the whole file. cc strips html comments, so tags cost cc nothing. to add, move or
drop a route: edit the tag in `~/frame`, never memory, never the map.

- the routing table, generated every run: `~/frame/home/.claude/shelf/memory-sync-mirror/map.md`
- the raw truth: `grep -rn 'sync:' ~/frame/home/.claude/CLAUDE.md ~/frame/home/.claude/rules`

## the procedure

1. render fresh — desktop-commander `start_process` on the mac (📌 `device_bash` runs a linux vm
   with the wrong node):

   ```
   cd ~/frame && node script/skill-memory-sync-mirror.ts
   ```

   one line per destination with its size; a warn line is over budget and a **stop**. output:
   `home/.claude/shelf/memory-sync-mirror/` — one fragment per destination, `manifest.json`, `map.md`.
2. read `manifest.json`. keys are `<destination>#<fragment>`; `paste: true` marks the box.
3. memory keys (`paste: false`): `memory_read` the host, find the block between
   `<!-- mirror:start -->` and `<!-- mirror:end -->`, compare the `source-sha256` in its first
   comment line with the manifest → differs → one `memory_str_replace` of the whole block with the
   rendered file. cw-native sections are never touched. no markers in the host → stop and report.
4. the paste key (`instructions#core`): find the box's `source-sha256` in this session's
   user-preferences block (the box text is in the system prompt).
   - same sha → `unchanged`, print nothing.
   - differs or absent → print the whole rendered fragment in one fenced block, ribbon
     `copy → claude settings › instructions for claude — replace everything`. the fence holds the
     file verbatim, markers and stamp included; the stamp is how the next run checks the paste.
5. report, one line per key: `destination#fragment: written / unchanged / paste block printed /
   held (reason)`, then a link to `map.md`.

## durability — the hold rule

📌 the box changes only when dima pastes, and a session sees the box as it was at session start.
so a memory block whose content moved into the box is **held, never emptied**, until a session
sees the box carrying the new stamp:

- a memory fragment rendering with 0 sections while its host still holds an older block → `held
  (box not confirmed)`. splice it only when this session's box stamp equals the manifest's
  `instructions#core` sha.
- the check is mechanical, same run: box stamp == manifest sha → confirmed. anything else → held.
- this keeps cw from ever running with a fact in neither place.

## what is where

- the target list and caps — `script/lib/memory-sync-mirror.ts` (`targets`, `ORDER`). routing is
  never there; it is the tags.
- ⚠️ **each destination truncates its tail SILENTLY above its cap** — box 32 768, `/preferences.md`
  16 384, `/profile.md` 8 192, a memory host's native content eating the same budget. the render
  aborts rather than hand cw an over-budget block, and a vitest case guards the live masters.
- leaf detail — the cli doors (`/areas/tooling.md`), the vault hazards (`/topics/obsidian.md`) — is
  cw-native, read on demand. the box's doors table only makes cw know a door exists.
- cw-native entries and sections — anything outside a marker block — are never written by this
  skill. `/areas/cw-cc-delta.md` holds the surface differences; it is memory-owned, edited through
  `memory-update`.

## args

- `/memory-sync <destination>` — one manifest key only (`instructions`, `/preferences.md`,
  `/profile.md`), same procedure.
- `/memory-sync dry` — render, compare, print the report and the paste block if due, write nothing.
