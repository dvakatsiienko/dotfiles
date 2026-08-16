# Root CLAUDE.md

Global Claude Code configuration, applies to all projects.

## Config Layout — symlinks into ~/projects/dotfiles

- Actual CC config lives in `~/projects/dotfiles/home/.claude/`; the default `~/.claude/` locations are symlinks to it: `CLAUDE.md`, `settings.json`, `hooks/`, `commands/`, `themes/`, `sline` (plus `.claude.json` → `~/.claude.json`).
- Never Edit/Write through a symlink — CC refuses with "Refusing to write through symlink". Resolve first (`readlink -f <path>`) and edit the real target under `~/projects/dotfiles`.

## Codenames — the three Claude surfaces

- `cc` — Claude Code, this CLI, running locally on the Mac.
- `cc cloud` — a Claude Code session running on Anthropic's machines, not the Mac. Started from the Claude Desktop «code» tab, `claude --cloud`, the web, or a GitHub Actions run. Works with the Mac asleep. Thinner than local `cc`: no global `~/.claude` config, no `plugin-x` skills, no Desktop Commander. Neither `cc` nor `cw` can spawn one — a human or a GitHub event starts it (settled 2026-08-15, DOT-48).
- `cw` — Cowork: the cloud-side session that reaches the Mac over the device bridge. Settled 2026-08-15 (DOT-47); "desk"/"desktop" is RETIRED as a codename — use `cw` in all prose. Rejected: `cd` (shadows the shell builtin), `c` (reads as a `cc` typo, ungreppable), `ca` (collides with Certificate Authority — this repo ships `.ssh/config` + `allowed_signers`).
- Real product names stay as-is: "Claude Desktop" the app, and the Desktop Commander MCP server.

## Dormant tools — disabled but installed

Capabilities that exist but are switched OFF. If a task needs one, say you HAVE it disabled and offer to enable (`/mcp enable <name>`, per-project) — never let Dima hunt for an external replacement of something already installed.

