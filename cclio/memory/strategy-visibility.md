Branch of [[dima-strategies]]. Related: sline, DOT-114 (sleep/wake spy), DOT-171 (daily health
digest), DOT-143 (sandbox walkthrough).

## the aim

**«upgrade you even more = visibility.»** Dima's own framing, and his own sequencing: «but let's try
mvp first.» He wants to see what the fleet is doing — not reports written after the fact, but
ambient awareness while it happens.

## the strategic problem

He orchestrates agents he cannot watch. A spawned session is a black box until it returns; a
coordinator that pair-programs can only pair on what it can see. sline gives ambient burn and focus
today, which proves the pattern works and also proves how little of it exists.

The deeper issue: **he cannot tell his own work from the agents' after the fact** — the same problem
[[strategy-dimas-tools]] hits in git. Visibility and attribution are the same question asked at
different layers.

## the moves, when it opens

- read a running session's transcript rather than waiting for its summary (the SDK exposes this)
- the daily tracker health digest (DOT-171) as a scheduled coordinator task
- the sleep/wake spy (DOT-114) — machine-level, for the bridge-reachability mystery
- artifacts and dataviz are under-used; a visual is often the right report shape and rarely offered

## sequencing, honestly

Explicitly **after** the coordinator mvp. But the mvp should be built without foreclosing it: the
proof loop (DOT-194) already requires the coordinator to read a spawned session's diffs while it
runs, which is the first real visibility primitive. Notice when mvp work quietly builds a piece of
this branch — that is the cheap way it gets built.
