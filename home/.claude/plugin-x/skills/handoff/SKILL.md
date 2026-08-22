---
name: handoff
argument-hint: "[focus on] | spawn [focus on] | <session-id|name> [focus on] | list | peek <slug> | delete"
description: Sender side of session handoff — produce a CST of this thread. Triggers: /handoff (optional focus arg), incoming HANDOFF REQUEST message, "/handoff <session-id|name>" push to a live CC peer, "/handoff spawn" for a background successor, "/handoff list" and "/handoff peek <slug>" to inspect the store read-only, "/handoff delete" (aliases: clear, prune) to wipe it.
intended-models: fable, opus
---

# Handoff (sender)

Produce a CST per [CST-SPEC.md](../../CST-SPEC.md) — read it first; it defines the sections, calibration, store, and lifecycle. This skill only adds the Claude Code sender mechanics. The counterpart skill is `handoff-pull`.

## Before writing any CST — ask for the anchors

META's compare-anchors need numbers this session cannot read. Ask Dima for his `/context` output (and any other number the next session must diff against) BEFORE composing, in one line. He answers with the figures; they go into compare-anchors labelled and dated.

He declines or does not answer → write the CST anyway and say in compare-anchors that the numbers are missing. Never guess a number, and never silently omit the field.

Applies to every producing trigger (B, C, D) and to Trigger A when the request is not urgent.

Same pass: build META's fleet roster from `ListAgents` (fresh — refs rotate), keeping only sessions worth reattaching to and naming what each holds.

Mode by argument:

- **First token looks like a session id (8-char/UUID/pid) or session name** → Trigger D (push to that peer); remaining words are the FOCUS.
- **`spawn`** → Trigger C; remaining words are the FOCUS.
- **`list`** → Trigger F (show what is pending). **`peek <slug>`** → Trigger G (read one META, consume nothing).
- **`delete` / `clear` / `prune`** → Trigger E (wipe the store). `delete` is the canonical verb; the other two are accepted aliases only because Dima may type them. Any of the three, alone or with trailing words. A bare verb like these is never a FOCUS — writing a CST "about deleting" is the wrong read of an obvious intent.
- **Anything else (or empty)** → Trigger B; the argument is a FOCUS.

A FOCUS weights the CST toward it per the spec's TARGET rule. A FOCUS still carries the whole thread. If Dima instead asked for *only* a part of it, that is a SCOPED handoff — restrict the content and set META's `scope` field per spec.

## Trigger A — incoming `HANDOFF REQUEST` cross-session message

Priority interrupt. The message carries its own protocol instructions (the requester may run an older/newer spec) — follow THEM, reply to its `from` address. Then resume whatever you were doing exactly where it was; never abandon or reorder in-flight work because a request arrived.

DELIVERY FAILURE RULE (MANDATORY): if your reply bounces (send error, "not reachable"), do NOT retry inline. Write the CST file per spec immediately, then send ONE more one-line message carrying only the path; if that bounces too, tell your user the path — the requester's file fallback will find it. Never leave a bounced send without the file written; the file tier is the delivery guarantee.

## Trigger B — `/handoff [focus]` (pre-emptive, no requester yet)

Produce the CST and write it to the store per spec:

```bash
mkdir -p ~/.claude/shelf/handoffs && chmod 700 ~/.claude/shelf/handoffs
# write ~/.claude/shelf/handoffs/<utc-ts>-<audience>-<slug>.md, then:
chmod 600 ~/.claude/shelf/handoffs/<file>
```

🚨 **SUPERSEDE, never duplicate.** Before writing, list the store for a pending file whose audience
and thread match this one. Found → **overwrite that file in place** (same name if the slug still
fits, otherwise write the new one and delete the old in the same step). A thread that hands off
twice must leave ONE pending file. Two files from one thread is the duplicate-pending mess the
audience segment exists to prevent, arriving from the other direction.

`<audience>` is who the CST is FOR — the spec's store contract has the token list. Writing for
nobody in particular → `any`. Handing to a specific agent → that agent's token, so its bare `pull`
finds it and every other agent leaves it alone.

