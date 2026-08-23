# 2026-08-23 — the paths probe, and the connector sweep

run `cw·20260819·batch1` · cclio · opus 5 · DOT-131

## 1. the probe's first round tested the wrong trigger

**what broke.** direction 2 of the `paths:` probe told the instrument to run `cat <matching file>`.
it saw nothing, which reads as «`paths:` does not inject on trigger». the actual trigger is the
**`Read` tool**; `cat` through Bash never fires it. round 2 with `Read` flipped the answer.

**cost.** one extra probe session. cheap only because the contradiction was noticed.

**lesson.** `research-vs-lived-evidence` already says it: *«when a mechanism returns nothing,
suspect your own inputs before the mechanism.»* a null result was one sentence away from being
written into the checkup as «the presence half does not work».

📌 the sharper version, and it is new: **a probe measures the path it exercises, not the concept it
is named after.** «read a matching file» is not one operation — `cat` and `Read` are different
events to the harness, and only one of them is the trigger.

## 2. the finding that came out of it is bigger than the probe

this session's own instructions say to prefer Bash for reads. a session under that instruction
would **never fire a single `paths:`-scoped rule**, and a scoped rule would be indistinguishable
from a deleted one from inside. recorded in `docs/agents/memory-checkup.md` step 4.

## 3. deleting two agents was not a deletion

dima asked to delete `x:sweep-issues-reviewer` and `x:sweep-issues-verifier` «in place everywhere».
they were spawned by name in three places in `x:sweep-issues`, so a straight `rm` leaves a skill
that errors on its own main loop. folded the two mandates into `skills/sweep-issues/references/`
and repointed the spawns at `general-purpose` with explicit models.

📌 **an «everywhere» delete is a graph operation, not a file operation.** the cheap check is one
grep for the name before the `rm`, and it is the same shape as the connector pass this ticket is
about.
