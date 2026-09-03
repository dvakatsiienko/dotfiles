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
- 🚫 no playwright/puppeteer, ever — not installed anywhere in the fleet by decision (2026-09-03):
  cold start ~700 ms per run, a version-pinned browser cache, and nothing the verbs above do not
  already cover. A flaky element wants `wait <sel>` then the action, never a script.
- 🚫 no browser mcp — cli only, the resident schema is not worth it.

## hazards — measured on a chart app, 2026-09-03

- ⚠️ **an unknown flag is swallowed as a positional arg and reports success** — `screenshot
  out.png --selector x` wrote a png named `--selector` into the cwd with a green ✓. verbs are
  positional: `screenshot <selector> <path>`. check `--help` for the verb before a first use.
- **`click` does not auto-wait** — it fails in 20 ms on an element still loading. `wait <sel>`
  first, then act.
- **`eval` shares one page scope across calls** — a second `const p` dies as «already declared».
  wrap every eval in an IIFE.
- **token bombs:** `network requests` unfiltered ≈ 11k tokens, `snapshot -i` ≈ 6.5k on a dense
  page. always `--filter`, always scope to a selector.

## habits

- `--json` on every verb when the output feeds a decision.
- a chart or layout check runs at 390 / 768 / 1280 wide, and reads the console after.
- a coder writes «verified in agent-browser: <what, at which widths>» in its report, or says
  «unverified in a browser» — never silence.

Research behind the pick: `docs/research/headless-browser-tool.md` (dies when this skill is in use).
