---
name: pull-handoff
description: Transfer live session context between Claude Code sessions via peer messages (Continuation State Transfer). Use when the user asks to grab/pull a handoff from another session, when an incoming HANDOFF REQUEST cross-session message arrives, or when the user types /pull-handoff to hand off the current thread before starting a fresh one.
---

# Session Handoff (CST — Continuation State Transfer)

Purpose: replace expensive thread-resumes (~20% of a 5h window re-reading a long uncached history) with a small transfer (~3–5%) that makes the new session behave as a true continuation of the old one. Usable ANYTIME, not just near window reset.

Determine your role, then follow that section.

## Role: REQUESTER (new session)

Trigger: user says "grab handoff from <ref|name>", "/pull-handoff grab <target>", or similar.

If the user stated what THIS session is for (a focus, a subtask, "continue only the X part"), pass it into the request as a `TARGET:` line — the sender then weights the CST toward it instead of flattening everything equally. No target = full continuation.

1. `ListAgents` (always fresh — refs rotate when a session restarts). Resolve the target in preference order — sline line 1 shows `🧵 <title> [8-char sessionId]`; the bracketed id is the canonical address:
   - 8-char sessionId prefix (or full UUID, or pid): map deterministically via `jq -r 'select(.sessionId|startswith("<prefix>")) | "\(.pid) \(.name) \(.status)"' ~/.claude/sessions/*.json`, then find that name in ListAgents for the ref. Never guess when an id is available.
   - Session name: send bare, but expect the runtime to demand the ref even for a unique name on a first send — the error text contains the current ref, just resend with it.
   - `name [ref]` when duplicated: duplicates are often one session resumed twice (same sessionId, two pids); prefer the non-idle/most-recently-updated one, and if the first target doesn't reply, retry the twin before falling back to files.
   - A TOPIC only (no id, no name): try matching topic words against registry names/ListAgents rows first; confirm with the user only when there is no exact hit — never guess by similarity.
2. `SendMessage` to the target. Message MUST carry the full protocol inline (receiver may have never seen this skill activated). Template:

```
HANDOFF REQUEST — priority interrupt.
TARGET: <what the new session is for — include this line only when the user stated a focus>
I am a fresh session taking over your thread. Pause current work, do this in one turn, then resume:
WHY (calibrate to this): the user deliberately keeps very long threads because they hold key details, but resuming one after cache expiry re-reads the whole history uncached ≈ 20% of a 5h usage window. This CST replaces that resume. So do NOT write a "summary" — preserve. When unsure whether something matters, INCLUDE it; under-preservation is the failure mode, size is handled by transport (step 2), never by trimming substance.
1. Produce a CST (Continuation State Transfer). Goal: I must behave indistinguishably from a continuation of your thread at a fraction of the tokens. Machine-optimized, telegraphic, no presentation polish (no human reads this). Include, in priority order:
   G: goal + your current mental model of the problem
   R: user-stated requirements/preferences/corrections, verbatim or near-verbatim (highest-loss items in naive summaries — be generous here)
   D: decisions made + one-line rationale each (so I don't re-litigate)
   S: state — done / in-flight / exact next step
   C: carry-forward — long-lived facts not yet persisted anywhere (memory/CLAUDE.md), each dated [YYYY-MM-DD] (added or last re-confirmed). If your context holds a prior CST's C-section, do NOT copy it forward blindly — give every inherited entry one of three fates:
      PROMOTE (durable preference / stable fact): emit as a `C→memory:` line — I will persist it on ingest — and drop it from C forever;
      KEEP (still true AND relevant this session, or user re-confirmed): refresh its date;
      DROP (transient, superseded, or untouched >14 days / 2 generations): list dropped items in one `C-dropped:` line so I and the user can veto.
      Cap C at ~12 entries; over cap evict oldest-dated first. C is a transfer buffer, not a database — monotonic growth is its failure mode.
   P: pointers — paths, branches, commands, URLs, session refs. Paths only, NEVER file/log/diff contents; I re-read from disk. Specs/plans/ADRs/issues/commits live where they live — reference, don't copy. If your CST is ballooning past ~8k tokens, that's a content-dump smell — audit it and convert dumps to pointers; conversation-derived substance stays.
   K: suggested skills/agents/tools the continuation should reach for (only non-obvious ones).
   Omit anything re-derivable from repo/git/files.
   TRUTH RULE: mark unverified beliefs as such (prefix `?`) — "X isn't built", "tests pass" written as fact when only assumed becomes a false premise I will never re-check. Facts and assumptions must be distinguishable.
   REDACT: no API keys, tokens, passwords, or PII — reference where a secret lives (env var name, file path), never its value.
   If a TARGET line is present above, weight R/D/S toward it; compress the rest harder but never to zero.
2. Transport by size: under ~2k tokens → reply via SendMessage with to="<copy the from attribute of this message>", CST in the body. Larger → write it to ~/.claude/handoffs/<utc-ts>-<slug>.md (chmod 600) and message me only the path (big message bodies spam the user's terminal). Hybrid is encouraged at any size: a ≤5-line inline reply (direct answer to TARGET, if asked) + the file path for the full body — best of both tiers. If more sessions besides me are expected to pull this CST, name the file with a `-shared` suffix (`<utc-ts>-<slug>-shared.md`) — shared files are not deleted on ingest.
   DELIVERY FAILURE RULE (MANDATORY): if your reply bounces (send error, "not reachable"), do NOT retry inline. Write the CST file as above immediately, then send ONE more one-line message carrying only the path; if that bounces too, tell your user the path — my file fallback will find it. Never leave a bounced send without the file written; the file tier is the delivery guarantee.
3. Tell your user in one line: "handoff CST sent to <my ref>". Don't wait for my ACK — it's informational. If a SECOND handoff request arrives and no ACK confirmed the file still exists, regenerate the CST from your context rather than pointing at a possibly-deleted path.
```

