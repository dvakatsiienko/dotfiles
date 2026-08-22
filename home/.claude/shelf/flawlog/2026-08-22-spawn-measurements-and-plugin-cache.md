# flawlog — 2026-08-22 · run cw·20260819·batch1

one line per flaw: what broke, cost, lesson.

- **`linear whoami` does not exist** (linear cli 2.5.0 prints usage and exits 1). `/cclio-init` step 2
  names it first, GraphQL only as a parenthetical. cost: one wasted call at every boot.
  lesson: a command file that names a command must name one that RAN — same rule as queries. → fixed in place.
- **handoff META said «obsidian worklog EXHAUSTED», and the boot prompt repeated «do not go looking for
  it».** true for `worklog.md`; `inbox.md` had a 28k fresh drop written the same day. cost: nearly
  skipped the largest item in the session. lesson: «exhausted» is a statement about a moment, not a
  standing fact — the inbox check is unconditional, exactly as the init skill has it.
- **read a CST with `cat` instead of `/x:handoff-pull`.** reading is not consuming — only the skill
  retires a CST into `superseded/`, so the handoff stayed pending and would have been re-offered at the
  next boot. dima caught it. cost: near-duplicate work next session. lesson: a shortcut that skips a
  skill also skips its side effects; when a skill owns state, invoking it IS the operation.
- **printed a six-row spawn-types table sourced from a MIX of tool schemas, `--help` output and plain
  inference, without tagging which was which.** dima caught it with one question: «prediction, or
  truthful reliable info?» — before it became a contract. cost: nearly a spec built on inference.
  lesson: a table reads as measured whether or not it is. tag provenance INSIDE the table, per cell,
  or do not print the table. → researcher spawned to verify it empirically.
