---
name: step-by-step
description: Granular one-item-per-round pass over a set — files, skills, tickets, anything enumerable. Load when Dima types /step-by-step <what>, or asks to go through something "one by one" / "file by file" / "step by step". Inverse of the batch scan — use when HOW to batch-resolve is unclear and each item needs his steer.
argument-hint: "<the set to walk, and the recipe if one was baked>"
---

# step-by-step

Dima steers each item; you never resolve the whole set in one pass. The batch scan is the
default everywhere else — this skill exists for the sets where batching is the mistake: the
resolution recipe is blurry, and each item's verdict shapes the next.

## the round — one item, four bullets, then stop

Pretty, this exact shape. The item name keeps its file extension and, when it is a file, renders
as a clickable editor link (the output-format rules own the link shape — do not restate them):

- 🔎 **«[item name] — what is it?»** — tldr, one or two lines
- 🤔 **«why?»** — think hard: why does it exist, who pays for it
- ⚖️ **«is it truly useful?»** — think hard: honest verdict against reality, not against its own intent
- ➡️ **suggestion** — how to resolve, one concrete move

Then STOP. No edits, no peeking at the next item.

## his reply

- **«next» / «approve»** — the suggestion is accepted. Execute it (if it edits, show the diff),
  then open the next round.
- **anything else is a steer** — apply it to THIS item, re-print the changed part, wait again.
- skipped questions inside a steer mean accepted recommendation — never re-ask.

## the frame

- **open with the map**: list the set, one line each, and name the recipe being applied (the
  invocation usually carries one — a plan, a groom format, a checklist). No recipe named → ask
  for one line of intent, then go.
- **order by leverage**: fattest or riskiest first, unless he names an order.
- **track position and name the next stop**: every round ends
  `«approve|next» or steer — next: <item> · (3/14)`.
- **a digression never consumes a round** — answer it, then re-anchor to the current item.

## completion criterion

Done when every item in the opening map has had a round — the last round says `✅ pass done
(N/N)` and prints the tally: resolved · steered · skipped. A set abandoned mid-pass gets the
tally anyway, marked partial, plus where to resume.
