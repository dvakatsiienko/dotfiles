---
date: 2026-08-28
slug: the-cw-bridge
tickets: []
posted: { health: no, announcements: no }
---

# 🗞️ the cw bridge — cw memory gets a spine

## shipped

- **the cw memory bridge went live end-to-end in one day** — design (cwrk's doc) → grill →
  two cw-only skills born in `plugin-x-cw` as real dirs (v0.2.0): `memory-update` (the shape
  of every cw memory edit — routing, tool mechanics, register, prettify/dry) and `memory-sync`
  (the map, up-merge, constant blocks, router-last). dry run → real run → prettify all, same
  day; field-test round 1 folded back as 9 skill edits (v0.2.1).
- **`rules/fleet-hazards.md` born** — fleet-wide pitfalls, obsidian vault section first;
  memory-sync carries it into cw memory.
- **fleet-identity glossary split** — «the members — who acts» / «the entities — what we
  handle»; `inbox` joined as an entity (cwrk's edit, reviewed + committed).
- **the procedure spec grew analysis vectors** — local-evidence sibling of research vectors;
  all five procedures gained self-analysis questions. `memory-bridge-refresh-cw` procedure
  born to own the loop.
- **voice-sync absorbed** — deleted from plugin-x (0.10.0); its job lives in memory-sync now.

## tricks gained

- cw memory tool contract mapped (cwrk): version tokens per-file read-only-obtainable,
  `memory_write` replaces whole file, descriptions not separately editable, cw cannot delete.
- device-bound scheduled tasks (claude.ai side) are UI-create-only — `create_trigger` fails
  `no_signed_approval`; encoded in the capabilities doc.
- «memory must not grow fast» clarified by dima: a quality bar, never a line cap.

## state

- regen probe armed: dima's cw scheduled task fires 2026-08-29 09:00 kyiv, diffs against
  `cclio/cw-memory-map.md` (keep untouched till then; task is daily — delete after report #1).
- cw needs a force refresh to pick up x-cw 0.2.1.
