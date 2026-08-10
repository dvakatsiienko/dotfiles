---
name: handoff-prune
description: Wipe all pending handoff CSTs from the shared handoff store. Use when the user types /handoff-prune or asks to clear/prune pending handoffs.
---

# Handoff-prune (Desktop)

Requires the local `handoff` MCP server (Settings → Developer → Local MCP servers). If its tools are unavailable, say so in one line and stop.

Call `prune_handoffs` and relay its one-line result. No confirmation dance — pending handoffs are disposable by design.
