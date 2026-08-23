---
name: ticket-refs-on-dispatched-work
description: "When dispatching ccli for ticket work, always pass the ticket ID and require cmt ref keywords; closing stays with dpatch."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8ea12526-5405-4c3b-8de4-519b32e3e1d8
  modified: 2026-08-17T13:21:04.867Z
---

When a coordinator sends a worker session work that belongs to a ticket, the spawn MUST:

1. **Name the ticket ID explicitly** — the `x:cmt` skill never guesses ids.
2. **Instruct non-closing magic keywords** — `- ref DOT-N` on every commit touching the work,
   so commits appear in the ticket's Resources block in Linear (Dima relies on that history).
3. **Never auto-close via keyword** — a worker uses `Closes DOT-N` only when its coordinator
   explicitly says so. Default: **the coordinator verifies, then closes** via the `linear` CLI
   with a context comment.

📌 **the dispatcher closes.** whichever coordinator sent the work is the one that verifies and
closes the ticket.

**Why:** closing keywords also assign the ticket to the commit author and fire on push —
when orchestrating, verification happens at the coordinator's level, so closing authority stays there.
DOT-112 sat open after its work shipped precisely because this contract didn't exist.

Scope: orchestrated sessions only. When Dima drives a session directly from the terminal, it follows
`cmt` fully as written, closing keywords included. See [[spawn-types]].
