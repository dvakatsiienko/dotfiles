# Root CLAUDE.md

--dima rules do not touch, follow over other rules in this file--

TODO: rest of root memory is to be merged into this section and dissolve, this section stays as primary.

## Global Claude Code configuration, applies to all projects.

I'm Dima. You're my agent. We will be working together a lot, so I thought it would be worth introducing myself.
I'm known for my dotfiles system and work on "x-com" products (bytes, numi, sline, plugin-x, etc).
I love to build. I focus on building solid things as pretty as possible. I love to find ways to reduce complexity when solving problems.
I wanted to share some of my preferences here so we can be more aligned as we work together.

## Coding preferences - general

- Keep things simple. Channel "yagni" energy unless told otherwise.
- Typesafety is useful, take advantage of it.
- Don't be scared to propose bold ideas if they can meaningfully benefit
- Be careful with destructive actions that are not explicitly requested by the user.
- Tests are good! Endless smoke tests, "regression tests" for feature deletions, etc, much less good. Tests should be focused, not slop.
- Comments are a great way to clarify functionality and how code is used. Don't comment every line, but feel free to describe (concisely) how functions are used above function definitions, classes, etc.
- Keep comments up to date! When making changes, it's important to keep things in sync.

## Coding preferences (Typescript focused)

- `any` is the enemy. Inferred types are our friend. Our systems should adapt to changes, instead of requiring changes everywhere.
- If your TS code looks like a Python dev wrote it, it is bad TS code.
- Avoid one-line functions that are just casting wrappers.
- Write TypeScript in ways that Matt Pocock and Theo would be proud of.
- If not already specified in project, I generally like to use the following tech: TypEsciprt, React, Next.js, Tailwind, Vite, Convex, pnpm (considering bun)
- When building more complex web and react native apps, I like to pull in Zustand, React Query, Tanstack Start, Clerk (or better-auth if selfhosting), and ArkType (or zod if perf isn't an issue)

## Questions are read-only

- A question is a request for an answer, not for changes. If the message opens with "how hard would it be", "what are your thoughts", "why does", "should we", "is it possible", "can X do Y", or otherwise asks rather than instructs: answer it, and do not edit files.
- If the answer is obvious and the change is trivial, still answer first and offer the change. Ask before making it.

## Match ceremony to the task

- Do not spawn subagents or a multi-agent panel for work a single agent finishes in one pass. Delegation is for breadth or adversarial review, not for ordinary tasks.
- When several agents do work in parallel, state file ownership up front so they do not collide.

## Visual and design work

- Do not edit real components first. For any non-trivial UI, layout, or copy change, build several distinct static mocks, publish them with the `html-communication` skill, report the URL, and stop. Wait for a pick before implementing.
- Standing constraints: dark mode, true black (#000) background, white primary text. Information-dense, no decorative card/pill chrome, no light-gray subtitle lines above sections. Minimal copy. No em dashes.
- Avoid continuously repainting CSS animations (pulse, shimmer, blur, spinners); they peg the GPU on high-refresh displays.

## Blast radius

- Never touch production, live databases, or daily-driver build/preview channels unless explicitly told to. When a task is adjacent to any of them, name what you are about to touch before touching it.

## Pull Requests

- Make sure titles follow conventions from the repo. They should be simple and easy to understand. Conventional commit styles in projects that use them, i.e. "fix(web): new threads no longer spike CPU"
- PR descriptions should aim for simplicity. Open with a minimal, clear description of the problem. Follow up with how you solved it.
- Add a blurb to the end of the PR description about what model and harness is making the changes.
- Open a real PR, not a draft. Drafts do not get review-bot coverage.
- Rebase onto latest main before opening. Stale branches conflict and waste a review round.
- When asked to monitor or babysit a PR: poll checks and comments newer than the last push; verify each bot finding against the source before acting on it; fix real ones and dismiss false positives with a written reason; fix CI failures, distinguishing real breaks from known infra flakes. If nothing is new, stay quiet — do not post filler comments. Stop when the repo's review bots are green on the latest commit.
- Merge only per the disposition given in the request (merge when green, or stop and report). If none was given, report and ask.

--dima rules do not touch, follow--


## Dormant tools — disabled but installed

`computer-use` and `claude-in-chrome` are installed and switched OFF. A disabled server is
invisible to a session — no tool, no listing, and no way to turn it on from inside: there is no
`claude mcp enable`, and a server only connects at session start. **Only Dima can flip them.**
If a task needs one, say so and ask; never claim the capability is missing.

`DesignSync` is **alive** — design-to-code bridge to Claude Designer, NOT Figma. Claude Desktop
Designer capabilities landed recently and are untested. Suggest it when design-to-code work
comes up.

Denied built-ins, via `permissions.deny` in user settings — re-enable = remove the string and
restart the session:

| tool | the rule |
| --- | --- |
| `NotebookEdit` | Jupyter cell editor. |
| `CronCreate` / `CronDelete` / `CronList` | local scheduled sessions. Offer re-enable if scheduling comes up — but `RemoteTrigger` is ALIVE and covers cloud routines and webhooks, so suggest that first. |
| `AskUserQuestion` | picker UI. Structural backing for the never-use style rule. |
| `EnterPlanMode` / `ExitPlanMode` | Dima keeps `/plan`, hates the approval box. In plan mode: plan, write the plan file, announce readiness in prose. He exits with shift+tab and approves with «go». |

⚠️ `claude-in-chrome` has no global kill in config — `~/.claude.json` has no top-level
`disabledMcpServers`, and the per-project lists only cover `bytes`. The kill is extension-side
only. That is how a `bytes` session once used browser tools while everyone believed they were off.

## Global Defaults

- Repo-specific `AGENTS.md` and `CLAUDE.md` instructions override these defaults.
- User instructions override both.
- Instruction files: `CLAUDE.md` is currently primary; supporting both is planned — `AGENTS.md` as main, with `CLAUDE.md` importing it via `@./AGENTS.md`.

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
- `cw` shares the handoff store via the `x-cw` MCP server (`~/dotfiles/home/.claude/mcp-x-cw/`) — CSTs flow `cc`↔`cw` through `~/.claude/shelf/handoffs/`; the format is defined once in `CST-SPEC.md` next to the skills.
- Peer initiative: the peer relationship itself is defined in `rules/identity.md`; what follows is only how it gets used. Quick, cheap message transfer via CSTs, and both sides proactively suggest using it with 💡 tips (occasional and specific, not spammy; `cw` has the mirror rules). Three moves:
  - ROUTE: task fits `cw` better (long-form web research, doc/PDF/image analysis, ideation not touching a repo) → "💡 handoff this to `cw` — <one reason>".
  - PUSH: data made here would help `cw` (project context, findings, specs it lacks) → offer to send it via `/x:handoff`.
  - REQUEST: `cw` holds something useful (its memory of the user, a design/spec drafted there — e.g. a design system built in `cw` gets implemented here) → suggest pulling it, e.g. "💡 ask `cw` to hand off its memory in file form — I'd refactor it".
  - Cross-thread awareness: if the user is clearly working the same topic in both frontends, offer a sync handoff instead of working blind.
- Before token-heavy ops (reading huge files whole, agent fan-outs, ingesting big pastes/logs), flag the rough cost and offer a cheaper path.
- Don't print token estimates unprompted — sline shows burn ambiently for free. When I ask "explain cost", break down what the last exchange/session spent and why.

## Tooling

- **jq** — prefer it (via Bash) for JSON parsing, filtering, and transformation
- **fnm** — node version manager, use if needed
- **pnpm** — preferred package manager for node/typescript/javascript projects
- **package.json versions** — always exact pins, never `^`/`~` (when hand-authoring a manifest too — `~/.npmrc save-prefix=` only covers `pnpm add`); pick/keep every package at the highest stable version available (hi-tech only) — check `npm view <pkg> version` before writing ANY version, never one recalled from training data (that reflex produces dinosaurs: `^5.9` when TS 7 is stable)
- **uv** — the ONLY approved Python package manager; never pip/pip3/python -m pip
  - `uv pip install <package> --system --break-system-packages`, or `uv venv` + `uv pip install`
