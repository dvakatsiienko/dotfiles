---
name: pm
description: Quick ticket operations across Dima's project trackers — create, update, label, link, close, flesh out issues in the correct project. Use for "close #N", "update the ticket", "add a label", "file this as an issue", or /x:pm.
---

# PM — ticket quick-ops

Fast, correctly-routed ticket operations. Know the registry cold — no re-discovery.

## Tracker registry

| Project | Tracker | Where | Notes |
| --- | --- | --- | --- |
| **bytes** | GitHub | `dvakatsiienko/bytes` | Primary tracker, Matt's system (see below) |
| **dotfiles** | GitHub | `dvakatsiienko/.dotfiles` | Matt's system too; CC tooling / sline / handoff issues |
| **Linear** (testing) | Linear | team `x-com`, project `bytes`, ids `X-N` | Fewer issues; `X-33` = design-system decisions doc (source of truth). Label groups `app/`, `pkg/` |

Routing: infer the project from cwd and topic (repo work → that repo's GitHub; design-system
decisions doc → Linear X-33). Genuinely ambiguous → ask, don't guess.

## Matt's system (both GitHub repos)

- **Conventions doc:** `docs/agents/issue-tracker.md` in bytes — gh CLI for everything.
- **Triage labels:** `needs-triage` · `needs-info` · `ready-for-agent` · `ready-for-human` · `wontfix`.
- **App labels (bytes):** one per issue — `x-com-chat`, `cv`, `kit`, `space-explorer-ui`, `financial`, ….
- **Blocking edges:** GitHub native dependencies —
  `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-DB-id>`
  where the DB id comes from `gh api repos/<owner>/<repo>/issues/<n> --jq .id` (never the `#number`).
  Remove: same path, `--method DELETE …/blocked_by/<blocker-DB-id>`.
- **Frontier:** open issues with `issue_dependencies_summary.blocked_by == 0` and no assignee.
- **Specs and tickets** produced by `/to-spec` / `/to-tickets` are `ready-for-agent` by construction —
  don't re-triage them. `/triage` is only for issues the user didn't create.

## Linear ops

- MCP tools: `mcp__plugin_linear_linear__*` (`get_issue`, `list_issues`, `save_issue` — updates
  use `id` + `patch`/fields; state names: Todo/Backlog/Done/Canceled).
- Cross-tracker link: mention GH issues as plain `#N (dvakatsiienko/bytes)` in Linear bodies.

## Operation rules

1. **Read before writing** — fetch the issue (`gh issue view N --comments` / `get_issue`) before
   editing its body; edit surgically (Linear `patch` ops, GH `--body-file` with the merged text).
2. **Ticket ids in replies** are always clickable links with a short tldr (global typography rule).
3. Closing with context: `gh issue close N --comment "…"` — one paragraph, what landed + where
   (commit sha), never bare-close.
4. Don't move issues between trackers unless explicitly asked (Linear→GH flattening for the bytes
   project is explicitly postponed).
5. Current campaign context lives in memory (`design-system-roadmap`) — consult it before
   restructuring anything design-system related.
