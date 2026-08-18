---
name: remind
description: Persistent reminders that survive across sessions. Load when Dima types /remind, or asks to be reminded of something / to drop or list a reminder.
intended-models: haiku, sonnet
argument-hint: "[forget|clear]"
---

# Remind

A reminder outlives the conversation. It lives in the memory system, not in this thread.

## Verbs

**No argument** — take what Dima describes and store one memory entry, prefixed `⏰`:

```markdown
⏰ <the thing, in his words where possible> — set <YYYY-MM-DD>
```

Confirm in one line: `⏰ reminded: <thing>`. Never file two entries for one reminder.

**`forget`** — he describes which one in plain words, not by id. Match against the `⏰` entries,
delete the match, confirm `⏰ dropped: <thing>`. Two plausible matches → name both and ask which,
one line. No match → say so; do not guess.

**`clear`** — delete every `⏰` entry. Confirm the count.

## Raising it

The entries load with memory every session, so they are always in front of you. Re-raise one at a
**natural moment** — the work touches it, a related decision comes up, a session is wrapping. Once
per moment, one line, never a list recited on arrival.

A reminder **only** dies when Dima drops it. Not on being raised, not on looking handled.

## Timed pings — only if he named a time

A reminder is not a timer. If and only if he gives a time or cadence, also create a scheduled task
alongside the memory entry, and say both exist. Otherwise create nothing.

- `cw` / dispatch — have a scheduler; use it.
- `cc` — has none. Memory entry only; say so rather than implying a ping will fire. launchd is v2.