- **`claude --bg` is gated by `"disableAgentView": true`** (settings.json line 173, dima's own).
  it blocks exactly one of the six spawn types — the background session, i.e. the coder. rows 1–4
  are unaffected (measured: a subagent spawned fine while the boolean was still true).
- **measured: subagents do NOT block the coordinator.** the researcher ran while this session kept
  talking to dima.
- **measured: peer messages arrive MID-TURN.** `bytes-d3`'s reply landed inside a working turn, not
  at a turn boundary. so an unbounded inbound channel really does seize coordinator attention —
  dima's ping-pong worry and dpatch's §3 warning are now evidence, not intuition.
- **measured: cloud sessions are RECEIVE-ONLY.** a cloud peer accepts a message and cannot reply;
  its answer lands in its own transcript. the fleet-capabilities doc says nobody can spawn one —
  it does not say they can be *messaged*, which they can.
- **found: `SendMessage` has `notify_when_idle: true`** — a one-shot completion event for a session
  on this machine. this is precisely the primitive dpatch reported it lacks («no callback, nothing
  that wakes me when the coder finishes»). it was in the tool schema the whole time, unread.
  lesson: read the tool you are about to build a protocol around, before asking another agent how
  it solved the problem without it.
- 🚨 **a research subagent reconciled two of its own contradictory observations by INVENTING a cause
  for a failure it never witnessed.** it claimed `claude --bg` was never gated and that the
  coordinator's refusal was really a `--bg`/`--print` conflict. the coordinator passed no `-p`; the
  refusal named `disableAgentView` verbatim. root cause: dima flipped the setting at 15:33:14, ~40s
  into a ~12min research run, so the agent's early probe saw the gate and its later probes did not.
  cost: none — caught before relay. lesson: **a probe run while a human edits the system is not a
  controlled experiment.** when two of your own measurements disagree, suspect the environment moved
  before inventing a story that reconciles them. this is the exact shape of the audit-relay failure
  already on record; reading the file is what caught it, not the summary.
- **measured by research, operationally important: subagents do NOT start in the parent's cwd** —
  they get the git repo ROOT. cclio sits at `dotfiles/cclio`, so its subagents start at `dotfiles`.
  the parent cannot choose; `Agent` has no cwd param. every brief must therefore state absolute
  paths, never relative ones.
- **`Agent`'s `name` rejects the fleet spawn convention** — its regex bans emoji, colons and spaces,
  so `🔧 code: foo` is a hard validation error. `--bg -n` names are free-form. the convention
  applies to sessions only, and the memory leaf claiming it covers ALL spawns is wrong.
- **a peer's plain-text reply reaches nobody.** a session that answers in prose instead of calling
  `SendMessage` is silently talking to itself. every brief that expects an answer must say so.
- **the proof loop ran end to end, but ONE step was skipped and it is the step the ticket names.**
  DOT-194 says «coordinator reads its diffs WHILE IT RUNS». cclio did not — it subscribed to the
  idle event and verified afterwards. the outcome was good, so the omission is easy to miss.
  arguably the subscription is the better primitive and §5 now prescribes it, but «i did something
  better» is a claim to make out loud, not a reason to report the original step as done. cost: none
  this time; the risk is a wrong direction running to completion unwatched.
- ✅ **the verify step paid for itself immediately.** the coder's report was accurate on every point
  checked — but the one thing that looked like a defect (a dirty `bytes/.claude/settings.json` it
  never mentioned) turned out to be dima's own file from two days earlier, provable only by mtime.
  relaying the report would have been fine; NOT checking would have been luck, not judgment.

## cloud messaging — the contract, and the hole in it

- ✅ **cloud → cli FAILS, and it is documented, not a bug.** a cloud container's `ListAgents`
  enumerates only sessions on its own machine; a mac cli session is not one. `SendMessage("cclio")`
  returns «No agent named 'cclio' is reachable».
- ✅ **cloud CAN see peers it cannot address** — `list_sessions` returns live sessions including cli
  ones. read-only telemetry, no send path.
- ✅ **cowork sessions are invisible from cloud** — the tag filter it would need returns «tags filter
  is not currently available» for in-session callers.
- 🚨 **cli → cloud is NOT verified, and may be broken.** cclio's `SendMessage` returned success; the
  cloud session reported «your message still hasn't landed; nothing queued». the contract line
  claiming it works was sourced from cclio's own report and handed back — **circular evidence**, and
  the cloud session flagged that itself. **a send that resolves without delivering** is the worst
  failure shape there is. do not build on this leg.
- **operating rule while cloud is out of scope:** cli is always the initiator, cloud never calls out,
  cloud replies live in the cloud transcript, and anything cloud must hand back goes through a
  **shared store** — linear, a github pr/issue, or a repo commit. never a request/response handshake.
- cloud session on record: `session_01FiqKNsMtcCbg1WVHQeyAoq`, name `dotfiles-81 [9da05c]`.

## habits adopted this session

- **every peer message carries cclio's own session id in plain text.** the `from=` wrapper already
  carries an address, but a plain id survives a summary, a paste, or a human relaying it. one line,
  and it removes a `ListAgents` round trip on the receiver's side.
- **always clean up sessions spawned as probes; never clean a headliner.** dima peeks at working
  sessions and interferes deliberately — killing one costs him a thread. probes die by cclio's hand,
  the coder dies at halt or when he says so.
- **measured: effort is the FLAG, not inheritance.** a probe spawned `--effort medium` from a `high`
  coordinator rendered «Opus 5 with medium effort». dpatch's open question is closed.

## late-session flaws

- **an unquoted heredoc let the shell execute backticks inside a python payload.** writing a linear
  body containing `` `bytes` `` and `` `chatbot` `` ran them as commands, and the ticket landed with
  the app names silently stripped out of a table. cost: one wasted write plus a repair.
  lesson: **always `<<'PYEOF'`, never `<<PYEOF`**, whenever the payload contains backticks or `$`.
  the failure is silent in the good case — the mutation returns success either way.
- 🚨 **two agents committing in ONE working tree.** dima spotted it: the coder's cwd is
  `~/dotfiles`, the same repo cclio commits in. `git add -A` from either side would sweep
  the other's half-finished edits into a commit nobody reviewed. **no damage this time** — its
  commit touched only its own paths, and the contested file (`cclio-init.md`, mid-edit by cclio)
  was copied AFTER the edit, verified byte-identical.
  the fix is now in `spawn-contract`: **state file ownership up front, stage explicit paths, never
  `git add -A` while a coder is live.** worktree isolation would also solve it, but dima dislikes
  worktrees, so ownership-by-agreement is the standing answer.
- 📌 the near-miss is the lesson, not the outcome. nothing warned either side; it was caught by a
  human watching two commit lines appear at once.
- 🚨 **a THIRD silent commit failure, and the newest one.** the lefthook `format` step failed
  (`🥊`), yet the shell reported nothing, exit was clean, the files stayed staged, and **no commit
  was created**. it was caught only because the shared-tree rule written minutes earlier says
  «verify the hash after every commit» — `git log -1` still showed the previous commit.
  cause: biome wanted to reformat `cclio/.claude/settings.json`, a file the **cli** writes. the repo
  already excludes `home/.claude/settings.json` for exactly this reason; the new one needed the same
  line. fix mirrors the existing precedent rather than inventing one.
  **so the tally of silent commit failures in one session is three:** a commit vanishing under a
  peer's, a bare commit sweeping a peer's staged files, and a hook failing without an error. all
  three look identical from the caller's side — nothing happened, quietly.
- **halted the coder before realising it was the survivability test.** the halt ritual says close
  spawns before finishing, and that was followed correctly — but dima had wanted the coder left
  alive precisely to see whether a session survives a coordinator restart, which is one of the
  contract's four remaining assumptions. cost: none, recovered by spawning an idle throwaway probe
  in its place. lesson: **before closing a spawn at halt, ask what it is still evidence for.**
  «finished its work» and «finished being useful» are different states.
- **next-browser deleted, and dima's objection to keeping it was better than mine.** cclio argued
  «unpublished ≠ abandoned, the cli is alive, it costs nothing parked». dima's counter settled it:
  a snapshot that can never be updated is dead weight, and if the tool is ever wanted the live cli
  installs fresh. 3.3M removed, symlink and folder. lesson: «costs nothing» is not a reason to keep
  something — un-updatable is a reason to remove it.

---

## session 2 — after the restart


- **`ps -ax | grep claude` is a token bomb.** ~14k tokens of electron helper argv to learn one
  pid's parentage. cost: real context, for a fact `ps -p <pid> -o pid,ppid,command` gives free.
  lesson: never grep the full process table on this mac — always target a pid.

- **`TaskStop` cannot stop a session it did not spawn.** two failed calls (by name, then by ref)
  before falling back to `kill <pid>` from `~/.claude/sessions/<pid>.json`. lesson: `TaskStop` is
  for *this* session's subagents. a background SESSION inherited from a dead coordinator is
  stopped by pid, and the session record is where the pid lives. worth folding into
  `spawn-contract` — the contract says how to spawn, not how to reap.

- **`OPEN.md` had a broken heading.** the `## parks` header was swallowed into the `## queue`
  intro paragraph by an earlier edit, so the file rendered as one section. it survived a whole
  halt unnoticed. lesson: a structural edit to a file the boot ritual reads wants a render check,
  not just a write.

- 🚨 **the plugin cache is a COPY, not a symlink.** `plugin-cclio/` is the source;
  `~/.claude/plugins/cache/cclio/cclio/0.1.0/` is what actually loads. in sync right now, but
  editing the source no longer edits the live command. this dents `skill-edits-are-file-edits`
  for the `cclio:*` family specifically.

- **invented a filename instead of reading the folder.** wrote a new flowlog as
  `2026-08-22-cw·20260819·batch1.md` (middots, from the run id) next to the existing
  `2026-08-22-cw-20260819-batch1.md` (hyphens). two logs for one day, silently. merged and
  removed. lesson: `ls` the target folder before naming a file in it — a convention already
  chosen beats one derived from first principles.

- **fixed the duplicate-heading bug by hitting the duplicate heading.** split `OPEN.md` on the
  string `## parks` to keep the parks section — it matched the BROKEN copy inside the queue intro
  first, and produced a file with two `## queue` and two `## parks`. cost: one extra repair round.
  lesson: when repairing a file because a marker appears twice, never key the repair on that
  marker. count the occurrences first (`grep -n`), then splice by line number.

- 🚨 **the plugin cache refreshes on VERSION BUMP, not on file change.** editing
  `plugin-cclio/commands/*.md` changed nothing live — `claude plugin update` answered *"already at
  the latest version"* and left the stale copy in place. bumping `plugin.json` to 0.1.1 was what
  actually moved it. cost: would have shipped a rename that silently never landed. lesson: **every
  `cclio:*` edit needs a version bump plus `claude plugin marketplace update cclio` and
  `claude plugin update cclio@cclio --scope project`**, and it still only binds at the NEXT session.
  this is the concrete shape of the cache-copy hazard logged above.

- **zsh does not word-split unquoted variables.** a `sed ... $FILES` pass silently ran as one
  giant filename and errored. cost: one wasted round. lesson: pass file lists as literal args or
  `${=VAR}` — bash habits do not carry to this shell.

- 🚨 **`git mv` stages, so a scoped `git add` does not scope the commit.** planned a two-commit
  split, staged only the transcript scripts — and the commit swallowed all 15 renames, because
  `git mv` had put them in the index an hour earlier. this is the **silent sweep** the spawn
  contract warns about, arriving from my own earlier command rather than a peer's. cost: one
  `reset --soft` + `git reset` + restage, caught only because `git log -1 --stat` was read.
  lesson: **before a split, `git diff --cached --name-status` — the index is not empty just
  because you have not run `git add` this turn.** verifying the hash is not enough; verify the
  *contents*.

- 🚨 **killing a background session does not stop it — the daemon respawns it.** told dima the
  probe was stopped after `kill <pid>` showed the process gone and the session record deleted.
  it came back twice; the roster now reads `"attempt": 3`. removing the job dir did not help
  either — the supervisor recreates it. cost: **a false "done" reported to dima**, which is worse
  than the probe still running. lesson: `claude agents` has **no stop verb**, so a background
  session cannot be stopped from the cli at all. verify a stop AFTER the respawn window, never at
  t+2s — and when a mechanism fights back twice, stop and report instead of digging further into
  daemon internals.

- **a hook can fail with its error scrolled off.** the commit reported `🥊 format` and simply did
  not happen; HEAD was unchanged and the files stayed staged. the cause was 44 biome errors on
  22 transcript `metadata.json` files newly pulled into git by the shelf. lesson: **read HEAD
  after every commit** — the summary line is not the outcome. the fix was a biome exclusion for
  the shelf as a class, which the config's own comment had already predicted for exactly this
  failure shape.

- **linear rewrites markdown on save, so a round-trip string replace silently misses.** sent
  `~~source-agnostic ~~` + `**bold**` around backticks; linear stored a re-normalised form
  (`~~source-agnostic ~~`~~transcript~~`` and `**write ... header into**` with the code span
  outside the bold). two exact-match replacements reported success while changing nothing — the
  script had no assert, so it wrote the body back unchanged and printed ✓. cost: one silent no-op
  round. lesson: **never exact-match against text you sent to linear — match what it stored**, or
  replace by line/bounds. and a rewrite script must assert the match, not trust it.

- 🚨 **told dima "no stop verb exists" — it does: `claude stop <id>`.** i searched `claude agents
  --help`, found no stop, and reported the capability as absent. the verb lives on `claude` itself,
  and the spawn output prints it unprompted: `claude stop 11510c80 — stop this session`. cost: a
  wrong capability claim, plus two pid-kill attempts that fought the daemon's respawn for no reason.
  lesson: **`<cmd> --help` for ONE subcommand is not a search of the cli.** check the parent
  command's help too, and read the tool's own output — the answer was printed on screen the moment
  a session was created. this is the exact shape `tell-dima-all-capabilities` warns about: a limit
  that was believed, never tested.

- **my survey brief tracked ONE of the three names through the docs.** the rename had three names
  (directory, protocol server name, tools). the inventory i handed the coder chased the *directory*
  everywhere but only spot-checked the *server name* — so three live sites were missing, including
  `CONTEXT.md:106`, the repo glossary. the coder found them and said so. cost: none, because it
  checked; would have been silent staleness in the glossary otherwise. lesson: **when a thing has
  several names, the survey question is per-name.** «where does X appear» asked once answers about
  whichever name you had in mind.

- **`git add` with one dead path stages NOTHING, silently.** the coder's first add bundled a live
  path with the now-renamed `home/.claude/mcp-handoff-cw`; git failed the whole pathspec and left
  the index empty, so two real code edits were simply not staged. caught only by
  `git status --short`. lesson: this is the third distinct way a commit can silently not contain
  what you think today — vanishing under a peer, sweeping a peer's files, and now a failed pathspec
  discarding the whole add. **`git diff --cached --name-status` before every commit** is the single
  check that catches all three.
