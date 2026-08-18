---
name: x-pm
description: CORE skill — one of the highest-priority, near-mandatory skills for any ticket-shaped task. PM mode over Dima's Linear tracker (teams DOT/BYT). Use EVERY time you create, update, close, or triage a ticket — any DOT-N/BYT-N mention, "capture this idea", scope changes to tracked work. Runs the linear CLI via Desktop Commander.
intended-models: fable, opus
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

## Workspace map — inlined, because `cw` cannot read the repo's tracker context

On `cc` the vocabulary below is normative in `~/projects/dotfiles/docs/tracker/CONTEXT.md` +
`docs/tracker/adr/`. `cw` cannot load those, so they are carried here by hand. Restructured
2026-08-17 (DOT-72 / TRK-0001); if the repo files move on, this block must be re-adapted — nothing
detects the drift.

- **Team** — top split by nature of the work, never by repo. `DOT` = tooling/approaches/how-we-work,
  `BYT` = building apps. A build-infra problem is `DOT` even when every file lives under `bytes`.
  `BYT/tooling` is app-local build config **inside `bytes` only**; cross-cutting tooling is `DOT`.
- **DOT projects**: `pm` (tracker + pm skill) · `mind` (memory, skills, rules, writing) · `fleet`
  (surfaces and bridges: dispatch, `cc cloud`, ipad, handoff) · `cli` (interface layer) · `shelf` ·
  `revamp` · `sline` · `numi`
- **BYT projects**: `rl` · `design-system` · `cv` · `x-com-chat` · `tooling`
- A project is a long-lived area and never closes. Dissolved 2026-08-17: `claude` (→ pm/mind/fleet/cli)
  and `handoff` (→ fleet). **Projectless is legal** for one-offs and idea pools — don't force one.
- **Story, never epic.** «epic» is retired (TRK-0001) — not in titles, not in speech. A **story** is
  just a ticket with sub-tickets; no marker, no label, the hierarchy is what makes it one. The parent
  doubles as the batch id. Ordering = native `blocks` relations, never title prefixes. Meet «epic» in
  an old title while editing → rewrite it to «story» in passing.
- **Assignee ≠ role label.** Assigned-to-Dima = strictly his: never resolve it, never start it, never
  reassign it. Unassigned = the default, open to anyone. Never self-assign, and never assign to Dima
  to signal importance. The `human` label says a human does the work, not *which* human.
- **States**: Triage inbox = needs-triage · `needs-info` label + Todo · `agent` label + Todo (ready-for-agent) · `human` label + Todo · Canceled = wontfix. Backlog is unused — a blocked ticket stays visible in Todo; blocking is the label plus relations, never position.
- **Labels — all workspace-level** since 2026-08-17; no per-team sets remain. One **role** (`agent` ·
  `human` · `needs-info` — who does it) and one **kind** (`bug` restores intended behaviour · `feature`
  is new capability · `improvement` is an existing thing made better — refactors, renames, docs,
  tooling) on every create and every touch. A story parent or decision ticket takes the kind of the
  work it leads to. **Model routing** labels — `fable-5` (magenta) · `opus-5` (blue) · `sonnet-5`
  (emerald) — are Dima's notation for future label→model routing; set one only on a real preference.
- **Priority** 1 Urgent–4 Low, p1 **rare** — priority says how much a ticket *matters*; must-land-before-another = `blocks` relation, never inflated priority. **Estimate** 1–5 = complexity, not wall-clock.
- **Quota**: free plan, 250 non-archived issues workspace-wide, auto-archive on. Resolve faster than create; prefer one fuller area-ticket over strands (no monsters); near ~200 propose a restructure pass.

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
- Heavy restructuring (stories, dependency graphs, bulk edits) belongs to CC — offer a handoff.
- Stay quick: real scope/architecture thinking → suggest a grill, don't silently expand.
- **No session-rename suggestion here** — `/rename` is a `cc`-only slash command, `cw` has no equivalent. Don't print `/rename` lines in `cw` output.
