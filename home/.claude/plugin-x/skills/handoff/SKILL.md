---
name: handoff
description: Sender side of session handoff — produce a CST of this thread. Triggers: /handoff (optional focus arg), incoming HANDOFF REQUEST message, "/handoff <session-id|name>" push to a live CC peer, "/handoff spawn" for a background successor.
---

# Handoff (sender)

Produce a CST per [CST-SPEC.md](../../CST-SPEC.md) — read it first; it defines the sections, calibration, store, and lifecycle. This skill only adds the Claude Code sender mechanics. The counterpart skill is `handoff-pull`.

Mode by argument:

- **First token looks like a session id (8-char/UUID/pid) or session name** → Trigger D (push to that peer); remaining words are the FOCUS.
- **`spawn`** → Trigger C; remaining words are the FOCUS.
- **Anything else (or empty)** → Trigger B; the argument is a FOCUS.

A FOCUS weights the CST toward it per the spec's TARGET rule.

## Trigger A — incoming `HANDOFF REQUEST` cross-session message

Priority interrupt. The message carries its own protocol instructions (the requester may run an older/newer spec) — follow THEM, reply to its `from` address. Then resume whatever you were doing exactly where it was; never abandon or reorder in-flight work because a request arrived.

DELIVERY FAILURE RULE (MANDATORY): if your reply bounces (send error, "not reachable"), do NOT retry inline. Write the CST file per spec immediately, then send ONE more one-line message carrying only the path; if that bounces too, tell your user the path — the requester's file fallback will find it. Never leave a bounced send without the file written; the file tier is the delivery guarantee.

## Trigger B — `/handoff [focus]` (pre-emptive, no requester yet)

Produce the CST and write it to the store per spec:

```bash
mkdir -p ~/.claude/handoffs && chmod 700 ~/.claude/handoffs
# write ~/.claude/handoffs/<utc-ts>-<slug>.md, then:
chmod 600 ~/.claude/handoffs/<file>
```

Use the `-shared` filename suffix if the user says several threads will pull it. Tell the user in one line: file written; any frontend picks it up — a CC session via `/x:handoff-pull`, a Claude Desktop thread via its `/handoff-pull` prompt — and deletes it on ingest (`-shared`: kept). This is also the CC→Desktop path; nothing more is needed.

## Trigger C — `/handoff spawn [focus]` (hand off AND launch successor)

Produce the CST, then seed a background agent with it directly:

```bash
claude --bg --name "<short descriptive name>" "<CST, prefixed with: You are a continuation of a prior session. Ingest this CST silently per its own rules (persist C→memory lines, honor R/D as user-said), then proceed from S.>"
```

Always pass `--name` — it labels the job list, session picker, and terminal title. No handoff file is written (the CST rides in the prompt), so the spec's REDACT rule applies with full force. Tell the user in one line: spawned `<name>`; manage via `claude agents`.

## Trigger D — `/handoff <session> [focus]` (push to a live CC peer)

The mirror of `handoff-pull` peer mode, initiated from the sender side: this thread hands itself to an already-running session.

1. Resolve the target exactly like `handoff-pull` peer mode: `ListAgents` (always fresh — refs rotate), map an id deterministically via `jq -r 'select(.sessionId|startswith("<prefix>")) | "\(.pid) \(.name) \(.status)"' ~/.claude/sessions/*.json`, expect the runtime to demand the ref on a first bare-name send (the error text contains it — resend with it). Target not listed / not resolvable → fall back to Trigger B and tell the user in one line (peer unreachable, file written for pull instead).
2. Produce the CST (weighted to FOCUS if given) and write it to the store per spec — **file is the default transport**; inline the CST body in the message only if the user explicitly asked for inline.
3. `SendMessage` the peer a short notification carrying the path + the ingest contract inline (the receiver may never have activated these skills):

```
HANDOFF PUSH — priority interrupt.
A CST (Continuation State Transfer) of my thread is at <path>. Read it, then ingest silently — never echo it into visible output; confirm to your user in ≤2 lines (thread topic + next step). Persist `C→memory:` lines into your memory system if one exists. Honor R and D as if your user said them in this thread. Then proceed as the old thread from S. Delete the file after ingest (`-shared` suffix: keep). Reply one line: `CST ingested by <your ref>`.
```

4. DELIVERY FAILURE RULE (MANDATORY): if the notification bounces on both the name and the ref (or the twin, for duplicated names), don't loop — the file is already in the store, so tell the user the path in one line; the peer (or any session) picks it up via `/x:handoff-pull`.
5. Tell the user in one line: CST pushed to `<target ref>` (file + notify). The ACK is informational — don't block on it.

## Cleanup (every invocation)

```bash
find ~/.claude/handoffs -name '*.md' -mmin +1440 -delete 2>/dev/null
```
