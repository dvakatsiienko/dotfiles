# TRK-0002 — label vocabulary: block direction, standing, vet

status: accepted (dima, 2026-08-18)
context: `needs-info` named a block without saying which way it pointed — a ticket waiting on dima and a ticket waiting on an agent carried the same label and could not be filtered apart. separately, standing tickets (DOT-82) were parked in a fake perpetual In Progress because no label said "open by nature", and the TRK-0001 consequence line left that state question open. label names had also drifted toward hyphens, and team-level labels would fragment the vocabulary across DOT/BYT.

decision — one entity per id:

- **L1 `needs human`** — the agent is blocked on dima's information or decision. replaces the blocked-on-dima half of `needs-info`.
- **L2 `needs agent`** — dima is blocked on agent knowledge or research. new; the direction that had no name.
- **L3 `needs-info`** — retired. every use migrates to L1 or L2; nothing keeps the old name.
- **L4 `standing`** — the ticket is long-running by nature and stays open while active. replaces parking such tickets in a perpetual In Progress; state now tracks reality (`rules/ticket-flow.md`) even for these. example: DOT-82.
- **L5 `vet`** — 🧪 trial. examine an idea before committing to it. mutates into `investigate` if the shorter name does not survive use; delete the label rather than keep a dead one.
- **L6 label language** — no hyphens in label names, ever. workspace-level labels only, never team-level: one vocabulary across DOT and BYT.

consequences: L6 is what retires the `needs-info` spelling as much as L1/L2 do. the role slot in `docs/tracker/CONTEXT.md` becomes `agent · human · needs human · needs agent`. `docs/agents/triage-labels.md` remaps the mattpocock `needs-info` role onto L1/L2 by direction. L5 is under test — revisit before treating it as settled.
