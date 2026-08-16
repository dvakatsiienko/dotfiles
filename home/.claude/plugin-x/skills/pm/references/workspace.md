# Linear workspace map — x-com

Single tracker for everything since 2026-08-13 (GH issues retired; closed GH issues = read-only history with pointer comments).

## Teams

| Team | Key | Scope |
| --- | --- | --- |
| dotfiles | `DOT` | **tooling, approaches, problem-solving** — CC workflow lab, shell, machine setup, and how-we-work questions wherever they surface |
| bytes | `BYT` | **building apps** — the `bytes` monorepo's product work |

**Split by nature of the work, not by which repo the files live in.** A build-infra or
deploy-quota problem is a DOT ticket even when every file it touches is under `bytes` — it is a
tooling problem. A feature in an app is BYT even though the same session may edit shared config.
When in doubt: "am I solving how we work, or building the thing?" (stated 2026-08-16).

Free plan: **2 teams max (both slots used), 250 non-archived issues workspace-wide**. Archive aggressively (archived issues don't count, stay searchable). Escape hatch: Basic $10/mo.

📌 The project structure under each team is **mid-restructure** and Dima owns it — Linear went
live 2026-08-14 and the shape is still being formed. Propose a project for a new ticket, but do
not reorganise projects unprompted.

## Projects

- **DOT**: `revamp` (setup audit + restructure) · `shelf` (artifact store + transcript family) · `handoff` (`cc`↔`cw` CST) · `claude` (skills, plugins, agent loops, personal CLI) · `sline` (statusline)
- **BYT**: `design-system` (kit-rooted unification) · `cv` · `x-com-chat` · `tooling` (app-local build config inside `bytes` only — cross-cutting tooling is DOT) · `rl` (benchmark work)
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

## Labels — two vocabularies, one of each per ticket

**Role** (per team): `agent` · `human` · `needs-info`. Answers *who does it*. Exactly one, always
set. Resist inventing a fourth.

**Kind** (workspace-wide): `bug` · `feature` · `improvement`. Answers *what it is*. Linear's own
defaults, kept and lowercased. Set one on every create and whenever a ticket is touched, so the
"fixing or building?" question stays answerable.

- `bug` — something behaves wrong. Restores intended behaviour, adds none.
- `feature` — capability that does not exist yet.
- `improvement` — existing thing made better: refactors, renames, docs, tooling, ergonomics.

An epic or a pure decision ticket takes the kind of the work it leads to; `improvement` when
that is genuinely unclear.

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
