The binding rules for handing work to a coder. **Full spec:** `cclio/docs/coordinator-coder-contract.md`
— read it when actually spawning, never at boot. Both stay evergreen; this leaf is the compression,
that file is the source. When they disagree, the file is right and this leaf is stale.

**The shape:** one coder by default, two allowed, never three without a stated reason. cclio owns
the plan, the tracker and the review; the coder owns the edits and reports precise data. The coder
does not decide scope.

**Two doors, never interchangeable.** A subagent runs inside cclio, dies with it, cannot be opened
by Dima, and takes no effort. A **background session** (`claude --bg`) is real, survives a
coordinator reset, and takes model AND effort — **that is the door for all coding.** The split is
not research-vs-code, it is **disposable-vs-watchable**.

**Four preflight checks:** reuse before spawn · tier (repo work ⇒ session) · pretty name (sessions
only — the `Agent` tool's regex rejects emoji and colons) · ticket id + `- ref DOT-N`, never a
closing keyword.

**The messaging model — write freely, read on a leash.** cclio messages the coder whenever. The
coder answers **once** per assignment, only when blocked or done. `git diff` in its cwd beats any
message. Doneness is a **written marker** — a final commit plus a report file — never transcript
archaeology. Subscribe with `notify_when_idle`, never poll. Budget: three round trips; exceeding it
means the brief was wrong.

⚠️ **Shared working tree — the standing tactic, deliberately simple.**

**One agent per repo where possible; parallelism goes ACROSS repos, not inside one.** When two do
share a tree:

- **state file ownership at spawn**, and stage **explicit paths only**. Never `git add -A`, never
  `git add .`, while any peer is live.
- **`git status` before staging.** Anything modified that is not yours is left exactly as it is.
- **index.lock means a peer is committing.** Wait and retry — it clears in seconds. **Never delete
  a lock.**
- 🚨 **verify the hash after every commit.** The failure here is not a conflict — conflicts are
  loud. It is a **silent no-op** (your commit vanishes under theirs) and a **silent sweep** (a bare
  `git commit` takes their staged files). Both were observed. `git log -1` is the whole check.
- Upgrade only if this fails: coordinator-as-sole-committer, then worktrees. **Worktrees are the
  answer at ~5+ agents or genuine concurrent edits, not before** — Dima dislikes them and at this
  scale they buy isolation nobody is paying for in collisions.

**Before closing a spawn, ask what it is still evidence for.** «finished its work» and «finished
being useful» are different states — a coder left idle answers questions about session lifetime
that a stopped one cannot. Closing at halt is right; closing without that question is not.

**cclio closes the ticket, the coder never does.** And a coder's report is a candidate, not a
finding: check its claims before relaying them.

Related: [[spawn-types]], [[spawn-title-convention]], [[ticket-refs-on-dispatched-work]],
[[research-vs-lived-evidence]]

**Coder lifetime is a per-case judgment, not a rule — dima's call.** A background session
**survives a cclio restart** (measured: probe `46cc8bac` outlived a full coordinator halt). So
halting cclio does NOT oblige halting its coders. Decide on **context preservation**:

- **keep the coder warm across a cclio halt** when its loaded context is expensive and the next
  assignment is in the same area — a warm session already holds the repo, the ticket and the
  prior diff, and a respawn pays ~50k to rebuild that.
- **stop it and respawn** when the next work is unrelated, when its context is polluted by a
  failed approach, or when it has drifted from the brief. A fresh session is cheaper than
  arguing with a stale one.
- **always stop probes.** They exist to answer one question; a probe that outlives its answer is
  clutter, not a resource.

📌 **stopping is not `TaskStop`.** That tool only reaches subagents *this* session spawned. A
background session inherited from a previous coordinator is stopped by pid, read from
`~/.claude/sessions/<pid>.json`. `ListAgents` shows it; it does not stop it.

🚨 **and deleting the session in the desktop Code ui does NOT stop it either.** Measured: Dima
deleted `🔧 code: mcp rename to x-cw` from the desktop ui, and the process stayed alive and
registered — a later coordinator found it idle in `~/.claude/sessions/90480.json` with pid 90480
still answering `kill -0`. The ui removes the **card**, not the **daemon**.

**So there is exactly one reliable stop for a background session: `kill <pid>`**, with the pid read
from the registry. It is clean — the registry file removes itself on exit, so a follow-up `ls
~/.claude/sessions/` is the whole verification.

📌 The failure shape is the dangerous one: the ui gives positive feedback (the card is gone) for an
action that did not happen. Anyone trusting it believes the machine is quieter than it is. **Never
report a coder stopped because a ui said so — check the pid.**
