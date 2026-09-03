---
researched: 2026-09-03
sources-current-as-of: 2026-09-03
method: every version from `npm view <pkg> version`. top candidates installed in `/tmp/headless-eval` and smoke-tested against one local page carrying the layout hazard, a hover tooltip, a console line, a network call and an overlay covering the click target. every number below is wall clock on this mac, 3 runs each. star counts ignored.
dies-when: the pick is installed and its fleet shape (script + skill) shipped
---

# headless browser tool for llm coders

the incumbent is playwright 1.62.1, picked by inheritance. the coder's six wants are the only
scoring axis: persistent attachable browser · one-shot verbs for the common five · json out ·
install once shared everywhere · auto-waiting plus actionability diagnostics that name the blocker ·
cli, no mcp. plus the hazard: a page that does not lay out (`document.hidden` → resizeobserver never
fires → charts render blank).

## a. the field

versions, all checked today: `playwright` 1.62.1 · `puppeteer` 25.10.0 · `cypress` 16.0.0 ·
`agent-browser` 0.36.0 · `@playwright/mcp` 0.0.80 · `browser-use` 0.8.0.

- **`agent-browser` (vercel-labs, apache-2.0)** — a native rust cli over a rust daemon speaking cdp
  directly. no node, no playwright in the runtime path. it already ships every want as a verb:
  `snapshot` (aria tree with `@e1` refs), `screenshot <sel>`, `hover`, `console`, `network requests`,
  `--json` on everything. also `a11y`, `vitals`, `react tree`, `diff screenshot`.
  - cannot: file urls — `open file://…` returned `success:true` with the right title and the tab
    still sat on `about:blank`. serve over http instead. also: `chat` needs `AI_GATEWAY_API_KEY`,
    and the arg order is `screenshot <selector> <path>`, not `--selector`.
- **playwright** — the reference api, the best scripting surface, and the thing to attach *with*
  rather than drive from. cannot: run a verb without a script file, and its browser cache is version
  pinned — the 509 mb `~/Library/Caches/ms-playwright` here holds chromium 1194 while 1.62.1 demands
  1234, so "share the cache" breaks on every bump. want 4 fails as stated.
- **puppeteer 25.10.0** — attaches fast (below), api thinner than playwright, no locator
  auto-waiting worth the name, no cli. cannot: one-shot verbs, actionability diagnostics.
- **cypress 16** — a test runner. needs a config, a spec file and its own runner process; there is no
  ad-hoc "screenshot this selector" invocation and no attach-to-running. wrong shape, disqualified.
- **`browser-use` 0.8.0 / `@playwright/mcp` 0.0.80** — both put an llm or an mcp channel between the
  coder and the browser. mcp is ruled out by standing decision, and `browser-use` bills a model call
  per step. disqualified on want 6.
- **`chromium --remote-debugging-port` + a thin cli** — this is what `agent-browser` already is,
  written by someone else in rust. building it ourselves buys nothing.
- 🚫 brew's `playwright-cli` 0.1.19 stays a dead fossil. never install it.

⚖️ **verdict a — `agent-browser` 0.36.0 wins the want list outright; playwright stays as the
scripting escape hatch, not as the driver.**

## b. persistence, measured

