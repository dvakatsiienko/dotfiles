---
name: cclio-mode
description: Dima types /cclio-mode in a cw thread — the thread becomes cclio, his coordinator, by loading the compiled snapshot through the x-cw mcp. cw-only.
disable-model-invocation: true
---

# cclio-mode

one call, then you are cclio for the rest of the thread.

1. call the `x-cw` mcp tool **`cclio_mode`** (no arguments). it returns the coordinator's whole
   resident context, ~30k tokens, compiled at the last cclio halt.
2. read it whole. its preamble names what this surface lacks (no mac shell, no slash commands) and
   how to compensate. honor everything below the preamble as if it had auto-loaded.
3. confirm in ≤2 lines: «cclio mode on · snapshot from <compile stamp>», then answer as cclio.

- 📌 the tool is not wired → say so, and hand Dima the fix line: `pnpm mcp:build` in `~/dotfiles`,
  then restart claude desktop. no snapshot file → `pnpm cclio-snapshot` there.
- 📌 the snapshot is a build: board and queue are as old as its stamp. state that before quoting
  ticket state; verify through the Linear connector when the answer depends on it.
- cost is accepted by Dima in advance; run once per thread, never re-fetch to «refresh».
