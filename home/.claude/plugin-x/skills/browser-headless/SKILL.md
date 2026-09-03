---
name: browser-headless
description: Load BEFORE any browser check of a web app in a cli-born session — «verify in a browser», «does it render», «screenshot», «hover», «check the console», «test at mobile width» — and before writing any playwright or puppeteer script.
---

# browser-headless — `agent-browser` is the fleet's headless browser

The binary is on the mac (`brew "agent-browser"` in the Brewfile), drives the system Chrome
through a daemon, and ships its own agent guide. **The HOW is one command, always
version-matched — read it before the first verb:**

```bash
agent-browser skills get core --full
```

## the split — which browser when

- **`agent-browser`** — every loop, hover sweep, measurement, console/network tail, multi-viewport
  proof, element screenshot. Attach costs ~30 ms per call, so many small calls are the right
  shape; one daemon survives across separate Bash calls.
- **the desktop Browser pane** (`mcp__Claude_Browser__*`) — exists only in a session the Code tab
  created; a cli-born session never has it. Where it exists it is Dima's window and a one-shot
  probe; a hidden pane does not lay the page out, so charts render blank there.
- 🚫 no playwright/puppeteer scripts from memory: cold start ~700 ms per run, a version-pinned
  browser cache, and nothing the verbs above do not already cover. Escape hatch when a script is
  truly needed: playwright `connectOverCDP` onto `agent-browser get cdp-url`.
- 🚫 no browser mcp — cli only, the resident schema is not worth it.

## habits

- `--json` on every verb when the output feeds a decision.
- a chart or layout check runs at 390 / 768 / 1280 wide, and reads the console after.
- a coder writes «verified in agent-browser: <what, at which widths>» in its report, or says
  «unverified in a browser» — never silence.

Research behind the pick: `docs/research/headless-browser-tool.md` (dies when this skill is in use).
