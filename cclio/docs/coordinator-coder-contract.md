---
drafted: 2026-08-22
status: draft — door B untested at time of writing, see §7
ticket: DOT-194
---

# the coordinator→coder contract

how cclio hands work to a coding session, watches it, and takes it back. written for cclio and for
every ccli session cclio spawns.

the governing sentence is dima's: **«make it work → make it good → make it fast»** — the previous
step must hold solidly before the next one is attempted. this document is the *make it work* step.
it is deliberately the smallest thing that can run.

---

## 1 · the shape

**one coder by default. two allowed. never three without a stated reason.**

there is no orchestration framework, no fan-out, no judge panel. the codebases in play are small;
spawning sixty-four agents to fix them would be theatre. the second coder exists for exactly two
cases: the first is saturated, or the work splits cleanly into two areas decided **before** launch.

| role | context | owns | never |
| --- | --- | --- | --- |
| **cclio** — coordinator | small, flat, long-lived | the plan, the tracker, the review | bulk reads, bulk writes, large edits |
| **coder** — ccli session | large, disposable | the edits, the reads, the reporting | deciding scope, closing tickets |

the coder does not decide. it reports precise data and may re-check when unsure. **dima and cclio
decide.** cclio may read and peek at files — that peek is what makes review possible — but a
coordinator doing the reading itself is the failure this split exists to prevent.

---

## 2 · two doors, and they are not interchangeable

this is the single most load-bearing distinction in the document, and getting it wrong is what
makes a spawn unreachable.

### door A — the `Agent` tool (in-process subagent)

- lives **inside** cclio's process. dies when cclio's session ends.
- **dima cannot see it and cannot connect to it.** it is not a session.
- no reconnect after a session reset. its transcript is a file, not a conversation.
- `model` is settable. **`effort` is not** — the `Agent` tool has no effort parameter.
- `subagent_type: "fork"` inherits cclio's whole context and shares its prompt cache.

**use it for:** research sweeps, surveys, one-shot questions whose raw output cclio does not want
to keep. never for coding work dima might want to watch or take over.

### door B — a real background session (`claude --bg`, managed by `claude agents`)

- a **genuine ccli session** with its own conversation, its own cwd, its own memory load.
- appears in `ListAgents` and in `claude agents --json`. **dima can connect to it.**
- survives cclio's session reset — cclio reconnects by name, it does not respawn.
- **`--effort <level>` IS settable** here, alongside `--model`, `--permission-mode`, `--add-dir`.
- reachable by `SendMessage` for follow-ups; an idle child is not a finished child.

**use it for: every coder.** this is the door the contract is about.

📌 dpatch could not set effort on its spawns. that limit belonged to dpatch's door, not to the
platform. ours has the knob.

---

## 3 · remote control is the visibility layer, and it is already on

`settings.json` carries `"remoteControlAtStartup": true`. measured consequence: cclio's
`ListAgents` sees peer sessions it did not spawn — an interactive session in another repo, a
dispatch conversation over remote control, a cloud session.

⚠️ **this falsifies the standing memory that session blindness is bidirectional.** that was
measured before remote control was switched on at startup. with RC on, cclio can see across
surfaces, and dima can reach any of them from the desktop app or from his phone.

**rule: every coder spawn runs with RC reachable.** a spawn dima cannot open on his phone is a
spawn he has to come back to the mac for.

---

## 4 · launching one

four checks, every time, no exceptions. all four have been violated in a single session before;
the rules existed, the checking did not.

0. **reuse before spawn.** an idle child is not a finished child. `ListAgents` first; a message
   revives one with its context intact and costs nothing.
1. **tier.** touches a repo, a real filesystem, or produces commits ⇒ **door B**. a question with
   a text answer ⇒ door A.
2. **name.** `🔧 code: <slug>` · `🔬 research: <slug>` · `🧪 probe: <slug>` · `⏰ area:` for
   schedules. **titles cannot be renamed after spawn**, so it is right the first time or wrong
   forever.
