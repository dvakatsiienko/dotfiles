# CST-SPEC — Continuation State Transfer

Single definition of a CST, consumed by every handoff frontend (`cc` `handoff*` skills, the `mcp-x-cw` server for `cw`). Edit here, never fork the text.

A CST is a machine-optimized context package one thread produces so another thread — in any frontend — behaves indistinguishably like a continuation of it at a fraction of the tokens. It is NOT a summary: it is an *upgraded compaction*, expanded with specific attention to the data that naive summaries lose.

**Core principle: a handoff is `/compact` on steroids.** The ingesting session behaves as a near-continuation of the source thread, not as a reader of a report about it. The name stays `/handoff` and the flow stays manual — nothing here fires on its own.

## Calibration (read first, calibrate everything to this)

The user deliberately keeps very long threads because they hold key details, but resuming one after cache expiry re-reads the whole history uncached (≈20% of a 5h usage window in `cc`; `cw` threads are often far longer). The CST replaces that resume. So do NOT summarize — preserve. When unsure whether something matters, INCLUDE it; under-preservation is the failure mode. Size is handled by transport, never by trimming substance.

If a TARGET/focus was stated (what the continuation is for), weight R/D/S toward it; compress the rest harder but never to zero. No target = full continuation.

**Scope is not focus.** Default mode is the full session carried across unfluffed. When the user asks for part of it ("hand off only the linear work"), the CST covers **only that scope**: same section skeleton, content restricted, everything outside it left out rather than compressed. Mark it in META's `scope` field. Size follows scope — never print whole history for a partial ask.

## Sections (priority order)

**META goes first, and it is the one section a human reads.** Format it prettily — headings, short lists, whitespace — because Dima peeks at it to manage several pending handoffs at once. Everything below META is for the model.

- **META**: six fields, omit any that is empty.
  - **scope** — omit entirely when the CST is full (the default). On a scoped handoff write `scope: partial — <what>`, so the ingesting session knows it is NOT a full continuation and does not act as if it holds the rest of the thread.
  - **queues** — cross-session `/queue` items still owed, one line each.
  - **first-acts** — ordered actions the ingesting session performs before anything else. Numbered; the order is the content.
  - **fleet roster** — living sessions worth reattaching to, one line each: session title, role, what it holds (e.g. `🔬 research: proto lab — proto owner — the running prototype + its findings`). Titles follow the spawn naming convention, so the title IS the address. Purpose: a dispatch session that cleared its conversation reconnects to the persistent `cc`s listed here instead of spawning new ones. Only sessions actually worth resuming — a roster of everything is a roster of nothing.
  - **run marker** — the active tracker run id (`cc·20260819·batch1`), if one was minted. The
    ingesting session continues that run instead of minting a new one, so a batch spanning two
    sessions still reverts as one. Format and stamping rules: the `pm` skill.
  - **compare-anchors** — numbers the next session must diff against, each labelled and dated (e.g. `/context` sizes at save time). An anchor without its number is not an anchor — see the save-time step in the sender skill.
