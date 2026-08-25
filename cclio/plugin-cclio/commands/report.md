---
description: load when dima says «sup», «where are we», «status», or asks for the session board — one compact status message.
---

# /cclio:report

loads on `/cclio:report`, or when dima asks «sup» / «where are we» / «what's next» / «report».

ONE message, this shape, nothing more:

📊 **run** · `<run id>` — **elapsed** · `<time>`

🟢 **done** · `N / ~M`
- **<area>** · value with `backticked` artifacts and https ticket links
  (2-4 biggest, one line each)

🚧 **in flight** · what runs right now
⏸️ **left** · next 2-3 concrete items, in order
🟩 **freebies** · `N` ready — the 1-2 juiciest, id + one-line what; «none open» if empty
❓ **on dima** · open calls; «nothing blocked» if none
🃏 · one-liner mood

## freebie sweep — mandatory
any «sup / what's next / where are we» triggers a FRESH linear query for open issues carrying
the `freebie` label. GraphQL, never `issue view`, never from memory.
- `freebie` = pre-approved by dima. an agent may just do it and close it, no ask needed.
- offer to run the cheap ones now. strip the label from anything already done.

## format rules
- **bold keys**, plain values, `backticks` for ids/files/commands
- EVERY ticket id a full https link, never bare:
  [DOT-N](https://linear.app/x-com/issue/DOT-N) — it must open in a browser
- counts come from real state (flowlog statuses, linear, git), never guessed
- ≤16 lines. no history retelling.
