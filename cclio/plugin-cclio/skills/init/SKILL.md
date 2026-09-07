---
description: boot ritual for cclio — light by default; add «board» / «full» for the tracker picture
disable-model-invocation: true
---

# /cclio:init

light boot by default. an argument that loosely means the full picture — «board», «full», or
similar — adds tracker orientation. run silently, report as ONE opening message.

🎯 **the boot ORIENTS, it never resolves.** steps 1–8 are pure parse-and-assemble: no answers
written, no tickets touched, no inbox item worked. the opening board ends with a proposed
processing order and STOPS for dima's word. resolution then runs as labeled sub-batches with a
checkpoint after each (`habit-pacing`); heavy queries fire at the step that needs them, never
up front. a query too fat for its checkpoint → say so to dima instead of absorbing it.

## 1. healthcheck
- barrel probe: name one fact that lives ONLY in a leaf body (the commit hash `d03f3da` in
  `sys-settings-drift` — it appears in no barrel line). cannot name it → 🚨 the import chain
  broke; say so and read `memory/_MEMORY.md` by hand for this session.
- `ls -l ~/.claude/settings.json` — a REAL FILE where the symlink belongs is silent divergence
  from dotfiles. flag it.
- tracker reachable: `linear api 'query { viewer { name } }'`. 📌 there is no `linear whoami`.
- any check fails → report the failure FIRST, before any work.

## 2. the roadmap block 🧭
the prefetch prints the linear initiative «roadmap»: its status and nine-line body, the attached
projects by start date (the step in progress), the dependency edges, and every open milestone
with its tickets in `sortOrder`. **that block is the answer to «what's next»** — name the step
and the next ticket from it; never re-query what it already printed.

## 3. inbox sweep 📬
prompts folder: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Dima's Vault/prompts`
- read `inbox.md` — cclio's personal email, **a plan source, never a work order.** EVERY item —
  smallest aside included — gets a line in `flowlog.md` with a status (✅🚧❓⏸️🎫) and a lane:
  answer-now / step-by-step / defer / observation-only. the checklist line is the completeness
  guarantee; resolution is paced later. **deletion happens at the halt, never here.**
- empty → «inbox clean». marked FROZEN → do not touch, report frozen, move on.

## 3.5 the broom 🧹
dima pins 🧹 on tickets that look off. fetch them (query ran 2026-08-31):

```
linear api 'query { issues(filter: { labels: { name: { eq: "🧹" } } }, first: 50) { nodes { identifier title state { name } } } }'
```

non-zero → they enter the opening board as a proposed early sub-batch, run per `craft-pm`'s
broom section (prettify only, no data loss, one approve). zero → say nothing.

## 4. continuity
- 📬 **pending handoff addressed to you → PULL IT NOW** via `/x:handoff-ingest`. never `ls` the
  store and read the file by hand — 🚨 **the skill DELETES on ingest, and that deletion is the
  point**; a CST read with `cat` stays pending and makes the store lie. one exception (the
  skill's): never ingest a CST addressed to another agent — report whose it is and leave it.
- active run id from the last CST META → continue it, never mint one mid-story. a CST marked
  FROZEN is not the active one.
- read `.claude/x-queue.md` — offer the top item; it never surfaces on its own. long-lived items
  are tickets, not park lines.

## 5. stuck reminders ⏰📌
`/remind stick` writes `⏰📌` entries into the auto-memory store; **raise every one at every
boot, unprompted** — that is the whole difference from an ordinary `⏰`. an answered stuck
reminder still surfaces; it dies only when dima says drop it. none → say nothing.

## 6. self-grill 🥊
read the **last two files** in `~/.claude/shelf/flawlog/` and ask ONE grounded question — the
weakest part of cclio as coordinator or pm, with the fix. **two lines, last lines of the board:**

```
🥊 <the issue, one line>
➡️ <the approach, one line>
```

no evidence paragraph, no options, no quotes. **grounded or silent — never invent one.** nothing
real in the logs → skip the step entirely.

## 7. opening board
one message, short lines, **no queries here — pure assembly**:
- «hey <model> here» (the root claude.md rule)
- healthcheck verdict (one line if green)
- ⏰📌 stuck reminders, own line each (omit if none)
- inbox status · handoffs pending · queue depth + top item
- 📋 the proposed processing order — the flowlog checklist, lanes marked, sub-batches labeled;
  **the board ends here and waits for dima's word.** he corrects the parse before any work runs;
  a skipped question means the recommendation is accepted
- ✍️ prompt coaching, 1–2 lines max: the ONE thing in today's inbox that made parsing harder,
  and how to write it next time. parsed clean → just «prompt is good». grounded in this inbox
  or silent — never a generic writing tip
- 🥊 self-grill, last line (omit if nothing real)

## 8. flaw capture 📝
open the per-session log at `~/.claude/shelf/flawlog/<YYYY-MM-DD>-<topic-slug>.md` — naming rule
and habits live in `/cclio:flawlog`, which loads alongside this boot.

---

## board mode — `/cclio:init board`

adds tracker orientation to the boot. **state is queried, never remembered** — a stored board
goes stale silently and gets read with confidence.

**one query serves the skeleton** (per-project counts blow linear's complexity cap — derive
counts client-side):

```
linear api 'query { teams(first: 10) { nodes { key name } } projects(first: 50) { pageInfo { hasNextPage } nodes { name state description } } issues(filter: { state: { type: { nin: ["completed","canceled"] } } }, first: 250) { pageInfo { hasNextPage } nodes { identifier project { name } parent { identifier project { name } } } } }'
```

- **skeleton**: compact table — project · state · open count · what it is for (the `description`
  is the payload). count no-project issues too; an unprojected ticket is invisible on every board.
- **milestones** — the first source of truth for «what's next»:

```
linear api 'query { projectMilestones(first: 50) { pageInfo { hasNextPage } nodes { name project { name } issues(first: 50) { nodes { identifier state { type } } } } } }'
```

  one line per milestone: `project · milestone · done/total`. ⚠️ flag on sight: a milestone with
  0 issues, and one whose done-count disagrees with the board — both mean nobody maintains it.
  📌 milestones are project-scoped; `Initiative` is the cross-project layer.
- **placement drift**: flag every open sub-issue whose project differs from its parent's. clean →
  one line. non-zero → list ids, do NOT fix unasked.
- ⚠️ **read both `pageInfo.hasNextPage` values before printing any number** — a capped page looks
  complete, and this has already produced two wrong counts.
- 📌 the class this cannot catch: two stories cutting one domain on different dimensions (DOT-184
  by artifact vs DOT-28 by channel). before creating or splitting a story, name the dimension it
  cuts on and compare against the stories already covering that domain.

---

## the command family
- global, any ccli session: `/pre` · `/queue` · `/remind` · `/handoff` · `/cmt` · `/x:pm`
- coordinator-only: `/cclio:init [board]` · `/cclio:report` · `/cclio:flawlog` ·
  `/cclio:graceful-halt` (bare = planned finish, `stop` = immediate)
- nothing in the global family may assume this home exists.

## rules
- default verb is FOLD OR DROP, not file. one flush per session.
- no destructive ops unasked.
- dima on mobile → nothing that can throw a permission dialog.
