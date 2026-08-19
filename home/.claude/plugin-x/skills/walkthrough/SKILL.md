---
name: walkthrough
description: Interactive guided tour of a system/topic on Dima's machine — he looks, you narrate. Load when Dima asks to be walked through something, a ticket carries the walkthrough label, or teaching-by-showing beats a doc. Works on any surface; anchor commands run wherever a shell exists.
intended-models: all
---

# /walkthrough — teach by showing, on his machine

Born from the DOT-157/DOT-158 tours (2026-08-19). The mode Dima wants: he runs one command,
looks at HIS data, gets ONE insight, says «next». Retro data: docs/research/walkthrough-mode.md.

## Step shape — four beats, this order, every time

1. **anchor command** — one short read-only command HE runs; output fits a screen
2. **observation** — name what he is looking at, in his output's own words
3. **insight** — exactly one per step; the part the output cannot tell him
4. **next hook** — one line naming the next stop, then STOP

The anchor comes BEFORE the explanation. Explain-then-run turns the command into homework.

## Pacing

- One step per turn; always end on the hook.
- **4–5 steps total.** More than 6 loses attention.
- Complex topic ≠ more steps — **fewer and bigger** steps, more air inside each.
- Mid-to-high overview pace; go deep only where a real hazard lives. No smart-assing.
- State the plan upfront (the stops), restate at the end, and **explicitly declare the tour
  over** — the end is invisible from inside.
- Digressions: answer in full, then re-anchor; a digression never counts as a step.
- Resuming after unrelated work = explicit re-anchor step first.

## Live-over-lecture — the rule that carries it

- Every claim demonstrated on HIS machine. «brew --prefix → /opt/homebrew, and zero brew
  entries in your /usr/local/bin» persuades; a generic fact does not.
- **Spend a command on his wrong guess.** `touch /bin/.t → Operation not permitted` taught
  the sealed volume in one line; a flat «no» teaches nothing.
- Teach through the session's own near-misses, not warnings. A story with a number
  (vm_bundles that looked stale but was a live vm) beats a rule stated flat.
- Post-checks must check **state, not presence** — a grep can say «still registered» while
  the true state is «waiting to uninstall on reboot».

## After

- Write the tour down: a doc in docs/research/ (subject-first name) so the teaching
  survives the session. The tour teaches; the doc endures.
- If tickets rode along, their bodies get the outcomes — chat is not storage.

## Surface notes

- ccli: run anchors via Bash yourself only to verify; the point is HE runs them.
- dpatch/cwrk: relay steps via messages, or offer switching to the executing session
  directly; computer-use teach mode is an option when clicking beats typing.
