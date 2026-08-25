---
name: pm
description: CORE skill — one of the highest-priority, near-mandatory skills for any ticket-shaped task. PM mode over Dima's Linear tracker (teams DOT/BYT). Load EVERY time you create, update, close, or triage a ticket — any mention of a DOT-N/BYT-N id, "save this idea as a ticket", scope changes to tracked work, or /x:pm.
intended-models: fable, opus
---

# PM — literal PM mode over Linear

**lane** — `cw`: `x-cw__pm_guide` for the contract, then the `linear` cli through the shell · `cc`: Bash.

📌 The always-loaded `rules/linear-flow.md` already holds what must be true whenever a ticket is
touched at all — where tickets live, In Progress the moment work starts, the focus pin, never
inventing an id. On `cw` nothing auto-loads it: read it at
[`../../rules/linear-flow.md`](../../rules/linear-flow.md) in the plugin root, or take it inlined
from `x-cw__pm_guide`. This skill is the PM handbook on top of that: field contracts, judgment, CLI
mechanics. Do not restate the rule file here; when the two overlap, edit the rule file.

You are the PM for the duration of the request. One tracker: **Linear**, workspace `x-com`.

Two files, and the split matters:

- **vocabulary is normative in the repo** — `~/dotfiles/docs/tracker/CONTEXT.md` (glossary)
  and `~/dotfiles/docs/tracker/adr/` (`TRK-nnnn` decisions). what a team, project, story,
  label or assignee *means* is settled there. never restate it, never contradict it.
- **recipes are here** — [references/workspace.md](references/workspace.md): current projects,
  states, cli mechanics, quota ops. read it before the first write of a session.

Channel: the `linear` CLI. `linear api '<graphql>'` is the fallback for anything the CLI lacks.

**Pick the channel by probing your own tool list, never by guessing the platform.** Some
environments cannot be identified from inside, so a platform check guesses wrong where a capability
check cannot. Read the manifest — do not make a failing call to find out. First match wins:

1. a shell tool (`Bash` on `cc`, Desktop Commander on `cw`) → run the `linear` CLI through it.
2. no shell tool at all (Claude iOS) → the Linear MCP connector, the only channel that exists there.
3. a shell tool but no `linear` binary or no auth → say so and stop. Do not reach for the MCP to
   route around a broken CLI.

📌 The MCP is a **no-shell** fallback, not a preference. Wherever a shell exists the CLI is the only
correct channel — this is the one exception to «never the Linear MCP», and it is narrow.

Everything below this line is transport-independent: the field contract, the gates, the vocabulary
and the ticket shape are the same in every environment. Only the call layer differs.

## CLI cheatsheet — inlined on purpose

📌 **A pointer to another skill is a citation, never a load.** Naming the `linear-cli` skill in
prose here is what produced invented flags (`issue list --query`, `issue search` — neither exists)
while the right calls sat in that skill's first screen. So the calls that get guessed wrong live
here, in the file you are already reading. **Before any call not on this list, run
`Skill(linear-cli:linear-cli)`** — an explicit load, not a mention. `linear <cmd> --help` confirms
a flag in one call and is always cheaper than a wrong guess.

📌 **this list and the `linear-cli` skill are not duplicates — they hold opposite things.**
`linear-cli` documents **what works**: query filters, create, update, comments, attachments, ~334
lines of recipes. the list below is **what breaks** — the calls that look right and are not. keep
both; deleting either re-creates a real failure.

- **listing** — `linear issue query --team DOT`. `issue list` shows only issues assigned to *you*,
  and there is no `--query` flag on it.
- **searching** — no `issue search` subcommand exists. Use `linear api` with `searchIssues`.
- **multi-line bodies** — write a file, pass `--description-file f.md` (`issue create` /
  `issue update`) or `--body-file f.md` (`issue comment add` / `issue comment update` — there is no
  top-level `comment` command). Inline `--description "$(cat …)"` lets the shell mangle `$VAR` and
  backticks silently.
- **labels replace, never add** — `issue update --label` drops every label you omit, silently, with
  a success message. Pass the full intended set (`--label agent --label improvement --label 'opus
  5'`) and verify: `linear api 'query { issue(id: "DOT-N") { labels { nodes { name } } } }'`.
- **state on create** — `issue create` with no `--state` lands in **Triage**, not Todo. The team
  default wins and the CLI says nothing. Always pass `--state Todo`, or the state the role calls for.
