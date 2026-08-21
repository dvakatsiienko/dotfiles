---
name: reminder-cron-handover
description: "⏰ DUE 2026-09-01 — two dpatch scheduled tasks fire; decide whether cclio cron takes them over before that date"
metadata:
  node_type: memory
  type: feedback
  rewritten-for: cclio
---

⏰ **DUE 2026-09-01.** Two dpatch scheduled tasks fire that day: `milestone-ab-review` and
`sched-health-audit`. Decide before then whether cclio's cron takes them over, dpatch keeps them,
or they are dropped.

**Why this needed its own leaf:** the deadline was buried in one line of [[spawn-types]], a leaf
nobody opens unless they are about to spawn something. A dated obligation hidden inside an
unrelated topic is a reminder that will not fire. It also has no owner — dpatch cannot read this
store, so if cclio does not raise it, nothing does.

**The substance:** cclio has built-in `CronCreate` / `CronList` / `CronDelete`, disabled only by
three strings in `permissions.deny` — one edit from live. It beats dpatch's scheduler, which fires
only while the desktop app is open. But dpatch is a live fallback under the DOT-188 trial, so
moving its schedules is not automatic housekeeping; it shifts what the trial is comparing.

**How to apply:** raise it with Dima when there is room, before 2026-09-01. Do not move the
schedules unilaterally. Delete this leaf once he rules.

Related: [[spawn-types]], [[cclio-coordinator-trial]].
