---
description: load when dima types /cclio:checkpoint, says «checkpoint», or warns that we switch topic and he wants the thread thinned without losing state — the half-halt that ends in his /compact.
---

# /cclio:checkpoint [drop …]

**a half-halt, no exit.** frees the thread of a finished topic while everything else survives —
the same guarantees as a halt, minus the goodbye. dima's spec (2026-09-10): as few steps as
possible; memory as precise as possible after the resume; only the unwanted absent; he names what
to drop, or i suggest and drop only what he confirms.

📌 `/compact` is dima's to type; nothing here can run it. the ritual ends by handing him the line.

## 1. the keep/drop proposal — one message, then stop

- list the session's topics, one line each, **kept by default**
- mark my drop suggestions 🗑️ with the file that already holds the outcome (a doc, a ticket, the
  flawlog); nothing drops unconfirmed
- with args (`/cclio:checkpoint drop notes bench, the #67 rounds`): his list wins, no proposal
  round — go straight to 2
- always kept, unlisted: the boot ingest, the inbox items and their homes, every open ask in his
  words, the coder roster, my own pending suggestions, the flowlog and queue state

## 2. land, same as a halt's middle

- inbox: every item has a home, content cleared, headers stay (halt phase 1.5)
- flawlog flush: one batched proposal, his one approve, execute (halt phase 3); stories appended
- milestones refreshed (halt phase 3.5)
- gazette: `/cclio:gazette` writes the ⸻ upd block; **no wire** unless he says so
- **the coder roster**: retro received? still needed? a coder that is done is stopped now
  (`claude stop <id>`), never carried through a compact

## 3. the CST — fuller than a halt's

`/x:handoff` to the store, slug `<runid>-checkpoint-<n>`. on top of the halt CST:

- **the keep list verbatim**: each inbox item and where it went, each open ask in dima's words,
  each hot topic with its current state and next move
- **the drop list as pointers**: one line per dropped topic naming the file that holds it — a
  dropped topic is reachable, never remembered
- the coder roster with ids and status
- the ⏳ block as it last stood

## 4. hand him the two lines

📋 **copy → this session** 📋

```
/compact keep the boot ingest, the inbox items and their homes, every open ask, the coder roster and the current ⏳ block; drop <his drop list, one clause each>
/x:handoff-ingest <runid>-checkpoint-<n>
```

✂️ **end** ✂️

the first thins the thread with the hint as the steer; the second restores the precise state on
top of what the compact kept. the prefetch hook re-runs on compact by itself (queue, roadmap,
handoffs, reminders).

## 5. the probe — first runs only

after the ingest, dima asks ten facts from the keep list, no tools allowed. ten of ten = the
checkpoint keeps what a halt keeps; a miss goes into the CST template above, once. drop the probe
once two runs pass.

## completion criterion

the proposal was verdicted line by line, the CST is in the store, the coder roster is stopped or
carried on purpose, and the two-line fence is the last thing in the reply.
