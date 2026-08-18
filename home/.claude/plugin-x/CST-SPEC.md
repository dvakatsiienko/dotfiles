# CST-SPEC — Continuation State Transfer

Single definition of a CST, consumed by every handoff frontend (`cc` `handoff*` skills, the `mcp-handoff-cw` server for `cw`). Edit here, never fork the text.

A CST is a machine-optimized context package one thread produces so another thread — in any frontend — behaves indistinguishably like a continuation of it at a fraction of the tokens. It is NOT a summary: it is an *upgraded compaction*, expanded with specific attention to the data that naive summaries lose.

**Core principle: a handoff is `/compact` on steroids.** The ingesting session behaves as a near-continuation of the source thread, not as a reader of a report about it. The name stays `/handoff` and the flow stays manual — nothing here fires on its own.

## Calibration (read first, calibrate everything to this)

The user deliberately keeps very long threads because they hold key details, but resuming one after cache expiry re-reads the whole history uncached (≈20% of a 5h usage window in `cc`; `cw` threads are often far longer). The CST replaces that resume. So do NOT summarize — preserve. When unsure whether something matters, INCLUDE it; under-preservation is the failure mode. Size is handled by transport, never by trimming substance.

If a TARGET/focus was stated (what the continuation is for), weight R/D/S toward it; compress the rest harder but never to zero. No target = full continuation.

**Scope is not focus.** Default mode is the full session carried across unfluffed. When the user asks for part of it ("hand off only the linear work"), the CST covers **only that scope**: same section skeleton, content restricted, everything outside it left out rather than compressed. Mark it in META's `scope` field. Size follows scope — never print whole history for a partial ask.

## Sections (priority order)

**META goes first, and it is the one section a human reads.** Format it prettily — headings, short lists, whitespace — because Dima peeks at it to manage several pending handoffs at once. Everything below META is for the model.

- **META**: five fields, omit any that is empty.
  - **scope** — omit entirely when the CST is full (the default). On a scoped handoff write `scope: partial — <what>`, so the ingesting session knows it is NOT a full continuation and does not act as if it holds the rest of the thread.
  - **queues** — cross-session `/queue` items still owed, one line each.
  - **first-acts** — ordered actions the ingesting session performs before anything else. Numbered; the order is the content.
  - **fleet roster** — living sessions worth reattaching to, one line each: session title, role, what it holds (e.g. `🔬 research: proto lab — proto owner — the running prototype + its findings`). Titles follow the spawn naming convention, so the title IS the address. Purpose: a dispatch session that cleared its conversation reconnects to the persistent `cc`s listed here instead of spawning new ones. Only sessions actually worth resuming — a roster of everything is a roster of nothing.
  - **compare-anchors** — numbers the next session must diff against, each labelled and dated (e.g. `/context` sizes at save time). An anchor without its number is not an anchor — see the save-time step in the sender skill.
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

## Compression contract

Per section, and it is not negotiable per section:

- **R, S, META — lossless in meaning.** Wording may shrink; content may not. A dropped requirement or a half-stated next step is the failure this format exists to prevent.
- **D, C — lossy-terse.** Deltas and dated facts only. No narrative, no how-we-got-here.
- **Conversational fluff never crosses, from either side.** Pleasantries, restated questions, thinking-out-loud, apologies — none of it is state.

Compress the **language**, never the substance. Telegraphic fragments are fine. Keep light markdown structure — headings, bullets, line breaks. Decoration costs ~5–10% of the tokens and buys back readability for the model reading it, so it stays: readable-first, no losses.

**TRUTH RULE**: mark unverified beliefs as such (prefix `?`) — "X isn't built", "tests pass" written as fact when only assumed becomes a false premise the continuation will never re-check. Facts and assumptions must be distinguishable.

**REDACT**: no API keys, tokens, passwords, or PII — reference where a secret lives (env var name, file path), never its value.

## Store contract (shared across frontends)

Normative. Every frontend re-implements this — the `cc` skills in bash, the `cw` MCP server in
TypeScript, sline in Go for the read-only count — because they cannot share a library across three
languages. So the rules live here once and implementations cite them; if an implementation and this
section disagree, this section is right and the implementation is a bug.

- **Location**: `~/.claude/handoffs/`. Directory `chmod 700`, files `chmod 600`.
- **Filename**: `<utc-ts>-<slug>.md`, where `<utc-ts>` is `YYYYMMDDThhmmssZ` and `<slug>` is
  kebab-case. Append `-shared` before `.md` when multiple threads are expected to pull it.
- **Membership**: only `*.md` directly in that directory is a handoff. Anything else — a stray
  `.DS_Store`, a subdirectory — is not, and is never counted, swept, or deleted.
- **Ingest**: the consumer deletes the file on successful ingest, EXCEPT `-shared` files, which are
  left for other pullers.
- **Sweep**: every frontend deletes files older than **24h** on any handoff operation. History stays
  clean by design — pending files are the exception, not the norm.
- **Prune**: an explicit prune deletes every pending file including `-shared` ones.
- **Races are normal, not errors.** The store is shared, so a file can vanish between listing it and
  reading it — another thread pulled it, another session pruned. An implementation must tolerate
  that silently and never fail a whole operation over one missing file.

📌 `DOT-10` plans to move this store to `~/.claude/shelf/handoffs/`. That migration touches every
implementation at once, which makes it the right moment to replace them with a single
`handoff-store` executable that all frontends shell out to — the only shape where these rules stop
being duplicated. Until then, this section is the owner.

## Ingest (consumer contract)

Ingest silently — never echo the CST into visible output; confirm in ≤2 lines (thread topic + next step). Run META's first-acts before anything else, in their given order, and carry its queues and compare-anchors into this thread. Persist `C→memory:` lines into the memory system if one exists (else keep them in C when re-handing-off). Honor R and D as if the user said them in this thread. Then proceed exactly as the old thread from S.
