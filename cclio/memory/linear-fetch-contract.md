---
name: linear-fetch-contract
description: "what a Linear GET must always include (labels+descriptions, relations, parent/children, comments, attachments) and how to keep mutations cheap"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: af91cdb2-f865-4212-9dc8-4734e9a8bf66
  modified: 2026-08-20T17:28:04.644Z
---

Adopted 2026-08-20. `linear issue view` is a fixed pre-baked query and omits most of this — **use `linear api` GraphQL for any read that will inform a decision.** Same single round-trip; filter the JSON through `python3 -c` so only needed fields enter context.

**Always fetch on a GET:**
- `labels { nodes { name description } }` — descriptions are steering, not decoration (Dima writes instructions into them, e.g. model-routing labels). Never read a label as a bare name.
- 🚨 **BOTH `relations` AND `inverseRelations`** — `relations` returns only the edges this ticket
  *declares*. A ticket that is **blocked by** something shows an empty `relations` and looks
  unblocked. Measured: DOT-202 `blocks` DOT-195 renders as `relations: []` on DOT-195 and
  `inverse: [blocks ← DOT-202]`. Asking for `relations` alone is how a blocker becomes invisible.

      relations { nodes { type relatedIssue { identifier title state { name } } } }
      inverseRelations { nodes { type issue { identifier title state { name } } } }

  note the field names differ — the inverse side exposes `issue`, not `relatedIssue`.
- `parent { identifier title }` + `children { nodes { identifier title state { name } } }` — placement and story shape.
- `comments { nodes { body user { name } } }` — agents post state/progress there; a body-only read misses the current truth.
- `attachments { nodes { title url } }` — research docs are attached to tickets by agreement. Read the attachment when its title suggests relevance to the task; don't blind-fetch every one.
- state, project, priority, estimate, assignee.

**Mutations stay cheap:** short single-flag updates inline (`linear issue update DOT-N --state Done`). Only prose (bodies, comments) needs a heredoc — `cat > /tmp/x.md <<'EOF'` … `EOF` plus the command in ONE shell call.

**Batch:** alias multiple issues into one GraphQL query; loop many updates inside one shell call.

⚠️ **`first:` is a cap, and a capped result looks exactly like a complete one.** Linear pages at 50
by default and returns no warning. Counting nodes from a query with `first: 80` and reporting "80
open" is how a 151-issue board gets described as an 80-issue board. **Always request
`pageInfo { hasNextPage }` on any query whose count you intend to state**, and raise `first` until
it reads false. A number nobody paged is an estimate — label it or do not print it.

**Why:** Dima steers through label descriptions and relations; a shallow fetch silently discards his steering. Related: [[native-relations-always]], [[pm-scrape-strategy]], [[no-timestamps-in-prose]].

## reading relations — one hop, titles first, bodies on merit

Setting relations is only half of it. **A relation nobody reads is decoration**, and that was the
real gap: [DOT-165](linear://linear.app/issue/DOT-165) holds the mcp verdict, so anyone opening a handoff-mcp ticket without
following that edge works blind against research already paid for.

**Measured on [DOT-177](linear://linear.app/issue/DOT-177), 5 relations:**

| depth | tickets | cost |
| --- | --- | --- |
| hop 1 bodies | 5 | **~2.3k tokens** |
| hop 2 bodies | +7 unique | **~5k running** |
| hop 3 | unbounded | — |

📌 the graph has **cycles** — DOT-73 and DOT-173 each appeared twice at hop 2 — so naive recursion
re-reads and never obviously terminates.

**The rule, and it is deliberately small:**

- **always** pull hop-1 relations with `identifier · title · state` only. ~20 tokens each, so it is
  effectively free and it is already in the GET contract above.
- **read a hop-1 body when its title says it decides something about the task in hand.** a research
  ticket with a closing word is the high-value case; a scheduling `blocks` edge rarely is.
- **hop 2 is a consideration, not a ban.** having read hop 1, look at its relation titles and ask
  whether any would change the work. if yes, dig. Dima's steer, and it is the right one: *«we truly
  have useful info in linear»* — a hard stop at hop 1 would leave it there.
- what recursion must never become is **automatic**. the cost is unbounded and the graph has
  cycles; the defence is deciding each hop on merit, not a depth limit.

🚨 **never filter relations by state, and never skip a closed one.** The instinct is backwards: a
**closed** ticket is usually the *most* valuable edge on the graph, because closing it is what
produced the closing word. [DOT-165](linear://linear.app/issue/DOT-165) is exactly this — the mcp verdict lives in a Done ticket, and
skipping it because it is Done means walking into the handoff-mcp work blind to research already
paid for. Open/closed says whether work remains; it says nothing about whether the ticket holds
knowledge. Filter open-vs-closed on **boards and counts**, never on relation reads.

📌 **but Done is not the same as Canceled.** the payload is the closing word, and a canceled or
archived ticket has none — it was abandoned, not concluded. so: **Done ⇒ read it. Canceled or
archived ⇒ skip it.** the split is by state *type*, not by "is it open".

**Setting them, with the same restraint:** the test is *«would this change how I do the other
one?»* — not «are these topically similar». `blocks`/`blocked by` for real ordering, `related` for
knowledge worth finding later. Everything else is noise that makes the graph unreadable, which is
how the reading habit dies.
