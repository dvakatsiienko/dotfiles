# .dotfiles

Personal macOS dotfiles: shell/git/terminal configuration plus the Claude Code
workflow layer (`home/.claude/`) — sline, the plugin-x, and agent docs.

## Language

### Sline

**Sline**:
This repo's implementation of Claude Code's statusline feature — the Go binary, its state file, and the settings wiring, as one subsystem.
_Avoid_: statusline (that names the official CC feature slot sline plugs into)

**Segment**:
The smallest self-contained unit of the rendered line. A segment renders only when its data source provides its field; otherwise it is omitted entirely.
_Avoid_: widget, block, part

**Alert**:
An active fault rendered in the alert segment that closes line 1 — the single place any fault appears, at one of two levels (`warn`, `crit`). The label states the fault in words; colour only reinforces it.
_Avoid_: error state, badge, marker

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

### Artifact shelf

**Shelf**:
`~/.claude/shelf/` — the consolidated store for artifacts our skills produce for internal, throwaway-to-mid-term use (not config, not code). One subdirectory per artifact family: `shelf/handoffs/`, `shelf/transcripts/`. Lives outside any git repo.
_Avoid_: store (collides with redux/app stores mid-project), stash (collides with git stash)

**Transcript**:
A shelved text extraction of a video — the artifact the `transcript` skill family produces and recalls. Source-agnostic term: YouTube today, possibly other sources later.

### Sessions & handoffs (shared with plugin-x)

**Session**:
One Claude Code conversation — a registry entry and a peer-messaging endpoint.

**Session label**:
Sline's rendered form of a session's name — kebab-cased and truncated.

**Peer socket**:
A session's inbound message endpoint at `/tmp/cc-socks/<pid>.sock`.

**CST (Continuation State Transfer)**:
The machine-optimized context package one thread produces so another thread — in any handoff frontend — can continue it. Defined once in `CST-SPEC.md`.

**Handoff frontend**:
A surface that can produce or ingest CSTs — the `cc` `handoff*` skills, or `cw` via the `handoff` MCP server.
_Avoid_: naming one frontend when the statement holds for all

**Handoff store**:
`~/.claude/handoffs/` — the directory all handoff frontends share. Files are transient: deleted on ingest (`-shared` kept), swept after 24h.

**Pending handoff**:
A CST file in the handoff store awaiting ingest. The handoff skill family and the `cw` MCP server own its lifecycle; sline's 📬 only observes.