- **G**: goal + current mental model of the problem.
- **R**: user-stated requirements/preferences/corrections, verbatim or near-verbatim (highest-loss items in naive summaries — be generous here).
- **D**: decisions made + one-line rationale each (so the continuation doesn't re-litigate).
- **S**: state — in-flight work and the exact next step. **Open items only** — finished work is not state, and a done-list carried across hops is the commonest source of CST bloat. A completed thing survives only as a D entry (if it settled a decision) or a C entry (if it is a fact the next session needs).
  - 🚨 **A step that depends on a HUMAN action is written as BLOCKED, naming the action — never as a verification step.** A CST once opened with "verify `cw` sees its tools after Dima's app restart", phrased as if the restart had happened. It had not, and the next session spent its boot proving a negative. The honest form is `BLOCKED on <the exact thing only the user can do>` — then the successor asks for it in its first message instead of discovering it.
- **C**: carry-forward — long-lived facts not yet persisted anywhere, each dated `[YYYY-MM-DD]` (added or last re-confirmed). If the producing thread holds a prior CST's C-section, do NOT copy it forward blindly — give every inherited entry one of three fates:
  - **PROMOTE** (durable preference / stable fact): emit as a `C→memory:` line — a consumer with a memory system persists it on ingest — and drop it from C forever;
  - **KEEP** (still true AND relevant, or user re-confirmed): refresh its date;
  - **DROP** (transient, superseded, or aged out by the decay rule below): list dropped items in one `C-dropped:` line so the consumer and the user can veto.
  - Cap C at ~12 entries; over cap evict oldest-dated first. C is a transfer buffer, not a database — monotonic growth is its failure mode.
- **P**: pointers — paths, branches, commands, URLs, session refs, doc names. Pointers only, NEVER file/log/diff contents; the consumer re-reads from source. Specs/plans/ADRs/issues/commits live where they live — reference, don't copy. A CST ballooning past ~8k tokens is a content-dump smell — audit it and convert dumps to pointers; conversation-derived substance stays.
- **K**: suggested skills/agents/tools the continuation should reach for (only non-obvious ones). Omit in frontends without tooling context.

Omit anything re-derivable from repo/git/files.

## Decay (TTL)

Info-needed survives, clutter dies. A CST is a relay baton, not an archive — every hop it is carried
without being used is evidence it was never needed.

- **D and C entries carry a max of 2 hops.** A hop is one produce→ingest. An entry re-touched in the
  producing thread on the day it is written — used, acted on, re-confirmed by the user — resets its
  counter to zero and its date to today.
- **Untouched two pulls in a row → gone.** Either drop it, or demote it to a single one-line C entry
  if the bare fact still has value. A demoted entry starts a fresh 2-hop count; it does not get a
  third life after that.
- **S never decays — it empties.** An S item that is no longer in flight is not aged out, it is
  removed the moment it closes.
- The C cap (~12) and the PROMOTE path are unchanged and run first: promote to memory before
  considering decay, so a durable fact is never lost to a counter.

📌 Decay is a floor, not a ceiling. Anything the user re-stated, or that the stated TARGET depends
on, stays regardless of hop count — R is lossless and outranks this section.

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

📌 **Where an `x-cw` tool exists for an act, it wins over a shell performing the same act.**
📌 Skill prefixes follow the plugin name per surface — `x:` on `cc`, `x-cw:` on `cw`. Cross-refs
in skill bodies use bare skill names; translate with your own prefix.

- **Location**: `~/.claude/shelf/handoffs/`. Directory `chmod 700`, files `chmod 600`.
- **Filename**: `<audience>-<slug>-<utc-ts>.md`, where `<audience>` is the agent the CST is written
  FOR, `<slug>` is kebab-case, and `<utc-ts>` is `YYYYMMDDThhmmZ` (seconds optional). Append
  `-shared` before `.md` when multiple threads are expected to pull it:
  `<audience>-<slug>-<utc-ts>-shared.md`. A legacy `<utc-ts>-first` name still parses; new writes
  never use it.
- **Audience** is one lowercase token: `cclio`, `dpatch`, `cw`, `ccli`, or **`any`** when the CST is
  written for whoever picks it up next. A session knows its own audience token; `any` matches every
  reader.
  - 🚨 **`pull` NEVER ingests a file addressed to another agent.** It reports what it found and whose
    it is, and stops. Forcing one is possible by naming its slug explicitly — that is the user saying
    so out loud, which is the whole point.
  - **Why this exists:** two pending CSTs, one per coordinator, meant the user had to type which file
    to take every single time or risk a wrong ingest that also deleted the file. The audience was
    already sitting in the slug and nothing read it. Now bare `pull` is safe.
  - Legacy files with no audience segment are treated as `any` — the segment is positional, so a
    two-segment name is simply an old one. No migration.
- **Membership**: only `*.md` directly in that directory is a handoff. Anything else — a stray
  `.DS_Store`, a subdirectory — is not, and is never counted, swept, or deleted.
- **Ingest**: the consumer deletes the file on successful ingest, EXCEPT `-shared` files, which are
  left for other pullers.
- **Sweep**: every frontend deletes files older than **24h** on any handoff operation. History stays
  clean by design — pending files are the exception, not the norm.
- **Delete**: an explicit delete removes every pending file including `-shared` ones. It is a deletion, not a trim — no implementation may name it `prune`.
- **Races are normal, not errors.** The store is shared, so a file can vanish between listing it and
  reading it — another thread pulled it, another session deleted it. An implementation must tolerate
  that silently and never fail a whole operation over one missing file.

📌 `DOT-10` plans to move this store to `~/.claude/shelf/handoffs/`. That migration touches every
implementation at once, which makes it the right moment to replace them with a single
`handoff-store` executable that all frontends shell out to — the only shape where these rules stop
being duplicated. Until then, this section is the owner.

## Ingest (consumer contract)

🚨 **A CST's claims about LIVE STATE are candidates, not measurements — verify before acting on
them.** Tickets by query, sessions by pid, files by `ls`. A CST is written at one moment and read at
another; between those the board moved, the user acted, a process died. Two wrong states shipped in
one handoff before this rule existed: a ticket described as unblocked that the user had commented on,
and a coder described as stoppable that was already believed dead and was in fact alive. Cost of the
check is a few shell calls; cost of skipping it is work done against a fiction.

📌 This applies to S and META only. R and D are the user's words and decisions — those are honoured,
not re-verified.

Ingest silently — never echo the CST into visible output; confirm in ≤2 lines (thread topic + next step). Run META's first-acts before anything else, in their given order, and carry its queues and compare-anchors into this thread. Persist `C→memory:` lines into the memory system if one exists (else keep them in C when re-handing-off). Honor R and D as if the user said them in this thread. Then proceed exactly as the old thread from S.