same page, same operation (read one element's text), separate process each time, 3 runs:

- **`agent-browser`, daemon warm — 30 ms.** element screenshot 49–79 ms. hover 42 ms.
- **puppeteer `connect()` over cdp — 98 ms.**
- **playwright `connectOverCDP` — 820 ms.** slower than its own cold launch: it enumerates every
  target and context on attach. ~150 ms of it is just `import playwright`.
- **playwright cold launch — 700 ms warm-fs, 1746 ms on the first run** (matches the coder's ~1 s).
- node's own empty-process floor is 20 ms, so `agent-browser` is running near the shell's limit.

the daemon starts on the first command, persists across separate `Bash` calls, and idles out after
1 h (`--idle-timeout`). sessions isolate by key, and `session id --scope worktree` mints a stable
per-worktree id — exactly the fleet's bg-coder layout.

the escape hatch is real and was run, not assumed: `agent-browser get cdp-url` returns a live ws
endpoint, and `chromium.connectOverCDP` onto it landed in 344 ms and read the *same* page state the
cli had built. one browser, two drivers.

**the hazard is clear on both.** on `agent-browser`: `document.hidden=false`, resizeobserver fired,
`742x80`. on playwright headless: same. one playwright cold run out of four read the element before
the first ro callback landed and got `UNLAID-OUT` — a race against page boot, not a layout failure,
and one an explicit wait fixes. the separate-command model structurally avoids it, since every read
arrives long after load.

⚖️ **verdict b — attach is the whole game: 30 ms vs 700 ms, a 23× cut per call, and playwright can
still attach to the same browser when a script is genuinely needed.**

## c. the fleet shape

three options were on the table: a root-dotfiles devdependency plus `script/browser.ts` verbs · a
global install plus a slim `x:browser` skill · both.

the first option loses on its own premise. `agent-browser` is a 12 mb rust binary, not a node
library — wrapping it in `script/browser.ts` would add a ~40 ms node process in front of a 30 ms
call and re-import the cold-start tax the pick exists to delete. there are no mechanics left for a
script to hold; the cli *is* the mechanics, and it is already installable by `brew install
agent-browser` (homebrew-core, bottled, 0.36.0) — one install, on `PATH`, every project and every
worktree, no per-project dependency, no browser download (it drove the system chrome 152 and never
touched the daily profile: `--headless=new` in a temp `user-data-dir`).

so what is left to own is *when*, and that is a skill. it should be thin, because the tool serves its
own instructions: `agent-browser skills get core` prints a usage guide that always matches the
installed version. our skill points at that instead of copying it, so it cannot drift.

resident cost, the honest number: a skill description is paid in **every session, forever** — a
trigger line like «load when verifying in a browser, screenshotting a page, hovering an element, or
reading console/network» is ~40 tokens, ~0.02 % of a 200 k window. cheap, but it only earns that if
the description stays a trigger and the body carries everything else.

⚖️ **verdict c — option 2: `brew install agent-browser` plus a slim `x:browser` skill that holds
when-to-reach and defers the how to `agent-browser skills get core`. no `script/browser.ts`.**

## d. the five verbs

they already exist. this is the mapping the skill body should carry, not an interface to build:

```
browser shot <sel> [path]   → agent-browser screenshot <sel> [path]      # cropped to the element
browser hover <sel>         → agent-browser hover <sel> && agent-browser get text <tooltip-sel>
browser console             → agent-browser console [--json]             # + `errors` for uncaught
browser net                 → agent-browser network requests [--filter|--type|--status]
browser aria                → agent-browser snapshot                     # aria tree with @e1 refs
```

three notes worth keeping in the skill body:

- **the diagnostic is better than playwright's.** a click on a covered button returned: `element
  '#btn' is covered by <div#cover> at its click point, so the input would land on that element
  instead.` it names the blocker unprompted, with no script.
- **`batch` collapses a multi-step flow into one call** — `agent-browser batch "open <url>"
  "snapshot" "screenshot #chart"` — for when even 30 ms × 5 is worth folding.
- **`--json` is opt-in, not the default.** the skill should pass it by default; plain output is for
  humans reading the terminal.

⚖️ **verdict d — no cli to design. adopt the existing verbs verbatim and spend the effort on the
skill's when.**

## what this leaves open

- the skill has to be written, and `x:browser` needs the cw inclusion call at create time.
- `agent-browser` is 0.36.0 — pre-1.0, and the surface is wide enough that it will move. pin nothing,
  but re-read `skills get core` after an upgrade rather than trusting a cached copy.
- the file-url miss was found in five minutes of smoking. assume more edges exist and serve over
  http.
