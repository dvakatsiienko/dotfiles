# Issue tracker: Linear

Issues for this repo live in **Linear** — workspace `x-com`, team `DOT` — since the
2026-08-13 migration. GitHub issues are retired: closed history only, each with a pointer
comment to its Linear successor. Never create or reopen GH issues here.

All operations go through the `linear` CLI (schpet/linear-cli, on PATH, keyring-authed);
`linear api '<graphql>'` covers anything without a dedicated command. The Linear MCP is
not used. Command recipes: the `linear-cli` plugin skill.

```bash
linear issue query --team DOT               # team-wide listing (issue list = only issues assigned to you)
linear issue query --team DOT --project shelf
linear issue view DOT-3                     # one issue
linear issue create --team DOT --title "…" --description "…" --project claude --priority 3 --estimate 2
linear issue update DOT-3 --state done
```

## Conventions

The pm skill (`x:pm`) owns the operating contract: priority (1–4) + estimate (1–5,
complexity) always filled and re-evaluated on scope changes, batched diff-shaped
approvals, tidy subject-first titles, quota awareness (free plan: 250 non-archived
issues workspace-wide — archive aggressively). Its `references/workspace.md` is the
full map of teams, projects, states, and labels.

## Triage states

| Canonical role | Linear |
| --- | --- |
| `needs-triage` | **Triage** inbox |
| `needs-info` | **Todo** + `needs-info` label |
| `ready-for-agent` | **Todo** + `agent` label |
| `ready-for-human` | **Todo** + `human` label |
| `wontfix` | **Canceled** |

Epics = parent issue + native sub-issues. Ordering/dependencies = native blocking
relations, never title prefixes or body text.

## When a skill says "publish to the issue tracker"

Create a Linear issue in the right team/project via `linear issue create`.
