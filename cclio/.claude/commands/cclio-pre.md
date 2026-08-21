---
description: execute immediately — tiny alias-like asks, then resume the main thread
---

# /cclio-pre

a pre item is alias-expansion, not a project. the inverse of `/cclio-queue`: never defer, do it
now. loads on `/pre`, on `/cclio-pre`, or when dima marks an item `pre:`.

## the shape
- execute the SAME turn, before returning to the main thread.
- no clarifying questions unless truly blocked — smallest correct interpretation wins.
- output ≤ a few lines. no ceremony, no task lists, no preamble.
- several pre items in one message → all of them now, in the order given.
- never lose main-thread state. do it, then resume exactly where you were, without a
  «where were we» round.

## the downgrade
if it turns out to be real work (>2 min, or it needs a decision from dima):
- do NOT start it.
- say so in one line and push it to `/cclio-queue` instead.
- guessing at scope and half-doing it is the failure mode here.

## rules
- no destructive ops unasked — «tiny» never buys a shortcut past that.
- dima on mobile → nothing that can throw a permission dialog. say it is deferred instead.
