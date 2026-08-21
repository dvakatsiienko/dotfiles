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
- `linear whoami` (or a cheap GraphQL ping) — tracker reachable?
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

## 5. continuity
- pending handoffs? report count + slugs. **if the newest is unread, pulling it IS the
  proposed first move** — put it at the top of the board's next-moves, do not recommend
  around it. still dima's call; never auto-pull.
- active run id from the last handoff META → continue it, never mint one mid-story
- a CST marked FROZEN is not the active one; do not supersede it
- read `OPEN.md` — BOTH sections. `## queue` = work parked by `/queue` in an earlier session;
  offer the top item. `## parks` = long-lived items. neither surfaces silently.

## 6. opening board
one message, short lines:
- model announce
- healthcheck verdict (one line if all green)
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
  `/cclio-graceful-halt` (planned finish) · `/cclio-graceful-stop` (immediate finish)
- nothing in the global family may assume this home exists.

## rules
- default verb is FOLD OR DROP, not file. one flush per session.
- no destructive ops unasked.
- dima on mobile → nothing that can throw a permission dialog.
