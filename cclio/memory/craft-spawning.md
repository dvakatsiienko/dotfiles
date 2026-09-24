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

- **opus-5.5** — the default coder since 2026-09-22 (`--model opus` resolves to `claude-opus-5-5` on cc 2.1.280, probed): **`--effort medium` for the trial** (dima 2026-09-22: «set default coder to opus 5.5 medium, let's explore how 5.5 performs»); the models.md refresh on 10-06 decides the standing effort. before it: opus-5 at `--effort high` (his 2026-09-06 word)
  (measured at only ~+10% weekly usage — do not revert on a hunch). ⚠️ **not a PM**: overlong
  prose, invented jargon, unasked docs.
- 📌 **a `fork` always runs on the parent model** (the session model — opus since the 09-24 settings change) whatever `model` says — research and lookups go to a fresh agent (`general-purpose`, `haiku` for retrieval), forks only when the job needs this session's context. `CLAUDE_CODE_SUBAGENT_MODEL=opus` in settings.json makes opus the fresh-agent default (dima's yes, 2026-09-13, after two fable forks spent ~365k on web reading).
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
   `cd <repo> && claude --bg -n '🔧 code: BYT-N <what>' --model opus --effort medium '/x:coder-brief BYT-N <job> coordinator: <cclio registry name>' --remote-control`
   **the verifier is dima's call, asked before EVERY coder spawn** (dima 2026-09-20): the spawn ask carries a proposed `exit` section (given/when/then, from the ticket's acceptance) and the question «verifier: yes/no?» — the exit lines are his to think through, so the ask never skips them and never decides alone; a coder spawned without the ask was the miss on DOT-254. **a pr-lane coder spawns with its verifier** (dima 2026-09-18, spec = `x:verifier-brief`): the ticket carries an `exit` section (given/when/then, 3–6 lines, written at spawn, approved in the same ⏳ block — no exit lines, no spawn); after the coder's pr exists:
   `cd <repo> && claude --bg -n '🔎 verify: BYT-N' --model opus --effort high '/x:verifier-brief BYT-N <pr url> <coder registry name> <cclio registry name>' --remote-control`
   **the loop runs coder ↔ verifier; cclio reads one checkpoint line per round, arbitrates a dispute or a round-3 stop, and gets the coder's single report on `clean`** (dima 2026-09-20 — the DOT-254 phase-0/2 rounds came to cclio because my spawn note said «report to me only», which overrode the skill and cost a hop plus a page per round; never write that note again). the coder's brief names the verifier by its registry name (`🔎 verify: BYT-N`), never a session id — the verifier is spawned after the pr opens, and a session id was unreachable by `SendMessage` on 2026-09-18 while the name resolved; freebies and `dima`-mode coders get no verifier. model tier is a trial, not a decision: pr 1 opus high, pr 2 sonnet high, compare unique findings; the ci reviewer stays for those two prs as the control, then earns its place or goes.
   type-first (`🔧 code:` · `🔬 research:` · `🧪 probe:` · `⏰ area:` · `🔎 verify:`), `-n` typed BEFORE the prompt, every child, probes included. `-n` is the registry name; `--remote-control <name>` labels only the rc card, and an unnamed session names itself (measured: `da9590aa` → «git hook dispatcher diagnosis»). a rename is a typed `/rename` inside that session (`claude attach <id>`); a coder has no tool for it. the `Agent` tool's `name` regex bans emoji/colons/spaces. dima steers running sessions by name in the desktop Code tab.
