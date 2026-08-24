**Full spec:** `cclio/docs/coordinator-coder-contract.md` — read when actually spawning, never at
boot. When it and this file disagree, this file is right and the spec is stale.

## the two doors, never interchangeable

- **subagent** (`Agent` tool) — runs inside cclio, dies with it, Dima cannot open it, takes no
  effort setting (inherits the session's). `subagent_type: "fork"` inherits full context; any other
  type starts blank and is briefed like a colleague who just walked in.
- **background session** (`claude --bg`) — real, survives a coordinator reset, takes model AND
  effort. **The door for all coding — and always spawned with `--remote-control`**, so Dima can
  join it.

The split is **disposable-vs-watchable**, not research-vs-code.
`isolation: "worktree"` gives a real git worktree — expensive, only when agents would collide.

## picking the model — Dima's contract, never re-derived

- **opus-5** — the default coder: hard multi-step engineering, **always `--effort high`**
  (measured at only ~+10% weekly usage — do not revert on a hunch). ⚠️ **not a PM**: overlong
  prose, invented jargon, unasked docs.
- **fable-5** — 🚫 never spawned unless he asks by name, `low` even then; Dima spends that budget
  on his own turns. Anything Dima reads → fable flavour: *«opus picks pragmatically, fable =
  flavour»*.
- **sonnet-5** — routine well-specified work under quota pressure; never hard multi-step (−16 vs
  opus on SWE-bench Pro).
- **haiku-4.5** — 🎯 reach for it more: retrieval, classification, extraction, bulk transforms,
  subagents. Deliberately under-observed — default it for narrow-question subagents and report
  what it handled well vs fumbled; the observation is the point. 📌 its benchmarks compare against
  4.x, never the 5s.
- Full cards and prices: `docs/agents/models.md`, on demand.

## preflight, four checks, every spawn

0. **reuse before spawn** — an idle child revives by message with context intact; a warm coder is
   worth ~50k.
1. **tier** — code, repo, real filesystem ⇒ a real session, never a thinking-only one.
2. **name** — `🔧 code:` · `🔬 research:` · `🧪 probe:` · `⏰ area:`, type-first, unrenamable after.
   🚨 sessions only: the `Agent` tool's `name` regex bans emoji/colons/spaces. Dima steers running
   sessions by name in the desktop Code tab.
3. **ticket** — pass the id; link-only keyword on every commit; closing keyword only on cclio's
   word — **the dispatcher verifies, then closes.**

All four were once violated in one session. The rules existed; the failure was not checking.

## measured, not read from a schema

- **`--effort` is honoured** on `claude --bg` — pass it every time, it is a flag, never inherited.
- ⚠️ **`claude --bg <prompt>` does NOT run the prompt** — the session comes up idle. Brief it
  afterwards with `SendMessage`, which also carries `notify_when_idle`.
- ⚠️ **a subagent starts in the git repo root, not the parent's cwd** — every path in a brief is
  absolute.
- ⚠️ **a peer answering in plain prose reaches nobody** — only a `SendMessage` call travels. Say so
  in any brief expecting an answer.
- ⭐ **background sessions are ADOPTABLE** — anything reading `~/.claude/sessions/` can brief a
  coder it never spawned. Never respawn to escape a lost parent; delivery is proven, correctness is
  a separate check.
- ⚠️ **`notify_when_idle` subscriptions die on a coordinator restart, silently** — re-subscribe
  after every restart; an empty `SendMessage` costs nothing.
- 🚨 **remote control has ONE owner per session** (loser prints 4090). Start in the terminal, treat
  the desktop Code tab as join-only. 📌 handover direction untested — assert no cause.
- **cloud is receive-only** and cli → cloud delivery is unverified — a one-way pipe plus a shared
  store, never a handshake.
- ✅ peer messaging is non-intrusive — Dima: *«does not look like spamming»*. No hedging about
  waking peers.
- `ListAgents` and `Workflow` are absent from subagent toolsets — only the coordinator surveys the
  fleet.

## briefing and watching — write freely, read on a leash

Message the coder whenever; it answers **once** per assignment, blocked or done. `git diff` in its
cwd beats any message. Doneness is a **written marker** (final commit + report), never transcript
archaeology. Subscribe, never poll. Budget three round trips — more means the brief was wrong.

**A coder's report is a candidate, not a finding** — check its claims before relaying.
**A timeout is not proof of failure** — verify with `ListAgents` before respawning; a blind retry
double-runs the work.

## the shared working tree

**One agent per repo where possible; parallelism goes ACROSS repos.** When two share:

- state file ownership at spawn; stage **explicit paths only**, never `git add -A`.
- `git status` before staging; anything modified that is not yours stays untouched.
- `index.lock` means a peer is committing — wait, retry, **never delete a lock**.
- 🚨 **verify the hash after every commit** (`git log -1`) — the real risks are a silent no-op and
  a silent sweep, both observed.
- Worktrees at ~5+ agents or genuine concurrent edits, not before.

## lifetime and stopping

Per-case judgment: keep a coder warm when its context is expensive and the next assignment is
nearby; respawn when the work is unrelated or the context is polluted. **Always stop probes.**

- 🚨 **`kill <pid>` is the ONLY reliable stop** — pid from `~/.claude/sessions/<pid>.json`; the
  registry file removes itself on exit, so `ls` is the whole verification.
- `TaskStop` reaches only subagents *this* session spawned.
- ⚠️ **deleting the session in the desktop Code ui does NOT stop it** — measured: card gone,
  process alive. Never report a coder stopped because a ui said so.
- 📌 before closing a spawn, ask what it is still evidence for — «finished its work» and «finished
  being useful» are different states.

Related: [research-vs-lived-evidence](research-vs-lived-evidence.md)
