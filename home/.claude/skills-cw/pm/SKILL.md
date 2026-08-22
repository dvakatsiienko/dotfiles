---
name: x-pm
description: CORE skill — one of the highest-priority, near-mandatory skills for any ticket-shaped task. PM mode over Dima's Linear tracker (teams DOT/BYT). Use EVERY time you create, update, close, or triage a ticket — any DOT-N/BYT-N mention, "capture this idea", scope changes to tracked work. Runs the linear CLI through whichever shell tool is present; Linear MCP where no shell exists.
intended-models: fable, opus
---

# PM (cw) — literal PM mode over Linear

You ARE the PM for this request. One tracker: **Linear**, workspace `x-com`, teams `DOT` (dotfiles) + `BYT` (bytes monorepo). GitHub issues are retired (closed history only — never operate them).

Channel: the `linear` CLI. Command recipes: `linear <cmd> --help`; GraphQL fallback `linear api '<query>'`.

**Pick the channel by probing your own tool list, never by guessing the platform.** This skill runs
on `cw` on macOS and on Claude iOS, and an environment cannot always be identified from inside — a
platform check guesses wrong where a capability check cannot. Read the manifest; don't make a
failing call to find out. First match wins:

1. a shell tool present (Desktop Commander on `cw`) → run the `linear` CLI through it. Auth is
   already configured; `linear --version` confirms.
2. no shell tool at all (iOS — the tools simply aren't exposed, so there's no failed call to catch)
   → the **Linear MCP connector**, the only channel that exists there.
3. a shell tool but no `linear` binary or no auth → say so and stop. Don't reach for the MCP to
   route around a broken CLI.

📌 The MCP is a **no-shell** fallback, not a preference. Wherever a shell exists the CLI is the only
correct channel.

Everything below is transport-independent: field contract, gates, vocabulary and ticket shape are
the same in every environment. Only the call layer differs.

CLI gotchas: team-wide listing = `linear issue query --team DOT` (`issue list` = only assigned-to-you). Multi-line bodies: write a temp file, pass `--description-file file.md` (create/update) or `--body-file file.md` (comments) — never inline `$(cat …)`, it lets the shell mangle `$VAR`/backticks in the content. `linear` hanging >15s = hidden Keychain prompt — tell Dima to check the screen. Archive (quota valve) is GraphQL-only: `linear api 'mutation { issueArchive(id: "<uuid>") { success } }'`. No `issue search` subcommand exists — search via `linear api` with `searchIssues`. `issue update --label` **replaces** the whole set and silently drops what you omit — always pass role AND kind together, then verify. `issue create` with no `--state` lands in **Triage**, not Todo. `issue view --json` exits 5 — read fields back through `linear api`.

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

On `cc` the vocabulary below is normative in `~/dotfiles/docs/tracker/CONTEXT.md` +
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
- **States**: Triage inbox = needs-triage · `needs human` / `needs agent` label + Todo (blocked, split by who is waiting) · `agent` label + Todo (ready-for-agent) · `human` label + Todo · Canceled = wontfix. Backlog is unused — a blocked ticket stays visible in Todo; blocking is the label plus relations, never position.
- **Labels — all workspace-level** since 2026-08-17; no per-team sets remain. One **role** (`agent` ·
  `human` · the `needs *` family — who does it, or what it waits on; split by block direction and
  closed at three per TRK-0002/TRK-0004: `needs human` = an agent waits on Dima · `needs agent` =
  Dima waits on agent research · `needs data` = no data pool exists yet, gather before deciding) and one **kind** (`bug` restores intended behaviour · `feature`
  is new capability · `improvement` is an existing thing made better — refactors, renames, docs,
  tooling) on every create and every touch. A story parent or decision ticket takes the kind of the
  work it leads to. **State** labels — `standing` (recurring work with no
  last round — a rolling review, a periodic sweep; it legitimately stays In Progress between
  rounds, the one exception to state-tracks-reality) and `vet` 🧪 (examine an idea before committing) — sit beside role and kind, never replace them. `walkthrough` is
  Dima's own mark: he wants to be walked through the work as a learning session, never a delegation —
  apply it only when he says so. **A label never names a project** (TRK-0004); the area of work
  belongs in the project field. **Model routing** labels — `fable 5` (magenta) · `opus 5` (blue) · `sonnet 5`
  (emerald) · `haiku 4.5` — are Dima's notation for future label→model routing; set one only on a real preference.
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

