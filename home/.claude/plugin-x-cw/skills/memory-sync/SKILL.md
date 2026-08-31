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

- `rules/fleet-voice.md` + `rules/fleet-output-format.md` → `/preferences.md`, ONLY the
  `## voice and formatting` section — every other section in that entry is cw-native and
  untouchable
- `rules/dima-signals.md` → `/areas/fleet-contract.md` (`## reading him`)
- `rules/fleet-identity.md` → split: members + entities glossary and surface facts →
  `/areas/fleet.md` · invariants + refusals (the destruction rails) →
  `/areas/fleet-contract.md`, which is the ONE home of the rails — `/areas/fleet.md` carries
  no copy
- `CLAUDE.md` + `rules/fleet-bypass-restraint.md` + `rules/fleet-vibe.md`
  → `/areas/fleet-contract.md`, with two carve-outs routed OUT: the beliefs block (x-com
  products, simplicity, UX/DX drivers) → `/profile.md` · the TS/stack preferences block →
  `/topics/frontend.md`
- `rules/fleet-hazards.md` → `/topics/obsidian.md`, the vault section ONLY — the git-hooks
  section is cc-only (cw makes no worktrees), deliberately not mirrored
- a route move is a MOVE: the line lands in its new entry and leaves the old one in the same
  pass — a dupe across entries is a defect to fix, never a safety margin
- the constant blocks below → `/areas/fleet-contract.md`

## the up-merge — per entry, in order

a cw session starts with NO memory loaded — scheduled runs included. `memory_list` +
`memory_read` are the only view, and every write needs the version token a same-session
`memory_read` returns; reading each entry first is the protocol, not overhead.

0. at run start, compare `memory_list` against the map: a mapped entry missing from the
   listing means THIS skill is stale (a rename it never followed, or a stale plugin cache) —
   stop and report; never create the missing entry.
1. read the FULL entry (also yields the version token).
2. read the fresh master(s).
3. diff: what is new · what is stale · what is cw-native with no cc source (untouchable).
4. anything ambiguous — a prune, a conflict between cw-native and master — ask dima before
   writing. his words in an entry survive every edit. a master line whose subject belongs to
   a different entry than the map assigns is a routing question, never a silent write into the
   mapped entry. one concept under two names (master says `entity-first`, entry says
   `subject-first`) is a diff, not a synonym — the master's spelling wins.
5. one write, per `memory-update` mechanics. refresh the entry `description` with it.
6. stamp the entry frontmatter: `derived-from: [<master files>]`. when an entry's existing
   `derived-from:` disagrees with the map above, **the map wins** — restamp, and name the
   mismatch in the diff report.

the pass is done when every mapped entry is refreshed and the per-entry diff report printed:
`entry: what changed / unchanged / asked` — plus a coverage line: every section of every
mapped master landed somewhere, or is named as not-mirrored. an entry retired during the pass
is named in the report for dima's hand (cw cannot delete).

## constant blocks — source of truth is THIS file

no cc master exists for these; they live here and land in `/areas/fleet-contract.md`.
a `🧪 vet` comment is an authoring note: write the content plain — the trial state lives here,
never in memory.

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
- when the model running this thread is opus: verdict first, plain words, simple technical
  english — applies to any non-code text. keep the substance; calmer and cleaner, not shorter.
  voice, emojis and formatting rules stay. other models: ignore this line.
<!-- 🧪 vet: the line above is the cc `opus-register` hook carried into cw memory — dima's ask
     was an «opus-mode skill» for the desktop app, where hooks do not run and opus still
     prints poems. he wants it against opus ONLY; other models talk fine and must not be
     suppressed. A/B against `x-cw:opus-mode` (a cw-only skill, same text) — he inspects the
     difference and keeps one. -->

## args

- `/memory-sync <entry>` — one entry only, same procedure.
- `/memory-sync dry` — full pass, print the per-entry diff report, write nothing. the safe
  first command after any long gap.
