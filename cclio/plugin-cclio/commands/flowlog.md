---
description: flowlog habit — fix the flaw in place first, log only what survives the attempt
---

# /cclio-flowlog

**a flaw just happened → try to fix it NOW. log only what survives the attempt.**

loads at boot alongside `/cclio-init`, whenever a mistake/friction/retry just happened, or when
dima asks «do you keep an eye on flowlog». coordinator-only, on purpose — do not generalise it
into an `x:*` skill yet.

## 1. flag on the spot, same turn
two lines in the reply. non-blocking, informational — never a topic change, never a permission
request:

```
⚠️ flaw — <what broke, one clause>
💡 fix — <the suggestion>
```

then **fix it in place if it is fixable in place.** most process flaws are: a memfile corrected,
a habit adopted, a wrong assumption named, a command pattern learned. those cost one tool call
now and a rewind at wrap.

**fixed in place → do NOT write it to the log.** it is resolved. logging it manufactures work
that re-litigates a settled thing hours later.

## 2. what actually reaches the log
only what could NOT be closed on the spot:
- needs dima's decision or approval
- needs code, a script, or a real build
- a pattern needing several occurrences before it is even diagnosable
- environment facts worth carrying but not actionable yet

file: `cclio/flowlog/<YYYY-MM-DD>-<runid>.md`, created on first entry. never dotfiles' own
`home/.claude/flowlog/` — that is READ-ONLY pre-migration history.
line shape: `what broke · cost · lesson`. one line, no essay.

also log the GOOD finds — a transferable idea worth keeping. this is system-improvement data in
both directions.

## 3. at wrap
the log is short by construction; it holds only unresolved items. cluster them, produce ONE
batched proposal (memory / rules / announcements / tickets / drop), ONE approve from dima, then
execute and commit. never ticketify catches one at a time.
when a flaw class repeats, reference past logs — a repeat is stronger evidence than a first sighting.

## 4. the failure mode to watch
several turns of visible friction with zero flags is itself the flaw — sweep backwards, flag what
was missed, fix what is still fixable.
the opposite failure: flagging so eagerly every turn carries a ⚠️. if it cost nothing and changes
nothing, it is not a flaw. **silence is the correct output for a clean turn.**
