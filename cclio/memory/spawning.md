**Full spec:** `cclio/docs/coordinator-coder-contract.md` — read it when actually spawning, never at
boot. When it and this file disagree, the file is right and this is stale.

## the two doors, never interchangeable

- **subagent** (`Agent` tool) — runs inside cclio, dies with it, Dima cannot open it, takes no
  effort setting. `subagent_type: "fork"` inherits cclio's full context and keeps its tool noise
  out; any other type starts blank and needs briefing like a colleague who just walked in.
- **background session** (`claude --bg`) — real, survives a coordinator reset, takes model AND
  effort. **This is the door for all coding.**

The split is not research-vs-code, it is **disposable-vs-watchable**.

`isolation: "worktree"` gives a real git worktree. Expensive; only when agents would collide.
Model defaults and effort policy live in `rules/models.md`, which is always loaded — do not restate
them here.

## preflight, four checks, every spawn

0. **reuse before spawn** — an idle child is not a finished child. A message revives it with context
   intact, and a warm coder is worth ~50k.
1. **tier** — code, repo, real filesystem ⇒ a real session, never a thinking-only one.
2. **name** — `🔧 code:` · `🔬 research:` · `🧪 probe:` · `⏰ area:`, type-first, and it cannot be
   renamed after spawn. 🚨 **sessions only** — the `Agent` tool's `name` regex bans emoji, colons and
   spaces, so that prefix is a hard validation error there. `claude --bg -n` is free-form.
   Dima peeks at running sessions in the desktop Code tab and steers them himself, so the name is
   how he tells one from another.
3. **ticket** — pass the id, require a link-only keyword on every commit touching the work. Never a
   closing keyword unless cclio says so: **the dispatcher verifies, then closes.** [DOT-112](linear://linear.app/issue/DOT-112) sat open
   after its work shipped because that contract did not exist.

All four were violated in one session, some twice. The rules already existed; the failure was not
checking.

## measured, not read from a schema

- **`--effort` is honoured** on `claude --bg` — a `--effort medium` probe from a `high` coordinator
  rendered `Opus 5 with medium effort`. A flag, never inheritance, so pass it every time.
- ⚠️ **`claude --bg <prompt>` does NOT run the prompt.** The session comes up idle. Deliver the brief
  afterwards with `SendMessage`, which also carries `notify_when_idle`.
- ⚠️ **a subagent does not start in the parent's cwd** — it gets the git repo root, and the parent
  cannot choose. **Every path in a brief must be absolute.**
- ⚠️ **a peer answering in plain prose reaches nobody.** Only a `SendMessage` call travels. Say so in
  any brief expecting an answer.
- ⭐ **background sessions are ADOPTABLE, not merely survivable.** Coder `11510c80` was spawned by one
  session, outlived it, and was briefed by a coordinator that never spawned it. A coder is a resource
  on the machine, addressable by anything that can read `~/.claude/sessions/`. **Never respawn to
  escape a lost parent.** What is proven is delivery; whether the adopted coder works correctly is a
  separate check.
- ⚠️ **`notify_when_idle` subscriptions are SESSION-LOCAL and die on a coordinator restart.** Nothing
  announces the loss — you simply wait forever. **Re-subscribe after every restart**; a bare
  `SendMessage` with an empty message costs the coder nothing.
- 🚨 **remote control has ONE owner per session**, and the loser prints code 4090. Start in the
  terminal, treat the desktop Code tab as join-only. 📌 the handover direction was never tested, so
  do not assert a cause.
- **cloud is receive-only** and cli → cloud delivery is unverified: a send returned success while the
  cloud reported nothing arrived. Treat it as a one-way pipe plus a shared store, never a handshake.
- ✅ **peer messaging is non-intrusive** — Dima, unprompted: *«cross-sess peer msging works fine from
  my side, does not look like spamming.»* Stop hedging about waking peers.
- `ListAgents` and `Workflow` are absent from subagent toolsets. Only the coordinator surveys the fleet.

## briefing and watching — write freely, read on a leash

cclio messages the coder whenever. The coder answers **once** per assignment, when blocked or done.
`git diff` in its cwd beats any message. Doneness is a **written marker** — a final commit plus a
report file — never transcript archaeology. Subscribe, never poll. Budget three round trips;
exceeding it means the brief was wrong.

**A coder's report is a candidate, not a finding.** Check its claims before relaying them.

**A timeout is not proof of failure.** Verify with `ListAgents` before respawning; a blind retry
double-runs the work with two agents writing the same files.

## the shared working tree

**One agent per repo where possible; parallelism goes ACROSS repos, not inside one.** When two share:

- state file ownership at spawn, stage **explicit paths only**. Never `git add -A` while a peer lives.
- `git status` before staging. Anything modified that is not yours is left exactly as it is.
- `index.lock` means a peer is committing. Wait and retry. **Never delete a lock.**
- 🚨 **verify the hash after every commit.** Conflicts are loud; the real risks are a **silent no-op**
  and a **silent sweep**. Both observed. `git log -1` is the whole check.
- Worktrees are the answer at ~5+ agents or genuine concurrent edits, **not before**.

## lifetime and stopping

**Per-case judgment, not a rule.** A background session survives a cclio restart, so halting the
coordinator does not oblige halting its coders. Keep one warm when its context is expensive and the
next assignment is nearby; stop and respawn when the work is unrelated or its context is polluted by
a failed approach. **Always stop probes** — one that outlives its answer is clutter.

🚨 **`kill <pid>` is the ONLY reliable stop**, pid read from `~/.claude/sessions/<pid>.json`. The
registry file removes itself on exit, so `ls` is the whole verification.

- `TaskStop` reaches only subagents *this* session spawned.
- **Deleting the session in the desktop Code ui does NOT stop it.** Measured: the card vanished, the
  process stayed alive and registered, still answering `kill -0`. **The ui gives positive feedback
  for an action that did not happen.** Never report a coder stopped because a ui said so.

📌 Before closing a spawn, ask what it is still evidence for. «Finished its work» and «finished being
useful» are different states.

Related: [[research-vs-lived-evidence]], 
