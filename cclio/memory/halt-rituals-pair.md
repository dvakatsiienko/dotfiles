---
name: halt-rituals-pair
description: "wrap is retired — two halts now: graceful-halt (plan the finish first) and halt-now (leave fast, break nothing)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: aab235fd-2057-4364-94ac-624e8431bffc
  modified: 2026-08-21T00:30:42.850Z
---

Dima: «you tend to init wrap immediately, it looked for me like you're interrupting flow. what I
mean is «let's plan finishing», not «finish immediately».»

`dpatch-wrap` is **retired and pruned**. Two skills replace it:

- **`dpatch-graceful-halt`** — phase 0 comes before any closing: name every live thread, sort each
  into land-now / must-park / already-done, propose an order, wait for one go. Then land, sweep,
  flowlog flush, report, CST, boot prompt, joke. Never opens unprompted mid-task.
- **`dpatch-halt-now`** — he has to leave the mac immediately. One pass, no ceremony: freeze
  anything in flight, land only what is one step from done, push only if hooks pass, write park
  notes where the work lives, save a terse CST. No sweep, no flush, no joke.

**Why:** a ritual that fires mid-flow strands task leaves, and stranded leaves are what the next
session pays for. Also: a park that exists only in a chat message is a strand.

**How to apply:** never suggest a halt unless he asks or the session is genuinely at a boundary.
When he does ask, run phase 0 and wait — do not start closing.

Related: [[halt-rituals-pair]] (superseded — delete once confirmed), [[pm-fold-or-drop]].