- `computer-use` — full desktop control: screenshots, mouse/keyboard, any native macOS app. Server stays connected with tools DEFERRED — 0 resident tokens until summoned via ToolSearch (screenshot burn ~1–1.5k/capture still applies when used). Policy-dormant: suggest it proactively when a task needs desktop driving; no disable ritual needed anymore (deferral made it free).
- `claude-in-chrome` — full Chrome automation: tabs, clicks, forms, DOM/console/network reads, page JS, GIF recording (~2.5k est. tokens when live). Rarely used (~1×/month). Global kill = extension side; `/mcp` toggle is per-project. NOT superseded by computer-use: computer-use treats browsers as read-only (clicks/typing blocked) — this is the only tool that can act inside Chrome, and it's DOM-based (cheap text reads, no screenshot burn). Same enable-on-demand / push-to-disable lifecycle as computer-use.
- claude.ai connectors (Gmail, Google Calendar, Google Drive, GitHub, Linear, Notion, Slack, Vercel, Jobs and Careers) — HARD-DISABLED in CC via `disableClaudeAiConnectors: true` (settings.json, 2026-08-13); Dima evaluating standalone Vercel/Linear installs vs re-enabling. `cw` unaffected — but ticketing there now runs the `linear` CLI via Desktop Commander (`cw` pm skill), not connectors.
- `DesignSync` — ALIVE (re-enabled 2026-08-13): design-to-code bridge to **Claude Designer** (NOT Figma — earlier description was wrong; Dima doesn't use Figma). Dima plans to use Claude Designer soon — suggest DesignSync when design-to-code work comes up.
- Denied built-in tools (via `permissions.deny`, user settings): `NotebookEdit` (Jupyter cell editor), `CronCreate/CronDelete/CronList` (local scheduled-session plumbing — offer re-enable if scheduling comes up; note: `RemoteTrigger` stays ALIVE and covers cloud routines/webhook triggers, so suggest it first for "scheduled/event-triggered agent" asks), `AskUserQuestion` (picker UI — structural backing for the never-use style rule), `EnterPlanMode`/`ExitPlanMode` (plan-mode approval boxes — Dima keeps /plan but hates the box; in plan mode: plan + write plan file as usual, announce readiness in prose, Dima exits via shift+tab and approves with «go»). Re-enable = remove from the deny array + session restart.
Maintenance: whenever an MCP/connector is enabled or disabled, update this list in the same turn. Watch for divergence proactively: if observed reality contradicts this list (a "dormant" tool's tools are live in context, a listed-as-live one is missing, or `disabledMcpServers` in `~/.claude.json` disagrees), flag it and sync the registry immediately — a stale registry is worse than none. Doctor runs verify it wholesale.

## Global Defaults

- Repo-specific `AGENTS.md` and `CLAUDE.md` instructions override these defaults.
- User instructions override both.
- Instruction files: `CLAUDE.md` is currently primary; supporting both is planned — `AGENTS.md` as main, with `CLAUDE.md` importing it via `@./AGENTS.md`.

## Aliases

- **`cute`** = Claude (whenever prompted with "cute", interpret as "claude")

## Information Lookup

<!-- claude_do_not_touch TODO include grep-mcp claude_do_not_touch -->

For library/framework/SDK questions, prefer in this order (explicit user instructions override):

1. **context7 MCP** — official library documentation
2. **grep-mcp** (`searchGitHub`) — real-world usage examples across GitHub repos
3. **Web search/fetch** — fallback for current events or anything the above misses

## MCP Spec Shift (2026-07-28)

There are now two MCP generations: the legacy stateful spec (sessions, `initialize` handshake, HTTP+SSE) and the stateless `2026-07-28` spec (self-contained requests, MRTR, extensions framework). Deprecated legacy features sunset ~mid-2027.

- When researching, picking, or building an MCP server, always check which spec it targets — prefer `2026-07-28` implementations, treat old-spec-only *remote* servers as a staleness signal (local stdio servers are unaffected)
- If an installed MCP server is old-spec and a new-spec version of it is available, flag the upgrade to me proactively

## CLAUDE.md Maintenance

- Delete stale info on sight — outdated content is worse than missing content; this file reflects the current state of the system, not its history
- Edit only the CLAUDE.md matching the current working scope: project dir → project CLAUDE.md, `~/.claude` → this file
- Modifying this global file from a project context requires an explicit request

## Core Principles

- Naming convention, subject-first: `<entity>-<qualifier/verb>`, never verb-first — `handoff-delete`/`handoff-create`/`skills-cw`/`plugin-x`, NOT `delete-handoff`/`create-handoff`/`cw-skills`/`x-plugin`. Applies to everything that can grow into a family: variables, folder names, entity names (skills, commands, tools) — siblings then sort/group by subject.

- NEVER proactively create documentation files (\*.md) or README files unless explicitly requested
- Never write description comments or docstrings for functions/methods unless genuinely needed
- Don't hesitate to delete dead code (obvious or not) during task execution
- Never spin up a local dev server (e.g. `next dev`) after finishing a task — I do this myself if needed
- Use tsc to catch type errors where the project's TypeScript is healthy (script name varies); skip it for projects with broken TS — their CLAUDE.md will say so. Prefer IDE type info when connected to Cursor.
- Only commit changes when explicitly requested
- Clean up after operations: delete obsolete artifacts, backups, and /tmp files you created

## Background work — offload, announce, watch

**Never block the foreground on a wait.** Poll loops, deploy/CI watches, long builds, test
suites, `until`-loops, anything that sits there. Offload it to a background shell
(`run_in_background`), a `Monitor`, or a subagent, and keep talking to me. Two failures come
from blocking, and both are bad:

1. You cannot notice your own script is stuck — you are inside the wait.
2. I cannot reach you. My prompts only queue while you hang.

**Announce every offload with sound.** macOS `afplay`, fire-and-forget, never blocking:

| moment | command |
| --- | --- |
| routine launched | `afplay /System/Library/Sounds/Blow.aiff >/dev/null 2>&1 &` |
| routine finished clean | `afplay /System/Library/Sounds/Glass.aiff >/dev/null 2>&1 &` |
| routine failed or was killed | `afplay /System/Library/Sounds/Basso.aiff >/dev/null 2>&1 &` |

All three verified present and audible on this Mac (2026-08-16).

**Watch what you spawn.** A spawned routine is yours until it resolves — never fire and forget
the *supervision*, only the sound.

- Give every wait a deadline. When it passes, stop waiting and report — do not extend silently.
- A wait loop must confirm the thing it waits for actually **started** before it can report
  success. Checking for "Building" before the build was even queued once had me report a deploy
  green that had never happened.
- Distinguish the three ends: finished clean, failed, still running past deadline. "No output"
  is not success.
- Report a hard failure or a stuck routine the moment you see it, with what you know — never
  fold it into a later summary.

## Artifacts + Dataviz — use proactively

- Artifacts are UNDER-USED — push them. When a deliverable has an audience or a visual shape (report, comparison, plan, architecture overview, anything chart-able), proactively offer to publish it as an Artifact instead of dumping terminal text: "💡 this'd land better as an artifact — want one?" Occasional and specific, same etiquette as handoff tips.
- Any data with numbers worth comparing → offer a `dataviz`-skill chart inside the artifact.
- Terminal prose stays the default for quick answers; artifacts are for things Dima might reread, share, or scan visually.

## Token Thrift + Session Handoff

- On long threads, proactively suggest `/x:handoff` + fresh session when continuing/resuming would burn more window than transferring (resuming a long thread re-reads its whole history uncached ≈ up to ~20% of a 5h window). Orientir: clear at ~80k tokens when active; hand off at any size before going idle >1h (cache TTL).
- `cw` shares the handoff store via the `handoff` MCP server (`~/projects/dotfiles/home/.claude/mcp-handoff-cw/`) — CSTs flow `cc`↔`cw` through `~/.claude/handoffs/`; the format is defined once in `CST-SPEC.md` next to the skills.
- Peer initiative: `cc` and `cw` are peers on a two-way bridge — quick, cheap message transfer via CSTs — and both sides proactively suggest using it with 💡 tips (occasional and specific, not spammy; `cw` has the mirror rules). Three moves:
  - ROUTE: task fits `cw` better (long-form web research, doc/PDF/image analysis, ideation not touching a repo) → "💡 handoff this to `cw` — <one reason>".
  - PUSH: data made here would help `cw` (project context, findings, specs it lacks) → offer to send it via `/x:handoff`.
  - REQUEST: `cw` holds something useful (its memory of the user, a design/spec drafted there — e.g. a design system built in `cw` gets implemented here) → suggest pulling it, e.g. "💡 ask `cw` to hand off its memory in file form — I'd refactor it".
  - Cross-thread awareness: if the user is clearly working the same topic in both frontends, offer a sync handoff instead of working blind.
- Before token-heavy ops (reading huge files whole, agent fan-outs, ingesting big pastes/logs), flag the rough cost and offer a cheaper path.
- Don't print token estimates unprompted — sline shows burn ambiently for free. When I ask "explain cost", break down what the last exchange/session spent and why.

## Conversational behaviour

Three layers, edited there and never here:

- **Shape** — typography, emoji placement, link formats, question rounds, reply skeletons —
  lives in `home/.claude/rules/voice-formatting.md`, loaded in every session under every style.
  Output styles cannot import or extend each other (`docs/research/output-style-extension.md`),
  so shared rules live in `rules/`, not duplicated per style.
- **Casing** — lowercase rule, the never-flatten table, and the 🧪 LAB section of layers under
  test — lives in `home/.claude/rules/comms-casing.md`, loaded the same way. Was a skill until
  2026-08-16; a skill had to be remembered and got missed, so it became an always-loaded rule.
  Golden prompt (Dima's verbatim intent): `docs/research/comms-casing.md`.
- **Voice** — register only — lives in the output styles: `home/.claude/output-styles/output-fun.md`
  (default) and `output-ELI5.md` (fried-brain mode). Selected via `outputStyle` in settings.json
  or `/config`; a change takes effect on a new session.

Budget: shape under 3k tokens, each voice file under 400.

## Tooling

- **jq** — prefer it (via Bash) for JSON parsing, filtering, and transformation
- **fnm** — node version manager, use if needed
- **pnpm** — preferred package manager for node/typescript/javascript projects
- **package.json versions** — always exact pins, never `^`/`~` (when hand-authoring a manifest too — `~/.npmrc save-prefix=` only covers `pnpm add`); pick/keep every package at the highest stable version available (hi-tech only) — check `npm view <pkg> version` before writing ANY version, never one recalled from training data (that reflex produces dinosaurs: `^5.9` when TS 7 is stable)
- **uv** — the ONLY approved Python package manager; never pip/pip3/python -m pip
  - `uv pip install <package> --system --break-system-packages`, or `uv venv` + `uv pip install`
