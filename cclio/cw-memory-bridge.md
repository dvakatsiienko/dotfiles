# the cw memory bridge

> written by **cwrk** (claude-opus-5) in a cowork thread, 2026-08-28, at Dima's ask.
> audience: **cclio** — for code review of the changes listed here, and to carry the topic forward.
> status: the plan is RAW. what is on disk is small and additive; the design is the argument.

## why this exists

cc and cw never shared anything. cw booted blind every thread: no idea who cclio is, what «propose»
means, that questions are read-only, or that `~/dotfiles` is where skill source lives. Dima paid for
that gap by re-typing context on an ipad at 1am.

cw does have a persistent memory filesystem (the `memory_*` tools, shared with claude.ai chat). So a
bridge is possible: **cc facts, distilled into cw memory entries, refreshed on demand.**

## Dima's asks, as stated

1. **cc is the source of truth, generally.** cw memory is a derived view, never the origin.
2. **idempotence between cc and desktop is the ideal** — same knowledge, same meaning, either side.
   Acknowledged as hard; not to be bought with complexity.
3. **no per-surface branching inside every skill.** Skills stay tailored for cc first. A skill run
   from cw is cw's problem to solve — it substitutes its own tools (Desktop Commander instead of the
   Bash tool, `memory_*` instead of files on disk) and gets on with it.
4. **one global statement carries the surface difference**, instead of `if cc / if cw` sprinkled
   through every skill. That statement lives in cw memory and tells cw: you are the odd surface,
   here is how to translate.
5. **one skill covers the whole refresh**, tailored for cw: he runs it in a cw thread, cw walks the
   script and refreshes memory carefully and granularly.
6. **the resulting memory must be pretty for a human to read** and efficient for the agent.
   Both audiences, no compromise on either.
7. **refresh, never rewrite.** cw memory also holds things born in cw threads that have no cc source.
   The strategy is up-merge:
   - fetch the FULL entry first
   - evaluate what is new and what is stale
   - write the refreshed version
   - **if unsure whether to prune something — ask him before writing**
8. **memory stays clean** — no stale or ancient lines. But cw does not know all his wants upfront,
   so: clarify rather than guess.

## what already landed (review these)

### on disk, in dotfiles — STAGED, NOT COMMITTED

Dima chose to review the diffs himself; the 1Password signing agent was locked anyway
(`1Password: failed to fill whole buffer`). Both changes are additive, nothing deleted.

- **`home/.claude/rules/fleet-identity.md`** — one new glossary entry, `inbox`, between `CST` and
  `run id`. Carries: `prompts/inbox.md`, the drop → fold model, cclio edits freely / everyone else
  per his ask, not under git, icloud sync lands minutes late, never edit pre-sync.
  📌 review note: the sync hazards were later reclassified as **vault-wide, not inbox-specific**
  (his correction). The cc-side wording still states them inline on `inbox` — worth trimming to a
  pointer.
- **`home/.claude/plugin-x/skills/voice-sync/SKILL.md`** — `rules/fleet-identity.md` added to the
  master-file list; MEMORY lane step 1 «three» → «four» plus a note that identity lands in its own
  memory entry, not the voice digest.
  📌 review note: if `memory-sync` is written, this edit should be REVERTED and voice-sync kept
  voice-only. It was a stopgap.

`plugin-x-cw/skills/*` are symlinks into `plugin-x/skills/*`, so no distribution step exists —
editing the source is the whole job. (cw learned this the hard way and it is now in cw memory.)

### in cw memory — live now

- `/_router.md` — the barrel/TOC. One line per entry: what it owns. Plus a «known debt» section.
- `/areas/fleet.md` — the identities: dima · cclio · ccli · cwrk · ccloud · dpatch.
- `/areas/inbox.md` — the inbox entity: edit rules, drop → fold loop, pointer to vault hazards.
- `/areas/working-contract.md` — his vocabulary (propose · pause · freebie · slay · `←` · `note:` ·
  `just thoughts`), how to read his messages, the safety rails and why they exist, and **skill source
  of truth** (x-cw:* are distributed copies; source is `plugin-x/skills/<name>/SKILL.md`).
- `/topics/obsidian.md` — the vault: path, the no-git + lagging-icloud-sync hazards as vault-wide,
  the rename hazard (never move/rename from outside Obsidian — wikilinks break), house style for
  writes, and the notion-vs-obsidian history so no future thread re-suggests the migration blind.

## the memory hygiene shape (approved by him)

- the platform fixes five roots and they cannot be renamed:
  `/profile.md` · `/preferences.md` · `/topics/*` · `/areas/*` · `/people/*`
- **naming carries the grouping**, `_router.md` style — the same word his vault uses
- `/areas/` = things with a lifecycle · `/topics/` = things that just are
- **one subject, one file.** A fact goes where its subject lives, never into whichever file was open
- every `description` is a routing line — *what's inside · when to read it* — never a restatement of
  the path. This matters more than it sounds: `memory_list` returns path + description, so the
  descriptions ARE the table of contents an agent sees before reading anything
- memory is written only on his approval or ask. No bulk writes

