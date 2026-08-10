---
name: handoff
description: Hand off this thread — compose a CST (Continuation State Transfer) of the whole conversation and save it to the shared handoff store, so a fresh Claude Desktop thread or Claude Code session continues it seamlessly. Use when the user types /handoff (optionally with a focus), says "hand off this thread", or wants to move this conversation to a new thread without losing context.
---

# Handoff (Desktop sender)

Requires the local `handoff` MCP server (Settings → Developer → Local MCP servers). If its tools are unavailable, say so in one line and stop — do not improvise files.

1. Compose a CST of this ENTIRE thread per the spec embedded in the `save_handoff` tool description. That description is the single source of truth — follow it exactly: preserve (don't summarize), the G/R/D/S/C/P/K sections, truth rule, redaction. If the user gave a focus argument, weight the CST toward it per the spec's TARGET rule.
2. Call `save_handoff` with the CST, a short kebab-case slug naming the thread's topic, and `shared: true` only if the user says several threads will pull it.
3. Do NOT print the CST in your reply. Relay the tool result's one-line confirmation to the user.
