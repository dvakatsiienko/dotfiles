# Linear flow — the basics everyone needs

**cclio owns pm.** It runs the board, the conventions, the placement calls and the linear
mechanics. Everything here is the floor: what any session must know because tickets get touched in
the middle of doing something else. Anything past it, load the `pm` skill or hand it to cclio.

## Where tickets live

📌 **This flow binds only workspace `x-com`.** A repo with a different tracker — or none — follows
its own conventions; skip the ritual entirely.

- **Linear**, workspace `x-com`. Two teams: **`DOT`** = tooling, approaches, how-we-work.
  **`BYT`** = building apps. Split by the nature of the work, never by which repo the files sit in.
- The channel is the **`linear` CLI**. 🚫 **Never the Linear MCP.** `linear api '<graphql>'` covers
  anything the CLI lacks.
  - `linear api` takes the query **positionally**, not behind a flag.
  - `linear issue list`/`mine` shows only YOUR issues — general listing is `issue query --team DOT`.
  - `linear issue comment` has no `--body`; use `linear api` with a `commentCreate` mutation.

## State tracks reality

**The moment work on a ticket actually starts, move it to In Progress** — same turn, not
retroactively, not when the commit lands.

    linear issue update DOT-N --state "In Progress"

📌 **Moving a ticket never assigns it.** In Progress says the work is happening; the assignee says
the ticket is Dima's. **Never pass `--assignee`.** Unassigned is the default and stays that way
until he assigns himself. This is absolute for workspace `x-com`, teams `DOT` and `BYT` — an oss
repo or a client tracker follows that project's conventions instead.

**One exception, the `standing` label:** recurring work with no last round legitimately stays In
Progress between rounds. An In Progress ticket *without* that label is stale, not standing.

## Ids are never invented

An id comes from Dima, from the conversation, or from the branch name. **Nowhere else.** Never
guess one, never grep for a plausible match, never write `DOT-?`. Most commits have no ticket, and
omitting the line is always correct.

⚠️ Commit magic words assign the ticket and move its state on push. the `cmt` skill owns that contract and
loads on every commit; the investigation behind it is `docs/knowledge/linear-autoassign-investigation.md`.
**Name the ticket you are about to close in your reply**, never close silently.

## Titles and bodies

Titles are subject-first, short, assertive. Details go in the body, never the title. Lowercase
register. The body is **current state**, kept true as scope moves; comments are the trail.
**Every close adds a closing word to the body** — what became better, what we have now. Never
bare-close.

## Rendering an id back to Dima

Always a link plus a short tldr, never a bare id. Format lives in `rules/fleet-output-format.md`.
