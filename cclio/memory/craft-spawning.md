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

- **the Code tab door (dima opens, cclio briefs)** — the flow that ran eight coders on 2026-09-06: dima opens a session in the app dir (root when the job crosses apps), pastes a one-line pointer to a brief file in cclio's scratchpad, the coder pings back through `mcp__ccd_session_mgmt__send_message`. a brief that says «dima's word» starts without a y/n round; a steer relayed by cclio is NOT his grant to the coder (the coder confirms with him — by our own rule). every brief starts from `x:coder-brief` (dima types it in the coder's session; cclio pastes the file body into a `--bg` prompt).
- **`/fork [prompt]`** — a third door (dima, 2026-09-05): copies THIS conversation into a new
  background session, no brief, the coder starts knowing everything cclio knows. reach for it
  when the job needs the session's context (a design bundle discussed here → `theme.css`, a
  grill's outcome → the build); `--bg` when it needs a clean one. dima may say «fork it»; cclio
  suggests it when the brief would be longer than the context it replaces. unmeasured yet:
  whether the fork inherits the Code-tab pane and the desktop channel — probe on first use.
`isolation: "worktree"` gives a real git worktree — expensive, only when agents would collide.

## picking the model — Dima's contract, never re-derived

- **opus-5** — the default coder: hard multi-step engineering, **always `--effort high`** (cheap enough to squeeze; his 2026-09-06 word)
  (measured at only ~+10% weekly usage — do not revert on a hunch). ⚠️ **not a PM**: overlong
  prose, invented jargon, unasked docs.
- **fable-5 / 5.1** — spawned only on his word, and then **always `low`** (dima, 2026-09-06: five medium tasks burned ~40–50% of a 5h window; the knob follows complexity, never volume, and the pick is his — bump only when he says so); Dima spends that budget
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
2. **name + argv** — the template, literal, prompt BEFORE `--remote-control` (measured 2026-09-07: the flag ate a 1.5 kB brief as its rc label → 400, idle child):
   `cd <repo> && claude --bg -n '🔧 code: BYT-N <what>' --model opus --effort high '/x:coder-brief BYT-N <job> coordinator: <session id>' --remote-control`
   type-first (`🔧 code:` · `🔬 research:` · `🧪 probe:` · `⏰ area:`), `-n` typed BEFORE the prompt, every child, probes included. `-n` is the registry name; `--remote-control <name>` labels only the rc card, and an unnamed session names itself (measured: `da9590aa` → «git hook dispatcher diagnosis»). a rename is a typed `/rename` inside that session (`claude attach <id>`); a coder has no tool for it. the `Agent` tool's `name` regex bans emoji/colons/spaces. dima steers running sessions by name in the desktop Code tab.
3. **cwd** — a coder is launched as `cd <target repo> && claude --bg …` in one command: the only
   door that derives its stack from cwd (2/2 clean on 2.1.258). a subagent inherits the
   coordinator's brain whatever the cwd — fine for a probe, wrong for a coder. the brief asks the
   coder to name its loaded CLAUDE.md paths in its first reply — the bleed detector.
4. **ticket** — pass the id; link-only keyword on every commit; closing keyword only on cclio's
   word — **cclio verifies, then closes.**
5. **identity (vet)** — the brief carries `LINEAR_TOKEN=$(pnpm --silent linear:agent-token coder)` and
   asks the coder to post its done-report as one linear comment on the ticket through that token
   (`linear api` with `Authorization: Bearer`); it renders as «coder». the reminder counts.
   📌 **cap the comment at ~12 lines** — what shipped, what is left, measured numbers, one line per
   defect; the essay stays in the coder's transcript. dima on the uncapped ones: «comments are
   poems for me». and: prompt BEFORE `--remote-control` — that flag eats the next arg as its label.

## measured, not read from a schema

- **`--effort` is honoured** on `claude --bg` — pass it every time, it is a flag, never inherited.
  a `Workflow` `agent()` call honours its per-call `effort` too (2.1.258).
- ✅ **`claude --bg '<prompt>'` RUNS the prompt** (re-verified 2.1.258; it came up idle on 2.1.239).
  `SendMessage` is still how you brief it later, and the only way to attach `notify_when_idle`.
- ⚠️ **a subagent starts in the parent's bash cwd and inherits cclio's whole stack regardless
  of it** (2.1.258; flipped on each of the last three builds — re-probe every build). keep every
  path in a brief absolute.
- ⚠️ **effort is inherited only by an effort-capable child** — an opus subagent gets
  `CLAUDE_EFFORT`, a haiku one records `effort=null`. never measure effort with haiku in the loop.
- ⚠️ **a worktree agent branches from `origin/<default-branch>`, not local HEAD** — it cannot see
  unpushed commits.
- 📌 `~/.claude/jobs/<jobId>/state.json` carries `respawnFlags` — the only place a session's
  launch argv survives.
- ⚠️ **a peer answering in plain prose reaches nobody** — only a message call travels; say so
  in any brief expecting an answer. Code-tab sessions have no cc `SendMessage`; their channel is
  `mcp__ccd_session_mgmt__send_message` (load via ToolSearch), one-way per call, delivered as a
  user turn — a two-way needs both sides to load it and to know the other's `session_id`
  (`get_session self`). **both, always:** the ping for timing, the transcript (`list_events`)
  for the picture — dima also steers the coder in its own chat, and only the transcript shows that.
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
- 🚫 **the desktop Browser pane (`mcp__Claude_Browser__*`) exists ONLY in a session the Code tab itself created** — injected via `--mcp-config` at creation, never on resume, never for `claude --bg` or remote-control (sources in `docs/knowledge/claude-fleet-capabilities.md`). a browser-needing coder is a handoff dima opens in a fresh Code-tab session; a terminal-born cclio has no pane. `x:browser-headless` works from either.
- ✅ **cclio spawns `--bg` coders from either birth, terminal or Code tab** — measured 2026-09-07: a Code-tab-born session's child booted on `Claude Max`, wrote a file, bridged rc. the desktop env markers (`CLAUDE_CODE_ENTRYPOINT=claude-desktop`, `ANTHROPIC_BASE_URL`) are harmless. an auth error on spawn means cc is signed out, not a broken door — probe: `claude -p --model haiku 'reply: alive'`.
- **cloud is receive-only** and cli → cloud delivery is unverified — a one-way pipe plus a shared
  store, never a handshake.
- ✅ peer messaging is non-intrusive — Dima: *«does not look like spamming»*. No hedging about
  waking peers.
- `ListAgents` and `Workflow` are absent from subagent toolsets — only the coordinator surveys the
  fleet.

## briefing and watching — write freely, read on a leash

**The coder contract is `x:coder-brief`** (`plugin-x/skills/coder-brief/SKILL.md`, user-invoked only, zero resident cost): skill set, lane, identity, done-comment cap, ping-back. ✅ **the `--bg` prompt expands it** (measured 2026-09-07, haiku: all four headers back) — 🚫 **a `SendMessage` does NOT** (same day: the coder got raw slash text, no brief, and posted its comment as dima). so the brief is the spawn prompt; a later message carries only steers. cclio adds only the job, the ticket, its own session id, and any skill the work drifts into — a complete brief suppresses the skill router (measured on DOT-233: guide-code never loaded), so an unnamed skill is an unloaded one.

🎨 **comp first** — a design job opens with a `design` canvas dima approves in the artifact, then `impeccable` builds the code from that comp: its finish-reviewer judges the build against the comp, its documenter derives `DESIGN.md` from the shipped code. one coder, both skills in sequence (measured 2026-09-06: the two halves ran in two sessions and composed; impeccable's `PostToolUse`/`Stop` hooks are user-scope and fire in every session — a clean a/b needs the competing plugin disabled per lane). the canvas lane touches no files; the build lane starts only after his word on the boards.

A research brief asks for a **structured summary, never a file dump** — paths with line ranges, who owns what, footguns, and «what is NOT in the area» (borrowed from g2i's spec skill, 2026-09-03).

Message the coder whenever; it answers **once** per assignment, blocked or done. `git diff` in its
cwd beats any message. Doneness is a **written marker** (final commit + report), never transcript
archaeology. Subscribe, never poll. Budget three round trips — more means the brief was wrong.

**A coder's report is a candidate, not a finding** — check its claims before relaying.
**A relay to a coder names the source it was read from** — and a claim about a repo's behaviour
opens that repo's `CLAUDE.md` first: «gitignore handler.js, the build regenerates it» was
reasoned from `vercel.json` alone; the repo's own docs said vercel picks functions at clone time,
and the coder held (2026-09-04).
**A timeout is not proof of failure** — verify with `ListAgents` before respawning; a blind retry
double-runs the work.

## the shared working tree

**One agent per repo where possible; parallelism goes ACROSS repos.** When two share:

- state file ownership at spawn; stage **explicit paths only**, never `git add -A`. two coders
  live at once: the second brief names the first's files, or cclio holds the first's merge until
  the second's pr is open (a merge mid-flight broke a rebase, 2026-09-11).
- **a rename of a name a live session uses** (a label, a github app, a branch) is relayed to
  that session the same minute — a coder cannot infer it from its own tool output; every review
  request failed for an hour after `x-coder-bot` → `x-coder-cc` (2026-09-11).
- **a cap is real only if something reads the counter before acting** — the actor never keeps
  the tally from memory; the brief names the api call and the moment (#76: the coder tracked
  rounds by recall, i counted a workflow-wide list; both wrong, 2026-09-11).
- **known items go in ONE batched brief** — ten items dripped over a session re-shaped the same
  predicate four times; hold a pr ten minutes rather than drip.
- the merge monitor's «coder idle» guard reads the live session cwds against the worktree path,
  never a session name (a name-wired guard pruned under a live coder, 2026-09-11).
- `git status` before staging; anything modified that is not yours stays untouched.
- 🚨 **a worktree is pruned only when no live session sits in it** — `jq -r .cwd ~/.claude/sessions/*.json` lists every live cwd; a match means hands off, whatever `git status` says (two prunes under a live push, 2026-09-08; the merge monitor now waits for the coder to be idle, this is the check for a hand-run `scout`).
- `index.lock` means a peer is committing — wait, retry, **never delete a lock**.
- 🚨 **verify the hash after every commit** (`git log -1`) — the real risks are a silent no-op and
  a silent sweep, both observed.
- 🚨 **bytes is ONE shared checkout: a coder's `git switch` moves every session's tree** (measured 2026-09-07 — the prettify branch took the dev servers with it). the PR lane makes every coder concurrent, so **a `coder/*` branch lives in its own worktree** (`git worktree add .claude/worktrees/BYT-N-<slug> -b coder/BYT-N-<slug> main` — `<repo>/.claude/worktrees/` is the one location, cc's own default and where `EnterWorktree` puts its trees; dima's call 2026-09-08 after two locations produced drift); the main checkout stays on `main`. `pnpm worktree:seed` makes a fresh tree runnable (`CI=1` install, env copies, port offset).
- Worktrees at ~5+ agents or genuine concurrent edits, not before. a worktree brief's step 0 is
  `CI=1 pnpm install` (inline, that command only) — kills the shared-hooks rewrite
  (`rules/fleet-hazards.md`, git hooks).
- ⚠️ a dotfiles worktree cannot push and must never run `pnpm` (`rules/fleet-hazards.md`, git
  hooks) — the coordinator merges and pushes.

## lifetime and stopping

Per-case judgment: keep a coder warm when its context is expensive and the next assignment is
nearby; respawn when the work is unrelated or the context is polluted. **Always stop probes.**

- 🚨 **stop with `claude stop <jobId>`, never `kill <pid>`** — four rc sessions killed by pid came
  back with new pids (2026-08-30, cause unconfirmed). the registry file removes itself on exit,
  so `ls` is the whole verification. never pattern-kill.
- `TaskStop` reaches only subagents *this* session spawned.
- ⚠️ **deleting the session in the desktop Code ui does NOT stop it** — measured: card gone,
  process alive. Never report a coder stopped because a ui said so.
- 📌 before closing a spawn, ask what it is still evidence for — «finished its work» and «finished
  being useful» are different states.

**Context size is a cost, not a precision cliff — until our own probe says otherwise**: no
long-context number exists for the 5 family, the last measured knee (opus 4.6) sits past 256k, a
90k boot on a warm 1h cache is ~2 cents a turn. what does cost: a cache gone cold after a >1h gap.
the probe (10-needle recall + one edit at 100k / 400k / 800k) rides `refresh-spawn-mechanics` at
every model bump — the curve is per-release.
📌 **the top of the cost curve is measured, not capped**: a coder at 250–460k context, 638 turns in 75 min, took ~85 % of a 5-hour window (2026-09-12). dima's call: no ceiling, no auto-compact below the max — a coder that compacts mid-task forgets the task. cases log in `cclio/docs/ctx-burn-log.md`; dig in when the pattern repeats.

**Cost of a reading agent = bodies × size, never agents × a flat number** — the board-sweep
workflow was guessed at ~150k and spent 1.27M for 82 ticket bodies + comments.

Full evidence base: `docs/knowledge/spawn-mechanics.md`, on demand.

Related: [method-report-verify](method-report-verify.md)

**a coder's last act is a retro** (dima, 2026-09-08, after a test that surfaced nine ranked findings): ≤20 lines to the coordinator, ranked by cost, with the WHY stated in the ask — the fleet improves itself only from what its members saw. the shape of the ask matters: name the angles (the brief, the steers, the lane, the reporting, what nobody asked), ask for blunt, name-the-moment specifics. cclio folds it into the flawlog flush. the contract line lives in `x:coder-brief`.
