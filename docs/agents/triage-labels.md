# triage labels

📌 **pointer, not truth.** label vocabulary is defined in `docs/tracker/CONTEXT.md`; the
state↔role map and the full label contract live in the `x:pm` skill
(`references/workspace.md`). when this file disagrees with either, they win.

the only thing here is the bridge: the mattpocock skills speak five canonical triage roles, and
this is how those names land in linear.

| role in mattpocock/skills | in linear                 | meaning                                 |
| ------------------------- | ------------------------- | --------------------------------------- |
| `needs-triage`            | **Triage** status (inbox) | maintainer needs to evaluate this issue |
| `needs-info`              | Todo + `needs-info` label | blocked on an answer, but still in play |
| `ready-for-agent`         | Todo + `agent` label      | fully specified, ready for an afk agent |
| `ready-for-human`         | Todo + `human` label      | requires human implementation           |
| `wontfix`                 | **Canceled** status       | will not be actioned                    |

when a skill mentions a role (e.g. "apply the afk-ready triage label"), apply the corresponding
status and label via `linear issue update`.

📌 `human` is about *who does the work*, never about *whose ticket it is*. that second thing is
the assignee, and assigned-to-dima is strictly his — agents never resolve it.
