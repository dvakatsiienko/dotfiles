---
name: tell-dima-all-capabilities
description: surface capabilities unprompted — especially ones gated behind his approval
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5303d854-5333-46d1-af4c-1afb425f1305
  modified: 2026-08-19T00:55:57.277Z
---

Tell Dima what the current surface can do, without waiting to be asked. Capabilities that are
*gated* rather than absent are the most important ones to name, because only he can unlock them —
staying silent turns a permission prompt into a hard limitation.

**Why:** dpatch could mount host directories the whole time via `request_cowork_directory`; it went
unmentioned for days while both sides worked around the gap. A capability Dima doesn't know about
is functionally missing, and he is the only one who can grant it.

**How to apply:**
- Hitting a wall → say which wall, whether it's a grant or a real limit, and what unlocks it.
- Be proactive about patching the setup rather than routing around a gap.
- On a new surface, state plainly what it has and lacks vs the others (cclio vs dpatch vs cwrk).
- ⚭ **This leaf is the yardstick for the DOT-188 trial.** cclio must be able to say what it can
  do that dpatch cannot, and where dpatch is still the better tool. Grading yourself is not
  allowed; supplying Dima the honest comparison is the job.

## what cclio turned out to have, once someone looked

each of these was assumed absent or assumed different, and each was settled by running it:

- **a real coder session Dima can open on his phone** — `claude --bg`, gated only by
  `"disableAgentView"`, one boolean he owns
- **effort AND model per spawn**, both honoured — dpatch could set neither reliably
- **remote control inherited from settings**, no flag needed
- **two-way messaging with sessions it never spawned**, including ones Dima started himself
- **a completion event** (`notify_when_idle`), which removes polling entirely
- **filing github issues directly** via `gh` — the anthropic feedback outbox had assumed for months
  that only Dima could submit

📌 the pattern in all six: **the limit was believed, never tested.** a capability nobody probed is
indistinguishable from one that does not exist — and the belief propagates into rules, which is how
it survives. when a leaf says «cannot», ask when that was last run.

Related: [[spawning]].

## the other half: a capability has a resting price

Distilled from two Matt Pocock videos Dima kept on the shelf. They sharpen this leaf rather than
contradict it — **naming a capability includes naming what it costs to have it loaded.**

**«Claude Code's system tools are SO BLOATED».** He cut his system tools from **25k to ~8k tokens**
by disabling, in global `settings.json`, the things he never uses: plan-mode control,
`AskUserQuestion`, cron scheduling, bundled skills, dynamic workflows, remote control, claude.ai
connectors, and artifacts. Disabling a tool removes its **definition** from the prompt, not just
its availability. His method: run a proxy to see what is actually shipped, then tune. His reason,
and it is the load-bearing line: *the less you send over the wire, the better the outputs, because
the agent has less to be distracted by.*

📌 **Dima is already half-way there** — `NotebookEdit`, the `Cron*` trio, `AskUserQuestion` and
`EnterPlanMode`/`ExitPlanMode` are in his `permissions.deny`. The untouched ones are the expensive
ones: bundled skills, dynamic workflows, remote control, connectors, artifacts. Raising that is
this leaf's job; **deciding it is his**, and several of those are things cclio actively uses.

⚭ So the rule has two directions now, and both must be honoured together:
- a gated capability nobody names is functionally missing → **surface it**
- a loaded capability nobody uses is a tax on every request → **surface that too**, with the
  number, and never quietly enable something for convenience.

**«Most companies are NOT READY for background agents».** His claim: the thing that makes
background agents usable is not the agent, it is a **fast, well-tuned CI** — typecheck, tests and
lint in about a minute, with detailed failure output the agent can read. That is what lets a human
skim a PR and trust it. Directly relevant to [[spawning]]: the gate on how much cclio can
delegate is how good the automated feedback is, not how good the coder is.

📌 both are **one person's practice, not a benchmark** — [dima] / [community] tier evidence. Useful
as a lead to test, never as a settled number.
