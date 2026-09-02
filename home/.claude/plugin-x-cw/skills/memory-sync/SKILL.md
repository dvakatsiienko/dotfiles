---
name: memory-sync
description: dima runs /memory-sync to refresh cw memory from the dotfiles master files — full pass, or one entry by name. Args: <entry> · gazette · dry. cw-only. the daily 09:00 task runs `/memory-sync gazette`.
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
  → `/areas/fleet-contract.md`, with three carve-outs routed OUT: the beliefs block (x-com
  products, simplicity, UX/DX drivers) → `/profile.md` · the TS/stack preferences block →
  `/topics/frontend.md` · the global naming conventions block (entity-first) →
  `/preferences.md` `## content conventions` (dima's call 2026-09-02); `fleet-contract` carries
  no copy
- every routing decision dima makes during a run lands in this map the same day — the map is
  the memory of the bridge, the run is not
- `rules/fleet-hazards.md` → `/topics/obsidian.md`, the vault section ONLY — the git-hooks
  section is cc-only (cw makes no worktrees), deliberately not mirrored
- a route move is a MOVE: the line lands in its new entry and leaves the old one in the same
  pass — a dupe across entries is a defect to fix, never a safety margin
- the constant blocks below → `/areas/fleet-contract.md`
- `cclio/gazette/*.md` → `/areas/fleet-cclio-gazette.md` — the ONE entry that is a rolling window,
  not an up-merge; procedure in «the gazette» below

## the up-merge — per entry, in order

a cw session starts with NO memory loaded — scheduled runs included. `memory_list` +
`memory_read` are the only view, and every write needs the version token a same-session
`memory_read` returns; reading each entry first is the protocol, not overhead.

0. at run start, compare `memory_list` against the map: a mapped entry missing from the
   listing means THIS skill is stale (a rename it never followed, or a stale plugin cache) —
   stop and report; never create the missing entry. one exception: the gazette entry
   (`/areas/fleet-cclio-gazette.md`) may be created when missing — a rolling window with no
   cw-native content to protect.
1. read the FULL entry (also yields the version token).
2. read the fresh master(s).
3. diff: what is new · what is stale · what is cw-native with no cc source (untouchable).
4. anything ambiguous — a prune, a conflict between cw-native and master — ask dima before
   writing. his words in an entry survive every edit. a master line whose subject belongs to
   a different entry than the map assigns is a routing question, never a silent write into the
   mapped entry. one concept under two names (master says `entity-first`, entry says
   `subject-first`) is a diff, not a synonym — the master's spelling wins.
5. one write, per `memory-update` mechanics. refresh the entry `description` with it.
6. stamp the entry frontmatter: `derived-from: [<master files>]`. a partially derived entry
   scopes the stamp to the block: `derived-from: [CLAUDE.md#beliefs]`,
   `[rules/fleet-voice.md, rules/fleet-output-format.md → ## voice and formatting]` — the stamp
   names what is a protected copy; everything else in that entry is cw-native. when an entry's existing
   `derived-from:` disagrees with the map above, **the map wins** — restamp, and name the
   mismatch in the diff report.

the pass is done when every mapped entry is refreshed and the per-entry diff report printed:
`entry: what changed / unchanged / asked` — plus a coverage line: every section of every
mapped master landed somewhere, or is named as not-mirrored. an entry retired during the pass
is named in the report for dima's hand (cw cannot delete).

## the gazette — `/memory-sync gazette`

cclio writes one post a day into `~/dotfiles/cclio/gazette/`. each post's frontmatter carries a
`cw:` block: 3 lines cclio pre-digested for you — what shipped, what is live or next, the one line
worth repeating to a human. your job is a rolling window, never a rewrite.

the entry `/areas/fleet-cclio-gazette.md` is what makes you aware of what dima and cclio are doing.
surface it unprompted where it helps: an hr mail, a recruiter reply, cv positioning («this week
we shipped…»), or any thread where he asks what the two of them are up to.

1. `memory_read` the entry (version token + current state). its body is one section per post:
   `## <date> · <slug> · <bytes>b`, freshest first, the `cw:` lines under it.
2. list the source: `ls -l ~/dotfiles/cclio/gazette/*.md` — date and slug from the filename,
   bytes from the size.
3. diff by header: a filename with no section is NEW; a section whose byte count differs from
   the file is CHANGED (cclio appends an evening update to the same post). everything else is
   untouched and stays byte-identical.
4. for each new or changed post only: extract the block —
   `sed -n '/^cw: |/,/^---$/p' <file>` — and build its section. **copy verbatim** — the lines
   are cclio's words for you, zero edits.
5. assemble: new sections prepended in date order, changed sections replaced in place, then trim
   to the **7 freshest**. one `memory_write`. `derived-from: [cclio/gazette/*.md]`.
6. nothing new, nothing changed → write nothing, report «gazette: noop».

done when the entry holds ≤7 sections, each byte count matches its file, and the report names
which sections were added, replaced, trimmed, or noop.

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
- 🚨 **opus register, mandatory when the model running this thread is opus** — every reply, from
  the first one: verdict first, plain words, simple technical english. applies to any non-code
  text. keep the substance; calmer and cleaner, never shorter. voice, emojis and formatting rules
  stay. no poems, no meta-frameworks, no theories of everything. other models: ignore this line.
<!-- 🧪 vet: the line above is the cc `opus-register` hook carried into cw memory — dima's ask
     was an «opus-mode skill» for the desktop app, where hooks do not run and opus still
     prints poems. he wants it against opus ONLY; other models talk fine and must not be
     suppressed. A/B against `x-cw:opus-mode` (a cw-only skill, same text) — he inspects the
     difference and keeps one. -->

## args

- `/memory-sync <entry>` — one entry only, same procedure.
- `/memory-sync dry` — full pass, print the per-entry diff report, write nothing. the safe
  first command after any long gap.
