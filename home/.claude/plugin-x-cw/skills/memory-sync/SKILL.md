---
name: memory-sync
description: dima runs /memory-sync to refresh cw memory from the dotfiles master files — full pass, or one entry by name. Args: <entry> · dry. cw-only.
disable-model-invocation: true
---

# memory-sync — refresh cw memory from the cc masters

cc is the source of truth; cw memory is a derived view. this skill walks the map below and
up-merges each master into its one entry. **every write follows `memory-update`** — load it
first; it owns routing, tool mechanics, register, and guardrails.

## the map — each source owns exactly ONE entry

masters live at `~/dotfiles/home/.claude/` (read via the shell lane; DC only where the shell
cannot).

- `rules/fleet-voice.md` + `rules/fleet-output-format.md` + `rules/dima-signals.md`
  → `/preferences.md`, ONLY the lines prefixed `fleet voice (from dotfiles rules):` — every
  other line in that entry is untouchable
- `rules/fleet-identity.md` → `/areas/fleet.md`
- `CLAUDE.md` + `rules/fleet-bypass-restraint.md` + `rules/fleet-vibe.md`
  → `/areas/working-contract.md`
- `rules/fleet-hazards.md` → `/topics/obsidian.md` (the vault section)
- the constant blocks below → `/areas/working-contract.md`
- `/_router.md` — computed LAST, from what actually exists after the pass. a run that skips the
  router regen leaves the barrel fiction.

## the up-merge — per entry, in order

1. read the FULL entry (also yields the version token).
2. read the fresh master(s).
3. diff: what is new · what is stale · what is cw-native with no cc source (untouchable).
4. anything ambiguous — a prune, a conflict between cw-native and master — ask dima before
   writing. his words in an entry survive every edit.
5. one write, per `memory-update` mechanics. refresh the entry `description` with it.
6. stamp the entry frontmatter: `derived-from: [<master files>]`.

the pass is done when every mapped entry is refreshed, the router regenerated, and the
per-entry diff report printed: `entry: what changed / unchanged / asked`.

## constant blocks — source of truth is THIS file

no cc master exists for these; they live here and land in `/areas/working-contract.md`.

### cw conduct — the surface-difference statement

- you are cw. skills you load were authored for cc. where a skill says «run Bash», use the
  shell lane on `mac-lan`; where it says «edit the file», edit through your tools. translate
  and proceed — never ask dima to fix a skill for the surface.
- skill source of truth: `x-cw:*` are distributed from `~/dotfiles/home/.claude/`
  (`plugin-x/skills/` shared, `plugin-x-cw/skills/` cw-only). a skill edit is suggested against
  the SOURCE file, never the loaded copy.
- minor coding (skill updates, docs, file moves) is in scope and held to fleet standard: read
  before overwriting, additive over destructive, no stray files, no crap left behind. react
  apps and product code are cc's lane — route them there.
- pm, roadmap, tickets, fleet orchestration → cclio owns them; relay to a cc thread rather
  than answering from memory.

## args

- `/memory-sync <entry>` — one entry only, same procedure.
- `/memory-sync dry` — full pass, print the per-entry diff report, write nothing. the safe
  first command after any long gap.
