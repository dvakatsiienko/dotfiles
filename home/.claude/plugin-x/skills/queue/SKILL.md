---
name: queue
description: Defer work to later in this conversation and resurface it. Load when Dima types /queue, or says to do something after the current thing / later in the session.
intended-models: haiku, sonnet
argument-hint: "<thing to do later>"
---

# Queue

It exists so Dima never has to type "queue this after that" again. The inverse of `/pre`.

`/queue <thing>` — push it. Confirm in one line with the new depth: `📋 queued (3): <thing>`.

## Where it lives — durable, hidden, one per place

A park that exists only in a chat message is a strand. So the queue is written down, and the
conversation only mirrors it for speed.

**The file is `.claude/x-queue.md`.** The name says whose it is — the `x:queue` skill's — and
living inside `.claude/` keeps a technical park file out of the project root, where it is clutter.

Resolve it once per session, in this order, and say which one you picked:

1. walking **up** from cwd, the nearest directory that already contains a `.claude/` — write
   `.claude/x-queue.md` there. This is the normal case and it is what makes each place its own
   queue: a `cclio` session lands on `cclio/.claude/`, a `dotfiles` session on `dotfiles/.claude/`,
   a `bytes` session on `bytes/.claude/`. Nothing is hardcoded and the queues never mix.
2. no `.claude/` anywhere above cwd, but you are in a git repo → create `.claude/x-queue.md` at
   the repo root
3. not in a repo, or the tree is read-only → the session scratch dir, and **say so plainly**,
   because that park dies with the session

Write items under a `## queue` heading, one hyphen line each, in order.

📌 **The file holds the queue and nothing else.** It is not a place for long-lived notes, and it
is never a shadow tracker — anything with a ticket belongs on the board, which every boot already
queries. A copy here is a copy that goes stale silently.

- **Write on push, same turn.** Never "I'll note it later" — that is the forgetting.
- **Remove on pop, same turn.** A done item left in the file is worse than no file.

## Surfacing it — the half that rots

- At every **natural pause** — a task lands, a question is answered — offer the **top item**. One
  item, not the list.
- **Before any wrap-up.** A wrap-up is not complete while the queue is non-empty. Report what
  remains rather than closing over it.
- Keep it **visible**: whenever you show it, show the whole queue in order, one line each.
- Pop an item only when it is done or Dima drops it. Do not silently reorder; if a later item
  should go first, say so and let him decide.

📌 Items now survive the session, which is the point — but a queue is a park, not a tracker. If a
session ends with items still queued, say so and offer to fold them into a handoff, a ticket, or
`/remind`. Surviving in a file is not the same as being scheduled.
