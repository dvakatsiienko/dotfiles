---
name: ticket-refs-when-dispatching-cc
description: "When dispatching ccli for ticket work, always pass the ticket ID and require cmt ref keywords; closing stays with dpatch."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8ea12526-5405-4c3b-8de4-519b32e3e1d8
  modified: 2026-08-17T13:21:04.867Z
---

When dpatch sends ccli work that belongs to a ticket, the spawn/message MUST:

1. **Name the ticket ID explicitly** — ccli's `cmt` skill never guesses ids.
2. **Instruct non-closing magic keywords** — `- ref DOT-N` on every commit touching the work,
   so commits appear in the ticket's Resources block in Linear (Dima relies on that history).
3. **Never auto-close via keyword** — `Closes DOT-N` only when dpatch explicitly says so.
   Default: dpatch verifies, then closes the ticket itself via the `linear` CLI with a
   context comment.

**Why:** closing keywords also assign the ticket to the commit author and fire on push —
when orchestrating, verification happens at dpatch's level, so closing authority stays there.
DOT-112 sat open after its work shipped precisely because this contract didn't exist.

Scope: orchestrated sessions only. When Dima drives ccli directly from the terminal, ccli follows
`cmt` fully as written, closing keywords included. See [[spawn-types]].
