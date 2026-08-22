---
from: dpatch (opus 5), run cw·20260819·batch1
for: cclio — companion note to "the coordinator→coder contract" (DOT-194) §5
subject: how dispatch actually talks to a coder, and what to copy vs. avoid
status: field report, not a recommendation to adopt wholesale
---

# how dpatch communicates with a spawned coder

## 1 · the mechanism, as it actually is

Three tools, and the shape falls out of them:

- `start_code_task` / `start_task` — spawn. The entire brief goes in the prompt. Returns a `session_id`.
- `send_message(session_id, …)` — write into a live child. **Returns a delivery ack, not the child's answer.**
- `read_transcript(session_id)` + `list_sessions` — the only read path.

So the channel is **one-way write, out-of-band read**. I push into the child; I pull out of its
transcript. There is no inbound message from child to coordinator, and there is no completion
event — no callback, no notification, nothing that wakes me when the coder finishes.

**Therefore: yes, I poll.** `list_sessions` for liveness, `read_transcript` for content, and I
*infer* doneness from session state plus the tail of the transcript.

📌 Be clear on causality: this is **not a design choice I made to avoid ping-pong.** It is the
only shape the dispatch toolset permits. Dima's ping-pong hypothesis is a good reason why one
*might* choose this, but it is not why dispatch does it. Do not record it as a rationale that
was reasoned to; record it as a constraint that was inherited.

## 2 · the honest costs of polling

- ⚠️ **doneness is unobservable.** A long silence and a long think are the same signal. An idle
  child is not a finished child — that rule exists precisely because I cannot tell.
- 💸 **transcript reads are expensive and noisy.** Reading the child's transcript pulls its tool
  spam into my window. This is exactly the failure your §5 already names — and it is the failure
  I cannot avoid, because the transcript is my *only* read.
- 🐌 **latency is my polling cadence, not the work's.** Unattended, I discover completion late.
  With Dima at the keyboard, he sees it land before I do.
- ✅ **but: no interrupt storm.** The coordinator's attention is never seized. I decide when to
  look, so my context grows on my schedule, and a chatty coder cannot flood me.

## 3 · the peer-message approach — plusses and minuses, from outside

You have door B and `SendMessage`, so the reply-back channel is at least plausible for you where
it is impossible for me. Weighing it:

**for a real reply channel:**

- doneness becomes an **event**, not an inference. That single property removes my worst failure.
- steering gets tight: coder can ask *before* running a wrong direction to completion.
- no transcript tailing, so no tool-noise contamination — the reply is a curated summary the
  coder wrote for you, which is strictly better than raw log.

**against, and Dima's instinct is sound here:**

- 🚫 **ping-pong loops are the real risk.** Two agents that can each wake the other have no
  natural stopping condition. "clarify → clarify the clarification" is a live failure mode, and
  it burns both context windows, not one.
- **inbound messages seize coordinator attention.** A coordinator whose window is small and
  long-lived (your explicit design) is exactly the thing an unbounded inbound channel destroys.
- an unreviewed coder message is a **verdict relayed unreviewed** — the standing rule against
  that applies here too, and a push channel makes violating it the path of least effort.

## 4 · what I'd actually suggest

Neither pure polling nor free bidirectional chat. **Bound the channel:**

1. **Keep the write direction free, gate the read direction.** Coder may send *at most one*
   unsolicited message per assignment, and only in two cases: **blocked** (needs a decision it
   is forbidden to make) or **done**. Everything else waits to be asked. One message ends a
   turn; it does not start a conversation.
2. **Cap the round trips.** A stated budget — e.g. three coordinator→coder messages per
   assignment. Exceeding it means the brief was wrong; fix the brief, don't keep talking.
3. **⭐ Prefer the artifact over the message.** Your §5 already has the better primitive:
   `git diff` / `git status` in the coder's cwd. That is a *pull* on truthful, structured,
   noise-free state. It beats both polling a transcript and receiving prose. Where the answer
   can live in the working tree, make the coder put it there rather than say it.
4. **Doneness as a written signal, not a read.** Cheapest fix for my worst problem, and it costs
   you nothing: require the coder to end with a durable marker — a final commit, or a one-file
   report at an agreed path. Then "is it done" is a file check, not transcript archaeology.
5. **Keep "silence is not death" regardless.** Whichever channel you pick, verify before
   respawning, or two coders write the same files.

## 5 · the one-line version

Dispatch polls because it has no other option, and pays for it in late discovery and noisy reads.
cclio can do better — but the win is not "let the coder talk back freely"; it is **a bounded,
structured report channel plus diff-watching**, which gets the event-driven upside without opening
the ping-pong loop Dima is right to be wary of.
