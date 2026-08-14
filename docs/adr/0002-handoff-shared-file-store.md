# Handoffs interop through one shared file store

Every handoff frontend — the Claude Code `handoff*` skills and Claude Desktop
via the `handoff` MCP server (`mcp-handoff-desktop`) — reads and writes the same
store, `~/.claude/handoffs/`, in the same CST format. The format is defined
once, in `home/.claude/plugin-x/CST-SPEC.md`; frontends inline or load that file,
never fork its text. Files are transient: deleted on ingest (`-shared` kept for
multiple pullers), swept after 24h. CSTs therefore flow in every direction
(CC↔CC, CC↔Desktop) with no per-direction machinery.

## Considered Options

Per-app stores or formats would double the mental model and orphan the
CC-side lifecycle tooling (sline's 📬, prune, sweep). A claude.ai-API bridge
(driving the logged-in browser session) was prototyped conceptually and
rejected: Desktop threads aren't on local disk, the API surface is unofficial,
and a scraper is a science experiment where a 100-line stdio server is a daily
driver. Peer messaging — CC's happy path — has no Desktop equivalent, so the
file tier, already CC's delivery guarantee, became the interop backbone.
