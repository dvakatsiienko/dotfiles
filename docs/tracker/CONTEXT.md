# tracker context — glossary

the linear workspace (`x-com`) domain. one term per concept, per TRK adrs. operational recipes live in `x:pm`; this file is vocabulary only.

- **team** — top split by nature of work, never by repo: `DOT` = tooling/approaches/how-we-work, `BYT` = building apps. two teams, free-plan max.
- **project** — long-lived area inside a team. never closes. DOT: pm, mind, fleet, cli, shelf, revamp, sline, numi. BYT: rl, design-system, cv, x-com-chat, tooling.
- **story** — a ticket with sub-tickets grouping one strand or batch inside a project. the only grouping term («epic» is dead, TRK-0001). no title marker — the sub-tickets are what makes it a story.
- **ticket** — unit of work. pretty title (short, descriptive, subject-first), body = key data only.
- **standing ticket** — a recurring home that never finishes (DOT-82). carries the `standing` label and stays open while active; never parked in a perpetual In Progress (TRK-0002).
- **loose ticket** — projectless is legal for one-offs and idea pools (DOT-86).
- **label** — exactly one **role** (`agent` · `human` · `needs human` = agent blocked on dima · `needs agent` = dima blocked on agent research) + one **kind** (`bug` · `feature` · `improvement`) per ticket; **state** labels (`standing`, `vet` 🧪) sit beside them; **model routing** labels (`fable 5` · `opus 5` · `sonnet 5` · `haiku 4.5`) are dima's notation, future label→model routing. no hyphens in names, workspace-level only (TRK-0002).
- **assignee** — assigned-to-dima = strictly his, agents never resolve it (≠ `human` label, which only says a human does the work). unassigned = open to anyone.
- **priority** — how much a ticket matters, p1 rare. sequencing = `blocks` relation, never inflated priority. **estimate** — complexity 1–5, not wall-clock.
- **sweep** — a read-only analysis pass over the tracker producing proposals, flushed only after approval.
- **run marker** — per-run identifier stamped on agent-created tickets (DOT-107, planned).
- **doc** — research/deliverable attached to a ticket or project the moment it is born (task outputs are ephemeral). title is the interface: topic — kind — date.
- **project overview** — a project's content field, the standing description of what it is and where it stands. a tracked surface: dispatch maintains it for dima, it is never left to rot.
- **health update** — a linear project update. cadence is weekly per active project plus event-driven on real state changes (TRK-0003). ticket ids do not auto-link there, so every id is a markdown link — mandatory, not style.