3. **ticket ref.** pass the id. require `- ref DOT-N` on every commit touching the work.
   **the coder never uses a closing keyword.** cclio verifies, then closes.

### the brief

a fresh session has zero context. it is briefed like a colleague who just walked in:

- what we are trying to accomplish, and **why**
- what has already been ruled out
- exact paths and line numbers where they are known
- the ticket id and the `ref` requirement
- what is explicitly **out** of scope
- how to report: precise data, no decisions

---

## 5 · the messaging model — a bounded channel

📌 this section was rewritten after dpatch supplied a field report on how it talks to its own
coders (`cclio/docs/dpatch-coder-comms-note.md`) and after cclio measured its own channel. both
inputs pointed the same way.

### what each side actually has

**dpatch has no reply channel at all.** its three tools are spawn, write-into-child, and
read-transcript. there is no inbound message and **no completion event**. so dpatch polls — not by
choice, by constraint. it pays in late discovery and in transcript reads that pull the child's tool
noise into its own window.

📌 record that as an inherited constraint, never as a rationale someone reasoned to. dpatch was
explicit about the difference.

**cclio has more, and one piece of it was sitting unread.** measured this session:

- ✅ **peer messaging is genuinely two-way.** a local session replied to a ping.
- ⚠️ **inbound messages arrive MID-TURN**, not at a turn boundary. an unbounded inbound channel
  therefore *does* seize the coordinator's attention — which is fatal to a window that is meant to
  stay small and long-lived.
- ⭐ **`SendMessage` accepts `notify_when_idle: true`** — a one-shot, opt-in notice when a session
  on this machine next goes idle or exits. **this is the completion event dpatch reports it does
  not have.** it costs the child nothing, and it removes polling entirely.
- ⚠️ **cloud sessions are receive-only.** they accept a message and cannot answer; the reply lands
  in their own transcript.

### the rule

**write freely, read on a leash.**

1. **coordinator → coder: unrestricted.** steer whenever a wrong direction is visible. cheaper to
   interrupt than to review a finished mistake.
2. **coder → coordinator: at most ONE unsolicited message per assignment**, and only when
   **blocked** (it needs a decision it is forbidden to make) or **done**. one message ends a turn;
   it does not open a conversation.
3. ⭐ **prefer the working tree to any message.** `git diff` / `git status` in the coder's cwd is a
   *pull* on truthful, structured, noise-free state. where an answer can live in the tree, the
   coder puts it there rather than says it.
4. **doneness is a written signal, not a read.** every assignment ends with a durable marker — a
   final commit plus a one-file report at an agreed path. «is it done» becomes a file check, never
   transcript archaeology.
5. **subscribe, do not poll.** `notify_when_idle: true` on the launch message. never a loop of
   `ListAgents`, never an «are you done?» ping.
6. **round-trip budget: three** coordinator→coder messages per assignment. exceeding it means the
   brief was wrong — fix the brief, do not keep talking.
7. 🚫 **never tail the coder's transcript.** that is the noise contamination the whole split exists
   to prevent, and it is the one cost dpatch cannot escape.
8. **silence is not death.** verify before any respawn, or two coders write the same files.

### noise, from dima's side

dima reads this thread. a coder's replies surface in it. the budget above caps that at roughly one
or two messages per assignment, which is signal rather than chatter. the coordinator relays a
**digest**, never a reaction to each inbound line.

---

## 5b · sharing a working tree

Two agents in one repo is the normal case here, because parallelism across repos is where the work
actually splits. It is safe under four rules, all of which were learned by nearly losing work:

1. **Ownership is declared at spawn.** Which paths are the coder's, which are the coordinator's.
   Anything unclaimed belongs to nobody and is left alone.
2. **Explicit paths only.** `git add -A` and `git add .` are banned while a peer is live. This is
   the single vector for a silent sweep.
3. **`index.lock` means a peer is mid-commit.** Wait and retry; it clears in seconds. Deleting a
   lock is destructive and never the fix.
