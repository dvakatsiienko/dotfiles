---
verified-against: claude code 2.1.251, on this mac, 2026-08-30
method: real spawns — bg sessions, subagents, a fork, worktree isolation, cross-session sends, forced tool calls, transcript + registry inspection. docs/schema only where execution was ruled out, and labelled so.
refresh-when: the claude code minor version changes
procedure: cclio/docs/procedures/refresh-spawn-mechanics.md
---

# spawn mechanics — what is actually true

the pristine evidence base for every way a claude code session can start another worker. the
resident distillate is `cclio/memory/craft-spawning.md`; this file is the on-demand detail behind
it, the same way `docs/knowledge/models.md` sits behind the model picks.

claim tags: **[verified]** ran it, observed the result · **[schema]** read from a tool definition
or `--help` · **[docs]** anthropic documentation only · **[inferred]** reasoning, not evidence ·
**[unknown]**

📌 **the doors, at a glance:** subagent and fork die with the parent and dima cannot open them.
a background session is real, survives a coordinator reset, and takes model and effort. worktree
isolation is a subagent in its own branch. a workflow is a script driving many subagents. cloud
runs on anthropic machines and nobody in the fleet can start one.

## 1. subagent — the `Agent` tool

- runs inside the parent's **own os process** [verified]
- **starts in the parent's cwd** [verified 2.1.251] — a parent at `~/dotfiles/docs` produced a
  child at `~/dotfiles/docs`, not at the repo root
  - 🚨 this **reversed** on 2.1.251. through 2.1.239 a subagent started at the *workspace root*
    (`~/dotfiles/cclio` → `~/dotfiles`). briefs written for the old behaviour still work, because
    absolute paths are correct under both.
- **async — it does not block the parent** [verified]. the tool result says the agent works in the
  background; the parent keeps its turn. completion arrives as a `<task-notification>` user-role
  message carrying the agent's final text plus a token/duration block.
- **model is settable and honoured** [verified] — `model: "haiku"` from an opus parent produced
  `claude-haiku-4-5-20251001` in the child's transcript.
- **effort takes no param and is inherited — but only by a child whose model carries effort**
  [verified]. see §6.
- **`name` is accepted** [verified] though it is absent from the printed parameter list — and its
  regex still rejects the fleet's own title convention:
  - `^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$` — no emoji, no colons, no spaces [verified]
  - `🔬 probe: emoji name` is an `InputValidationError`; transliterate to `probe-emoji-name`
  - 📌 `claude --bg -n` has **no such restriction** — emoji and spaces are fine there. the two
    naming surfaces do not share a validator.
- dima sees it in `/tasks` and **can resume it with another message** [schema]
- no remote-control channel of its own — it has no session, so there is nothing to bridge
  [inferred]; its output surfaces through the parent, which is itself remote-controlled
- 🚫 **`ListAgents` and `Workflow` are absent from a subagent's toolset** [verified] — proven by
  `ToolSearch` failing to resolve either name, not by asking. a subagent cannot survey the fleet or
  run a workflow. `SendMessage` **is** available (deferred; resolves on request) [verified].

## 2. fork — `Agent` with `subagent_type: "fork"`

- a subagent carrying the parent's **full context, including prior tool results** [verified] — a
  fork answered five facts with **zero tool calls**, and three of them had existed only inside
  `Bash` and `TaskCreate` results, never in assistant prose
- **`model` is ignored — a fork is always the parent's model** [schema]
- everything else matches §1

## 3. worktree isolation — `Agent` with `isolation: "worktree"`

**verified end to end on 2.1.251**, where it was previously schema-only.

- cwd: `<repo>/.claude/worktrees/agent-<agentId>` [verified]
- branch: `worktree-agent-<agentId>`, and the worktree is listed as `locked` [verified]
- 🚨 **it branches from `origin/<default-branch>`, NOT your local `HEAD`** [verified] — the probe's
  worktree sat at `origin/main` while local `main` was one commit ahead. **a worktree agent cannot
  see unpushed local commits.** governed by the `worktree.baseRef` setting, whose default `fresh`
  means origin; `head` would branch from local HEAD.
- **auto-removed when the agent changes nothing** [verified] — `git worktree list` was clean
  afterwards with no manual cleanup
- ⚠️ in `dotfiles` specifically, a worktree **cannot push** and must **never run `pnpm`** — it
  installs there and rewrites the shared `.git/hooks` to the worktree path
  (`rules/fleet-hazards.md`). brief any worktree agent with both bans explicitly.

## 4. workflow — the `Workflow` tool

- a js script driving many subagents; `agent()` returns a promise the script awaits, so **the
  workflow call blocks until the script ends** [schema]
