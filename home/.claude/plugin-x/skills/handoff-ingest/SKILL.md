---
name: handoff-ingest
description: Load on /handoff-ingest or "grab/pull/ingest handoff" — session id/name to request from a live CC peer; bare, topic keyword, or "cw" for the shared store.
---

# Handoff-ingest (requester)

**lane** — `cw`: `x-cw__handoff_ingest` (+ `_list`, `_peek` to look first) · `cc`: Bash.

Ingest a CST per [CST-SPEC.md](../../CST-SPEC.md) — read it first; its Ingest section is the
consumer contract (silent ingest, ≤2-line confirmation, META first-acts before anything else,
persist `C→memory:` lines, honor R/D, delete-on-ingest unless `-shared`). This skill adds the
Claude Code acquisition mechanics. Counterpart: `handoff`.

Mode by argument:

- looks like a session id (8-char/UUID/pid) or session name → **PEER MODE**
- empty, `cw`, `file`, or a topic keyword ("bg2ee", "the sline one") → **FILE MODE** — the
  default posture, and the pickup path for `cw`-produced handoffs

If the user stated what THIS thread is for, that is a TARGET — peer mode passes it as a
`TARGET:` line; file mode uses it only to pick the file (a written CST can't be re-weighted).

## FILE MODE

1. Sweep first (Cleanup below). List `~/.claude/shelf/handoffs/*.md` by mtime.
2. **Filter by audience BEFORE picking.** Filename is `<audience>-<slug>-<utc-ts>.md` (legacy
   ts-first names count). Keep only `any` or **this session's own token** (`cclio` for a cclio
   session, `ccli` for a plain one); a two-segment legacy name counts as `any`.
   - 🚨 **Never ingest a file addressed to another agent** — wrong context in this thread AND
     the other agent's file deleted, two failures from one mistake. Report whose it is, stop.
   - The user naming a slug outright forces it — that is the deliberate exception.
3. Pick from survivors: keyword → match filenames/slugs; none → newest. 2+ recent survivors
   and no keyword → list them (filename + age) and ask — never guess between plausibles.
4. Read, ingest per spec. **Verify live-state claims before acting on them** (tickets by
   query, sessions by pid). Delete the file (`-shared`: keep). Confirm ≤2 lines, proceed as
   the old thread.
5. Nothing pending → one line; suggest the sender side (`/handoff` in the old thread).

## PEER MODE

1. `ListAgents` (always fresh — refs rotate). Resolve in preference order (sline line 1 shows
   `🧵 <title> [8-char sessionId]` — the bracketed id is canonical):
   - id prefix/UUID/pid → map via
     `jq -r 'select(.sessionId|startswith("<prefix>")) | "\(.pid) \(.name) \(.status)"' ~/.claude/sessions/*.json`,
     then find that name in ListAgents. Never guess when an id is available.
   - session name → send bare, but expect the runtime to demand the ref even on a unique name
     first send — the error text carries it, resend with it.
   - `name [ref]` duplicated → often one session resumed twice (same sessionId, two pids):
     prefer the non-idle/most-recent; no reply → retry the twin, then FILE MODE.
   - topic only → match against registry names; no exact hit → FILE MODE, not guessing.
2. `SendMessage` the request. It MUST carry the full protocol inline (the receiver may never
   have seen this skill). Template — where marked, paste the entire CST-SPEC.md:

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

3. Wait by ending your turn — the reply re-wakes you; no sleep/poll. Peers drain messages at
   their next tool round; an idle interactive session may not wake immediately. Nothing in
   ~2 minutes, or target unlisted → FILE MODE fallback (confirm the slug plausibly matches
   the intent first).
4. On arrival: ingest per spec (path → Read then delete; `-shared`: keep). ACK one line:
   `CST ingested by <your ref>; file deleted|kept (shared)`. Proceed as the old thread.

## Etiquette (peer mode)

- The user asking to message a peer → ALWAYS do it. Only self-initiated pings are discouraged
  (each wakes the peer and burns its tokens). Conflict management between sessions is the
  user's call.
- Requests to a busy peer queue safely and drain between its tool rounds.
- Verified: idle interactive peers wake on receipt. An unresponsive peer is usually a zombie
  twin (same sessionId, stale pid) or a session blocked on a dialog — retry the twin, then
  FILE MODE.
- KNOWN CC BUG (temporary — delete this bullet, plus sline's `peerSocketAlive`/⚠ segment, once
  fixed upstream): a session can register in `~/.claude/sessions/` with its
  `/tmp/cc-socks/<pid>.sock` never bound — outgoing sends work, inbound is dead, ListAgents
  omits it, peers get "not reachable". Verify: `test -S /tmp/cc-socks/<pid>.sock`; heal via
  restart or `/exit` + `claude --continue`; the file tier covers delivery meanwhile. Tracking:
  https://github.com/anthropics/claude-code/issues/85497 (ours; dupes #85412, #84945, #85160, #84894).

## Completion criterion

Done when the CST's content steers this thread (META first-acts run, ≤2-line confirmation
sent) AND the store reflects the ingest — file gone (`-shared`: kept), verified by `ls`. An
ingested-but-undeleted file is a failure to report, not a detail.

## Cleanup (every invocation)

```bash
find ~/.claude/shelf/handoffs -name '*.md' -mmin +10080 -delete 2>/dev/null
```
