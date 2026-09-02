---
verified-against: claude code 2.1.258, on this mac, 2026-09-02
method: real spawns — bg sessions, subagents, a fork, worktree isolation, cross-session sends, forced tool calls, transcript + registry inspection. docs/schema only where execution was ruled out, and labelled so.
refresh-when: the claude code minor version changes
procedure: cclio/docs/procedures/refresh-spawn-mechanics.md
---

# spawn mechanics — what is actually true

the evidence base for every way a claude code session can start another worker. the resident
distillate is `cclio/memory/craft-spawning.md`; this is the on-demand detail behind it.

claim tags: **[verified]** ran it, observed the result · **[schema]** read from a tool definition
or `--help` · **[docs]** anthropic documentation only · **[inferred]** reasoning, not evidence ·
**[unknown]** · **[volatile]** verified, but flipped across builds — re-probe every build.

📌 **the doors, at a glance:** subagent and fork die with the parent and dima cannot open them.
a background session is real, survives a coordinator reset, and takes model and effort. worktree
isolation is a subagent in its own branch. a workflow is a script driving many subagents. cloud
runs on anthropic machines and nobody in the fleet can start one.

## 1. subagent — the `Agent` tool

- runs inside the parent's **own os process** [verified]
- **starts in the parent's SHELL cwd** [verified 2.1.258] — the cwd the parent's `Bash` tool sits
  in, mutated by any earlier `cd`. a cclio parent (registry cwd `~/dotfiles/cclio`) whose last Bash
  call had `cd ~/dotfiles/docs` produced a child at `~/dotfiles/docs`; after `cd ~/dotfiles`, the
  next child started at `~/dotfiles`. the shell cwd sets the child's cwd only, not its context
  stack (§7).
  - 🚨 **reversed on 2.1.251**: through 2.1.239 a subagent started at the *workspace root*
    (`~/dotfiles/cclio` → `~/dotfiles`). absolute paths in briefs are correct under both.
- **async** [verified] — the parent keeps its turn; completion arrives as a `<task-notification>`
  user-role message with the agent's final text plus a token/duration block.
- **model is settable and honoured** [verified] — `model: "haiku"` from an opus parent produced
  `claude-haiku-4-5-20251001` in the child's transcript.
- **effort takes no param; inherited only by a child whose model carries effort** [verified], §6.
- **`name` is accepted** [verified] though absent from the printed parameter list; regex
  `^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$` — no emoji, colons or spaces [verified]. `🔬 probe: emoji name`
  is an `InputValidationError`; transliterate to `probe-emoji-name`. 📌 `claude --bg -n` has no
  such restriction — the two naming surfaces do not share a validator.
- dima sees it in `/tasks` and **can resume it with another message** [schema]
- no remote-control channel of its own — no session, nothing to bridge [inferred]; its output
  surfaces through the parent
- 🚫 **`ListAgents` and `Workflow` are absent from a subagent's toolset** [verified] — proven by
  `ToolSearch` failing to resolve either name (§12). `SendMessage` **is** available (deferred)
  [verified].

## 2. fork — `Agent` with `subagent_type: "fork"`

- a subagent carrying the parent's **full context, including prior tool results** [verified] — a
  fork answered five facts with zero tool calls, three of them known only from `Bash` and
  `TaskCreate` results
- **`model` is ignored — a fork is always the parent's model** [schema]
- everything else matches §1

## 3. worktree isolation — `Agent` with `isolation: "worktree"`

- cwd: `<repo>/.claude/worktrees/agent-<agentId>` [verified]
- branch: `worktree-agent-<agentId>`, listed as `locked` [verified]
- 🚨 **it branches from `origin/<default-branch>`, NOT local `HEAD`** [verified] — the probe's
  worktree sat at `origin/main` while local `main` was one commit ahead, so **a worktree agent
  cannot see unpushed commits.** governed by `worktree.baseRef`: default `fresh` = origin, `head`
  = local HEAD.
- **auto-removed when the agent changes nothing** [verified] — `git worktree list` clean afterwards
- ⚠️ in `dotfiles` a worktree **cannot push** and must **never run `pnpm`** — it rewrites the
  shared `.git/hooks` to the worktree path (`rules/fleet-hazards.md`). brief both bans explicitly.

