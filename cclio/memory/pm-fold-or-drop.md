---
name: pm-fold-or-drop
description: "default PM verb is fold-or-drop, not file; one flush per session; a sweep isn't done until its own debris is retired"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: aab235fd-2057-4364-94ac-624e8431bffc
  modified: 2026-08-21T00:07:46.134Z
---

Dima: «you currently create a lot of additional work for you and me. you are intended to optimize
flow not make it hotter. you do sweeps (good), and leave a spread of pieces of work from where
swept.»

**Why:** capture is cheap for an agent (one CLI call, feels productive) and retirement is expensive
(needs his judgment). So the queue grows monotonically and he feels heat that never comes down. The
pm skill was tuned for completeness of capture — the opposite of chill.

**How to apply:**
- default verb is **fold or drop**, not file. A ticket must earn existence — if it dies when its
  parent dies, it was a body line, not a ticket.
- a sweep is not done until its own output is folded into an existing ticket or dropped. Closing
  the sweep while leaving its findings loose is the actual failure.
- **one flush per session**, not per finding. Batch drafts, one approval, execute.
- before any create: search for a similar ticket, to avoid a dupe AND to find the right parent and
  relations up front ([DOT-182](https://linear.app/x-com/issue/DOT-182) placement gate).
- act proactively but sit chill, even in the most stressful scenario.

Related: [[tickets-must-be-pretty]], [[pm-label-proactively]], [[ticket-heavy-replies-need-structure]].