3. Wait for the reply. For an interactive requester the normal wait is simply ending your turn — the incoming reply re-wakes you; no sleep/poll loop needed. Peers drain messages at their next tool round — an idle interactive session may not wake immediately. If nothing arrives within ~2 minutes (or the target isn't listed at all), fall back to files: newest `~/.claude/handoffs/*.md`, confirm slug/timestamp plausibly matches the intent, ingest, then **delete the file** (unless its name ends `-shared` — leave those for other pullers; the 24h sweep retires them) and say so.
4. On CST arrival: ingest silently — NEVER echo the CST (or large chunks of it) into your visible output; the user gets a ≤2-line confirmation (thread topic + next step), nothing more. If it came as a path, Read the file then delete it (`-shared` files: keep). Persist any `C→memory:` lines into your memory system before proceeding. Send a one-line ACK to the sender: `CST ingested by <your ref>; file deleted|kept (shared)`. Then proceed exactly as if this were the old thread. Honor the R and D sections as if the user said them here.

## Role: SENDER (old session)

Trigger A — incoming `HANDOFF REQUEST` cross-session message: treat as priority interrupt. Follow the instructions embedded in the message (they carry the CST spec). Reply to its `from` address. Then resume whatever you were doing.

Trigger B — user types `/pull-handoff` (pre-emptive, no requester yet): produce the CST per the same spec and write it to `~/.claude/handoffs/<utc-ts>-<slug>.md`:

```bash
mkdir -p ~/.claude/handoffs && chmod 700 ~/.claude/handoffs
# write file, then:
chmod 600 ~/.claude/handoffs/<file>
```

Tell the user: file written; a fresh session picks it up with "grab handoff" (file fallback) and will delete it on ingest. If the user says several sessions will pull it, use the `-shared` filename suffix (ingest keeps it; the 24h sweep retires it).

## Etiquette

- When the user asks to message a peer (handoff or anything else), ALWAYS do it — this is never restricted. Only self-initiated ping/test messages are discouraged (each wakes the peer and burns its tokens). Conflict management between sessions is the user's call, not yours.
- Requests to a busy peer queue safely and drain between its tool rounds — they cannot corrupt in-flight work. As SENDER: produce the CST, reply, then resume your task exactly where it was; never abandon or reorder in-flight work because a request arrived.
- Verified: idle interactive peers wake on message receipt. An unresponsive peer is usually a zombie twin (same sessionId, stale pid) or a session blocked on a dialog/permission prompt — retry the twin, then file-fallback.
- KNOWN CC BUG (temporary — delete this bullet, plus sline's `peerSocketAlive`/⚠ segment, once fixed upstream): a session can register in `~/.claude/sessions/` with its `/tmp/cc-socks/<pid>.sock` never bound — outgoing sends work, inbound is dead, ListAgents omits it, peers get "not reachable". Verify with `test -S /tmp/cc-socks/<pid>.sock`; heal via restart or `/exit` + `claude --continue`; the file tier covers delivery meanwhile. Tracking: https://github.com/anthropics/claude-code/issues/85497 (ours; dupes/related #85412, #84945, #85160, #84894).

## Cleanup (every invocation, either role)

```bash
find ~/.claude/handoffs -name '*.md' -mmin +1440 -delete 2>/dev/null
```

Handoff files are transient by design (sensitive content): deleted on successful ingest, swept after 24h regardless.