- **reading fields back** — `issue view --json` exits 5. Use `linear api` GraphQL.
- **archiving** — no CLI verb. `linear api 'mutation { issueArchive(id: "<uuid>") { success } }'`,
  uuid from `linear api 'query { issue(id: "DOT-3") { id } }'`.
- **hanging >15s** — likely a hidden keychain prompt. Tell Dima to check the screen.

## The two jobs

1. **Tweak an existing ticket** — read it first (`linear issue view`), then edit surgically; keep the ticket's voice.
2. **Capture an idea as a new ticket** — precise but compact: the idea's core, the trigger context, stated constraints.

## Field contract (every create AND update)

Role, priority and estimate are **always filled and current** — monitoring them is your job, not Dima's:

- **Role first.** Every ticket carries one role (state ↔ label map in [references/workspace.md](references/workspace.md)), assigned by you on every create and every update, without being asked. Judge it from the ticket's own readiness: fully specified and mechanical enough to hand over → `agent` + Todo; needs Dima's taste or hands → `human` + Todo; a real question blocks it → `needs human` (an agent waiting on Dima) or `needs agent` (Dima waiting on agent research) + Todo — pick by **who is waiting**; dead → Canceled. `Triage` is for a capture you genuinely cannot place yet, not the landing pad for new tickets. A ticket blocked on quota, time, or another ticket keeps its real role — a blocker is a relation, never a role.
- **Kind second.** Alongside the role, every ticket carries one kind — `bug` / `feature` /
  `improvement` (see [references/workspace.md](references/workspace.md)). Role says who does it,
  kind says what it is; both are yours to keep current.
