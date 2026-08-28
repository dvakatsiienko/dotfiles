---
dies-when: the `cclio's-gazette` leaf exists in cw memory and the 09:00 cw task runs memory-sync — then this folds into `cclio/docs/procedures/memory-bridge-refresh-cw.md`
---

# gazette → cw memory: ambient awareness of what dima and cclio are doing

dima's want, 2026-08-28, his words: *«i not see any reason of cw to not be aware of what we do
with you. its all of what i do and you. so having it in cw feels essential to me.»* the use case:
in cw he talks applications, cv, recruiters — cw should surface «we're building the harness this
week» in an HR mail unprompted. any thread, cooking included, so he can chat a hot topic without
a context switch. ctx load accepted.

## the shape (agreed)

- **leaf `cclio's-gazette`** in cw global memory — a rolling **digest**, not a copy: enough to
  cover the use case, humanized voice (cw reads it to talk to him). freshest first.
- **window: the 2 freshest gazette posts** (mvp; tune later — 5 was floated).
  **retirement built in:** a line older than 7 days falls off at the next sync, so the leaf never
  grows — this is how it passes the «must not grow fast» quality bar despite changing daily.
- **source:** `cclio/gazette/*.md` on the mac, read through the cw memory bridge the way the
  other mapped sources are.
- **carrier: `memory-sync`** (plugin-x-cw) gains one more mapped source → target leaf. the map
  entry states the want above so cw picks what is good; no cclio-side fan-out.
- **trigger: the daily 09:00 kyiv cw scheduled task** (device-bound, UI-create-only). the existing
  regen-probe task at that slot **mutates** into «run memory-sync» after probe report #1 — not
  deleted.

## the gate

the cw-memory regen probe (report #1 due 2026-08-29 ~09:00) decides whether a daily-rewritten
leaf survives cw's nightly regeneration. survives → the task mutation is the whole launch.
does not → the leaf needs a fallback carrier (an `x-cw__gazette_read` mcp tool was the
rejected first pick: pull-on-demand, wrong for ambient awareness).

## steps

1. probe verdict in hand.
2. `memory-sync`: add the source→leaf map entry with the want + the 7-day retirement rule;
   bump plugin-x-cw; dima force-refreshes cw.
3. dima edits the 09:00 task → memory-sync run.
4. first run: read the leaf, check the digest against the two posts, fix wording in the map.
5. fold the loop into `memory-bridge-refresh-cw.md`; this doc dies.