**Known debt:** the fleet trio would sort better as `fleet.md` / `fleet-inbox.md` /
`fleet-contract.md`. A cowork thread **cannot delete a memory file** — it can only add and edit. So
renames need his hand in claude.ai to remove the old paths. Logged in `/_router.md`.

## the proposed skill — `memory-sync`

Not written. Proposed only, per «propose» = answer → approve → act.

- lives at `plugin-x/skills/memory-sync/SKILL.md`, entity-first name, sibling of `voice-sync`
- **it should absorb `voice-sync`**, not sit beside it: both do the same shape (read master files →
  condense → write a cw memory entry → verify), only the target entry differs. Two skills is two
  places to drift
- the map — each source maps to exactly ONE entry, replace-in-place, never touch what it does not own:

| source in dotfiles | cw memory entry |
|---|---|
| `fleet-voice` + `fleet-output-format` + `dima-signals` | `/preferences.md` (voice lines only) |
| `fleet-identity` | `/areas/fleet.md` |
| `CLAUDE.md` + `fleet-bypass-restraint` + `fleet-vibe` | `/areas/working-contract.md` |
| project CLAUDE.mds | their `/areas/*` entries |
| — (computed last, from what exists) | `/_router.md` |

- **the up-merge procedure, per entry:** read the full entry → diff against the fresh source → list
  what is new, what is stale, what is cw-native and has no cc source → ask him about anything
  ambiguous → then one write. Never a blind overwrite
- modes: `/memory-sync` = full pass with a per-entry diff report (the default and the honest one,
  because partial syncs are how contradictions get born) · `/memory-sync <entry>` = one entry
- it cannot delete. A retired entry gets flagged in `_router.md` for his hand

## the surface-difference statement

His ask #4, spelled out. One cw memory entry says roughly: *you are cw. Skills you load were
authored for cc. Where a skill says «run Bash», you use Desktop Commander on `mac-lan`. Where it
says «edit the file», you edit through DC. Where it assumes a resident rules directory, you read it
on demand. Do not ask him to fix the skill for you — translate and proceed.*

The payoff: skills stay single-branch and cc-shaped. The cost: cw must actually hold this, which is
what the memory bridge is for. It belongs in `/areas/working-contract.md` — cw already knows the
skill-source rule, this is the same family.

## worries, weak spots, likely failure modes

Written honestly, because this is the part a review should attack.

1. **Scatter — his own top worry, and correct.** cw memory has no folders beyond the fixed roots, no
   git, and grows by accretion from several surfaces (this session watched claude.ai write
   `/areas/inbox.md` while cw was writing `/areas/fleet.md`, both claiming the inbox subject). The
   router is a partial fix: it makes scatter *visible*, not impossible. Nothing enforces it. If
   `memory-sync` does not regenerate `_router.md` on every run, the barrel silently becomes fiction.
2. **No delete from cw.** The single hardest constraint. Cleanup requires his hands, which means
   stale entries accumulate between his passes. Any design that assumes cw can prune is wrong.
3. **Concurrent writers.** claude.ai chat, cowork threads, and any future surface write the same
   filesystem with optimistic version tokens. Conflicts are detectable but merges are judgment
   calls. A full `memory-sync` pass is the most dangerous moment for this — it touches many entries
   in one turn.
4. **The nightly regeneration is unproven.** voice-sync's own live watch (first sync 2026-08-26) is
   still unsettled after three sessions: nobody has verified that written lines survive the
   platform's memory regeneration verbatim. **The whole bridge rests on that answer.** If lines get
   compressed or merged, refresh-in-place is a fight against the platform, not a feature.
   This is the first thing to settle, and it is cheap: diff an entry before and after a night.
5. **Distillation drift.** Every refresh re-summarizes cc source into cw prose. Repeated
   summarization loses precision — his exact words are the thing worth protecting. Mitigation: the
   craft-pm guard already in cclio's rules — *his words survive every edit* — should bind this skill
   too, and quoted phrasing should be copied, never paraphrased.
6. **Provenance is thin.** `sources: [cowork]` says which surface wrote a line, not which dotfiles
   file it came from. Without that, a stale line cannot be traced to a changed source. Worth adding
   a `derived-from:` frontmatter key for entries the skill owns.
7. **Size caps.** Memory files are size-capped and the listing is capped. A thorough bridge wants to
   copy more than fits. Condensation pressure will only grow — the discipline of «one subject, one
   file» is what keeps any single entry writable.
8. **cw is slow and costly.** A full pass reads several dotfiles files over DC and writes many
   entries. It is a real token spend on the expensive lane. Batch it deliberately; do not make it a
   boot ritual.
9. **Idempotence is aspirational.** cc holds far more than cw memory can, and cw holds thread-native
   facts cc will never see. The honest target is *no contradictions*, not *same contents*.

## first moves, if this is adopted

- settle the regeneration question (worry #4) — one entry, one night, one diff
- write `memory-sync`, revert the `voice-sync` stopgap
- add `derived-from:` to the entries the skill owns
- his hand: the three fleet renames + any entry retirement
