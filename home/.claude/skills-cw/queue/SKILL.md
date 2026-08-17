---
name: queue
description: Defer work to later in this conversation and resurface it. Load when Dima types /queue, or says to do something after the current thing / later in the session.
argument-hint: "<thing to do later>"
---

# Queue

Session-scoped. It exists so Dima never has to type "queue this after that" again.

`/queue <thing>` — push it. Confirm in one line with the new depth: `📋 queued (3): <thing>`.

## Holding it

The queue lives in the conversation. No file, no memory entry, no timer — it dies with the session
by design. Nothing here persists; that is `/remind`.

Keep it **visible**: whenever you show it, show the whole queue in order, one line each.

## Surfacing it

- At every **natural pause** — a task lands, a question is answered — offer the **top item**. One
  item, not the list.
- **Before any wrap-up.** A wrap-up is not complete while the queue is non-empty. Report what
  remains rather than closing over it.
- Pop an item only when it is done or Dima drops it. Do not silently reorder; if a later item
  should go first, say so and let him decide.

📌 If the session is ending with items still queued, say so plainly and offer to move them into a
handoff or `/remind` — otherwise they are lost, which is correct behaviour but a bad surprise.
