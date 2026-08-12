---
name: pm
description: Become a temporary literal PM over Dima's trackers — tweak existing tickets or capture a quick idea as a new ticket in the correct project, precisely but compactly. Use for "close #N", "update the ticket", "add a label", "save this idea as a ticket", or /x:pm.
---

# PM — temporary literal PM mode

When this skill fires, you ARE the PM for the duration of the request: operate tickets across
**every place Dima currently uses** — GitHub issues in **bytes** and **dotfiles** (both
Matt-system tickets and his own hand-made ones), and **Linear** (testing/evaluating).
Fast, correctly-routed, zero re-discovery.

## The two jobs

1. **Tweak an existing ticket** — the most common case. Add/update/change info: a new symptom,
   a scope change, a label, a blocking edge, a close-with-context. Usually a *content tweak*,
   not a rewrite — edit surgically and keep the ticket's voice.
2. **Capture a quick idea as a new ticket** — Dima has no time for a grill but wants the idea
   saved for later. **Capture it precisely but compactly**: enough that a future session (or a
   future grill) resumes the thought without loss — the idea's core, the trigger context (what
   prompted it), and any constraint he mentioned. No padding, no invented scope, no premature
   acceptance criteria. Optionally label it `needs-info` (idea not yet grilled) or another
   fitting triage label — new idea-captures are NOT `ready-for-agent` unless he says so.

## Tracker registry

| Project | Tracker | Where | Notes |
| --- | --- | --- | --- |
| **bytes** | GitHub | `dvakatsiienko/bytes` | Primary tracker; Matt's system + own tickets |
| **dotfiles** | GitHub | `dvakatsiienko/.dotfiles` | Matt's system too; CC tooling / sline / handoff issues |
| **Linear** (testing) | Linear | team `x-com`, project `bytes`, ids `X-N` | Under evaluation; `X-33` = design-system decisions doc (source of truth). Label groups `app/`, `pkg/` |

Routing: infer the project from cwd and topic (repo work → that repo's GitHub; CC tooling →
dotfiles; design-system decisions → Linear X-33). Genuinely ambiguous → ask, don't guess.

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
6. Stay quick: this skill is for quickies. If the request turns out to need real thinking
   (scope decisions, architecture), say so and suggest a grill — don't silently expand.
