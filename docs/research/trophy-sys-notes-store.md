---
dies-when: folded into the trophy-sys product doc once DOT-244's spec exists, or BYT-102 is canceled after the rethink
---

# trophy-sys notes store — cw's game notes, one record per game

Ticket: BYT-102

## the situation (cw report, 2026-09-17)

- cw's games project keeps two files per game: his mini db (project docs, `claude/<game>*.md`, split into ~6 small files) and dima's distilled file (now a notion child page under `games`, `ntn` cli only)
- project docs have three ops (`project_read`, `project_write`, `project_search`), no in-place patch, and desktop-commander cannot reach them. every edit = whole-file read + whole-file write. the rl2 doc hit 28 kB before the split
- `project_search` is the one thing project docs do that nothing else in the stack does: rag across every game doc at once
- the incident: dima pasted the full psnprofiles rl2 guide (#17028) into a cw thread; psnprofiles 403s every fetch, the project doc was a distillation, the paste is gone. the cost of having no golden-source store, paid once
- psn gives a cross-gen title two npCommIds and two trophy lists (elden ring `NPWR25264_00` ps4 / `NPWR25067_00` ps5); guide sites key off one, so «earned» marking breaks on cross-gen. dima's stated pain with psnprofiles

## dima's frame — read before anything is built

- «what i want to do is to essentially simplify access for cowork to his own data source information. what i don't want to do is to exchange one unoptimal approach for another unoptimal approach.» the move is questionable until a critical rethink says otherwise
- the rag loss is workaroundable: a search verb over our own db
- alternative: **obsidian** as the game db — easy writes, easy reads, backlinks. maybe plainly better. open
- gated behind: solid ci · the PO question · product docs spec · trophies redesign (BYT-75). to think when we get there

## the proposal (cclio, 2026-09-17)

- store: upstash redis, already trophy-sys's store (`src/server/state.ts`), key `note:<npCommId>`
- record: fixed core (`status`, `progress[]` dated lines, `questions[]`, `comments[]` for dima's «@cw fix this») + `sections: Record<slug, markdown>`, each section tagged `agent` or `dima`. one record replaces both files; the app renders the `dima` sections
- history: `note:<id>:log` list (field, old, new, who, when), capped ~200
- cli: `trophies note get <id> [section]` · `set <id> <section>` (stdin) · `append <id> progress|questions|comments "…"` · `search <term>` · `export <id>`. cw over desktop-commander (price = the process wrapper, same as today, far fewer tokens), cc directly
- phase a: store + cli + raw read-only page — pure data, unblocked. phase b: the designed reader + in-app edits (cw's f8), after BYT-75; dima's reading stays in notion until then
- dima's requirement on the reader: «must be very good and readable», exceptional fonts

## the rethink checklist (when we get there)

- three candidates on one table: redis record + cli · obsidian vault (raw files, `obsidian` cli for links, icloud hazards) · project docs kept + only the split
- per candidate: cw edit cost per line, cw read cost at thread start, dima's reading surface, history/undo, search (exact vs fuzzy), what breaks when a sync or a grant fails
- the test dima set: simpler for cw, not merely different

## cw's feature candidates (folded into BYT-86's review)

f1 cross-gen merge · f2 golden-source guide store · f3 what's-left view (rarity asc, dlc split) · f4 closest-to-platinum board · f5 guide-url per game · f6 session log from `news` · f7 wishlist ⇄ ownership · f8 editable notes panel (gated, = phase b above)