## 4. workflow — the `Workflow` tool

- a js script driving many subagents; `agent()` returns a promise the script awaits, so **the
  workflow call blocks until the script ends** [schema]
- **effort and model are per `agent()` call, and per-call effort is honoured** [verified 2.1.258]
  — `agent(…, {model: 'opus', effort: 'high'})` under a session at `low` read
  `CLAUDE_EFFORT=high`; `effort: 'low'` read `low`. a workflow agent starts in the parent's shell
  cwd, like a subagent (§1).
- concurrency caps: `min(16, cpus-2)` concurrent agents, 1000 total per workflow, 4096 items per
  `parallel()` / `pipeline()` [schema]
- absent from subagent toolsets — only a top-level session can run one [verified]

## 5. background session — `claude --bg`

the door for all coding work: real, watchable, outlives the session that started it.

- 🚨 **`claude --bg '<prompt>'` DOES run the prompt** [verified 2.1.251, 2.1.258] — the transcript
  carries the prompt as a user record and the answer as the first assistant text. this reversed the
  rule that the session comes up idle and needs a `SendMessage` brief. `SendMessage` remains the way
  to brief it *after* launch, and the only way to attach `notify_when_idle`.
- **model and effort are both flags, both honoured** [verified] — `--model opus --effort low`
  wrote `effort=low model=claude-opus-5 kind=bg` onto every assistant record. the earlier
  `effort: null` came from pairing the flag with `--model haiku`, not from the flag.
  - ⚠️ **always pass `--model`** — the settings default is fable, never spawned unless dima asks.
- **`-n <name>` sets the registry name** [verified] — free-form, emoji and spaces allowed.
  `--remote-control [name]` labels only the rc card; an unnamed session names itself from its
  first turn. a rename afterwards is a typed `/rename` inside the session (`claude attach <id>`);
  a spawned coder has no tool for it.
- **`remoteControlAtStartup: true` is inherited — no flag needed** [verified]. the registry entry
  gains a `bridgeSessionId`; the log shows a `claude.ai/code/session_…` link.
