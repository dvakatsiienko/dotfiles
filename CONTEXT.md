# .dotfiles

Personal macOS dotfiles: shell/git/terminal configuration plus the Claude Code
workflow layer (`.clauderc/`) — sline, the x-plugin, and agent docs.

## Language

### Sline

**Sline**:
This repo's implementation of Claude Code's statusline feature — the Go binary, its state file, and the settings wiring, as one subsystem.
_Avoid_: statusline (that names the official CC feature slot sline plugs into)

**Segment**:
The smallest self-contained unit of the rendered line. A segment renders only when its data source provides its field; otherwise it is omitted entirely.
_Avoid_: widget, block, part

**Quota window**:
A subscription rate-limit period — the 5h window or the weekly window.
_Avoid_: bare "window" (ambiguous with context window)

**Context window**:
The model's token budget for one session, as reported by Claude Code.
_Avoid_: bare "window"

**Severity bar**:
A cell bar whose filled cells are colored along a green→red ramp by the percentage it displays.
_Avoid_: progress bar (nothing is progressing)

**Value gauge**:
The `~$` segment — the API-equivalent value of a session's tokens on a subscription. Not money spent; the `~` marks it as such.
_Avoid_: cost, spend

**Rollover**:
A quota window resetting while the session sits idle.

**Stale-quota guard**:
Rendering 0% instead of the pre-reset percentage once a quota window's reset time is in the past.

**Sline state file** (`sline-state.json`):
A disposable cross-render cache (emoji rotation, pnpm version). Deletable at any time without harm; never git-tracked.
_Avoid_: sline-db, database

### Sessions & handoffs (shared with x-plugin)

**Session**:
One Claude Code conversation — a registry entry and a peer-messaging endpoint.

**Session label**:
Sline's rendered form of a session's name — kebab-cased and truncated.

**Peer socket**:
A session's inbound message endpoint at `/tmp/cc-socks/<pid>.sock`.

**CST (Continuation State Transfer)**:
The machine-optimized context package one session produces so another session can continue its thread.

**Pending handoff**:
A CST file in `~/.claude/handoffs/` awaiting ingest. The pull-handoff skill owns its lifecycle; sline's 📬 only observes.
