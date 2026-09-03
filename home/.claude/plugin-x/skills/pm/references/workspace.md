# linear workspace — x-com — operating map

recipes only. **vocabulary is normative elsewhere**: `~/dotfiles/docs/tracker/CONTEXT.md`
(glossary) + `~/dotfiles/docs/tracker/adr/` (`TRK-nnnn` decisions). read the glossary
before the first write of a session — team, project, story, ticket, label, assignee, priority,
estimate are all defined there and are never restated here.

📌 the split is deliberate (`CONTEXT-MAP.md`): if a definition here disagrees with the tracker
context, the tracker context wins and this file is the bug.

single tracker since 2026-08-13; gh issues retired (closed history with pointer comments).

## teams

| team | key | scope |
| --- | --- | --- |
| dotfiles | `DOT` | tooling, approaches, how-we-work |
| bytes | `BYT` | building apps — the `bytes` monorepo's product work |

**split by nature of the work, never by which repo the files live in.** a build-infra or
deploy-quota problem is `DOT` even when every file it touches is under `bytes`. a feature in an
app is `BYT` even when the session edits shared config. the test: "am i solving how we work, or
building the thing?"

📌 `BYT/tooling` is the one trap — it is app-local build config **inside `bytes` only**.
cross-cutting tooling is `DOT`, always.

free plan: **2 teams max** (both used), **250 non-archived issues** workspace-wide.

## projects — current (restructured 2026-08-17, DOT-72 / TRK-0001)

- **DOT**: `pm` (tracker + pm skill) · `mind` (memory, skills, rules, writing) · `fleet` (surfaces
  and bridges: dispatch, `cc cloud`, ipad, handoff) · `cli` (the interface layer over the rest) ·
  `shelf` (artifact store + transcript family) · `revamp` (setup audit + restructure) · `sline` ·
  `numi`
- **BYT**: `rl` (benchmark work) · `design-system` · `cv` · `x-com-chat` · `tooling`

- a project is a long-lived area and never closes. propose one for every create.
- **projectless is legal** for one-offs and idea pools — do not force a project.
- dissolved 2026-08-17: `claude` → split into pm/mind/fleet/cli · `handoff` → into `fleet`.
- this map is authoritative by convention: pm maintains it. creating or renaming a project and
  updating this file is **one operation** — and if the change is a decision, it wants a `TRK`
  adr too.

## stories, not epics

**«epic» is retired** — not in titles, not in speech, not in ticket bodies (TRK-0001). a **story**
is simply a ticket with sub-tickets. there is no title marker and no label: the sub-issue
hierarchy is what makes it a story.

- group a batch by making a parent ticket and hanging sub-issues off it — the parent doubles as
  the batch id (DOT-104 precedent).
- ordering and dependencies = native `blocks` / `blocked by` relations. never title prefixes,
  never body text, never inflated priority.
- if you meet «epic» in an old title or body while editing, rewrite it to «story» in passing.

```bash
linear issue update DOT-N --parent DOT-M     # hang a ticket under a story parent
```

## assignee ≠ role label

- **assigned to dima = strictly his.** agents never resolve it, never move it to In Progress,
  never pick it up. leave it alone and say so.
- **unassigned = the default** and open to anyone, agents included.
- the `human` label is a *different* statement: it says a human must do the work. a `human`
  ticket that is unassigned is still up for grabs by whichever human gets there.
- never self-assign, and never assign to dima to signal importance — that is what priority is for.

## states ↔ roles

| role | linear |
| --- | --- |
| needs-triage | **Triage** status (native inbox) |
| needs-info | Todo + one of the `needs *` family: `needs human` (agent waiting on dima) · `needs agent` (dima waiting on agent research) · `needs data` (no data pool yet — gather before deciding) |
| ready-for-agent | `agent` label + Todo |
| ready-for-human | `human` label + Todo |
| wontfix | **Canceled** |

Backlog is deliberately unused — a blocked ticket keeps its real role and stays visible in Todo.

## labels — all workspace-level

since 2026-08-17 every label is **workspace-wide**; there are no per-team label sets left. one
**role** and one **kind** on every ticket, always.

- **role** — `agent` · `human` · the `needs *` family. who does it, or what it waits on. the family
  is split by **block direction** and closed at three (TRK-0002, TRK-0004): `needs human` = an agent
  waits on dima · `needs agent` = dima waits on agent research · `needs data` = no data pool exists
  yet, gather before deciding. resist a fourth.
- **kind** — `bug` (behaves wrong, restores intended behaviour) · `feature` (capability that does
  not exist yet) · `improvement` (existing thing made better — refactors, renames, docs, tooling,
  ergonomics). a story parent or a pure decision ticket takes the kind of the work it leads to;
  `improvement` when genuinely unclear.
- **state** — `standing` (recurring work with no last round — a rolling review, a periodic sweep;
  it legitimately stays In Progress between rounds, the one exception to state-tracks-reality) ·
  `vet` 🧪 (examine an idea before committing to it). `walkthrough` is dima's own mark — he wants to
  be walked through the work as a learning session, never a delegation; apply it only when he says so.
- 📌 **a label never names a project.** `harness: home baked` was deleted for exactly that
  (TRK-0004) — the area of work belongs in the project field.
  these sit beside role and kind, never replace them (TRK-0002).
- **model routing** — `fable 5` (magenta) · `opus 5` (blue) · `sonnet 5` (emerald) · `haiku 4.5`. dima's
  notation for which model a ticket wants, aimed at future label→model routing. set one only when
  the ticket has a real model preference; absence means "no preference". when dima asks what to
  grab, read these and say which tickets want which model.

## fields

- **priority** 1 Urgent · 2 High · 3 Medium · 4 Low. p1 is **rare** — priority says how much a
  ticket matters. must-land-before-another is a `blocks` relation, never a priority bump.
- **estimate** 1–5 = complexity and uncertainty, **not** wall-clock. 5 = design-heavy, 1 = mechanical.

## execution order — `sortOrder`, the native field

every issue carries one `sortOrder` (a float; lower sorts first). it is what a manually-sorted
view writes on drag, and the api takes it directly. dima orders a milestone by dragging or by
saying the order in chat; the agent writes it, and reads it back to print a milestone in
execution order. ran 2026-09-03:

```
linear api 'mutation { issueUpdate(id: "DOT-39", input: { sortOrder: -194319.29 }) { success issue { identifier sortOrder } } }'
linear api 'query { issue(id: "DOT-39") { identifier sortOrder } }'
```

- to order a list: read the current values, then write them spaced by 1000 in the wanted order.
  keep the floats negative and below the neighbours, so untouched tickets stay where they were.
- 📌 one `sortOrder` per issue, shared by every view — never a per-milestone field.
- a **sorting phase** opens every new branch or milestone: after the tickets exist, the order is
  set before any work starts (`cclio/memory/craft-pm.md`, the sorting phase).

## quota ops (250 non-archived, workspace-wide)

auto-archive is **on**, and teams also auto-archive completed/canceled after 6 months. still keep
resolving faster than creating; near ~200 propose a restructure pass. the cli has no archive verb (recipe in `SKILL.md`):

```bash
# quota check — non-archived count across the workspace
linear api 'query { issues(first: 250, filter: {}) { nodes { id } } }' | jq '.data.issues.nodes | length'
```

## cli gotchas

moved into `SKILL.md` — the calls that get guessed wrong must sit in the file the agent is already
reading, not one indirection away (DOT-89). nothing to duplicate here.

## links

ticket-id link format lives in `rules/fleet-output-format.md`, always loaded. not restated here.
shell equivalent: `linear issue view DOT-3 -a` opens the app.