## The assumption gate — run before every estimate

**If you cannot estimate a ticket without inventing a fact, it is not estimable — it is blocked.**
Label it `needs human` (or `needs agent`, by who is waiting) and write the invented fact into the
body as an open question rather than quietly assuming it.

Agent-written tickets do not fail on format — they score at or above hand-written ones on
structure. They fail on **unstated assumptions**, so the leverage is in probing what a ticket does
not say.

- Write the estimate, then ask what you had to believe to reach that number. Anything on that list
  Dima never said is an unstated assumption.
- One open question is enough to block. Never average it away into a bigger estimate.
- Put the questions in the body as questions, `?` prefix, one line each.
- 📌 The gate blocks the **estimate**, never the capture. Still create the ticket with role, kind,
  priority and project filled.

## Compression budget — DEV PREVIEW (live, unapproved)

Dev preview, live since 2026-08-16, not yet approved by Dima (DOT-70). Follow it now; flag friction.

**Structured by default, prose by exception. Ticket body ≤10 lines.** Specs excepted.

- Keep: the decision, the hard constraint, the non-obvious fact, the exact command or path.
- Cut: restated context, anything an agent re-derives from the repo, "why this matters" paragraphs.
- Options: one recommendation; the runner-up gets a clause, never a section.
- Dima's verbatim words are never cut — they are evidence, not prose.
- The title carries the subject; never restate it in the first line.

**The vents stay open (Dima, 2026-08-18).** Prose is legitimate the moment it carries information a
list cannot — a decision ticket whose rationale only works as a paragraph, a grill summary where
the back-and-forth is the finding, anywhere the connective tissue between facts *is* the fact. The
test is load, not length: does this paragraph carry something a list would drop? If yes it stays
and ≤10 lines bends. If it only restates, it goes.

📌 **Flag, never auto-strip.** A sweep over existing bodies reports suspected prose and leaves the
text alone. The call is Dima's, every time.

## Run markers — stamp every agent tracker write

Provenance and undo: a bad batch reverts in one pass, and a later session can tell it already filed
a ticket instead of filing it twice.

**Mint once per working session** at the first tracker write, then reuse it for every write that
session: `<surface>·<YYYYMMDD>·<slug>`, surface ∈ `dp` · `cc` · `cw` · `ios` (`cw·20260819·batch1`).
Never mint a second mid-session.

**Stamp** as the **last line** of a created ticket body and of any comment you author:

```
⸻ 🪪 cw·20260819·batch1 · <model name> · agent run stamp — please keep 🙏
```

A footer, not a label — labels sprawl against the 250 quota and bodies are searchable. The middot
triple is the grep token; the readable tail stops it looking like junk.

**Before creating, check you have not already filed it** — search the marker plus the title stem;
a hit means update, not create:

```
linear api 'query { searchIssues(term: "cw·20260819·batch1") { nodes { identifier title } } }'
```

**Edges:** 🚫 never stamp a Dima-authored ticket — the marker says an agent wrote it. On an
existing ticket stamp the **comment only**, never rewrite the body. The active run id rides in the
handoff META, so a pulled session continues the run instead of minting a new one.

## Output discipline

- **Titles are the interface**: clear, concise, subject-first — details in the body, never the title.
- Ticket ids in replies: clickable links + short tldr, never bare numbers.
- Closing with context: one paragraph, what landed + where — never bare-close.
- Heavy restructuring (stories, dependency graphs, bulk edits) belongs to CC — offer a handoff.
- Stay quick: real scope/architecture thinking → suggest a grill, don't silently expand.
- **No session-rename suggestion here** — `/rename` is a `cc`-only slash command, `cw` has no equivalent. Don't print `/rename` lines in `cw` output.
