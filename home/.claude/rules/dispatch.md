# Dispatch

How the dispatch orchestrator (cowork-based, fable-5) relates to `cc` and the tracker. Sibling to
`ticket-flow.md`; that file governs any session touching tickets — this one governs the split of
duties when dispatch is the driver and `cc` is spawned.

⚠️ **Dispatch cannot auto-load this file** — it has no `rules/` layer. It reads it by hand via
Desktop Commander at session start (its memory + handoffs point here). `cc` sessions get it for
free like every rule. Edits here must assume both readers.

## The contract: dispatch owns linear, cc owns code

- Dispatch is PM/coordinator. All tracker ops (create, update, comment, close, triage) run at the
  dispatch level via the `linear` CLI through Desktop Commander; MCP only if the CLI fails.
- **Never spawn `cc` for pure linear ops.** `cc` is spawned for code, and only for code.
- Dima may steer a spawned `cc` directly (same session, two doors). One driver per turn — he tells
  dispatch, or dispatch re-reads the transcript to resync, before touching that session again.

## Closing policy

Born from DOT-112 sitting open after its work shipped: closing magic words live in `cc`'s `cmt`
skill, which dispatch-spawned sessions don't auto-load, so nothing closed the ticket.

- When dispatching `cc` on ticket work, **always pass the ticket id** and require `- ref DOT-N`
  on commits — the non-closing keyword, so commits surface in the ticket's Resources.
- `cc` **never auto-closes**. Closing keywords only when dispatch explicitly instructs them.
- **Dispatch closes**, via CLI, after verifying, with a context comment — what landed and where,
  never a bare close.
- Terminal-driven `cc` (Dima at the keyboard) is unchanged: full `cmt` vocabulary incl. closing.

## Link exception

The dispatch chat UI sanitizes non-https hrefs — `linear://` renders dead there ("copy link
address" yields the app page url). In dispatch replies use
`https://linear.app/x-com/issue/DOT-N`. Everywhere else `linear://` stays correct per
`text-formatting.md`.

## Session start — boot checklist

Load the core skills at boot, not reactively. `x:pm` above all — dispatch is the PM, and a
session that loads it only once a ticket is mentioned has already written the first ticket
wrong. Read this file and `ticket-flow.md` in the same pass (no `rules/` layer here).

## Spawning

- Model cards live in `rules/models.md`. Short form: haiku = large-but-simple; sonnet-5 = good
  but needs supervision; opus-5 = complex tech workhorse, never PM; fable-5 = **never spawned**
  unless Dima asks — dispatch already runs it, and spawns burn the $100-plan quota.
- Prefer reusing a warm session over a fresh spawn for small follow-ups — every fresh spawn costs
  ~50k context.
- Effort is not settable on spawns and appears inherited — mechanic unverified, do not build on it.

## Naming a spawned session

`[emoji][activity]: topic` — the emoji and the word are one unit, then the topic.

- 🔬 research — reading, gathering, comparing
- 🔧 code — writing or changing code
- 🧪 probe — checking whether a thing works at all

Example: `🔧 code: focus hook status cache`. Durable copy of dispatch's memory — the memory is
per-session, this file is not.

## Domain model stays evergreen

Any structural tracker change — project born/dissolved, term decided, label vocabulary shift —
updates `docs/tracker/CONTEXT.md` / `TRK` adrs in the same batch. The model has no auto-refresh;
this rule is the refresh.

## Artifacts are ephemeral

Task-session output folders die with the session. Any research doc or deliverable worth keeping is
attached to its Linear ticket/project **the moment it is born** — the ipad research file was lost
this way (DOT-103 restored from transcript, once, luckily).

## External skills

matt-pocock set, local at `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/`
(versioned dir inside). Dispatch reads a skill lazily via Desktop Commander when the task fits;
only constant-use ones (`domain-modeling`, `to-tickets`) get zipped into `cw` via the DOT-77
channel. The rest stay read-on-demand. Raw-read is a stopgap — clunky, stands until dispatch can
auto-load these.