4. 🚨 **Verify the hash after every commit.** `git log -1`. A conflict is loud; the two real
   failures here are silent — a commit that vanishes under a peer's, and a bare commit that sweeps
   a peer's staged files. Both happened in one session.

**Escalation ladder, with named triggers, so this is never redesigned — only climbed:**

| rung | shape | climb when |
| --- | --- | --- |
| 1 | one agent per repo, rules above | two jobs genuinely need one repo at once |
| 2 | coordinator is the sole committer | ownership-by-agreement starts slipping |
| 3 | a worktree per agent | ~5+ agents, or genuinely concurrent edits |

📌 Rung 3 is correct and unloved. Dima dislikes worktrees, and at current scale he is right — they
buy isolation that is not yet being paid for in collisions. At 64 agents that inverts completely.

⭐ The cheap mechanical upgrade, if rung 1 ever fails: this repo runs **lefthook**, so a `pre-commit`
hook can refuse any commit whose staged paths fall outside a declared ownership file. That turns an
agreement into a guard for about fifteen lines, and is removed by deleting one hook entry.

---

## 6 · closing it

- collect findings from every live spawn **before** halting
- close the spawns. leaving cleanup to dima is a named failure
- cclio verifies the work, then closes the ticket with a context comment and a closing word
- unassign anything linear auto-assigned on the push, in the same turn

the only exception is dima explicitly asking to keep a spawn alive.

---

## 7 · what is measured, and what is still assumed

**measured:**

- ✅ **`--effort` is HONOURED, not merely accepted.** a session spawned with `--effort high`
  renders `Opus 5 with high effort` in its own header. this was the open question dpatch could
  never answer about its own spawns.
- ✅ **remote control is INHERITED from settings.** `"remoteControlAtStartup": true` reaches a
  spawned session with no `--remote-control` flag passed; the child prints a live `claude.ai/code`
  url. so dima can open any coder from his phone without the coordinator arranging it.
- ✅ **subagents do not block the coordinator.** a research subagent ran while this session kept
  talking to dima.
- ✅ **peer messaging is two-way between local sessions**, and **inbound messages arrive MID-TURN**,
  not at a turn boundary. this is why §5 bounds the channel rather than opening it.
- ⚠️ **cloud sessions are RECEIVE-ONLY.** they accept a message and cannot answer; the reply lands
  in their own transcript. the fleet-capabilities doc says nobody can *spawn* one — it does not say
  they cannot be *messaged*, and they can.
- ⚠️ **`claude --bg <prompt>` creates the session but does NOT run the prompt.** the session comes
  up idle. the brief must be delivered afterwards with `SendMessage`. a spawn that looks successful
  and did nothing is exactly the silent-failure shape to watch for — always confirm the child left
  idle.
- ✅ **isolation holds.** a cold boot in `~/projects/bytes` loads zero cclio memory files.
- ⚠️ **but the shared `rules/` layer leaks the coordinator by name.** `fleet-identity.md` (~2k) carries
  the surface table and `dispatch.md` (~2.1k) describes a coordinator a bytes coder will never be.
  ~4k tokens on every coder boot, in every repo. a bucketing win for DOT-73, not an isolation
  failure.

**still assumed:**

- ❓ door B reconnect across a **coordinator** session reset
- ❓ whether dima can attach to a cclio-spawned session and drive it *while cclio also drives it*
- ❓ whether cclio can adopt a session **dima** started

📌 the six-row spawn table this document rests on was first published from a mix of tool schemas,
`--help` output and inference, presented as if uniformly verified. dima caught it with one
question. **tag provenance per cell, or do not print the table.** a dedicated research pass is
under way; its findings land in `cclio/docs/spawn-mechanics-research.md`.

---

## 8 · the named failure modes

- 🚫 spawning extra coders with no reason. if it is an idea, say the idea first
- 🚫 cclio drifting into coding. small and local is allowed; anything systematic is a spawn
- 🚫 forgetting a spawn and leaving the cleanup to dima
- 🚫 ugly spawn names
- 🚫 a coder closing its own ticket