- **effort and model are settable per `agent()` call**, not workflow-wide [schema]; whether the
  per-call effort is honoured is [unknown] — no workflow was executed
- concurrency caps: `min(16, cpus-2)` concurrent agents, 1000 total per workflow, 4096 items per
  `parallel()` / `pipeline()` [schema]
- absent from subagent toolsets — only a top-level session can run one [verified]

## 5. background session — `claude --bg`

the door for all coding work: real, watchable, and it outlives the session that started it.

- 🚨 **`claude --bg '<prompt>'` DOES run the prompt** [verified 2.1.251]. the probe's transcript
  carries the prompt as a user record and `PROBE_EFFORT_OK` as the first assistant text.
  - this **reversed** a standing rule that said the session comes up idle and must be briefed
    afterwards with `SendMessage`. that extra round trip is no longer needed.
  - `SendMessage` remains the way to brief it *after* launch, and is the only way to attach
    `notify_when_idle`.
- **model and effort are both flags and both honoured** [verified] — `--model opus --effort low`
  wrote `effort=low model=claude-opus-5 kind=bg` onto every assistant record of the transcript.
  📌 this settles the long-standing unknown; the earlier `effort: null` was caused by pairing the
  flag with `--model haiku`, not by the flag.
  - ⚠️ **always pass `--model` explicitly.** the settings default is fable, and fable is never
    spawned unless dima asks by name.
- **`-n <name>` sets the registry name** [verified] — free-form, emoji and spaces allowed.
  `--remote-control [name]` labels only the rc card; an unnamed session names itself from its
  first turn. a rename afterwards is a typed `/rename` inside the session (`claude attach <id>`);
  a spawned coder has no tool for it.
- **`remoteControlAtStartup: true` is inherited — no flag needed** [verified]. the session's
  registry entry gains a `bridgeSessionId` and its log shows a `claude.ai/code/session_…` link.
- **it is a detached daemon, not a child process** [verified]. on 2.1.251 the process is
  `claude bg-spare --bg-spare /tmp/cc-daemon-501/<n>/spare/<id>.claim.sock` — a session is
  **claimed from a pre-warmed spare pool**; its ppid points at the spare slot, never at the
  spawner. so it survives the spawning session by construction.
- **stopping: both routes work** [verified 2.1.251]
  - `claude stop <jobId>` — works from a plain non-tty shell
  - `kill <pid>`, pid read from `~/.claude/sessions/<pid>.json`
  - verification is the same for both: the registry file removes itself on exit, so `ls` is the
    whole check. 🚫 never pattern-kill — your own process carries the same path in its argv.
  - ⚠️ deleting the session card in the desktop Code ui does **not** stop the process.
- `claude logs <jobId>` prints recent output and works from a plain non-tty shell [verified].
  `claude attach <id>` needs a tty, so it stays [schema] from every shell here.
- 📌 `attach`, `logs`, `stop|kill` and a new `rm` are **documented in `claude --help` on 2.1.251**
  [verified]. they were absent from the command list on 2.1.239 and had to be learned from the
  `--bg` banner.
- ⚠️ **`--bg` and `--print` genuinely conflict** — pairing them is a real error, separate from the
  `disableAgentView` refusal that once gated `--bg` entirely [verified].

## 6. effort — the rule is model-conditional

**effort is a real recorded field**, present on every `assistant` record in the session jsonl. that
is the cheap audit for any future claim about it:

    jq -r 'select(.type=="assistant") | "\(.effort) \(.message.model)"' <transcript>.jsonl | sort -u

- `claude --effort <low|medium|high|xhigh|max>` — honoured [verified]
- `claude --bg --effort` on an effort-capable model — honoured [verified], see §5
- `Agent` tool — no param; **inherited by an effort-capable child** [verified]: an opus subagent of
  a `high` parent had `CLAUDE_EFFORT=high` in its env and `effort=high` on its records
- 🚨 **a haiku child carries no effort at all** [verified] — no `CLAUDE_EFFORT` in its env, and
  `effort=null` on its records, from the same `high` parent. this is a property of the model, not
  a broken inheritance.
  - 📌 this exact confound has now produced a wrong conclusion twice. **never measure effort with
    haiku in the loop.**
- `Workflow` → `agent(prompt, {effort})` — per call [schema], honoured [unknown]

## 7. base context — what a spawn knows before it reads anything

**a background session's stack is decided by the launch shell's cwd, and the registry records that
cwd faithfully** [verified] — a `--bg` launched from `~/dotfiles/docs` recorded
`cwd: /Users/dima/dotfiles/docs` and loaded `~/.claude/CLAUDE.md` + the `rules/*` set +
`dotfiles/CLAUDE.md` + the auto-memory index, and nothing below that.

