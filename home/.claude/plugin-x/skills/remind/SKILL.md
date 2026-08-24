---
name: remind
description: Persistent reminders that survive across sessions. Load when Dima types /remind, or asks to be reminded of something / to drop or list a reminder.
intended-models: haiku, sonnet
argument-hint: "[stick|unstick|forget|list|clear]"
---

# Remind

A reminder outlives the conversation. It lives in the memory system, not in this thread — the
inverse of `/queue`, which parks work for *this* session only.

Store: the auto-memory dir for the current project, as one `⏰` line in a memory file that the
index points at. Never a chat message, never a scratch file.
**Exception — cclio:** a session booted in `~/dotfiles/cclio` stores in
`cclio/memory/_reminders.md` (barrel-imported, git-backed) instead of auto-memory.

**Two tiers.** `⏰` is an ordinary reminder — raised at a natural moment. `⏰📌` is **stuck** — it
is raised **at every session boot**, whether or not the moment is natural. Both die only when Dima
drops them.

## Verbs

**No argument** — take what Dima describes and store one memory entry, prefixed `⏰`:

```markdown
⏰ <the thing, in his words where possible> — set <YYYY-MM-DD>
```

Confirm in one line: `⏰ reminded: <thing>`. Never file two entries for one reminder.

**`yourself stick`** — the thing to track is the agent's own behaviour or a system it watches.
Store at the stuck tier and **pick an emoji yourself** to flavour the entry (`⏰📌 👁️ …`,
`⏰📌 🧪 …` — your call, one per entry). Same lifecycle as `stick`.

**`stick`** — store the reminder at the **stuck** tier, prefixed `⏰📌`:

```markdown
⏰📌 <the thing, in his words where possible>
```

Confirm in one line: `⏰📌 stuck: <thing>`. If the thing already exists as an ordinary `⏰`,
**promote it in place** — change the prefix, never file a second entry.

**`unstick`** — demote a stuck reminder back to `⏰`. He describes which one in plain words.
Confirm `⏰ unstuck: <thing>`. **Unstick is not forget** — the reminder survives at the ordinary
tier. Only `forget` removes it.

**`forget`** — he describes which one in plain words, not by id. Match against the `⏰` entries,
delete the match, confirm `⏰ dropped: <thing>`. Two plausible matches → name both and ask which,
one line. No match → say so; do not guess.

**`list`** — read the entries back, one line each, **stuck first**, then oldest-first within each
tier. No argument needed; this is the verb for «what am I on the hook for».

**`clear`** — delete every entry, both tiers. Confirm the count, **split by tier**, because
wiping a stuck reminder is the more expensive mistake.

## Raising it

The entries load with memory every session, so they are always in front of you.

**Ordinary `⏰`** — re-raise at a **natural moment**: the work touches it, a related decision comes
up, a session is wrapping. Once per moment, one line, never a list recited on arrival.

**Stuck `⏰📌`** — raise **at boot, every session, unprompted**, as its own line in the opening
report. Not "if it seems relevant"; every time. Then behave like an ordinary reminder for the rest
of that session — once per natural moment, never nagging.

📌 **Stuck outranks ordinary when both could be raised**, and a boot report lists stuck ones first.
This is the whole point of the tier: the things Dima most wants answered are the small questions he
accumulates away from the Mac, and those are exactly the ones a "natural moment" never arrives for.

A reminder **only** dies when Dima drops it. Not on being raised, not on looking handled, and
**not on being answered** — an answered stuck reminder keeps surfacing until he says drop it. That
is deliberate: he wants to confirm he read the answer, not have the agent decide he did.

## Timed pings — only if he named a time

A reminder is not a timer. If and only if he gives a time or cadence, also create a scheduled task
alongside the memory entry, and say both exist. Otherwise create nothing.

- `cw` / dispatch — have a scheduler; use it.
- `cc` — `CronCreate`/`CronList` exist but sit in `permissions.deny`, so today: memory entry only.
  Say so rather than implying a ping will fire. Whether to lift the deny is
  [DOT-197](https://linear.app/x-com/issue/DOT-197).

📌 A scheduled task and a reminder are different objects. Scheduled tasks already live outside
memory (dispatch holds `milestone-ab-review` and `sched-health-audit`, both firing 2026-09-01).
Never assume a `⏰` entry created one, and never assume a scheduled task left a `⏰` entry.
