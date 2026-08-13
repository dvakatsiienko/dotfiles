# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to
Linear (team `DOT`), where a role is a status, a label, or a status+label pair.

| Role in mattpocock/skills | In Linear                    | Meaning                                  |
| ------------------------- | ---------------------------- | ---------------------------------------- |
| `needs-triage`            | **Triage** status (inbox)    | Maintainer needs to evaluate this issue  |
| `needs-info`              | Backlog + `needs-info` label | Waiting on reporter for more information |
| `ready-for-agent`         | Todo + `agent` label         | Fully specified, ready for an AFK agent  |
| `ready-for-human`         | Todo + `human` label         | Requires human implementation            |
| `wontfix`                 | **Canceled** status          | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), apply the
corresponding status/label via `linear issue update`.
