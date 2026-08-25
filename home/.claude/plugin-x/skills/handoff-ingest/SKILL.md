---
name: handoff-ingest
argument-hint: "[<session-id|name>] | [topic] | cw"
description: Requester side of session handoff — ingest a CST. Triggers: /handoff-ingest, "grab/pull/ingest handoff". Session id/name arg → request from that live CC peer; bare / topic keyword / "cw" → pending file from the shared store (incl. `cw` handoffs).
intended-models: haiku, sonnet
---

# Handoff-ingest (requester)

**lane** — `cw`: `x-cw__handoff_ingest`, with `x-cw__handoff_list` and `x-cw__handoff_peek` to look first · `cc`: Bash.

Ingest a CST per [CST-SPEC.md](../../CST-SPEC.md) — read it first; its Ingest section is the consumer contract (silent ingest, ≤2-line confirmation, META's first-acts before anything else, persist `C→memory:` lines, honor R/D, delete-on-ingest unless `-shared`). This skill adds the Claude Code acquisition mechanics. The counterpart skill is `handoff`.

Mode by argument:

- **Looks like a session id (8-char/UUID/pid) or session name** → PEER MODE.
- **Empty, "cw", "file", or a topic keyword** ("bg2ee", "the sline one") → FILE MODE. This is the default posture and the pickup path for `cw`-produced handoffs.

If the user stated what THIS thread is for (a focus, "continue only the X part"), that is a TARGET — in peer mode pass it into the request as a `TARGET:` line; in file mode use it only to pick the right file (an already-written CST can't be re-weighted).

## FILE MODE

1. Sweep first (Cleanup below). List `~/.claude/shelf/handoffs/*.md` by mtime.
2. **Filter by audience BEFORE picking.** The filename is `<utc-ts>-<audience>-<slug>.md` — the
   audience is who the CST was written FOR. Keep only files whose audience is `any` or **this
   session's own token** (a `cclio` session takes `cclio`; a plain `ccli` session takes `ccli`); a
   two-segment legacy name with no audience counts as `any`.
   - 🚨 **Never ingest a file addressed to another agent.** Pulling one both feeds this thread the
     wrong context AND deletes the file the other agent was waiting for — two failures from one
     mistake. Report what is there and whose it is, and stop.
   - The user can still force one by naming its slug outright. That is them saying so on purpose,
     which is exactly the case this rule leaves open.
3. Pick from what survived the filter: topic keyword → match against filenames/slugs; no keyword →
   newest. If 2+ survivors are recent and no keyword disambiguates, list them (filename + age) and
   ask the user to point — never guess between plausible candidates.
4. Read the file, ingest per spec. **Verify its live-state claims before acting on them** (spec: Ingest) — tickets by query, sessions by pid. Delete it (`-shared` files: keep). Confirm in ≤2 lines and proceed as the old thread.
5. Nothing pending → say so in one line; suggest the sender side (`/handoff` in the old thread — `cc` or `cw`).

## PEER MODE

1. `ListAgents` (always fresh — refs rotate when a session restarts). Resolve the target in preference order — sline line 1 shows `🧵 <title> [8-char sessionId]`; the bracketed id is the canonical address:
   - 8-char sessionId prefix (or full UUID, or pid): map deterministically via `jq -r 'select(.sessionId|startswith("<prefix>")) | "\(.pid) \(.name) \(.status)"' ~/.claude/sessions/*.json`, then find that name in ListAgents for the ref. Never guess when an id is available.
   - Session name: send bare, but expect the runtime to demand the ref even for a unique name on a first send — the error text contains the current ref, just resend with it.
   - `name [ref]` when duplicated: duplicates are often one session resumed twice (same sessionId, two pids); prefer the non-idle/most-recently-updated one, and if the first target doesn't reply, retry the twin before falling back to FILE MODE.
   - A TOPIC only: try matching topic words against registry names/ListAgents rows; no exact hit → FILE MODE, not guessing.
2. `SendMessage` the request. It MUST carry the full protocol inline (receiver may have never seen this skill activated). Template — where it says INLINE THE SPEC, paste the entire content of CST-SPEC.md:

```
HANDOFF REQUEST — priority interrupt.
TARGET: <focus — include this line only when the user stated one>
I am a fresh session taking over your thread. Pause current work, do this in one turn, then resume:
1. Produce a CST per the spec below. Machine-optimized, telegraphic, no presentation polish (no human reads this).
<INLINE THE SPEC: full text of CST-SPEC.md>
2. Transport by size: under ~2k tokens → reply via SendMessage with to="<copy the from attribute of this message>", CST in the body. Larger → write it to the store per the spec and message me only the path (big message bodies spam the user's terminal). Hybrid is encouraged at any size: a ≤5-line inline reply (direct answer to TARGET, if asked) + the file path for the full body. Multiple expected pullers → `-shared` filename suffix.
   DELIVERY FAILURE RULE (MANDATORY): if your reply bounces (send error, "not reachable"), do NOT retry inline. Write the CST file per the spec immediately, then send ONE more one-line message carrying only the path; if that bounces too, tell your user the path — my file fallback will find it. Never leave a bounced send without the file written; the file tier is the delivery guarantee.
3. Tell your user in one line: "handoff CST sent to <my ref>". Don't wait for my ACK — it's informational. If a SECOND handoff request arrives and no ACK confirmed the file still exists, regenerate the CST from your context rather than pointing at a possibly-deleted path.
```

3. Wait by ending your turn — the incoming reply re-wakes you; no sleep/poll loop. Peers drain messages at their next tool round — an idle interactive session may not wake immediately. Nothing within ~2 minutes (or target not listed at all) → FILE MODE fallback: confirm slug/timestamp plausibly matches the intent before ingesting.
4. On CST arrival: ingest per spec (came as a path → Read then delete; `-shared`: keep). Send a one-line ACK: `CST ingested by <your ref>; file deleted|kept (shared)`. Proceed as the old thread.

## Etiquette (peer mode)

- When the user asks to message a peer, ALWAYS do it — never restricted. Only self-initiated ping/test messages are discouraged (each wakes the peer and burns its tokens). Conflict management between sessions is the user's call, not yours.
- Requests to a busy peer queue safely and drain between its tool rounds — they cannot corrupt in-flight work.
- Verified: idle interactive peers wake on message receipt. An unresponsive peer is usually a zombie twin (same sessionId, stale pid) or a session blocked on a dialog/permission prompt — retry the twin, then FILE MODE.
- KNOWN CC BUG (temporary — delete this bullet, plus sline's `peerSocketAlive`/⚠ segment, once fixed upstream): a session can register in `~/.claude/sessions/` with its `/tmp/cc-socks/<pid>.sock` never bound — outgoing sends work, inbound is dead, ListAgents omits it, peers get "not reachable". Verify with `test -S /tmp/cc-socks/<pid>.sock`; heal via restart or `/exit` + `claude --continue`; the file tier covers delivery meanwhile. Tracking: https://github.com/anthropics/claude-code/issues/85497 (ours; dupes/related #85412, #84945, #85160, #84894).

## Cleanup (every invocation)

```bash
find ~/.claude/shelf/handoffs -name '*.md' -mmin +1440 -delete 2>/dev/null
```