3. **cwd** — a coder is launched as `cd <target repo> && claude --bg …` in one command: the only
   door that derives its stack from cwd (2/2 clean on 2.1.258). a subagent inherits the
   coordinator's brain whatever the cwd — fine for a probe, wrong for a coder. the brief asks the
   coder to name its loaded AGENTS.md paths in its first reply — the bleed detector.
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
- ⚠️ **a `--bg` session is a pre-warmed daemon spare, not a fresh process** — the pool keeps one `claude bg-spare` warm and re-warms on claim; a spare older than a day booted a coder WITHOUT the repo's root `AGENTS.md` (2026-09-22, coder ccbee7b0), a spare born minutes earlier loaded it. check: `ps -o pid,lstart,command -ax | grep '[b]g-spare'` — the brief's «name your loaded AGENTS.md paths» line is the belt, a yesterday-born spare is the tell
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
- 🚨 **a hang is mine to break** (dima 2026-09-20, after a whole loop stood still — coder, verifier and coordinator all idle): the coordinator is the only member that sees every session, so it is the detector. every member is subscribed (`notify_when_idle`, re-armed on every send); an idle notice with an open assignment → ping the idle member in the same turn with the next concrete step; no reply within ~5 min (a `Monitor` on the registry status, deadline stated) → ping dima if he is around, otherwise re-brief from the member's CST or respawn; a stall is reported the moment it is seen, never folded into a later summary
- 🚨 **an idle notice is a check, never a «nothing new»** (dima 2026-09-20, after a coder stalled twice within minutes): on every idle notice run `git -C <worktree> status --short` + `git log -1` against the coder's last ping; a dirty tree, an unpinged commit or an open assignment → nudge in the same turn. the stall then lasts seconds, unattended
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

🖼️ **visual iteration runs in an artifact; main gets the pick** — six hero versions in an hour with no commits, against three takes plus a jar hero shipped to main and replaced the same day (2026-09-24). and **one sample before the set**: five app jars built from a relayed spec were all turned down; one jar in the artifact would have caught it. an Artifact `read` without `path` costs ~15k tokens; `list scope=files` + `read path=` is the route, the full read is only the republish gate.

