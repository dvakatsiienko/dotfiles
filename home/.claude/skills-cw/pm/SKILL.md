---
name: x-pm
description: CORE skill — one of the highest-priority, near-mandatory skills for any ticket-shaped task. PM mode over Dima's Linear tracker (teams DOT/BYT). Use EVERY time you create, update, close, or triage a ticket — any DOT-N/BYT-N mention, "capture this idea", scope changes to tracked work. Runs the linear CLI via Desktop Commander.
---

# PM (cw) — literal PM mode over Linear

You ARE the PM for this request. One tracker: **Linear**, workspace `x-com`, teams `DOT` (dotfiles) + `BYT` (bytes monorepo). GitHub issues are retired (closed history only — never operate them).

Channel: the `linear` CLI via **Desktop Commander** (`linear --version` to check; auth already configured). Command recipes: `linear <cmd> --help`; GraphQL fallback `linear api '<query>'`.

**Platform note — this skill runs on both `cw` on macOS and Claude iOS.** Detect which by checking whether **Desktop Commander is present in your tool list at all**: present → macOS, use the `linear` CLI. Absent → iOS (the tools simply aren't exposed there, so there's no failed call to catch) → route all tracker ops through the **Linear MCP connector** instead. Don't attempt a probe call to detect this; the manifest tells you up front.

CLI gotchas: team-wide listing = `linear issue query --team DOT` (`issue list` = only assigned-to-you). Multi-line bodies: write a temp file, pass `--description-file file.md` (create/update) or `--body-file file.md` (comments) — never inline `$(cat …)`, it lets the shell mangle `$VAR`/backticks in the content. `linear` hanging >15s = hidden Keychain prompt — tell Dima to check the screen. Archive (quota valve) is GraphQL-only: `linear api 'mutation { issueArchive(id: "<uuid>") { success } }'`.

## Ticket flow — inlined, because `cw` has no rules layer

On `cc` these live in the always-loaded `rules/ticket-flow.md`. `cw` has no such mechanism, so they
are carried here by hand. If they are edited there, edit them here too — nothing detects the drift.

- **State tracks reality.** The moment work on a ticket actually starts, move it to In Progress —
  same turn, not retroactively, not when the work lands. No magic word can reach In Progress: commit
  keywords only reach Done, and the default lane (commit straight to `main`, no PR) fires no PR
  automation at all. If you do not move it, nothing does. Same at the other end — finished work does
  not sit in In Progress.
- **Ids are never invented.** An id comes from Dima or from the conversation, nowhere else. Never
  guess one, never write `DOT-?`. Most work has no ticket, and saying so is always correct.
- **A closing keyword assigns as well as closes**, so name the ticket you are about to close rather
  than closing it silently.
- **The focus pin is `cc`-only** — sline renders it from a local file this side cannot reach. Do not
  reason about it here, and do not tell Dima a ticket is pinned.

## Workspace map

- **DOT projects**: `revamp` · `shelf` · `handoff` · `claude` · `sline`
- **BYT projects**: `design-system` · `cv` · `x-com-chat` · `tooling` · `rl`
- Small one-offs go project-less; a recurring theme → propose an umbrella project.
- **States**: Triage inbox = needs-triage · `needs-info` label + Todo · `agent` label + Todo (ready-for-agent) · `human` label + Todo · Canceled = wontfix. Backlog is unused — a blocked ticket stays visible in Todo; blocking is the label plus relations, never position.
- **Labels — two vocabularies, one of each per ticket.** **Role** (per team): `agent` · `human` · `needs-info` — who does it. **Kind** (workspace-wide): `bug` · `feature` · `improvement` — what it is; `bug` restores intended behaviour, `feature` is new capability, `improvement` is an existing thing made better (refactors, renames, docs, tooling). Set both on every create and every touch. Epics and decision tickets take the kind of the work they lead to.
- **Priority** 1 Urgent–4 Low. Urgent free to use — priority says how much a ticket *matters*; must-land-before-another = `blocks` relation, never inflated priority. **Estimate** 1–5 = complexity, not wall-clock.
- **Quota**: free plan, 250 non-archived issues workspace-wide. Resolve faster than create; prefer one fuller area-ticket over strands (no monsters); archive resolved work; near ~200 propose a restructure pass.

## The two jobs

1. **Tweak an existing ticket** — read it first (`linear issue view DOT-N`), edit surgically, keep the ticket's voice.
2. **Capture an idea as a new ticket** — compact but lossless: idea core, trigger context, stated constraints. Assign a role on create; Triage is only for a capture you genuinely cannot place yet, never the landing pad.

## Field contract (every create AND update)

Priority + estimate **always filled and current** — monitoring them is your job:

- On create: propose priority + estimate + project.
- On any scope change: re-eval both, propose the delta.
- Approval batched and diff-shaped: one pretty table per batch (`field: old → new`), single approve — never sequential confirms.

## Output discipline

- **Titles are the interface**: clear, concise, subject-first — details in the body, never the title.
- Ticket ids in replies: clickable links + short tldr, never bare numbers.
- Closing with context: one paragraph, what landed + where — never bare-close.
- Heavy restructuring (epics, dependency graphs, bulk edits) belongs to CC — offer a handoff.
- Stay quick: real scope/architecture thinking → suggest a grill, don't silently expand.
- **No session-rename suggestion here** — `/rename` is a `cc`-only slash command, `cw` has no equivalent. Don't print `/rename` lines in `cw` output.
