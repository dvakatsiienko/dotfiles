---
description: boot ritual for cclio — healthcheck, inbox sweep, freebie sweep, opening board
---

# /cclio-init

run the steps in order, silently where possible. report as ONE opening message at the end.

## 1. announce
open with «hey <actual model> here». verify your OWN model. never inherit the claim from a
handoff or a memfile. non-negotiable.

## 2. self-healthcheck
- memory loaded? it AUTOLOADS now — `cclio/CLAUDE.md` imports `memory/MEMORY.md`, whose pointer
  lines import each leaf. **do not read the barrel by hand; that means it failed.** test it the
  cheap way: name one fact that lives only in a leaf body (the ⏰ dates in
  `reminder-cron-handover` are the easiest). cannot name one → the import chain broke, say so 🚨
  and fall back to reading `memory/MEMORY.md` for this session.
- **derive, never assert.** report the memfile stack that ACTUALLY loaded, by path, listed
  from what is in context — never from a hardcoded expectation. anything positional is
  computed at boot: `pwd`, then walk up to `/` listing every `CLAUDE.md` that exists on the
  way. this check has already been falsified once by a relocation; it must survive the next.
- against that derived list: any layer scoped to the CODER role (a `CLAUDE.md` at a
  `~/projects`-level ancestor, DOT-195) is a leak — flag it 🚨, name the file, and say the
  dotfiles→`~/dotfiles` relocation is now overdue. see `OPEN.md`.
- say plainly which layers you could NOT account for, rather than claiming a clean stack.
- `ls -l ~/.claude/settings.json` — a REAL FILE where the symlink belongs is silent
  divergence from dotfiles. flag it.
- tracker reachable? `linear api 'query { viewer { name } }'`. 📌 **there is no `linear whoami`** —
  the cli prints usage and exits 1.
- any check fails → report the failure FIRST, before any work.

## 3. inbox sweep 📬
prompts folder: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Dima's Vault/prompts`
- read `inbox.md` — it is cclio's personal email
- items found → copy into `worklog.md` with statuses (✅🚧❓⏸️🎫), propose a processing
  order, wipe inbox ONLY after dima approves
- empty → say «inbox clean»
- if `inbox.md` / `worklog.md` are marked FROZEN by dima, do not touch them. report frozen
  and move on.

## 4. freebie sweep 🟩 — standing habit
runs at every init, and again whenever dima asks «sup / what's next / where are we».
- fresh linear query for open issues carrying the `freebie` label. GraphQL, not `issue view`.
  never answer freebie state from memory.
- `freebie` = pre-approved by dima. an agent may just do it and close it, no ask needed.
- surface as a short list: id + one-line what + rough cost
- offer to run the cheap ones unattended this session; never batch-run without saying which
- freebies already done → strip the label, it is noise now

## 4.5 tracker orientation 🧭 — standing check

what the board looks like, and what is misplaced on it. both are **state**, so both are QUERIED,
never remembered — a stored copy of the board goes stale silently and then gets read with
confidence. this is the boot half of `pm-scrape-strategy`: conventions live in memory, state does
not.

**one query serves both halves.** counts are derived client-side from the open-issue list rather
than asked for per project — asking per project blows linear's complexity budget (50 × 250 scored
40132 against a 10000 cap).

```
linear api 'query { teams(first: 10) { nodes { key name } } projects(first: 50) { pageInfo { hasNextPage } nodes { name state description } } issues(filter: { state: { type: { nin: ["completed","canceled"] } } }, first: 250) { pageInfo { hasNextPage } nodes { identifier project { name } parent { identifier project { name } } } } }'
```

### a. the skeleton

- print a compact table: project · state · open count · what it is for
- the `description` is the payload — it says what each project is FOR, which is what lets a
  placement call happen without asking dima
- count issues with **no project** too; an unprojected ticket is invisible on every board
- 📌 the skeleton **orients, it does not answer.** details are still fetched on demand.

### b. milestones — the first source of truth for «what's next»

```
linear api 'query { projectMilestones(first: 50) { pageInfo { hasNextPage } nodes { name project { name } issues(first: 50) { nodes { identifier state { type } } } } } }'
```

- print one line per milestone: `project · milestone · done/total`
- **this is what answers «sup, what's next» on a cold boot** with an empty inbox and no handoff.
  the roadmap ([[dima-roadmap]]) says the order; the milestones say where we actually are in it
