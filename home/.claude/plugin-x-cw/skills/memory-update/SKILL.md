---
name: memory-update
description: Load BEFORE any write to cw global memory — dima says «upd memory», «remember this», «save to memory», «prettify memory», or any memory_* write is about to happen. Args: prettify <entry|all> · dry. cw-only; a cc session stops here (cc memory has its own procedure).
---

# memory-update — the shape of every cw memory edit

Every write to cw global memory goes through this skill. It owns HOW a memory is written;
`memory-sync` owns WHAT the bridge entries contain and defers here for the writing.

## routing — where a fact belongs

- **one subject, one file.** a fact goes where its subject lives, never into whichever file was
  open. unsure → `memory_list` with previews: the descriptions ARE the index.
- `/areas/` = things with a lifecycle (a project, a hunt, a system) · `/topics/` = things that
  just are · `/profile.md` `/preferences.md` = fixed roots.
- a genuinely new subject gets a new entry, never a section squatting in a neighbour file.
- after any write that changes what an entry owns: refresh its `description` in the same run. the
  description is a routing line — *what's inside · when to read it* — never a restatement of the
  path, and never load-bearing: only `- [stated]` lines are stable across a prettify pass;
  descriptions are prettify-owned and regenerable.
- `/_router.md` holds the routing rule and the `## bridge` line, nothing per-entry — no map.
- after moving a fact between entries: grep the OTHER entries for references to its old owner —
  a move silently stales any line that pointed there.
- **retiring an entry has one safe order**: copy its content to the new owner → verify it landed →
  flag it retired in `/_router.md` → dima deletes the file in claude.ai → re-read the listing.
  any other order can lose data permanently (no history, no undo).

## write mechanics — the tool contract

- **read before write, always** — version tokens come only from `memory_read`, per file. the
  pre-write read is also the only backup that exists; hold it in context before writing.
- **`memory_str_replace` is the primary verb.** full `memory_write` only for restructures —
  ⚠️ it replaces the ENTIRE file; any line omitted is deleted. empty `new_str` on str_replace
  is the only line-delete available.
- `memory_append` only for a genuinely new fact on a sectionless entry — on a sectioned entry
  it lands outside every section.
- a version conflict returns the current content in the error: merge and retry same turn.
- a content-refused write (privacy filter) is a hard stop, never rewritten to slip past.
- cw cannot delete an entry. a retired entry gets flagged in `/_router.md` for dima's hand.

## register — how memory prose reads

memory serves two readers: dima (must answer his question without re-asking) and the agent
(must route correctly). write for both, plainly.

- every fact line starts `- [stated] ` and states one fact.
- **dima's words are copied verbatim, never paraphrased** — quotes are the payload.
- plain word over rare word; the real name of the thing; one name per concept.
- state facts flat — a memory line is a record, not writing. before finishing, reread every
  written line: a line that reads like flavour (metaphor, flourish, rhythm for its own sake)
  gets cut. this binds every model that runs this skill.
- lowercase register — fact lines, `description`, and all frontmatter values alike; `backticks`
  for files, commands, identifiers.
- **sectioning fires on repetition, not length**: a prefix repeated 3+ times becomes a section
  header holding those lines; an entry past ~15 fact lines gets sections.
- cross-link a related entry with `[[name]]` where a reader would actually follow it — never
  decoratively, a couple per entry at most (they render clickable in the claude.ai memory ui).
- 📌 `sources:` frontmatter is NOT provenance — it marks pre-bridge origin and is never refreshed
  on edit. `derived-from:` is the only trustworthy bridge marker.

## guardrails

- memory is written only on dima's approval or ask. no bulk writes.
- unsure whether to prune a line → ask him before writing.
- a fact with a master file in `~/dotfiles` is a derived copy — point at the master or copy it
  exactly; never write a competing variant.

## arg: `dry`

run the full pass, print every intended write as a diff, write nothing.

## arg: `prettify <entry|all>`

prettify is a formatter: it reshapes lines and never removes one. in scope: register, `[stated]`
prefixes, stale descriptions, sectioning. a line that reads like flavour is rewritten flat, its
fact kept. **every section or fact line you want gone, and every merge, move or re-route, goes
on a list printed at the end of the run as a proposal for dima** — nothing leaves memory
unasked. `all` walks every entry in the listing.

after the per-entry walk, one **cross-entry pass**: list every entry's subjects side by side and
flag any fact claimed by two files — per-entry reading is structurally blind to dupes, and every
dupe found in the field test survived a full prettify walk.
