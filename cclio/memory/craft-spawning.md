**One coder by default, two with a stated reason, never three.** Parallelism goes across repos,
not into headcount.

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
- **haiku-4.5** — retrieval, classification, extraction, bulk transforms. 📌 its benchmarks
  compare against 4.x, never the 5s.
- Full cards and prices: `docs/knowledge/models.md`, on demand.

## preflight, five checks, every spawn

0. **reuse before spawn** — an idle child revives by message with context intact; a warm coder is
   worth ~50k.
1. **tier** — code, repo, real filesystem ⇒ a real session, never a thinking-only one.
2. **name** — `🔧 code:` · `🔬 research:` · `🧪 probe:` · `⏰ area:`, type-first. 🚨 **the registry name is `-n <name>`** — `--remote-control <name>` labels only the rc card, and an unnamed session names itself (measured 2026-08-30: `da9590aa` → «git hook dispatcher diagnosis»). a rename is a typed `/rename` inside that session (`claude attach <id>`) — a coder has no tool for it (measured).
   🚨 sessions only: the `Agent` tool's `name` regex bans emoji/colons/spaces. Dima steers running
   sessions by name in the desktop Code tab.
3. **cwd** — 🚨 a coder is a `--bg` session launched with `cd <target repo> && claude --bg …`
   in one command: the only door that derives its stack from cwd (2/2 clean on 2.1.258). a
   subagent spawned by cclio inherits the coordinator's brain whatever the cwd — fine for a
   probe, wrong for a coder. the brief asks the coder to name its loaded CLAUDE.md paths in its
   first reply — the bleed detector.
4. **ticket** — pass the id; link-only keyword on every commit; closing keyword only on cclio's
   word — **cclio verifies, then closes.**
5. **identity (vet)** — the brief carries `LINEAR_TOKEN=$(pnpm -s linear-agent-token coder)` and
   asks the coder to post its done-report as one linear comment on the ticket through that token
   (`linear api` with `Authorization: Bearer`); it renders as «cclio's pet». the reminder counts.
   📌 **cap the comment at ~12 lines** — what shipped, what is left, measured numbers, one line per
   defect; the essay stays in the coder's transcript. dima on the uncapped ones: «comments are
   poems for me». and: prompt BEFORE `--remote-control` — that flag eats the next arg as its label.

## measured, not read from a schema

- **`--effort` is honoured** on `claude --bg` — pass it every time, it is a flag, never inherited.
  a `Workflow` `agent()` call honours its per-call `effort` too (2.1.258).
- ✅ **`claude --bg '<prompt>'` RUNS the prompt** (re-verified 2.1.258; it came up idle on 2.1.239).
  `SendMessage` is still how you brief it later, and the only way to attach `notify_when_idle`.
- ⚠️ **a subagent starts in the parent's BASH SHELL cwd** — whatever the last `cd` left —
  and on 2.1.258 **inherits cclio's whole stack regardless of that cwd** (`cd` sheds nothing;
  flipped on each of the last three builds, so re-probe every build). a cclio subagent is a
  probe or a researcher wearing the coordinator's brain, never a plain coder. keep every path
  in a brief absolute.
- ⚠️ **effort is inherited only by an effort-capable child** — an opus subagent gets
  `CLAUDE_EFFORT`, a haiku one records `effort=null`. never measure effort with haiku in the loop.
- ⚠️ **a worktree agent branches from `origin/<default-branch>`, not local HEAD** — it cannot see
  unpushed commits.
- 📌 `~/.claude/jobs/<jobId>/state.json` carries `respawnFlags` — the only place a session's
  launch argv survives.
- ⚠️ **a peer answering in plain prose reaches nobody** — only a message call travels. Say so
  in any brief expecting an answer. Code-tab sessions have no cc `SendMessage`; their channel is
  the desktop tool `mcp__ccd_session_mgmt__send_message` (load via ToolSearch), one-way per
  call and delivered as a user turn — a two-way needs both sides to load it and to know the
  other's `session_id` (`get_session self`). the brief carries that line, or the coder's
  finish is invisible until a transcript read (2026-09-04). **both, always:** the ping for timing, the
  transcript (`list_events`) for the picture — dima also steers the coder in its own chat, and only
  the transcript shows that.
