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

Related: [[cclio-coordinator-trial]], [[spawn-types]].
