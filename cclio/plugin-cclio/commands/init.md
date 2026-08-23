---
description: boot ritual for cclio — healthcheck, inbox sweep, freebie sweep, opening board
disable-model-invocation: true
---

# /cclio:init

run the steps in order, silently where possible. report as ONE opening message at the end.

## 1. announce
open with «hey <actual model> here». verify your OWN model. never inherit the claim from a
handoff or a memfile. non-negotiable.

## 2. self-healthcheck
- memory loaded? it AUTOLOADS now — `cclio/CLAUDE.md` imports `memory/MEMORY.md`, whose pointer
  lines import each leaf. **do not read the barrel by hand; that means it failed.** test it the
  cheap way: name one fact that lives only in a leaf body (the commit hash `d03f3da` in
  `settings-json-drifts-when-unlinked` is the easiest — it appears in no barrel line). cannot name one → the import chain broke, say so 🚨
  and fall back to reading `memory/MEMORY.md` for this session.
- **derive, never assert.** report the memfile stack that ACTUALLY loaded, by path, listed
  from what is in context — never from a hardcoded expectation. anything positional is
  computed at boot: `pwd`, then walk up to `/` listing every `CLAUDE.md` that exists on the
  way. this check has already been falsified once by a relocation; it must survive the next.
- against that derived list: any layer scoped to the CODER role (a `CLAUDE.md` at a
  `~/projects`-level ancestor, DOT-195) is a leak — flag it 🚨, name the file, and say the
  dotfiles→`~/dotfiles` relocation is now overdue. see [DOT-202](linear://linear.app/issue/DOT-202).
- say plainly which layers you could NOT account for, rather than claiming a clean stack.
- `ls -l ~/.claude/settings.json` — a REAL FILE where the symlink belongs is silent
  divergence from dotfiles. flag it.
- tracker reachable? `linear api 'query { viewer { name } }'`. 📌 **there is no `linear whoami`** —
  the cli prints usage and exits 1.
- any check fails → report the failure FIRST, before any work.

## 3. inbox sweep 📬
prompts folder: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Dima's Vault/prompts`
- read `inbox.md` — it is cclio's personal email
- items found → copy into `flowlog.md` with statuses (✅🚧❓⏸️🎫), propose a processing
  order, wipe inbox ONLY after dima approves
- empty → say «inbox clean»
- if `inbox.md` / `flowlog.md` are marked FROZEN by dima, do not touch them. report frozen
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
- 📬 **pending handoff addressed to you → PULL IT NOW.** run `/x:handoff-pull`. do not `ls` the
  store and read the file by hand.
  🚨 **the skill DELETES on ingest, and that deletion is the point.** reading is not consuming — a
  CST read with `cat` stays pending, gets re-offered next boot, and makes the store lie about what
  is outstanding. this is the boot's own tradition and it is not dima's call to make each time.
  📌 one exception, and it is the skill's: **never ingest a CST addressed to another agent.** report
  whose it is and leave it. filename is `<utc-ts>-<audience>-<slug>.md`.
- active run id from the last handoff META → continue it, never mint one mid-story
- a CST marked FROZEN is not the active one; do not supersede it
- read `.claude/x-queue.md` — `/queue`'s store for this place. offer the top item; it never
  surfaces on its own. long-lived items are TICKETS, not park lines — the board is queried above.

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

## 5.6 self-grill 🥊 — one question, grounded

dima's ask: use the boot to improve the coordinator, not only to orient it.

- read the **last two files** in `~/.claude/shelf/flawlog/`
- ask **ONE** question about the pattern across them — the weakest part of cclio as a coordinator
  or as a pm, with the fix you would propose
- print it as the **last line of the opening board**, after everything else
- dima answers «approve» or «grill ok» (= approve all), or steers. no answer = no change

🚨 **grounded or silent. never invent one.** a self-grill with no real evidence produces plausible
self-criticism, which is worse than nothing — it is the same failure as inventing a cause for a
symptom nobody witnessed. no flawlog files, or nothing in them worth a question → **say nothing**
and skip this step.

📌 **one question, not a set.** the boot is already long and DOT-215 exists to shorten it; this
step is the one thing allowed to grow it, so it stays to a single line.

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
- queue depth + top item from `.claude/x-queue.md` (if non-empty)
- 1-2 proposed next moves — specific, not generic
- 🥊 the self-grill question, last line, one only (omit if there was nothing real to grill)

## 7. flaw capture 📝 — standing habit
- open a per-session log at `~/.claude/shelf/flawlog/<YYYY-MM-DD>-<topic-slug>.md` — the slug is
  the session's main topic in plain words, not the run id. `/cclio:flawlog` has the naming rule.
- log process flaws AS THEY HAPPEN, one line each: what broke, cost, lesson
- no ticketifying mid-session — too many moves. at halt, one batched analysis over the log,
  ONE decision/flush with dima.
- when a flaw class repeats, read past logs in the same dir — the pre-migration archive was merged
  in, so there is one flawlog and no second place to look.
- 📌 the flawlog lives on the **shelf** — `~/.claude/shelf/flawlog/`, which is a symlink into
  `home/.claude/shelf/` and therefore git-tracked like every other `cc/` dir. write to the
  `~/.claude/...` path; the mirror rule handles the rest.

## the command family
- global, work in ANY ccli session: `/pre` (do it now) · `/queue` (park + resurface) ·
  `/remind` (survives sessions) · `/handoff` · `/cmt` · `/x:pm`
- coordinator-only, this dir: `/cclio:init` · `/cclio:report` · `/cclio:flawlog` ·
  `/cclio:graceful-halt` — bare = planned finish, `stop` arg = immediate finish
- nothing in the global family may assume this home exists.

## rules
- default verb is FOLD OR DROP, not file. one flush per session.
- no destructive ops unasked.
- dima on mobile → nothing that can throw a permission dialog.
