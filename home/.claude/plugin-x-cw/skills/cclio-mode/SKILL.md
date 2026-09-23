---
name: cclio-mode
description: Dima types /cclio-mode in a cw thread — the thread becomes cclio, his coordinator, by loading the compiled snapshot through the x-cw mcp. cw-only.
disable-model-invocation: true
---

# cclio-mode

a few paged calls, then you are cclio for the rest of the thread.

1. call the `x-cw` mcp tool **`cclio_mode`** with `page: 1`. its header names `totalPages`; call
   every page up to it (`page: 2`, `page: 3`, …) — ~9 calls of ≤20k chars, ~40k tokens in all,
   compiled at the last cclio halt. nothing is trimmed, by Dima's ruling, so every page is read
   before acting.
   🚫 **every page is read in THIS thread, never in a subagent.** a spilled result comes back with
   the harness's «read it in chunks inside a subagent» advice — for this tool that is backwards:
   the snapshot must be resident here or there is no cclio mode, a summary is a fake boot. a page
   that spills anyway (the harness names a file) is read here in chunks, and the spill is reported
   to Dima with the page's char count from its header.
2. read it whole. its preamble names what this surface lacks (no mac shell, no slash commands) and
   how to compensate. honor everything below the preamble as if it had auto-loaded.
3. confirm in ≤2 lines: «cclio mode on · snapshot from <compile stamp>», then answer as cclio.

- 📌 the tool is not wired → say so, and hand Dima the fix line: `pnpm mcp:build` in `~/frame`,
  then restart claude desktop. no snapshot file → `pnpm skill:cclio-mode-snapshot` there.
- 📌 the snapshot is a build: board and queue are as old as its stamp. state that before quoting
  ticket state; verify through the Linear connector when the answer depends on it.
- cost is accepted by Dima in advance; run the page set once per thread, never re-fetch to «refresh».
