---
name: browser-mcp-per-project
description: BROWSER_MCP is disabled globally on purpose; add it to the project-local .claude config when building web apps.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8ea12526-5405-4c3b-8de4-519b32e3e1d8
  modified: 2026-08-16T22:30:39.911Z
---

Browser control (`claude-in-chrome`) is switched off in Dima's global config deliberately, and only
he can flip it. When work needs it, do not
re-enable it globally — add it to the current project's local `.claude` config instead, and
do so autonomously without asking.

**Why:** needing a browser MCP is a reliable signal you are inside a web-app project. Scoping it
there keeps every unrelated session free of a tool it will never call, while the projects that do
need it get it without a round-trip.

**How to apply:** building or debugging a web app and you want browser control → write the server
into that repo's local `.claude` config, not the global one. Global stays off.
