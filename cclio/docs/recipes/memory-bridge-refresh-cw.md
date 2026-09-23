# memory-bridge-refresh-cw — the cw memory bridge maintenance loop

## the want (dima's words)

- «cc is the source of truth, generally. cw memory is a derived view, never the origin.»
- «i dont want a mess there» — scatter is the fear, not volume: «memory must not grow fast» is
  a QUALITY bar, never a line cap.
- «memory must be pretty» — useful for him (no re-asking obvious things) AND for the agent.
- «no poems!» — binding on every model that runs the skills, opus included.
- the recipe exists «so i won't explain you my wants about this again».

## analysis vectors (his wording, re-groom each run — local evidence, no web research)

- what did the skills get WRONG in the field — which defect becomes a skill edit rather than a
  one-off fix?
- is cw memory still clean — dupes, scatter, stale lines, poems?
- do written lines survive the platform's nightly regeneration verbatim?

## artifacts

- `home/.claude/plugin-x-cw/skills/memory-update/SKILL.md` — the shape of every cw memory edit
- `script/lib/memory-sync-mirror.ts` — renders the field from the masters; routing is a
  `<!-- sync: cw -->` line under a heading in `CLAUDE.md` or `rules/*.md` (`pnpm memory-sync:map`
  prints every route); dima's own section is
  `home/.claude/plugin-x-cw/skills/memory-update/instructions-head.md`
- `home/.claude/rules/fleet-hazards.md` — fleet-wide pitfalls the sync carries into cw
- `docs/knowledge/claude-fleet-capabilities.md` — cw platform facts land here (e.g. the
  device-bound scheduled-task limit)

## retires — research docs this recipe's run kills

a `dies-when:` label fires only when someone opens the doc; this list is the check that runs.
each run: for every doc here, ask whether its verdict is encoded in an artifact above — yes →
delete the doc and its line.

- `docs/research/cw-memory-regen.md` — verdict: no nightly regen; projects are separate stores;
  local cw has no memory. encoded when the collision probe design and those two carve-outs sit
  in the artifacts.

## the run

1. **trigger** — cc masters changed meaningfully, or dima says the bridge feels stale. after
   a master change: `pnpm memory-sync:copy`, dima pastes into claude.ai settings › account ›
   profile › instructions for claude; to verify, a new cw thread runs `/x-cw:memory-update check`.
2. **field report** — cwrk writes a thorough handoff of what the run hit; dima drops it here
   via `/x:handoff-ingest`.
3. **eval** — the report is a candidate, not a finding: verify stale claims against git/disk,
   kill no-ops, catch questions this side already settled. print dima a compact verdict —
   worth-updating vs not, with reasons.
4. **fold** — on his word, land the survivors into the skills, bump `plugin-x-cw`, commit.
   push on his word; cw picks up after force refresh in settings.
5. **noop is first-class** — a clean field report folds nothing.

## cadence

on demand — after master-file changes or a batch of cw memory activity. not a boot ritual;
the sync is a real token spend on the expensive lane.

## last run

2026-09-20 — gazette lane ejected on dima's word: the gazette auto-loaded into every cw thread
and cw rarely needs fleet context. `/areas/fleet-cclio-gazette.md` deleted by his hand, the 09:02
cloud task with it; the renderer, the `cw:` frontmatter and the heartbeat file are gone.


2026-08-28 — round 1: skills born (0.2.0), field test folded (0.2.1): 7 edits to
memory-update, 2 to memory-sync, scheduled-task limit into capabilities. regen probe armed
for 2026-08-29 09:00 (dima's daily scheduled task in cw — delete after first report).
