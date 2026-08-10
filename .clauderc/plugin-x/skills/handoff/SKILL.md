---
name: handoff
description: Produce a CST (Continuation State Transfer) of the current thread — the sender side of session handoff. Use when the user types /handoff to hand off before starting a fresh thread (optionally with a focus argument), when an incoming HANDOFF REQUEST cross-session message arrives, or when the user asks to hand off and spawn a background successor ("/handoff spawn").
---

# Handoff (sender)

Produce a CST per [CST-SPEC.md](../../CST-SPEC.md) — read it first; it defines the sections, calibration, store, and lifecycle. This skill only adds the Claude Code sender mechanics. The counterpart skill is `handoff-pull`.

An optional argument is a FOCUS: weight the CST toward it per the spec's TARGET rule.

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

## Cleanup (every invocation)

```bash
find ~/.claude/handoffs -name '*.md' -mmin +1440 -delete 2>/dev/null
```
