# Cowork (cw): execution model and capabilities

Empirically probed 2026-08-15 from a Cowork session in this repo's project. Every claim marked
**[verified]** was executed, not read. **[docs]** means asserted by Anthropic documentation only.
This file supersedes the earlier assumption that cw is always a detached cloud sandbox.

## The core correction

A Cowork session started from the desktop app runs **locally** — session id prefix `local_…`
**[verified]** via `session_info.list_sessions`. Within one such session there are two execution
surfaces, and they are **not** two disjoint filesystems:

| Surface | Runs on | Sees |
|---|---|---|
| `Read` / `Write` / `Edit` file tools | the Mac, natively | real `~/projects/...` paths |
| `workspace.bash` | Ubuntu 22.04 aarch64 VM | `/sessions/<name>/mnt/*` bind-mounts of the same folders |
| Desktop Commander MCP | the Mac, zsh, full shell | everything, as `dima` |

A file written from the sandbox at `mnt/dotfiles/x` is immediately readable on the Mac at
`~/projects/dotfiles/x` **[verified]**. The mounts are a view of the real folder, not a copy.

The genuinely detached, Mac-independent surface is Claude Code's `--cloud` session, not this.

## Sandbox facts [verified]

- Ubuntu 22.04.5, aarch64, 4 vCPU, 3.8 GiB RAM, 9.6 GiB root + 9.8 GiB `/sessions`.
- `/sessions` **persists across bash calls**; only cwd and env do not carry over.
- Preinstalled: node 22.22.3, npm 10.9.8, python 3.10.12, git 2.34.1, jq, ripgrep, curl.
- **Missing: pnpm, gh, go, rust, deno, bun, fd, docker.**
- Node is **22**, this repo's `engines` floor is **>=24**. `pnpm test` / `dotfiles-link` cannot be
  validated from the sandbox — run them through Desktop Commander (Mac node is 24.12.0).
  `node --experimental-strip-types` does work under 22, so single files still run.

### Mount permission quirk

The mounts are **create/write/append/truncate — but not unlink**. `rm` and `rmdir` return
`Operation not permitted` **[verified]**. An agent can therefore make a mess in the sandbox that
it cannot clean up from the sandbox. Delete via Desktop Commander (real Mac shell) instead.

### Network is a proxy allowlist, not open egress [verified]

All traffic goes through `HTTP_PROXY` / `ALL_PROXY` on `localhost`. Reachable: `registry.npmjs.org`,
`github.com`, `pypi.org`, `claude.com`. Blocked (`000`): `api.github.com`, `example.com`,
`cdn.jsdelivr.net`. So `npm install` works, arbitrary HTTP does not.

Git over **SSH** fails from the sandbox — `Host key verification failed`, no keys, no known_hosts.
Notably the sandbox git has **no `commit.gpgsign` config**, so the 1Password Touch ID wall that
blocks Mac-side commits does not exist here — but push is gated by the proxy instead.

## Artifacts [verified]

Persisted HTML pages in the sidebar that survive across sessions and re-fetch on open. A probe
artifact (`cw-bridge-probe`) confirmed all three bridge APIs:

- `window.cowork.callMcpTool(name, args)` — **works**, ~650 ms against the Linear MCP.
  Returns `{content:[{type:'text',text}], isError}`. **`structuredContent` was absent** — always
  parse `r.structuredContent ?? JSON.parse(r.content[0].text)`.
- `window.cowork.askClaude(prompt, data[])` — **works**, ~6 s (Haiku). Returns an **object, not a
  string**; stringify before rendering.
- `localStorage` — **works** and persists.

Only tools listed in `mcp_tools` at creation are callable. Page network is blocked except three
exact pinned CDN URLs (Chart.js 4.5.0, Grid.js 5.0.2, Mermaid 11.15.0) — everything else inline.
`verify_artifact` returns a debug log with `resultShape` summaries, which is the fastest way to
learn an MCP tool's real output shape.

## Projects [docs, re-confirmed 2026-08-15]

Cowork projects are **local only by design** — "Projects live on your computer. They aren't synced
to the cloud or shared with other people." They can hold local folders but cannot be shared.
claude.ai Chat projects are the inverse: shareable on Team/Enterprise, cannot hold local folders.
A claude.ai project can be *linked* into a Cowork project for knowledge without merging.
The `Visibility → Local` radio with one option is scaffolding, not a plan gate.

A project bundles six things: description (Dispatch reads it to route tasks), folders, standing
instructions, reference links, linked claude.ai projects, and a **project-scoped memory store that
persists across sessions**. Three creation paths: from scratch, import a claude.ai project, or
point at an existing folder — this repo's project is the third.

Quirks worth knowing:

- Dragging in a **file** copies it into the project's first folder; dragging in a **folder** mounts
  it as an additional project folder. Individual file reads cap at 50 MB.
- **Archiving deletes the project's memory** along with its name, instructions and links. The
  attached folders on disk are untouched. There is no "archive but keep memory".
- Dispatch can route background work into a project so it inherits the same folders and memory.

Source: <https://claude.com/docs/cowork/guide/projects>

## Scheduled tasks [verified: none currently exist]

Stored as `{taskId}/SKILL.md` under `~/Claude/Scheduled/` — the directory does not exist until the
first task is created **[verified]**. Cron is evaluated in **local time, not
UTC**. Each run starts with **no memory of the originating conversation** — the prompt must be
fully self-contained. Tasks only run while the desktop app is open; a task due while it is closed
fires on next launch. A fired one-shot still reports a stale future `next_run_at` — `ended_reason`
is authoritative.

## Power model [verified 2026-08-15]

`pmset -g assertions` shows `pid <n>(Claude): NoIdleSleepAssertion named: "Electron"` — **the Mac
never idle-sleeps while the Claude desktop app is open**; `displaysleep 20` only turns the monitors
off. Bridge availability is a function of the app being open, not of power settings. Quitting the
app drops the assertion and the bridge dies with it.

Caveat: Claude is one of several assertion holders on this machine (Chrome, coreaudiod, powerd,
useractivityd, sharingd also appear) **[verified]** — so quitting Claude alone does not guarantee
the Mac sleeps, and observing "the Mac stayed awake" is not evidence that Claude was running.

## Practical routing

- Repo work needing pnpm / node 24 / real git → **Desktop Commander**, or Claude Code.
- Throwaway compute, parsing, scratch scripts → **sandbox bash**.
- Anything that must survive a closed laptop → **Claude Code `--cloud`**, not Cowork.
- Recurring reports over connector data → **artifact** + **scheduled task**.

## Open questions

- Whether a Cowork session started from phone/browser exposes the same `mnt/` bind-mounts (it has
  no Mac to mount) — untested.
- Whether the mount unlink restriction is configurable.
