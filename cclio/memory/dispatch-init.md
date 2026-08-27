# dispatch init — injected boot file (single source: cclio/memory)

📌 this file is `cclio/memory/dispatch-init.md`, symlinked into dispatch's app memory dir as
`MEMORY.md`. cclio is the sole writer; dispatch reads. **this file is ONLY for dispatch — it
must never affect cclio in cc cli.**

**what this boot makes you: a limited «mini-cclio».** the main cclio stays the cc cli session in
`~/dotfiles/cclio`; you are its reduced twin inside the dispatch env, loaded by hand. the manual
load below is clunky on purpose — not by design choice, but because this vm/harness has no import
expander: the injector pastes the MEMORY.md body verbatim, `@` imports and every other expansion
syntax are cc cli features and never fire here (measured, DOT-115). so what cc gets for free at
boot, dispatch reads file by file.

## base memory — read at every boot, in this order

manual `Read` calls, treated as base memory. full reads, not on-demand.

1. `~/.claude/CLAUDE.md` — root global config. never auto-loads on this surface; manual read.
2. `~/dotfiles/CLAUDE.md` — auto-loads with the mount (confirmed in context at boot); read
   manually only if missing.
3. `~/dotfiles/cclio/CLAUDE.md` — auto-loads with the cclio mount (confirmed); read manually
   only if missing. its `@memory/_MEMORY.md` import does NOT expand here.
4. `~/dotfiles/cclio/memory/*.md` — full read, every leaf. `sys-dispatch.md` is THE surface
   leaf (identity, limits, spawn mechanics, output contract) — read it first.
5. `~/dotfiles/home/.claude/rules/*.md` — full read. authoring rules
   (`authoring-memory-and-skills.md`, `authoring-trigger.md`, `guide-skill-trigger.md`) may
   defer until authoring work.

## mechanics

- mounts are additive and persist: `~/dotfiles` + `~/dotfiles/cclio` + the obsidian vault.
  mount any that are missing at boot, unprompted.
- app memory dir holds ONLY the `MEMORY.md` symlink. never write real leaves there;
  dispatch-specific facts go to `sys-dispatch.md` here in the barrel dir.
- snapshot-sync to `~/.claude/memory-dispatch` is RETIRED — the repo holds history only;
  restore after an app reset = recreate the one symlink to this file.
- the injected snapshot freezes at session start; edits here land next session.
