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

## States ↔ triage roles (Matt's five-role machine, kept)

| Matt role | Linear |
| --- | --- |
| needs-triage | **Triage** status (native inbox) |
| needs-info | `needs-info` label + Backlog |
| ready-for-agent | `agent` label + Todo |
| ready-for-human | `human` label + Todo |
| wontfix | Canceled |

Labels per team: `agent`, `human`, `needs-info` only — essentials, resist new ones.

## Fields

- **Priority** (built-in): 1 Urgent · 2 High · 3 Medium · 4 Low. Urgent is free to use — ordering/dependency is expressed via blocking relations, never via priority.
- **Estimate** (built-in, 1–5) = complexity/uncertainty, NOT wall-clock. 5 = design-heavy/gnarly, 1 = mechanical.
- **Relations**: `blocks`/`blocked by` native — use for phases instead of title prefixes.
- Epics = parent issue + sub-issues (e.g. DOT-4 shelf epic).

## Links

Ticket ids in replies: clickable + tldr, linking to the macOS app — `[DOT-3](linear://linear.app/issue/DOT-3): setup audit — in progress`. Fallback if a client won't route the scheme: https + Linear's "Open links in desktop app" preference. `linear issue view DOT-3 -a` opens the app from a shell.