📌 **`cd` before `--bg` is the entire context-selection mechanism.** a bg session launched from the
wrong directory is a worker with no memory and no idea it is missing any.

**a subagent re-derives from its own cwd rather than inheriting the parent's stack**
[verified 2.1.251] — a subagent of a session that holds `cclio/CLAUDE.md` did **not** receive it.
🚨 this **reversed** the 2.1.239 finding, which recorded inheritance. combined with §1's cwd flip,
the two changes cancel out for a parent at a repo root and diverge for a parent in a subdirectory.

**conversation is not inherited by a plain subagent** [verified] — it answers "no" to seeing prior
turns. a **fork** inherits everything, tool results included (§2).

**the parent cannot choose a subagent's cwd** — the `Agent` tool takes `description`, `prompt`,
`subagent_type`, `model`, `isolation`, `name`; there is no `cwd` [schema]. `isolation: "worktree"`
is the only lever and it picks the path itself. 📌 `EnterWorktree`'s own description mentions
agents "whose working directory was pinned at launch (subagent isolation or **explicit cwd**)", so
the runtime has the concept — it is simply not exposed on this build's `Agent` schema.
**the workaround is the practical one: state the working directory in the brief, and make every
path in it absolute.**

## 8. the two registries — how to introspect a live session

- `~/.claude/sessions/<pid>.json` — one per live session, self-removing on exit. carries
  `sessionId`, `cwd`, `kind`, `name`, `nameSource`, `jobId`, `status`, `version`,
  `bridgeSessionId`, `messagingSocketPath`, `peerProtocol`, `peerFeatures`.
  - on 2.1.251 `peerFeatures` reads `["notify_idle", "reply_across_default_dirs", "artifact_yield"]`
    — it was `["notify_idle"]` alone on 2.1.239.
- `~/.claude/jobs/<jobId>/state.json` — richer, and the **only place the launch flags survive**
  [verified 2.1.251]. carries `respawnFlags` (the literal argv: model, effort, `-n`,
  `--remote-control`), `template`, `cliVersion`, `cwd`, `tokens`, `state`/`detail`, and a `fan`
  array mirroring the session's live todo list. alongside it, `timeline.jsonl`.
  - 🎯 **this is how you answer "how was that session started?"** without asking it.
- `claude agents --json` prints the live set; it is gated by `disableAgentView`, the `ListAgents`
  tool is not [verified on 2.1.239, when the setting was `true`]. the setting is `false` today, so
  the gate itself is not re-testable without flipping it.
- 🚫 **`claude -p` sessions do not register at all** — no `~/.claude/sessions/` entry, no bridge
  [verified]. a `-p` probe is therefore invisible to `ListAgents` and unreachable by `SendMessage`.
  use `--bg` for anything that must be addressable.
- 📌 carried over, and now stale enough to distrust: on cc **2.1.237** the dpatch surface ran at
  `--effort low` with `Bash` in its `--disallowedTools`, read off its live process args [verified
  then]. relevant only to the dpatch-vs-cclio a/b; re-read the process args before citing it.

## 9. messaging between sessions

**a real two-way channel over unix-domain sockets, not polling.** [verified]

- transport: `/tmp/cc-socks/<pid>.sock`, one per live session, advertised in the registry as
  `messagingSocketPath`
- discovery: **`ListAgents`** — works even with `disableAgentView: true` [verified]
- addressing: **the name is the address**; append ` [ref]` only on ambiguity [schema]
- delivery: enqueues and drains at the receiver's next tool round [schema]
- 🚨 **a reply only travels if the peer explicitly calls `SendMessage`.** a peer that answers in
  plain prose reaches nobody. always tell a peer *to reply with SendMessage* — otherwise you have
  written into a void. [verified, twice]
- **completion events:**
  - subagents and forks → automatic `<task-notification>` [verified]
  - another session going idle → `notify_when_idle: true` on a `SendMessage`, one-shot, opt-in,
    **from a main conversation only**. the subscription is **accepted** from a main conversation
    [verified 2.1.251]; the notice may be routed to dima's transcript instead of to the subscriber
    when the sessions differ in permission class, so delivery to the caller is [unknown].
- **driving a session dima started himself works** [verified] — a probe reached an `interactive`
  session two days old and it replied. the message arrives wrapped and attributed:

      <cross-session-message from="uds:/tmp/cc-socks/<pid>.sock" from-name="…" from-mode="bypass">

  a subagent's send goes out under **its parent session's** address, with the subagent named
  inside — so dima can always tell an agent ping from a human one.