- **a detached daemon, not a child process** [verified]. the process is
  `claude bg-spare --bg-spare /tmp/cc-daemon-501/<n>/spare/<id>.claim.sock` — **claimed from a
  pre-warmed spare pool**; its ppid is the spare slot, never the spawner, so it survives the
  spawning session by construction.
  - the pool's owner [verified 2.1.258]: `claude daemon run --origin transient --spawned-by
    {"label":"claude --bg","cwd":…}`, ppid 1, started by the FIRST `--bg` call and recording that
    call's cwd. it holds `bg-pty-host` slots, each wrapping one `bg-spare`; a claimed spare becomes
    the session, and one unclaimed spare stays warm after every session is stopped. nothing exists
    before the first `--bg` of the day.
- **stopping: both routes work** [verified 2.1.251, 2.1.258]
  - `claude stop <jobId>` — works from a non-tty shell
  - `kill <pid>`, pid read from `~/.claude/sessions/<pid>.json`
  - verification for both: the registry file removes itself on exit; `ls` is the whole check.
    🚫 never pattern-kill — your own process carries the same path in its argv.
  - ⚠️ deleting the session card in the desktop Code ui does **not** stop the process.
- `claude logs <jobId>` works from a non-tty shell [verified]; `claude attach <id>` needs a tty,
  so it stays [schema] here.
- 📌 `attach`, `logs`, `stop|kill` and `rm` are **documented in `claude --help` since 2.1.251**
  [verified]; absent on 2.1.239.
- ⚠️ **`--bg` and `--print` conflict** — a real error, separate from the `disableAgentView`
  refusal that once gated `--bg` entirely [verified].

## 6. effort — the rule is model-conditional

**effort is a recorded field** on every `assistant` record in the session jsonl — the cheap audit
for any claim about it:

    jq -r 'select(.type=="assistant") | "\(.effort) \(.message.model)"' <transcript>.jsonl | sort -u

- `claude --effort <low|medium|high|xhigh|max>` — honoured [verified]
- `claude --bg --effort` on an effort-capable model — honoured [verified], §5
- `Agent` tool — no param; **inherited by an effort-capable child** [verified]: an opus subagent
  of a `high` parent had `CLAUDE_EFFORT=high` in its env and `effort=high` on its records
- 🚨 **a haiku child carries no effort at all** [verified] — no `CLAUDE_EFFORT`, `effort=null` on
  its records, same `high` parent. a property of the model, not broken inheritance. 📌 this
  confound produced a wrong conclusion twice: **never measure effort with haiku in the loop.**
- `Workflow` → `agent(prompt, {effort})` — per call, honoured [verified 2.1.258], §4

## 7. base context — what a spawn knows before it reads anything

**a background session's stack is decided by the launch shell's cwd, recorded faithfully in the
registry** [verified] — a `--bg` from `~/dotfiles/docs` recorded `cwd: /Users/dima/dotfiles/docs`
and loaded `~/.claude/CLAUDE.md` + `rules/*` + `dotfiles/CLAUDE.md` + the auto-memory index, and
nothing below that. 📌 **`cd` before `--bg` is the entire context-selection mechanism.**

**a subagent INHERITS the parent's context stack, whatever its own cwd** [volatile — verified
2.1.258] — two cclio subagents (opus at `~/dotfiles/docs`, haiku at `~/dotfiles`) both held
`cclio/CLAUDE.md` and every `cclio/memory/*` leaf and quoted its first sentence on request; a
`--bg` from the same shell and cwd held neither.
🚨 **reversed 2.1.251** (re-derive from own cwd), which had reversed 2.1.239 (inherit). three
builds, three answers — never write a brief that depends on either.
🎯 **consequence:** a subagent or workflow agent spawned by cclio wears the coordinator's brain
on this build, and no `cd` sheds it. a coder that must think as a plain session goes through
`claude --bg` from the target repo — the only door that derives from cwd.

**conversation is not inherited by a plain subagent** [verified]; a **fork** inherits everything,
tool results included (§2).

**the parent cannot choose a subagent's cwd** — the `Agent` tool takes `description`, `prompt`,
`subagent_type`, `model`, `isolation`, `name`; no `cwd` [schema]. `isolation: "worktree"` is the
only lever and it picks the path itself. 📌 `EnterWorktree`'s description mentions agents "whose
working directory was pinned at launch (subagent isolation or **explicit cwd**)" — the runtime has
the concept, this build's `Agent` schema does not expose it. **workaround: state the working
directory in the brief, every path absolute.**

## 8. the two registries — how to introspect a live session

- `~/.claude/sessions/<pid>.json` — one per live session, self-removing on exit. carries
  `sessionId`, `cwd`, `kind`, `name`, `nameSource`, `jobId`, `status`, `version`,
  `bridgeSessionId`, `messagingSocketPath`, `peerProtocol`, `peerFeatures`.
  - `peerFeatures` on 2.1.251: `["notify_idle", "reply_across_default_dirs", "artifact_yield"]`;
    `["notify_idle"]` alone on 2.1.239.
- `~/.claude/jobs/<jobId>/state.json` — richer, and the **only place the launch flags survive**
  [verified 2.1.251]: `respawnFlags` (the literal argv: model, effort, `-n`, `--remote-control`),
  `template`, `cliVersion`, `cwd`, `tokens`, `state`/`detail`, a `fan` array mirroring the live
  todo list; `timeline.jsonl` alongside. 🎯 this answers "how was that session started?" without
  asking it.
- `claude agents --json` prints the live set; gated by `disableAgentView`, which does not gate the
  `ListAgents` tool [verified 2.1.239, setting `true`]. the setting is `false` today, so the gate
  is not re-testable without flipping it.
- 🚫 **`claude -p` sessions do not register** — no `~/.claude/sessions/` entry, no bridge
  [verified]: invisible to `ListAgents`, unreachable by `SendMessage`. use `--bg` for anything
  addressable.
- 📌 stale enough to distrust: on cc **2.1.237** the dpatch surface ran at `--effort low` with
  `Bash` in its `--disallowedTools`, read off its live process args [verified then]. re-read the
  process args before citing it.

## 9. messaging between sessions

**a two-way channel over unix-domain sockets, not polling** [verified]

- transport: `/tmp/cc-socks/<pid>.sock`, one per live session, advertised in the registry as
  `messagingSocketPath`
- discovery: **`ListAgents`** — works even with `disableAgentView: true` [verified]
- addressing: **the name is the address**; append ` [ref]` only on ambiguity [schema]
- delivery: enqueues and drains at the receiver's next tool round [schema]
- 🚨 **a reply only travels if the peer explicitly calls `SendMessage`** — plain prose reaches
  nobody. tell every peer *to reply with SendMessage* [verified, twice]
- **completion events:**
  - subagents and forks → automatic `<task-notification>` [verified]
  - another session going idle → `notify_when_idle: true` on a `SendMessage`, one-shot, opt-in,
    **from a main conversation only** [verified end to end 2.1.251] — the
    `[Cross-session idle notice]` arrived at the caller carrying the peer's closing line. (docs:
    it can route to dima's transcript instead when the two sessions differ in permission class.)
  - ⏱️ **the notice is queued, not immediate** [verified] — it drains at the subscriber's next
    tool round and can land after the target was stopped (one reported a 20:03 idle and arrived
    after the kill). read the timestamp it carries, never its arrival.
- **driving a session dima started himself works** [verified] — a probe reached a two-day-old
  `interactive` session and it replied. the message arrives wrapped and attributed:

      <cross-session-message from="uds:/tmp/cc-socks/<pid>.sock" from-name="…" from-mode="bypass">

  a subagent's send goes out under **its parent session's** address with the subagent named
  inside — an agent ping is always distinguishable from a human one.
- ✅ non-intrusive in practice. dima: *«does not look like spamming»*.

## 10. cloud — `claude --cloud`

**not executed, deliberately.** everything here is [schema]/[docs]: runs on anthropic machines,
visible at claude.ai/code, model and effort settable, non-blocking, stopped by the user.
🚨 **nobody in the fleet can spawn one — only dima.** help takes `--cloud
[description|session_id|url]`; a prior-art claim that `--cloud` refuses `--print` dates from
2026-08-15 and is stale until re-run.

## 11. open questions

- **`claude attach`** — requires a tty; every shell here is non-tty.
- **row 10 in full** — cloud is forbidden by every brief so far.
- **what `disableAgentView` costs today** — it gated `claude agents` and `claude agents --json`
  and not `ListAgents` [verified 2.1.239]; whether it also hides the in-tui agent view [unknown].
- ⚠️ **the cclio-stack bleed — explained for subagents, unreproduced for `--bg`.** subagent
  inheritance (§7) is what the 2026-08-30 run saw from the inside. its one `--bg` observation
  (registry cwd `~/dotfiles`, cclio leaves loaded) did not reproduce: two `--bg` probes on 2.1.258
  from `~/dotfiles` and `~/dotfiles/docs` loaded nothing under `cclio/`. 1 bleed in 3 bg launches
  across two builds; the daemon recording the first `--bg` call's cwd (§5) is the remaining
  suspect. **a bg coder's brief asks it to name its loaded CLAUDE.md paths in its first reply** —
  the only detector.

## 12. method lessons specific to probing spawns

the general ones live in `cclio/memory/method-report-verify.md`. this subject's own:

- 🚨 **a model's self-report of its own tool list is unreliable** — sessions answered yes to
  "do you have `ListAgents`" where it was absent. a **forced call** or a `ToolSearch` resolution
  is the proof.
- 🚨 **change one variable.** the effort question stayed open eight days because the first probe
  moved the flag and the model together; the haiku confound nearly repeated on the rerun.

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

**agents spawned by the 2026-09-02 run (2.1.258):** 3 subagents (1 opus, 2 haiku — one
worktree-isolated), 2 one-agent workflows (opus, effort low / high), 2 `claude --bg` opus
sessions — one stopped by `claude stop`, one by `kill <pid>`, both registry files gone. worktree
auto-cleaned. no repo files touched by any probe.

**agents spawned by the 2026-08-30 run:** 4 subagents (2 haiku, 1 opus, 1 worktree-isolated),
1 fork, 1 rejected `name` validation, 2 `claude --bg` sessions — both stopped and verified gone.
no repo files touched by any probe.
