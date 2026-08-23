---
description: the graceful finish — plan it, land the leaves, close with a CST. add `stop` when dima leaves NOW
---

# /cclio:graceful-halt

**one ritual, two speeds.** `stop` is an argument, not a sibling command.

- `/cclio:graceful-halt` — dima is finishing up and there is time to do it properly. plan it,
  land what lands, wrap properly. 🚨 **invoking it IS the go — never ask for confirmation.**
- `/cclio:graceful-halt stop` — dima has to leave the mac NOW. same ritual, one pass, no
  conversation, under a minute.

**both are graceful, and `stop` is not the careless one.** it is still a halt: nothing is dropped
out of your hands, nothing is left half-applied, nothing is forced. it just prefers the quickest
safe finish over the best one. never trade safety for speed — a rushed exit leaving a half-written
file or a half-applied migration costs far more than the minute it saved.

loads on `/cclio:graceful-halt`, `/halt`, `/wrap`, or when dima says to finish the day.
`stop` also fires on `/halt stop`, `/bail`, or «i have to go».

📌 **never open the halt plan unprompted mid-task.** if dima has not asked to finish, do not
suggest it unless the session is genuinely at a natural boundary. reading the room beats running
the ritual.

## the stop lane — read this first when `stop` is passed

skip phases 0, 2, 3, and 7 entirely. do this, in order, **without asking**:

1. **freeze the dangerous things first.** any write in flight — finish it or revert it, never
   leave it half-applied. any spawned session — let it run, note its id. never kill a running job
   to save time; an interrupted agent is worse than an unattended one.
2. **land only what is already one step from done.** one command, one file save, one commit.
   needs a decision → it does not qualify. do not start anything.
3. **push if commits are clean and hooks pass.** hooks fail → force NOTHING. leave the commits
   local and say so.
4. **park notes where the work lives** — ticket comment, flowlog line, `/queue`. not in chat.
   one line each: what state it is in, and the single next action. **this is the part that must
   not be skipped**, because it is the part that pays for itself tomorrow.
5. **phase 3.5 still runs** — a stale milestone misinforms the next boot, and refreshing it is
   seconds.
6. **CST, slug `<runid-topic>-stop`.** terse is fine; state beats prose.

then report in under 10 lines: what landed · what is parked and where the note is · anything left
genuinely unsafe, named plainly and never softened · the boot line to resume.

🚫 **in the stop lane, do not:** start work however small it looks · refactor or clean up on the
way out · batch a decision to dima and act on the assumed answer · spend the minute writing a
pretty summary instead of park notes.

**the tell:** «this is quick, i will just finish it» — that thought IS the failure mode. park it
and go.

📌 a later full halt on the same run **picks up the stop lane's debt** — the sweep and the flawlog
flush it skipped.

## the full lane — phases below

## phase 0 — the halt plan, printed then executed

🚨 **typing the command IS the go.** Print the plan and start working through it in the same
turn — never stop to ask. He invoked a halt; asking «shall I halt?» makes him type twice.

one short message, then straight into phase 1:
- name every **live** thread: a ticket In Progress, an unlanded edit, a spawned session, an
  unanswered question put to dima, an unpushed commit
- sort each into **can land now** (small, finishable here) · **must park** (needs a resume
  note) · **already done**
- state the order you are taking, as a fact rather than a proposal

📌 the ONE thing that still stops for him: a **decision** inside a landing step — the flawlog
flush needs his single approval on what becomes a rule, a ticket, or nothing. That is a decision,
not a confirmation. Everything else proceeds.

## phase 1 — land the leaves
execute the «can land now» list. small only — a halt is not the time to start work. bigger than
it looked → stop, park it, say so.
each park gets its resume note **where the work lives** (ticket comment, flowlog line, `/queue`),
not in the report. a park that only exists in a chat message is a strand.

## phase 2 — missed sweep
re-read the flowlog, `.claude/x-queue.md`, and this thread for dropped asks and unanswered
questions. queued items FIRE now. mid-turn messages from dima are the usual casualty — check
those specifically.

## phase 3 — flawlog flush
read the session's flawlog, cluster the catches, ONE batched proposal (memory / rules /
announcements / tickets / drop), ONE approval, then execute and commit. see `/cclio:flawlog`.

## phase 3.5 — milestones, before the board

the boot ritual reads milestones as the first answer to «what's next», so a stale one misinforms
the next session directly. before writing the CST:

- attach anything finished this session to its milestone, and anything newly started
- if a milestone is complete, say so to dima — completing it is his call, not an agent's
- if the work drifted away from every milestone, that is the signal the **roadmap** moved. update
  [[dima-roadmap]] in the same pass rather than bending the milestones to fit
- one line in the wrap: `milestone · done/total · what moved`


## phase 4 — the board
the `/cclio:report` shape, mutated to fold in whatever the sweep and the park list surfaced.
ticket ids as full https links.

## phase 5 — handoff CST 📬
**mandatory, never skipped.** cclio cannot see sibling sessions, so the CST is its ONLY
continuity — an unwritten one loses the run.
auto-save via the handoff store; a halt implies a fresh thread next, so no here-or-fresh
question. slug `<runid-topic>-halt`. a previous CST marked FROZEN is never superseded — save
alongside and say which is which.

## phase 6 — boot prompt
hand dima a copy-paste block for the fresh thread: the boot command, how to pull the CST by
slug, the first moves, and the run id — continue it, never mint a new one.

## phase 7 — one earned joke. never skip it.

## standing rules
- unpushed commits get ONE final push ask, unless `slay` is standing
- reminders queued for the halt fire before the boot prompt
- any phase finding something big → do not fix it. park it and name it. a halt that grows into
  a work session has failed at its one job.
