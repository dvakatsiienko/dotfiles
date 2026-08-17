# tracker context — glossary

the linear workspace (`x-com`) domain. one term per concept, per TRK adrs. operational recipes live in `x:pm`; this file is vocabulary only.

- **team** — top split by nature of work, never by repo: `DOT` = tooling/approaches/how-we-work, `BYT` = building apps. two teams, free-plan max.
- **project** — long-lived area inside a team. never closes. DOT: pm, mind, fleet, cli, shelf, revamp, sline, numi. BYT: rl, design-system, cv, x-com-chat, tooling.
- **story** — a ticket with sub-tickets grouping one strand or batch inside a project. the only grouping term («epic» is dead, TRK-0001). no title marker — the sub-tickets are what makes it a story.
- **ticket** — unit of work. pretty title (short, descriptive, subject-first), body = key data only.
- **standing ticket** — a recurring home that never finishes (DOT-82). state semantics unresolved — see DOT-72 comments.
- **loose ticket** — projectless is legal for one-offs and idea pools (DOT-86).
- **label** — exactly one **role** (`agent` · `human` · `needs-info`) + one **kind** (`bug` · `feature` · `improvement`) per ticket; **model routing** labels (`fable-5` · `opus-5` · `sonnet-5`) are dima's notation, future label→model routing.
- **assignee** — assigned-to-dima = strictly his, agents never resolve it (≠ `human` label, which only says a human does the work). unassigned = open to anyone.
- **priority** — how much a ticket matters, p1 rare. sequencing = `blocks` relation, never inflated priority. **estimate** — complexity 1–5, not wall-clock.
- **sweep** — a read-only analysis pass over the tracker producing proposals, flushed only after approval.
- **run marker** — per-run identifier stamped on agent-created tickets (DOT-107, planned).
- **doc** — research/deliverable attached to a ticket or project the moment it is born (task outputs are ephemeral). title is the interface: topic — kind — date.