🎨 **comp first** — a design job opens with a `design` canvas dima approves in the artifact, then `impeccable` builds the code from that comp: its finish-reviewer judges the build against the comp, its documenter derives `DESIGN.md` from the shipped code. one coder, both skills in sequence (measured 2026-09-06: the two halves ran in two sessions and composed; impeccable's `PostToolUse`/`Stop` hooks are user-scope and fire in every session — a clean a/b needs the competing plugin disabled per lane). the canvas lane touches no files; the build lane starts only after his word on the boards. 📌 **the impeccable plugin is OFF by default and `claude plugin list` is the only truth** (dima, 2026-09-14; the memory line said «disabled» while it was enabled on 2026-09-22): its Stop hook runs a «design deep pass» over every `.ts`/`.js` touched, 9 min on a probe file in a pm session. the toggle is CCLIO's, never the coder's (dima, 2026-09-14: a coder will forget the disable): `claude plugin enable impeccable@impeccable` right before a design coder spawns, `disable` in the same step that stops it. plugin state is global, so cclio avoids editing `.ts` while a design lane runs.

A research brief asks for a **structured summary, never a file dump** — paths with line ranges, who owns what, footguns, and «what is NOT in the area» (borrowed from g2i's spec skill, 2026-09-03). **An architecture question names `neuroarxiv` as a lane** (`cclio/.claude/skills/`): a vendor-only research on the verifier missed the two papers that reshaped its spec (2026-09-18).

Message the coder whenever; it answers **once** per assignment, blocked or done. `git diff` in its
cwd beats any message. Doneness is a **written marker** (final commit + report), never transcript
archaeology. Subscribe, never poll. Budget three round trips — more means the brief was wrong.

**A visual spec names the artifact to match, never the recipe** — «22 % corner mask» cost three probe rounds; «match `handoffs.png`» would have been right and cheaper (2026-09-22).
**A ui-shaped ask gets its data measured before anything is drawn** — «the history view reads them as one chain» named a view that did not exist; dima's real rows (7, 5 zero-length) shrank it to a writer seam (2026-09-22).
**A script that narrows a shared file to HEAD reads HEAD at write time, never before the work** — a coder's package.json reset read HEAD before cclio's rename landed and shipped the pre-rename key (2026-09-22).
**An AGENTS.md imperative about WHEN acts at read time** — «start `ray develop` first» was read, then recalled after the whole edit; dima caught it (2026-09-22).
**A brief carries the symptom + the evidence; a guessed cause says «guess»** — the job-6 brief asserted «a per-command key still exists» as the cause of a 401, and three curl calls found an empty header instead (2026-09-18).
**A move is proven by executing every moved entrypoint** — a grep for the moved names missed a second relative import and the move died at runtime with typecheck green (2026-09-19).
**A brief whose proof needs dima's hands says so at the TOP** and asks up front — the rcmd count needed three of his presses, discovered one at a time at the end (2026-09-19).
**A coder's report is a candidate, not a finding** — check its claims before relaying.
**A relay to a coder names the source it was read from** — and a claim about a repo's behaviour
opens that repo's `AGENTS.md` first: «gitignore handler.js, the build regenerates it» was
reasoned from `vercel.json` alone; the repo's own docs said vercel picks functions at clone time,
and the coder held (2026-09-04).
**A timeout is not proof of failure** — verify with `ListAgents` before respawning; a blind retry
double-runs the work.

## the shared working tree

**One agent per repo where possible; parallelism goes ACROSS repos.** When two share:

- state file ownership at spawn; stage **explicit paths only**, never `git add -A`. two coders
  live at once: the second brief names the first's files, or cclio holds the first's merge until
  the second's pr is open (a merge mid-flight broke a rebase, 2026-09-11). **the split is stated at spawn, both coders spawned in one turn, and the second brief carries «tree as of HH:MM, done: …»** — a brief written against a moved tree cost the second coder its first stretch (2026-09-24). a shared `<area>/LANES.md` (who owns what, last touch) replaces about half of the coordinator's relays; it is deleted in the same step that stops the coders.
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
- 🎯 **dima's «no worktree» means «on `main`, no branch, no pr»** (2026-09-18: a coder read it as «branch in the shared checkout» and its `git switch` parked cclio's tree for an hour). the brief says «default lane: commit on main, cclio pushes»; a branch appears only when he says «pr».
- 📌 **a `--bg` coder briefed into a shared main checkout is refused `Edit`/`Write` by the bg-isolation guard** — it edits through Bash and works, but the brief names it: either `"worktree": {"bgIsolation": "none"}` in the spawn, or a worktree (handoff-shape coder, 2026-09-15).
- Worktrees at ~5+ agents or genuine concurrent edits, not before. a worktree brief's step 0 is
  `CI=1 pnpm install` (inline, that command only) — kills the shared-hooks rewrite
  (`rules/fleet-hazards.md`, git hooks).
- ⚠️ a frame worktree cannot push and must never run `pnpm` (`rules/fleet-hazards.md`, git
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
📌 **the top of the cost curve is measured, not capped**: a coder at 250–460k context, 638 turns in 75 min, took ~85 % of a 5-hour window (2026-09-12). dima's call: no ceiling, no auto-compact below the max — a coder that compacts mid-task forgets the task. cases log in `docs/vet/ctx-burn.md`; dig in when the pattern repeats.

**Cost of a reading agent = bodies × size, never agents × a flat number** — the board-sweep
workflow was guessed at ~150k and spent 1.27M for 82 ticket bodies + comments.

Full evidence base: `docs/knowledge/spawn-mechanics.md`, on demand.

Related: [method-report-verify](method-report-verify.md)

**a coder's last act is a retro** (dima, 2026-09-08, after a test that surfaced nine ranked findings): ≤20 lines to the coordinator, ranked by cost, with the WHY stated in the ask — the fleet improves itself only from what its members saw. the shape of the ask matters: name the angles (the brief, the steers, the lane, the reporting, what nobody asked), ask for blunt, name-the-moment specifics. cclio folds it into the flawlog flush. the contract line lives in `x:coder-brief`.