- **State and assignee floor** — `rules/linear-flow.md` binds with or without this skill: state
  tracks reality, never pass `--assignee`. On top of it: assigned-to-Dima means strictly his —
  never resolve, start, or reassign it; the `human` label says a human does the work, not *which*
  human (importance is priority's job).
- 📌 `--label` **replaces** the whole label set rather than adding to it. Always pass role AND
  kind together, or one of them is silently dropped.
- On create: propose priority (1–4) + estimate (1–5) + project + **parent and milestone** — a
  ticket with a parent inherits the parent's milestone unless the body says why not; no milestone
  means invisible on the «where are we» board. Projectless is legal for one-offs and idea pools —
  do not force one.
- On any scope change to an existing ticket: re-eval both, propose the delta.
- Approval is **batched and diff-shaped**: one pretty table per edit batch (`field: old → new`), one approve — never N sequential confirms. Silence on a row in Dima's reply = accepted.

## The assumption gate — run before every estimate

**If you cannot estimate a ticket without inventing a fact, it is not estimable — it is blocked.**
Label it `needs human` (or `needs agent`, by who is waiting), and write the invented fact into the
body as an open question instead of quietly assuming it.

Why this gate and not another: agent-written tickets do not fail on format. They score at or above
hand-written ones on structure. They fail on **unstated assumptions** — so the leverage is in
probing what a ticket does not say, never in polishing how it says it.

How to run it, on every create and every estimate:

- Write the estimate first, then ask what you had to believe to land on that number. Anything on
  that list Dima never said is an unstated assumption.
- One open question is enough to block. Do not average it away into a bigger estimate — a number
  covering an unknown reads as certainty the ticket does not have.
- Put the questions in the body as questions, not as decisions. `?` prefix, one line each.
- 📌 The gate blocks the **estimate**, never the capture. Still create the ticket, still fill role,
  kind, priority and project — an idea is never lost to a missing answer.

## Run markers — stamp every agent tracker write

Provenance and undo. A bad batch reverts in one pass, and a later session can tell it already filed
a ticket instead of filing it twice. No tracker vendor ships this; the marker is ours.

**Mint once per working session**, at the first tracker write, then reuse it for every write in that
session: `<surface>·<YYYYMMDD>·<slug>` — surface ∈ `dp` · `cc` · `cw` · `ios`, slug short and
kebab (`cc·20260819·batch1`). Never mint a second one mid-session.

**Stamp** as the **last line** of a created ticket body and of any comment you author:

```
⸻ 🪪 cc·20260819·batch1 · <model name> · agent run stamp — please keep 🙏
```

It is a footer, not a label — labels sprawl against the 250 quota, and bodies are searchable. The
middot triple is the grep token; the human-readable tail exists so nobody mistakes it for junk.

**Before creating, check you have not already filed it.** Search the marker plus the title stem; a
hit means update that ticket instead of creating a second one:

```bash
linear api 'query { searchIssues(term: "cc·20260819·batch1") { nodes { identifier title } } }'
```

**Edges, and they matter:**

- 🚫 **Never stamp a Dima-authored ticket.** The marker says an agent wrote this. Putting it on his
  ticket is a lie about who did.
- On an **existing** ticket, stamp the **comment only** — never rewrite the body to add a footer.
- The active run id rides in the handoff **META**, so a pulled session continues the run rather
  than minting a new one.

## Ticket economy (quota-aware)

250 non-archived issues workspace-wide. Resolve faster than create. Prefer one fuller ticket covering an area over strands of small ones — but no monster tickets; balance. Archive resolved work aggressively. Quota nearing (~200): propose a restructure pass.

## Compression budget — DEV PREVIEW (live, unapproved)

(claude-important) dev preview, live since 2026-08-16, not yet approved by Dima —
DOT-70 carries the rule and its approval. Follow it now; flag friction the moment you feel it.
(claude-important)

**Structured by default, prose by exception. Ticket body ≤10 lines.** Specs excepted.

- Keep: the decision to make, the hard constraint, the non-obvious fact, the exact command or path.
- Cut: restated context, anything an agent re-derives from the repo, "why this matters" paragraphs.
- Options: give one recommendation; the runner-up gets a clause, never a section.
- Dima's verbatim words are never cut — they are evidence, not prose.
- The title carries the subject. Never restate it in the first line.

**The vents stay open (Dima, 2026-08-18).** The default is a list, not a paragraph — but a budget
that closes every vent is the wrong budget. Prose is legitimate the moment it carries information
a list cannot:

- a decision ticket whose rationale only makes sense as a paragraph — the reasoning is the content,
  and chopping it into bullets destroys the argument;
- a grill summary, where the back-and-forth is the finding;
- any place where the connective tissue between facts *is* the fact.

The test is not length, it is load: **does this paragraph carry something a list would drop?** If
yes it stays and the ≤10 lines bends. If it only restates, it goes.

📌 **Flag, never auto-strip.** A sweeper pass over existing bodies reports prose it suspects and
leaves the text alone. Rewriting someone's ticket body on a heuristic is how real reasoning gets
deleted — the call is Dima's, every time.

## Output discipline

- **Titles are the interface**: clear, concise, subject-first — details go in the body, never the title.
- Bodies tidy and formatted. Ticket-id link format is not restated here — `rules/fleet-output-format.md` owns it.
- Pretty output: tables for batches, one-line confirmations for single ops.
- **CC only**: on the first ticket touch in a session (first `linear issue view`/create), suggest a session rename as a ready-to-run line: `/rename DOT-N: compact-title` — Dima pastes it manually, `/rename` isn't tool-callable. One suggestion per session, not on every subsequent ticket op.

Stay quick — this skill is for ticket ops. A request that turns into scope/architecture thinking gets a grill suggestion, not silent expansion.

**Completion criterion:** done when every touched ticket is fully fielded (role, kind, priority,
estimate-or-blocked, project, parent+milestone where they apply) and the approval batch — or the
one-line confirmation — **says which fields you set or changed**. A ticket left partially fielded
is not captured, it is scattered.

## Body vs comments — the state contract

Comments = trail (logs, stamps, provenance — keep using them). Body = current state: keep it
sanitized and updated, mutate without fear; a closed ticket reads true from the body alone.
The closing word on every close is the floor's rule (`rules/linear-flow.md`).

## Reading — the fetch contract

`linear issue view` is a fixed pre-baked query that omits most of this. **Use `linear api`
GraphQL for any read that will inform a decision**, and filter the JSON so only needed fields
enter context. Always fetch: `labels { nodes { name description } }` · `parent` + `children` ·
`comments` · `attachments` · state, project, priority, assignee.

- 🚨 **BOTH `relations` AND `inverseRelations`.** `relations` returns only the edges a ticket
  *declares* — a ticket that is **blocked by** something shows an empty list and looks unblocked.
  The inverse side exposes `issue`, not `relatedIssue`.
- ⚠️ **`first:` is a cap, and a capped result looks exactly like a complete one.** Linear pages at
  50 and warns about nothing. Request `pageInfo { hasNextPage }` on any query whose count you
  intend to state — a number nobody paged is an estimate.
- Relations are native, and you hunt for them: on every touch evaluate the full vocabulary
  (parent, sub-issue, related, blocked by, blocks, duplicate) and set what matches in the same
  batch. The test is *«would this change how I do the other one?»*. 🚨 Never filter relations by
  state — a closed ticket with a closing word is often the most valuable edge on the graph.
- Mutations stay cheap: short single-flag updates inline, heredoc/`--description-file` only for
  prose bodies.
