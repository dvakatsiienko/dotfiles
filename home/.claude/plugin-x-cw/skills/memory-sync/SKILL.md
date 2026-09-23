---
name: memory-sync
description: dima runs /memory-sync to mirror the frame masters into cw memory — a byte-compare against the rendered manifest, no judgment. Args: <cw path> · dry. cw-only.
disable-model-invocation: true
---

# memory-sync — mirror the cc masters into cw memory

cc is the source of truth; cw memory holds **verbatim copies** in the two auto-loaded entries,
`/preferences.md` and `/profile.md`. the render happens on the mac
(`script/skill-memory-sync-mirror.ts`, target map in `script/lib/memory-sync-mirror.ts`); this
skill only splices what changed. **no paraphrase, no routing decisions, no prose** — a line you
would want to reword is a change for the master, relayed to dima, never made here.

every write still follows `memory-update` mechanics: read first, version token, one write per entry.

## the procedure

1. render fresh — shell lane on `mac-lan`, frame root:

   ```
   node script/skill-memory-sync-mirror.ts
   ```

   it prints one line per fragment with its size and warns above a cap. output lands in
   `home/.claude/shelf/memory-sync-mirror/` (gitignored build) plus `manifest.json`.
   📌 `device_bash` runs in a linux vm with the wrong node — run this through desktop-commander
   `start_process` on the mac (`cd ~/frame && node script/skill-memory-sync-mirror.ts`).
2. read `manifest.json`. keys are `<host path>#<fragment>`.
3. for each key: `memory_read` the host entry, find the block between `<!-- mirror:start -->`
   and `<!-- mirror:end -->`, compare the `source-sha256` inside its first comment line to the
   manifest → differs → one `memory_str_replace` of the whole block with the rendered file.
   the host's cw-native sections are never touched. no markers in the host → stop and report;
   never guess where the block goes.
4. report, one line per key: `path#fragment: written / unchanged / skipped (reason)`.

## what is where

- the target map — which master, which sections, which host — lives in
  `script/lib/memory-sync-mirror.ts`. a new master, a rename, a section pick: edit the map, not memory.
- `/preferences.md#formatting` — output-format, compact.
- `/profile.md#fleet` — identity (invariant + the members glossary), voice, signals, the fleet
  words, and the doors routing table, compact.
- ⚠️ **each host injects a fixed number of chars and truncates the tail SILENTLY above it** —
  `/preferences.md` 16 384, `/profile.md` 8 192, with the host's native content eating the same
  budget. the render aborts rather than hand cw an over-budget block, so a warn line is a stop.
- the resident tier is a **routing table, not a library**: tooling detail and the vault hazards
  live in the cw-native leaves (`/areas/tooling.md`, `/topics/obsidian.md`), and
  `rules/fleet-doors.md` only makes cw know the door exists. 📌 a leaf `description` truncates at
  80 chars in the listing — that line is the whole trigger.
- cw-native entries — anything not in the manifest — are never written by this skill.
  `/areas/cw-delta.md` holds the surface differences; it is memory-owned, edited through `memory-update`.

## args

- `/memory-sync <host path>` — one manifest key only, same procedure.
- `/memory-sync dry` — render, compare, print the report, write nothing.
