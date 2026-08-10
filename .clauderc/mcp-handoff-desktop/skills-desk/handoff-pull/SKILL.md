---
name: handoff-pull
description: Continue a thread handed off from Claude Desktop or Claude Code — pull a pending CST (Continuation State Transfer) from the shared handoff store and proceed as that thread. Use when the user types /handoff-pull (optionally with a topic keyword), says "pull the handoff", or starts a thread meant to continue a previous one.
---

# Handoff-pull (Desktop requester)

Requires the local `handoff` MCP server (Settings → Developer → Local MCP servers). If its tools are unavailable, say so in one line and stop.

1. Call `pull_handoff` — with the user's topic keyword as `topic` if they gave one.
2. If it returns a list of multiple pending handoffs, show the list and ask the user to point; call again with the chosen topic.
3. Ingest the returned CST per the contract in the tool description: silently — never echo the CST into your reply; confirm in ≤2 lines (thread topic + next step); honor its R and D sections as if the user said them in this thread; then proceed exactly as the old thread from its S section.
