---
name: memory-sync
description: dima runs /memory-sync to mirror the frame masters into his account / profile / instructions field — a stamp compare against the rendered manifest, then a paste block if the field is stale. Args: dry. cw-only.
disable-model-invocation: true
---

# memory-sync — mirror the cc masters into `account / profile / instructions`

cc is the source of truth. the one cw destination the masters feed is dima's **`account / profile / instructions`**
field (claude.ai settings → account → profile → «instructions for claude»): 32 768 chars, loaded on every surface, plain chat
included. **only dima can write it** — this skill hands him the paste block.

cw's own memory — `/preferences.md`, `/profile.md`, every leaf — is **fully cw-native**. this skill
never writes it; edits there go through `memory-update`.

**no paraphrase, no routing decisions, no prose** — a line you would want to reword is a change
for the master, relayed to dima, never made here.

## routing lives in the masters

a line `<!-- sync: cw -->` directly under a heading in `CLAUDE.md` or `rules/*.md` sends that
section and its subsections to the field; `<!-- sync: none -->` opts a subsection back out; a tag
before the first heading routes the whole file. cc strips html comments, so tags cost cc nothing.
to add or drop a route: edit the tag in `~/frame`.

- the routing table, with sizes and room left: `pnpm memory-sync:map` (in `~/frame`)

## the field has two parts

- **dima's section, on top** — his own words, sourced from `instructions-head.md` beside this skill (`~/frame/home/.claude/plugin-x-cw/skills/memory-sync/`).
- a `═══` line reading «⬇ synced from cc memory» — everything under it is rendered, never hand-edited.

## the procedure

0. pull his edits back first. compare the text above the `═══` line in this session's
   user-preferences block with `instructions-head.md`. different → he edited the field: write the
   field's version into the file (desktop-commander `write_file`, mode `rewrite`), word for word.
   never the other way round — the field is where he types.

1. render fresh — desktop-commander `start_process` on the mac (📌 `device_bash` runs a linux vm
   with the wrong node):

   ```
   cd ~/frame && node script/skill-memory-sync-mirror.ts
   ```

   a warn line is over the cap and a **stop**. output: `home/.claude/shelf/memory-sync-mirror/` —
   `account-profile-instructions.core.md` and `manifest.json`.
2. read the manifest's `account/profile/instructions#core` sha. find the field's `source-sha256` in this session's
   user-preferences block — the field text sits in the system prompt, as it was at session start.
   - same sha → `unchanged`, done.
   - differs or absent → put the block on dima's clipboard, same shell:
     `pbcopy < ~/frame/home/.claude/shelf/memory-sync-mirror/account-profile-instructions.core.md`, and tell him:
     «settings › instructions for claude — select all, paste». never print the 20k+ block in chat.
3. report: `account/profile/instructions#core: unchanged / on your clipboard (stamp <8 chars>)`, plus a pointer to
   `pnpm memory-sync:map`.

## one-time migration — memory mirror blocks

until 2026-09-23 the masters were spliced into `/preferences.md` and `/profile.md` between
`<!-- mirror:start -->` and `<!-- mirror:end -->`. that content now lives in the field. **hold rule:**
while either entry still carries a marker block, strip it only in a session whose field stamp equals
the manifest sha — then one `memory_str_replace` per entry, the whole block to empty. a session
that cannot see the new stamp leaves the blocks alone, so cw never runs with a fact in neither
place.

## args

- `/memory-sync dry` — render and compare, report, touch neither the clipboard nor memory.
