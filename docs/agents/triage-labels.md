# triage labels

📌 **pointer, not truth.** label vocabulary is defined in `docs/tracker/CONTEXT.md`; the
state↔role map and the full label contract live in the `x:pm` skill
(`references/workspace.md`). when this file disagrees with either, they win.

the only thing here is the bridge: the mattpocock skills speak five canonical triage roles, and
this is how those names land in linear. the one-to-many row is `needs-info`: it was split by block
direction (TRK-0002) and closed at three (TRK-0004), so pick the one matching what the ticket is
waiting on.

| role in mattpocock/skills | in linear                 | meaning                                 |
| ------------------------- | ------------------------- | --------------------------------------- |
| `needs-triage`            | **Triage** status (inbox) | maintainer needs to evaluate this issue |
| `needs-info`              | Todo + one of the `needs *` family — `needs human` (agent blocked on dima) · `needs agent` (dima blocked on agent research) · `needs data` (no data pool yet, gather before deciding). there is no `needs-info` label in linear | blocked on an answer, but still in play |
| `ready-for-agent`         | Todo + `agent` label      | fully specified, ready for an afk agent |
| `ready-for-human`         | Todo + `human` label      | requires human implementation           |
| `wontfix`                 | **Canceled** status       | will not be actioned                    |

when a skill mentions a role (e.g. "apply the afk-ready triage label"), apply the corresponding
status and label via `linear issue update`.

📌 `human` is about *who does the work*, never about *whose ticket it is*. that second thing is
the assignee, and assigned-to-dima is strictly his — agents never resolve it.

📌 two labels have no mattpocock role and never will: `standing` (recurring work, sits In Progress
between rounds) and `walkthrough` (dima's own mark — he wants to be walked through it). they sit
beside a role, never instead of one.

📌 a label never names a **project** — `harness: home baked` was deleted for that (TRK-0004). the
area of work is the project field's job.