- ⭐ **background sessions are ADOPTABLE** — anything reading `~/.claude/sessions/` can brief a
  coder it never spawned. Never respawn to escape a lost parent; delivery is proven, correctness is
  a separate check.
- ⚠️ **`notify_when_idle` subscriptions die on a coordinator restart, silently** — re-subscribe
  after every restart; an empty `SendMessage` costs nothing.
- ⏱️ **the idle notice is QUEUED, not immediate** — it drains at your next tool round, so it can
  land after the session it reports was stopped. read the timestamp it carries, never its arrival
  time (2.1.251).
- 🚨 **remote control has ONE owner per session** (loser prints 4090). Start in the terminal, treat
  the desktop Code tab as join-only. 📌 handover direction untested — assert no cause.
- 🚫 **the desktop Browser pane (`mcp__Claude_Browser__*`) exists ONLY in a session the Code tab itself created** — injected via `--mcp-config` at creation, never on resume, never for `claude --bg` or remote-control (ingested CST `browser-pane-spawn`, 2026-09-03, sources in `docs/knowledge/claude-fleet-capabilities.md`). a browser-needing coder is a handoff dima opens in a fresh Code-tab session. cclio has it only when dima booted her from the Code tab — this session did (2026-09-04, `mcp__Claude_Browser__navigate` answered); a terminal-born cclio has none. `x:browser-headless` works from either.
- **cloud is receive-only** and cli → cloud delivery is unverified — a one-way pipe plus a shared
  store, never a handshake.
- ✅ peer messaging is non-intrusive — Dima: *«does not look like spamming»*. No hedging about
  waking peers.
- `ListAgents` and `Workflow` are absent from subagent toolsets — only the coordinator surveys the
  fleet.

## briefing and watching — write freely, read on a leash

**Every coder brief opens with step zero: «load `x:guide-code` + the language guides before the
first file».** A complete brief suppresses the skill router — the coder reads 40 exact lines as
the whole instruction set and never goes looking for a supplementary one (measured on DOT-233:
guide-code never loaded, guide-typescript arrived only after the code was written). One line in
the brief closes it.

A research brief asks for a **structured summary, never a file dump** — paths with line ranges, who owns what, footguns, and «what is NOT in the area» (borrowed from g2i's spec skill, 2026-09-03).

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
- Worktrees at ~5+ agents or genuine concurrent edits, not before. a worktree brief's step 0 is
  `CI=1 pnpm install` (inline, that command only) — kills the shared-hooks rewrite
  (`rules/fleet-hazards.md`, git hooks).
- ⚠️ a dotfiles worktree cannot push and must never run `pnpm` (`rules/fleet-hazards.md`, git
  hooks) — the coordinator merges and pushes.

## lifetime and stopping

Per-case judgment: keep a coder warm when its context is expensive and the next assignment is
nearby; respawn when the work is unrelated or the context is polluted. **Always stop probes.**

- 🚨 **stop with `claude stop <jobId>`, prefer it over `kill <pid>`** — both verified on 2.1.251,
  but four rc sessions killed by pid came back with new pids (2026-08-30; dima's read: his
  agents-view ctrl+x swipe may have respawned them — unconfirmed). the registry file removes
  itself on exit, so `ls` is the whole verification either way. never pattern-kill.
- `TaskStop` reaches only subagents *this* session spawned.
- ⚠️ **deleting the session in the desktop Code ui does NOT stop it** — measured: card gone,
  process alive. Never report a coder stopped because a ui said so.
- 📌 before closing a spawn, ask what it is still evidence for — «finished its work» and «finished
  being useful» are different states.

Full evidence base: `docs/knowledge/spawn-mechanics.md`, on demand.

Related: [method-report-verify](method-report-verify.md)
