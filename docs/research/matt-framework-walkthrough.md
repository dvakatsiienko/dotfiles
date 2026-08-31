---
dies-when: absorbed into x:pm's framework map + DOT-82 standing rounds, or the framework is dropped
---

Ticket: DOT-176

# matt's framework — the walkthrough digest (2026-08-31)

five-stop tour, dima's 8 questions. the durable answers:

## the shape

- pipeline: `grilling → domain-modeling → to-spec → to-tickets → triage → implement → code-review`; satellites: tdd, prototype, research, wayfinder, wizard, codebase-design, improve-codebase-architecture.
- nearly all `disable-model-invocation: true` — the framework fires only where *encoded into the loaded layer* (linear-flow floor → x:pm → tracker CONTEXT.md → skills on demand). ambient awareness is priors only; dispatch drifted because nothing loaded there.
- `/setup-matt-pocock-skills` ran long ago (opus); its artifact is the role-mapping table in `docs/tracker/CONTEXT.md`. canonical names → local strings is the SUPPORTED mode («label strings may differ») — `improvement` for `enhancement` is mapping, not drift. risk is only table staleness (DOT-82 checks).

## the verdicts

- **ADR core is the strongest part** (dima's read, confirmed): CONTEXT.md glossary + lazy ADRs = pre-answered re-litigation, agent-native memory for a codebase. scales 100k → 3M LOC (it IS big-world DDD practice); at vscode scale the format holds, governance per context becomes the bottleneck.
- **triage machine** = handoff protocol for time-decoupled flow (maintainer-asleep / agents-running). 2 categories + 5 states, agent briefs, `.out-of-scope/` KB. thin in live-mode pairing; wakes up the day AFK batches run.
- **modularity is one-directional**: ticketing reads the domain model; the model never needs labels. ADRs-without-labels coherent; labels-without-ADRs hollow.
- **usage census**: use — grilling, domain-modeling, writing-for-agents, research, wizard, code-review, wayfinder · partial — to-spec (BYT-25 is its template), to-tickets (hand-rolled via x:pm), triage (vocabulary + the gate) · skip — implement/tdd as stages, prototype, misc/in-progress/deprecated dirs. missing-and-valuable: agent-brief format (waits for AFK), out-of-scope KB (our closing words carry it).
- **domain-modeling vs improve-codebase-architecture**: complementary, not nested — dm is the cheap continuous discipline (terms blur → run it), ica is the heavyweight periodic scan (html report of deepening candidates) that *consumes* dm's artifacts. DOT-82's standing round = ica.

## decisions this tour produced

- triage returned: agent-created tickets born in Triage, dima's review gate (x:pm 0.11.7).
- x:pm gained the framework map paragraph (0.11.8) + absolute tracker-context path (0.11.9).
- ask-guard: no ticket closes until dima verdicts each of his asks (craft-pm).
- queued: DOT-82 refresh (+ mapping-table freshness, x:pm vocabulary dedup, stale coordinator glossary entry).
