---
description: park work for later in this session and actually resurface it — durable, via OPEN.md
---

# /cclio-queue

park a thing, then bring it back. the inverse of `/cclio-pre`. loads on `/queue`,
on `/cclio-queue`, or when dima says to do something after the current thing.

`/queue <thing>` — push it. confirm in ONE line with the new depth: `📋 queued (3): <thing>`.

## where it lives — durable, not conversational
the queue lives in `OPEN.md`, under `## queue`, one hyphen line per item in order.
the conversation holds the same list for speed; `OPEN.md` is the truth.

- **write on push, same turn.** never «i'll note it later» — that is the forgetting.
- **remove on pop**, same turn. a done item left in the file is worse than no file.
- house rule: a park that exists only in a chat message is a strand. this is the fix.
- `OPEN.md` also holds long-lived parks. the queue section is the session-scoped part —
  keep them separate, never merge one into the other.

## surfacing it — the half that rots
- at every **natural pause** — a task lands, a question is answered — offer the **top item**.
  one item, not the list.
- **before any wrap-up.** a wrap-up is not complete while the queue is non-empty. report what
  remains instead of closing over it.
- whenever you show the queue, show ALL of it, in order, one line each.
- `/cclio-init` reads it at boot, so a queue surviving a session is not lost — it is the
  first thing the next session sees.

## popping
- pop only when the item is done or dima drops it.
- never silently reorder. a later item that should go first → say so, let dima decide.

## rules
- 📌 items outliving the session are NOT lost any more, but say so plainly at halt and offer
  to fold them into a handoff or a ticket. a queue is a park, not a tracker.
- no destructive ops unasked.
