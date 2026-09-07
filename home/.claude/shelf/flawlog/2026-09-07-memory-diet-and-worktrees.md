# flawlog · 2026-09-07 · memory diet, scripts naming, worktrees · run cclio-memory-bridge

- handoff-store `ingest` deletes with `rm` and i piped its print to /dev/null → the halt8 CST died unread; META reconstructed from a peek, the tail lost · cost: one CST · lesson: the store should `trash` (recoverable) — needs code, ~3 lines in `script/lib/handoff-store.ts` + its test; and «an ingest is never silenced» belongs in x:handoff-ingest