- ⚠️ **milestones drift, and a wrong one is worse than none.** flag two shapes on sight:
  a milestone with **0 issues attached**, and a milestone whose done-count disagrees with what the
  board plainly shows. both mean nobody has been maintaining it
- 📌 linear milestones are **project-scoped**; there is no cross-project milestone. `Initiative` is
  the layer above projects if a cross-project view is ever wanted

### c. placement drift

- flag every open sub-issue whose project differs from its parent's project
- clean → one line, «placement clean»
- non-zero → list the ids; do NOT fix unasked, a re-project is dima's call

⚠️ **both `pageInfo.hasNextPage` values get read before printing any number.** a capped page is
indistinguishable from a complete one, and this has already produced two wrong counts — a
151-issue board reported as 80, and a 75-issue project reported as exactly 50.

📌 the class this check cannot catch: **two stories cutting the same domain on different
dimensions.** DOT-184 cut by artifact («the deliverable IS a skill»), DOT-28 cut by channel
(«things crossing the cc↔cw bridge»). they covered the same tickets and neither was a duplicate of
the other, so no search finds it. before creating or splitting a story, name the dimension it cuts
on and compare it against the stories already covering that domain. different dimensions over one
domain fight over children forever.

## 5. continuity
- pending handoffs? report count + slugs. **if the newest is unread, pulling it IS the
  proposed first move** — put it at the top of the board's next-moves, do not recommend
  around it. still dima's call; never auto-pull.
- active run id from the last handoff META → continue it, never mint one mid-story
- a CST marked FROZEN is not the active one; do not supersede it
- read `OPEN.md` — BOTH sections. `## queue` = work parked by `/queue` in an earlier session;
  offer the top item. `## parks` = long-lived items. neither surfaces silently.

## 5.5 stuck reminders ⏰📌 — raise every boot, unprompted

`/remind stick` writes `⏰📌` entries into the auto-memory store. **they are raised at EVERY boot**,
whether or not the moment feels natural — that is the entire difference from an ordinary `⏰`.

- read the auto-memory dir for this project, list every `⏰📌` line
- surface each as its own line in the opening board, **before** ordinary reminders
- an answered stuck reminder **still surfaces**. it dies only when dima says drop it — he wants to
  confirm he read the answer, not have an agent decide he did
- none → say nothing. never announce an empty list

📌 the tier exists because dima accumulates small questions away from the mac, and a «natural
moment» for those never arrives. a reminder nobody raises is a reminder that failed.

## 6. opening board
one message, short lines:
- model announce
- healthcheck verdict (one line if all green)
- 🧭 the tracker skeleton — compact table, teams + projects + open counts + purpose
- placement drift count (one line if clean)
- ⏰📌 stuck reminders, each on its own line (omit the section if none)
- inbox status
- freebies (count + the 1-2 juiciest)
- handoffs pending
- queue depth + top item from `OPEN.md` (if non-empty)
- open parks from `OPEN.md`
- 1-2 proposed next moves — specific, not generic

## 7. flaw capture 📝 — standing habit
- open a per-session log at `~/projects/dotfiles/cclio/flowlog/<YYYY-MM-DD>-<runid>.md`
- log process flaws AS THEY HAPPEN, one line each: what broke, cost, lesson
- no ticketifying mid-session — too many moves. at halt, one batched analysis over the log,
  ONE decision/flush with dima.
- when a flaw class repeats, reference past logs. `~/projects/dotfiles/cclio/flowlog/` first; the pre-migration
  archive at `~/projects/dotfiles/home/.claude/flowlog/` is READ-ONLY history — never write there.
- cclio has exactly ONE write target: `~/projects/dotfiles/cclio`. never split its memory across two repos.

## the command family
- global, work in ANY ccli session: `/pre` (do it now) · `/queue` (park + resurface) ·
  `/remind` (survives sessions) · `/handoff` · `/cmt` · `/x:pm`
- coordinator-only, this dir: `/cclio-init` · `/cclio-report` · `/cclio-flowlog` ·
  `/cclio-graceful-halt` — bare = planned finish, `stop` arg = immediate finish
- nothing in the global family may assume this home exists.

## rules
- default verb is FOLD OR DROP, not file. one flush per session.
- no destructive ops unasked.
- dima on mobile → nothing that can throw a permission dialog.
