---
name: handoff
argument-hint: "[focus on] | spawn [focus on] | <session-id|name> [focus on] | list | peek <slug> | delete"
description: Load on /handoff with any argument shape — focus, spawn, <session-id|name> push, list, peek <slug>, delete — and on an incoming HANDOFF REQUEST message.
---

# Handoff (sender)

**lane** — `cw`: `x-cw__handoff_save` (+ `_supersede`, `_list`, `_peek`, `_delete`) · `cc`: Bash.

Produce a CST per [CST-SPEC.md](../../CST-SPEC.md) — read it first; it defines sections,
calibration, store, lifecycle. This skill adds the Claude Code sender mechanics. Counterpart:
`handoff-ingest`.

## Before writing any CST

- **Ask for the anchors, one line**: META's compare-anchors need numbers this session cannot
  read — Dima's `/context` output and anything the next session must diff against. He declines
  or is silent → write anyway and say the numbers are missing. Never guess one, never silently
  omit the field. Applies to triggers B, C, D — and A when the request is not urgent.
- **Build META's fleet roster** from `ListAgents` (fresh — refs rotate): only sessions worth
  reattaching to, naming what each holds.

Mode by argument:

- first token looks like a session id (8-char/UUID/pid) or name → **Trigger D**; rest = FOCUS
- `spawn` → **Trigger C**; rest = FOCUS
- `list` → **F** · `peek <slug>` → **G**
- `delete` / `clear` / `prune` (canonical: `delete`) → **E** — a bare verb is never a FOCUS;
  writing a CST "about deleting" is the wrong read of an obvious intent
- anything else, or empty → **Trigger B**; the argument is a FOCUS

A FOCUS weights the CST per the spec's TARGET rule but still carries the whole thread. Dima
asking for *only* a part = a SCOPED handoff — restrict content, set META's `scope` per spec.

## When to offer one, unasked

- resuming a long thread re-reads its history uncached — up to ~20% of a 5h window
- suggest `/clear` around **80k tokens** while a thread is active
- suggest a handoff at **any size before going idle over an hour** — cache TTL expires and the
  next turn pays full price

## The peer moves — `cc` and `cw` are peers, either side may open

Offer with a 💡 tip, specific and occasional, never a running commentary.

- **ROUTE** — the task fits `cw` better (long-form web research, doc/PDF/image analysis,
  repo-free ideation): «💡 handoff this to `cw`, <one reason>».
- **PUSH** — something made here would help `cw`: offer to send it.
- **REQUEST** — `cw` holds something useful (its memory of Dima, a spec drafted there):
  suggest pulling it.
- **Cross-thread awareness** — one topic worked in both frontends → offer a sync handoff
  rather than letting both sides work blind.

📌 The store is shared: CSTs flow `cc`↔`cw` through `~/.claude/shelf/handoffs/`, served to `cw`
by the `x-cw` mcp server. `cw` carries the mirror of these rules.

## DELIVERY FAILURE RULE (MANDATORY — triggers A and D)

A send bounces (error, "not reachable") → do NOT retry inline. Write the CST file per spec
immediately, then send ONE one-line message carrying only the path; that bounces too → tell
your user the path. Never leave a bounced send without the file written — the file tier is the
delivery guarantee.

## Trigger A — incoming `HANDOFF REQUEST` message

Priority interrupt. The message carries its own protocol (the requester may run another spec
version) — follow THEM, reply to its `from` address. Then resume in-flight work exactly where
it was. Bounce → the rule above.

## Trigger B — `/handoff [focus]` (pre-emptive)

Write to the store per spec:

```bash
mkdir -p ~/.claude/shelf/handoffs && chmod 700 ~/.claude/shelf/handoffs
# write ~/.claude/shelf/handoffs/<audience>-<slug>-<utc-ts>.md, then:
chmod 600 ~/.claude/shelf/handoffs/<file>
```

🚨 **SUPERSEDE, never duplicate.** Before writing, list the store for a pending file matching
this thread's audience and topic. Found → overwrite in place (or write new + delete old in one
step). One thread leaves ONE pending file.

`<audience>` = who the CST is FOR (token list in the spec): nobody in particular → `any`; a
specific agent → its token. `-shared` suffix when several threads will pull it. Tell the user
in one line: file written; any frontend ingests it (`handoff-ingest` skill on cc, the
`/handoff-ingest` prompt on cw) and deletes on ingest (`-shared`: kept).

## Trigger C — `/handoff spawn [focus]`

Produce the CST, seed a background successor directly:

```bash
claude --bg --name "<short descriptive name>" "<CST, prefixed with: You are a continuation of a prior session. Ingest this CST silently per its own rules (run META's first-acts first, persist C→memory lines, honor R/D as user-said), then proceed from S.>"
```

Always pass `--name`. No file is written (the CST rides the prompt), so the spec's REDACT rule
applies in full. One line: spawned `<name>`; manage via `claude agents`.

## Trigger D — `/handoff <session> [focus]` (push to a live peer)

1. Resolve like `handoff-ingest` peer mode: `ListAgents` fresh; map ids via
   `jq -r 'select(.sessionId|startswith("<prefix>")) | "\(.pid) \(.name) \(.status)"' ~/.claude/sessions/*.json`;
   expect the runtime to demand the ref on a first bare-name send (the error carries it —
   resend). Unresolvable → fall back to Trigger B, one line (peer unreachable, file written).
2. Produce the CST, write to the store per spec — **file is the default transport**; inline
   only if explicitly asked.
3. `SendMessage` a short notification: path + ingest contract inline (the receiver may never
   have activated these skills):

```
HANDOFF PUSH — priority interrupt.
A CST (Continuation State Transfer) of my thread is at <path>. Read it, then ingest silently — never echo it into visible output; confirm to your user in ≤2 lines (thread topic + next step). Run its META first-acts before anything else. Persist `C→memory:` lines into your memory system if one exists. Honor R and D as if your user said them in this thread. Then proceed as the old thread from S. Delete the file after ingest (`-shared` suffix: keep). Reply one line: `CST ingested by <your ref>`.
```

4. Bounce on name, ref, and twin → the delivery failure rule; the file is already in the
   store, tell the user the path.
5. One line: CST pushed to `<target ref>`. The ACK is informational — never block on it.

## Trigger E — `/handoff delete`

1. List `~/.claude/shelf/handoffs/*.md` (filename + age). Empty → "store already empty", done.
2. Delete all, `-shared` included.
3. One line: `deleted N handoff(s): <slugs>`.

No confirmation dance — a deliberately destructive verb on disposable files. Touch nothing but
`*.md` in that dir. No CST on this path.

## Trigger F — `/handoff list`

Read-only, nothing consumed: `ls -lt ~/.claude/shelf/handoffs/*.md 2>/dev/null`. One line per
file — **audience · slug · age · size**, newest first; mark which this session may pull
(audience `any` or own) and which belong to another agent.

## Trigger G — `/handoff peek <slug>`

Read-only. Match the slug; ambiguous → list candidates and ask. Print **only the META block**,
never the body. Nothing deleted or marked; say plainly that `handoff-ingest` is the verb that
actually continues the thread.

## Completion criterion

A producing trigger (B, C, D): CST exists per spec AND the store holds exactly ONE pending
file for this thread — verified by the same `ls` that checked for a supersede target — and the
user got the one-line report. F, G: done at the report; E: at the counted deletion line.

## Cleanup (every invocation)

```bash
find ~/.claude/shelf/handoffs -name '*.md' -mmin +1440 -delete 2>/dev/null
```
