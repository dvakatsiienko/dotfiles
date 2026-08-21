---
name: session-ends-with-a-halt
description: Every cclio session is assumed to close with the graceful-halt ritual — run it when Dima signals the end, without waiting to be told the command
metadata:
  node_type: memory
  type: feedback
---

**The assumed shape of a session end, Dima 2026-08-21:** a cclio session finishes with
`/cclio-graceful-halt`. He may type it — or he may just say something that means *we are done*, and
then **running it is yours, unprompted.** Do not wait for the slash command.

**What "naturally asks to" sounds like:** "let's wrap", "that's it for today", "good point to stop",
"start fresh after this", "i'm done". Read the room, not the syntax.

**What it produces**, and this is the part Dima cares about — the skill has the full phases:
- a **short** wrap of what got done
- the interesting facts, not the complete log — what surprised us, what we learned
- a **copy-pasteable boot prompt** for the next session: the boot command, how to pull the CST by
  slug, first moves, and the run id to continue
- the CST itself, mandatory — cclio cannot see sibling sessions, so an unwritten CST loses the run

**The pair, and the difference is planned vs immediate — never careful vs careless:**
- `/cclio-graceful-halt` — there is time to talk. Plan the finish, agree an order, land the leaves.
- `/cclio-graceful-stop` — he has to go NOW. One pass, no conversation.

📌 **Never open the halt plan unprompted mid-task.** The trigger is his signal or a genuine natural
boundary. A halt that arrives early strands the work it was meant to protect, and a halt that grows
into a work session has failed at its one job.
