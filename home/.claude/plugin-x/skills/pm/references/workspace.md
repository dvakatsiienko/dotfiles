# Linear workspace map — x-com

Single tracker for everything since 2026-08-13 (GH issues retired; closed GH issues = read-only history with pointer comments).

## Teams

| Team | Key | Scope |
| --- | --- | --- |
| dotfiles | `DOT` | `~/.dotfiles` repo — CC workflow lab, shell, machine setup |
| bytes | `BYT` | `bytes` monorepo — apps, kit, tooling, rl |

Free plan: **2 teams max (both slots used), 250 non-archived issues workspace-wide**. Archive aggressively (archived issues don't count, stay searchable). Escape hatch: Basic $10/mo.

## Projects

- **DOT**: `revamp` (setup audit + restructure) · `shelf` (artifact store + transcript family) · `handoff` (CC↔desk CST) · `claude` (skills, plugins, agent loops, personal CLI) · `sline` (statusline)
- **BYT**: `design-system` (kit-rooted unification) · `cv` · `x-com-chat` · `tooling` · `rl` (benchmark work)
- Projects are for real feature families. A small one-off goes project-less; when a theme accumulates, propose an umbrella project (e.g. `shell`, `macos`) to Dima.
- This map is authoritative by convention: pm maintains it — creating/renaming a project and updating this file is one operation.

## States ↔ triage roles (Matt's five-role machine, kept)

| Matt role | Linear |
| --- | --- |
| needs-triage | **Triage** status (native inbox) |
| needs-info | `needs-info` label + Todo |
| ready-for-agent | `agent` label + Todo |
| ready-for-human | `human` label + Todo |
| wontfix | Canceled |

Labels per team: `agent`, `human`, `needs-info` only — essentials, resist new ones.

Workspace-wide: `fable-5` — this ticket needs Fable 5, grab it only when Fable quota is free.
No `opus-5` counterpart on purpose: absence of `fable-5` means Opus by default, and a label
that is always true carries no information. When Dima asks what to grab, check this label and
say which tickets are Fable-only.

## Fields

- **Priority** (built-in): 1 Urgent · 2 High · 3 Medium · 4 Low. Urgent is free to use — priority says how much a ticket *matters*; when one ticket must land *before* another, add a `blocks` relation instead of inflating priority.
- **Estimate** (built-in, 1–5) = complexity/uncertainty, NOT wall-clock. 5 = design-heavy/gnarly, 1 = mechanical.
- **Relations**: `blocks`/`blocked by` native — use for phases instead of title prefixes.
- Epics = parent issue + sub-issues (e.g. DOT-4 shelf epic).

## Quota ops (free plan: 250 non-archived, workspace-wide)

Teams auto-archive completed/canceled issues after **6 months** — too slow to be the valve alone. The CLI has no archive verb; use GraphQL:

```bash
# archive one issue (uuid via: linear api 'query { issue(id: "DOT-3") { id } }')
linear api 'mutation { issueArchive(id: "<uuid>") { success } }'
# quota check — non-archived issue count across the workspace
linear api 'query { issues(first: 250, filter: {}) { nodes { id } } }' | jq '.data.issues.nodes | length'
```

## CLI gotchas

- Team-wide listing = `linear issue query --team DOT` (`issue list` shows only issues assigned to *you*).
- Multi-line/markdown bodies: write to a file, pass `--description-file file.md` (`issue create`/`issue update`) or `--body-file file.md` (`comment add`/`comment update`) — the shell never touches the content, unlike inline `--description "$(cat …)"` (`$VAR`/backtick expansion silently mangles snippets).
- `issue update --label` **replaces** the whole label set, it never adds. Passing one label drops
  every other one, silently and with a success message. Always pass the full intended set
  (`--label agent --label fable-5`), and verify after:
  `linear api 'query { issue(id: "DOT-N") { labels { nodes { name } } } }'`.
- `issue view --json` exits 5 — read fields back through `linear api` GraphQL instead.
- `linear` hanging >15s = likely a hidden Keychain prompt (keyring auth) — check the screen.

## Links

Ticket ids in replies: clickable + tldr, linking to the macOS app — `[DOT-3](linear://linear.app/issue/DOT-3): setup audit — in progress`. Fallback if a client won't route the scheme: https + Linear's "Open links in desktop app" preference. `linear issue view DOT-3 -a` opens the app from a shell.
