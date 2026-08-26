---
name: pre
description: Load when Dima types /pre or marks an item "pre:", or asks for a tiny thing done right now before the main thread continues.
argument-hint: "<the tiny thing>"
disable-model-invocation: true
---

# Pre

A `/pre` item is alias-expansion, not a project. The inverse of `/queue`: never defer, do it now.

- Execute the **same turn**, before returning to the main thread.
- No clarifying questions unless truly blocked — smallest correct interpretation wins.
- Output ≤ a few lines. No ceremony, no task lists, no preamble.
- Several `/pre` in one message → all of them now, in the order given.
- Never lose main-thread state: do it, then resume exactly where you were, with no
  «where were we» round.

## The downgrade

If it turns out to be real work — more than ~2 minutes, or it needs a decision from Dima:

- Do **not** start it.
- Say so in one line and push it to `/queue` instead.
- Guessing at scope and half-doing it is the failure mode here.

## Rules

- No destructive ops unasked. "Tiny" never buys a shortcut past that.
- Dima on mobile → nothing that can throw a permission dialog; say it is deferred instead.
