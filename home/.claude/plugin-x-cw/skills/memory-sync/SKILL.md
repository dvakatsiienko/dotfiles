---
name: memory-sync
description: dima runs /memory-sync to mirror the frame masters into his «instructions for claude» box — a stamp compare against the rendered manifest, then a paste block if the box is stale. Args: dry. cw-only.
disable-model-invocation: true
---

# memory-sync — mirror the cc masters into the instructions box

cc is the source of truth. the one cw destination the masters feed is dima's **«instructions for
claude» box** (claude.ai settings → profile): 32 768 chars, loaded on every surface, plain chat
included. **only dima can write it** — this skill hands him the paste block.

cw's own memory — `/preferences.md`, `/profile.md`, every leaf — is **fully cw-native**. this skill
never writes it; edits there go through `memory-update`.

**no paraphrase, no routing decisions, no prose** — a line you would want to reword is a change
for the master, relayed to dima, never made here.

## routing lives in the masters

a line `<!-- sync: cw -->` directly under a heading in `CLAUDE.md` or `rules/*.md` sends that
section and its subsections to the box; `<!-- sync: none -->` opts a subsection back out; a tag
before the first heading routes the whole file. cc strips html comments, so tags cost cc nothing.
to add or drop a route: edit the tag in `~/frame`.

- the routing table, with sizes and room left: `pnpm memory-sync:map` (in `~/frame`)

## the procedure

1. render fresh — desktop-commander `start_process` on the mac (📌 `device_bash` runs a linux vm
   with the wrong node):

   ```
   cd ~/frame && node script/skill-memory-sync-mirror.ts
   ```

   a warn line is over the cap and a **stop**. output: `home/.claude/shelf/memory-sync-mirror/` —
   `instructions.core.md` and `manifest.json`.
2. read the manifest's `instructions#core` sha. find the box's `source-sha256` in this session's
   user-preferences block — the box text sits in the system prompt, as it was at session start.
   - same sha → `unchanged`, done.
   - differs or absent → put the block on dima's clipboard, same shell:
     `pbcopy < ~/frame/home/.claude/shelf/memory-sync-mirror/instructions.core.md`, and tell him:
     «settings › instructions for claude — select all, paste». never print the 20k+ block in chat.
3. report: `instructions#core: unchanged / on your clipboard (stamp <8 chars>)`, plus a pointer to
   `pnpm memory-sync:map`.

## one-time migration — memory mirror blocks

until 2026-09-23 the masters were spliced into `/preferences.md` and `/profile.md` between
`<!-- mirror:start -->` and `<!-- mirror:end -->`. that content now lives in the box. **hold rule:**
while either entry still carries a marker block, strip it only in a session whose box stamp equals
the manifest sha — then one `memory_str_replace` per entry, the whole block to empty. a session
that cannot see the new stamp leaves the blocks alone, so cw never runs with a fact in neither
place.

## args

- `/memory-sync dry` — render and compare, report, touch neither the clipboard nor memory.