- ✅ non-intrusive in practice. dima: *«does not look like spamming»*.

## 10. cloud — `claude --cloud`

**not executed, and deliberately so.** everything here is [schema]/[docs]: runs on anthropic
machines, visible at claude.ai/code, model and effort settable, non-blocking, stopped by the user.
🚨 **nobody in the fleet can spawn one — only dima.** the help text now takes
`--cloud [description|session_id|url]`; a prior-art claim that `--cloud` refuses `--print` dates
from 2026-08-15 and is stale until re-run.

## 11. open questions

- **`Workflow`'s per-call `effort`** — schema is explicit, no workflow executed.
- **`claude attach`** — requires a tty; every shell here is non-tty.
- **row 10 in full** — cloud is forbidden by every brief so far.
- **what `disableAgentView` costs today** — it gated `claude agents` and `claude agents --json`
  and not the `ListAgents` tool [verified 2.1.239]. it is `false` now; whether it also hides the
  in-tui agent view stays [unknown].
- ⚠️ **one unexplained observation, recorded rather than solved.** a `--bg` session whose
  `respawnFlags` and registry both record `cwd: /Users/dima/dotfiles` nonetheless loaded
  `cclio/CLAUDE.md` and every `cclio/memory/*` leaf. no import in `~/.claude/CLAUDE.md` or
  `dotfiles/CLAUDE.md` reaches `cclio/`, and a second `--bg` from `~/dotfiles/docs` showed no such
  bleed. **do not build on §7 for a session launched by a peer until this is explained** — the
  cost of being wrong is a non-coordinator session quietly wearing the coordinator's brain, which
  `dotfiles/CLAUDE.md` warns about by name.

## 12. method lessons specific to probing spawns

the general ones — a probe run while the system is being edited, a null result from your own
tooling — live in `cclio/memory/method-report-verify.md`. these two are this subject's own:

- 🚨 **a model's self-report of its own tool list is unreliable.** asked "do you have `ListAgents`",
  sessions have answered yes in configurations where it was absent. a **forced call** — or a
  `ToolSearch` resolution — is the proof.
- 🚨 **change one variable.** the effort question stayed open for eight days because the first probe
  moved the flag and the model together, and the same haiku confound nearly repeated on the rerun.

## 13. the test suite — re-run this list at every refresh

```bash
claude --version
claude agents --json                                  # live set + gating state

# bg: prompt execution, naming, model+effort. ALWAYS pass --model (default is fable)
claude --bg -n 'probe-x' --model opus --effort low 'reply with exactly: PROBE_OK'
jq -r 'select(.type=="assistant") | "\(.effort) \(.message.model) \(.sessionKind)"' \
  ~/.claude/projects/<slug>/<sessionId>.jsonl | sort -u
jq . ~/.claude/sessions/<pid>.json                    # registry: name, cwd, bridge, peerFeatures
jq '.respawnFlags, .cwd, .template' ~/.claude/jobs/<jobId>/state.json
ps -o pid,ppid,command -p <bg-pid>                    # ppid → bg-spare slot, not the parent

# context stack: launch cwd decides — run from two directories, compare
cd ~/dotfiles/docs && claude --bg -n probe-cwd --model haiku '…list your CLAUDE.md paths…'

# subagent cwd — must run from a SUBDIRECTORY of a repo to discriminate
#   parent ~/dotfiles/docs → child ~/dotfiles/docs  = parent's cwd (2.1.251)
#   parent ~/dotfiles/docs → child ~/dotfiles       = workspace root (2.1.239)

# forced tool calls — the only reliable capability test inside a subagent
#   ToolSearch 'select:ListAgents,Workflow' → "No matching deferred tools found" = absent

# effort inheritance — use an OPUS child; a haiku child proves nothing
env | grep -i CLAUDE_EFFORT                           # inside the subagent

# worktree isolation — brief it read-only, no pnpm, no writing git
#   pwd → <repo>/.claude/worktrees/agent-<agentId>, branch worktree-agent-<agentId>
git rev-parse --short main origin/main                # base ref is ORIGIN, not local HEAD
git worktree list                                     # empty after an unchanged agent = auto-clean

# stopping — both work; verify by the registry file vanishing
claude stop <jobId>
kill <pid>                                            # pid from the registry, NEVER a pattern
ls ~/.claude/sessions/<pid>.json                      # must be "No such file"
```

**agents spawned by the 2026-08-30 run:** 4 subagents (2 haiku, 1 opus, 1 worktree-isolated),
1 fork, 1 rejected `name` validation, 2 `claude --bg` sessions — both stopped and verified gone.
no repo files touched by any probe.
