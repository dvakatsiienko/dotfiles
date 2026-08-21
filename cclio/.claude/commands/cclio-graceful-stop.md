---
description: the IMMEDIATE finish — dima leaves NOW, one pass, break nothing, park in under a minute
---

# /cclio-graceful-stop

**the IMMEDIATE finish. use this when there is NO time to talk.** the pair:

- `/cclio-graceful-stop` — *this one.* dima has to leave the mac now. one pass, no questions,
  under a minute.
- `/cclio-graceful-halt` — dima is finishing up with time to spare. a planned conversation.

both are graceful; both break nothing. the difference is **immediate vs planned**, never
careless vs careful. same goal — no strands — but the budget here is one pass.

loads on `/cclio-graceful-stop`, `/halt-now`, `/bail`, or «i have to go».

**the one rule: never trade safety for speed.** a rushed halt leaving a half-written file, a
half-applied migration, or an unpushed commit costs more than the minute it saved.

## do this, in order, without asking
1. **freeze the dangerous things first.** any write in flight — finish it or revert it, never
   leave it half-applied. any spawned session — let it run, note its id. never kill a running
   job to save time; an interrupted agent is worse than an unattended one.
2. **land only what is already one step from done.** one command, one file save, one commit.
   needs a decision → it does not qualify. do not start anything.
3. **push if commits are clean and hooks pass.** hooks fail → force NOTHING. leave the commits
   local and say so.
4. **write the park note where the work lives** — ticket comment, worklog line, `OPEN.md`. not
   in chat. one line each: what state it is in, and the single next action. this is the part
   that must not be skipped, because it is the part that pays for itself tomorrow.
5. **save a handoff CST.** slug `<runid-topic>-stop`. terse is fine; state beats prose.

## then report, under 10 lines
- what landed
- what is parked, and where the note is
- anything left genuinely unsafe or unfinished, named plainly — never soften this
- the boot line to resume

no missed sweep, no flowlog flush, no board ceremony, no joke. those belong to
`/cclio-graceful-halt`, which picks up this one's debt if dima runs it later on the same run.

## what NOT to do
- do not start work, however small it looks
- do not refactor, rename, or clean up on the way out
- do not batch a decision to him and then act on the assumed answer
- do not spend the minute writing a pretty summary instead of writing the park notes

## the tell
«this is quick, i will just finish it» — that thought IS the failure mode. park it and go.
