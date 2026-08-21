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
- `relations { nodes { type relatedIssue { identifier title state { name } } } }` — the dependency map; needed to set correct new ones and to avoid duplicating work.
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