Use the `-shared` filename suffix if the user says several threads will pull it. Tell the user in one line: file written; any frontend picks it up — a `cc` session via `/x:handoff-pull`, a `cw` thread via its `/handoff-pull` prompt — and deletes it on ingest (`-shared`: kept). This is also the `cc`→`cw` path; nothing more is needed.

## Trigger C — `/handoff spawn [focus]` (hand off AND launch successor)

Produce the CST, then seed a background agent with it directly:

```bash
claude --bg --name "<short descriptive name>" "<CST, prefixed with: You are a continuation of a prior session. Ingest this CST silently per its own rules (run META's first-acts first, persist C→memory lines, honor R/D as user-said), then proceed from S.>"
```

Always pass `--name` — it labels the job list, session picker, and terminal title. No handoff file is written (the CST rides in the prompt), so the spec's REDACT rule applies with full force. Tell the user in one line: spawned `<name>`; manage via `claude agents`.

## Trigger D — `/handoff <session> [focus]` (push to a live CC peer)

The mirror of `handoff-pull` peer mode, initiated from the sender side: this thread hands itself to an already-running session.

1. Resolve the target exactly like `handoff-pull` peer mode: `ListAgents` (always fresh — refs rotate), map an id deterministically via `jq -r 'select(.sessionId|startswith("<prefix>")) | "\(.pid) \(.name) \(.status)"' ~/.claude/sessions/*.json`, expect the runtime to demand the ref on a first bare-name send (the error text contains it — resend with it). Target not listed / not resolvable → fall back to Trigger B and tell the user in one line (peer unreachable, file written for pull instead).
2. Produce the CST (weighted to FOCUS if given) and write it to the store per spec — **file is the default transport**; inline the CST body in the message only if the user explicitly asked for inline.
3. `SendMessage` the peer a short notification carrying the path + the ingest contract inline (the receiver may never have activated these skills):

```
HANDOFF PUSH — priority interrupt.
A CST (Continuation State Transfer) of my thread is at <path>. Read it, then ingest silently — never echo it into visible output; confirm to your user in ≤2 lines (thread topic + next step). Run its META first-acts before anything else. Persist `C→memory:` lines into your memory system if one exists. Honor R and D as if your user said them in this thread. Then proceed as the old thread from S. Delete the file after ingest (`-shared` suffix: keep). Reply one line: `CST ingested by <your ref>`.
```

4. DELIVERY FAILURE RULE (MANDATORY): if the notification bounces on both the name and the ref (or the twin, for duplicated names), don't loop — the file is already in the store, so tell the user the path in one line; the peer (or any session) picks it up via `/x:handoff-pull`.
5. Tell the user in one line: CST pushed to `<target ref>` (file + notify). The ACK is informational — don't block on it.

## Trigger E — `/handoff delete` (wipe the pending store)

Pending handoffs are transient by design (see CST-SPEC.md — Store); this clears the store outright.

1. List `~/.claude/shelf/handoffs/*.md` (filename + age). Nothing there → say "store already empty", done.
2. Delete them all, including `-shared`.
3. Report in one line: `deleted N handoff(s): <slugs>`.

No confirmation dance — the user invoked a deliberately destructive verb on disposable files. Do NOT touch anything but `*.md` inside `~/.claude/shelf/handoffs/`. Produce no CST on this path.

## Trigger F — `/handoff list` (what is pending)

Read-only. Nothing is consumed and no CST content enters the thread.

```bash
ls -lt ~/.claude/shelf/handoffs/*.md 2>/dev/null
```

Report one line per file: **audience · slug · age · size**, newest first. Mark which ones this
session may pull (audience `any` or its own) and which belong to another agent. Empty → one line.

## Trigger G — `/handoff peek <slug>` (read one META, consume nothing)

Read-only, and it is the safe way to decide before committing. Match the slug against filenames;
ambiguous → list the candidates and ask rather than guessing. Print **only the META block** — the
part written for a human — never the body. The file is not deleted, not moved, not marked.

Say plainly that nothing was ingested and that `/x:handoff-pull` is the verb that actually continues
the thread.

## Cleanup (every invocation)

```bash
find ~/.claude/shelf/handoffs -name '*.md' -mmin +1440 -delete 2>/dev/null
```
