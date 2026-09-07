---
name: memory-sync
description: dima runs /memory-sync to mirror the dotfiles masters into cw memory — a byte-compare against the rendered manifest, no judgment. Args: <cw path> · gazette · dry. cw-only. the daily 09:00 task runs `/memory-sync gazette`.
disable-model-invocation: true
---

# memory-sync — mirror the cc masters into cw memory

cc is the source of truth; cw memory holds **verbatim copies**. the render happens on the mac
(`script/skill-memory-sync-mirror.ts`, target map in `script/lib/memory-sync-mirror.ts`); this skill only copies what
changed. **no paraphrase, no routing decisions, no prose** — a line you would want to reword is a
change for the master, relayed to dima, never made here.

every write still follows `memory-update` mechanics: read first, version token, one write per entry.

## the procedure

1. render fresh — shell lane on `mac-lan`, dotfiles root:

   ```
   node script/skill-memory-sync-mirror.ts
   ```

   it prints one line per entry with its size and warns above a cap. output lands in
   `home/.claude/shelf/memory-sync-mirror/` (gitignored build) plus `manifest.json`.
   📌 `device_bash` runs in a linux vm with the wrong node — run this through desktop-commander
   `start_process` on the mac (`cd ~/dotfiles && node script/skill-memory-sync-mirror.ts`).
2. read `manifest.json`. keys are cw paths; a `#fragment` suffix marks a splice target.
3. `memory_list`, then for each manifest key:
   - **entry** (no fragment): `memory_read` the cw path. its frontmatter `source-sha256` equals
     the manifest `sha256` → unchanged, skip. differs or the entry is missing → `memory_write`
     the rendered file **as-is** (whole file, frontmatter included). a missing entry is created;
     the mirror is the one place `if_version: new` is routine.
   - **fragment**: `memory_read` the host entry, find the block between `<!-- mirror:start -->`
     and `<!-- mirror:end -->`, compare the `source-sha256` inside its first comment line to the
     manifest → differs → one `memory_str_replace` of the whole block with the rendered fragment.
     the host's cw-native sections are never touched. no markers in the host → stop and report;
     never guess where the block goes.
4. report, one line per key: `path: written / unchanged / created / skipped (reason)`.

## what is where

- the target map — which master renders to which cw path, descriptions, aliases — lives in
  `script/lib/memory-sync-mirror.ts`. a new master, a rename, a description fix: edit the map, not memory.
- `/preferences.md` is the one auto-loaded entry and is capped at 16 384 chars; its mirror block
  is rendered **compact** (headers, bullets, marker-led paragraphs) so it fits beside the
  cw-native sections. the full voice and output-format masters are mirrored as their own entries.
- cw-native entries — anything not in the manifest — are never written by this skill.
  `/areas/cw-delta.md` holds the surface differences (shell lane, skill source, model announce,
  the opus register); it is memory-owned, edited through `memory-update`.
- a cw entry that used to be hand-merged from masters and is now superseded by a mirrored one is
  retired per `memory-update` (emptied to a «retired → …» line, named for dima's hand).

## args

- `/memory-sync <cw path>` — one manifest key only, same procedure.
- `/memory-sync gazette` — only `/areas/fleet-cclio-gazette.md`. the renderer rolls the 5 freshest
  posts from their `cw:` frontmatter blocks; cw just copies.
- `/memory-sync dry` — render, compare, print the report, write nothing.
