# CST-SPEC — Continuation State Transfer

Single definition of a CST, consumed by every handoff frontend (Claude Code `handoff*` skills, the `mcp-handoff-desktop` server for Claude Desktop). Edit here, never fork the text.

A CST is a machine-optimized context package one thread produces so another thread — in any frontend — behaves indistinguishably like a continuation of it at a fraction of the tokens. It is NOT a summary: it is an *upgraded compaction*, expanded with specific attention to the data that naive summaries lose.

## Calibration (read first, calibrate everything to this)

The user deliberately keeps very long threads because they hold key details, but resuming one after cache expiry re-reads the whole history uncached (≈20% of a 5h usage window in Claude Code; Desktop threads are often far longer). The CST replaces that resume. So do NOT summarize — preserve. When unsure whether something matters, INCLUDE it; under-preservation is the failure mode. Size is handled by transport, never by trimming substance.

If a TARGET/focus was stated (what the continuation is for), weight R/D/S toward it; compress the rest harder but never to zero. No target = full continuation.

## Sections (priority order)

- **G**: goal + current mental model of the problem.
- **R**: user-stated requirements/preferences/corrections, verbatim or near-verbatim (highest-loss items in naive summaries — be generous here).
- **D**: decisions made + one-line rationale each (so the continuation doesn't re-litigate).
- **S**: state — done / in-flight / exact next step.
- **C**: carry-forward — long-lived facts not yet persisted anywhere, each dated `[YYYY-MM-DD]` (added or last re-confirmed). If the producing thread holds a prior CST's C-section, do NOT copy it forward blindly — give every inherited entry one of three fates:
  - **PROMOTE** (durable preference / stable fact): emit as a `C→memory:` line — a consumer with a memory system persists it on ingest — and drop it from C forever;
  - **KEEP** (still true AND relevant, or user re-confirmed): refresh its date;
  - **DROP** (transient, superseded, or untouched >14 days / 2 generations): list dropped items in one `C-dropped:` line so the consumer and the user can veto.
  - Cap C at ~12 entries; over cap evict oldest-dated first. C is a transfer buffer, not a database — monotonic growth is its failure mode.
- **P**: pointers — paths, branches, commands, URLs, session refs, doc names. Pointers only, NEVER file/log/diff contents; the consumer re-reads from source. Specs/plans/ADRs/issues/commits live where they live — reference, don't copy. A CST ballooning past ~8k tokens is a content-dump smell — audit it and convert dumps to pointers; conversation-derived substance stays.
- **K**: suggested skills/agents/tools the continuation should reach for (only non-obvious ones). Omit in frontends without tooling context.

Omit anything re-derivable from repo/git/files.

**TRUTH RULE**: mark unverified beliefs as such (prefix `?`) — "X isn't built", "tests pass" written as fact when only assumed becomes a false premise the continuation will never re-check. Facts and assumptions must be distinguishable.

**REDACT**: no API keys, tokens, passwords, or PII — reference where a secret lives (env var name, file path), never its value.

## Store (shared across frontends)

- Location: `~/.claude/handoffs/` (dir `chmod 700`, files `chmod 600`).
- Filename: `<utc-ts>-<slug>.md`; append `-shared` before `.md` when multiple threads are expected to pull it.
- Lifecycle: a consumer deletes the file on successful ingest, EXCEPT `-shared` files (left for other pullers); every frontend sweeps files older than 24h on any handoff operation. History stays clean by design — pending files are the exception, not the norm.

## Ingest (consumer contract)

Ingest silently — never echo the CST into visible output; confirm in ≤2 lines (thread topic + next step). Persist `C→memory:` lines into the memory system if one exists (else keep them in C when re-handing-off). Honor R and D as if the user said them in this thread. Then proceed exactly as the old thread from S.
