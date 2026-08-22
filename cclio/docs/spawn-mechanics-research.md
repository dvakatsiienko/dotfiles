---
researched: 2026-08-22
method: executed against claude code 2.1.239 on this mac — real spawns, real cross-session sends, transcript jsonl inspection, forced tool calls; docs only where execution was ruled out
refresh-when: the claude code minor version changes, or `disableAgentView` / `remoteControlAtStartup` are flipped
---

# spawn mechanics — what is actually true

claim tags: **[verified]** ran it, observed the result · **[schema]** read from a tool definition or `--help` ·
**[docs]** anthropic documentation only · **[inferred]** reasoning, not evidence · **[unknown]**

⚠️ **two rows of the original table were wrong in the confident direction.** `claude --bg` is NOT blocked,
and subagents do NOT start in the parent's cwd. both are load-bearing for a delegation contract.

## the corrected table

| # | type | what it is | dima sees it | remote control | effort settable | model settable | blocks parent | dies when |
|---|---|---|---|---|---|---|---|---|
| 1 | subagent (`Agent`) | runs in the parent's **own os process** [verified] | `/tasks`; **he can resume it with a message** [schema] | none of its own; visible through the parent's [inferred] | ❌ no param; **inherits parent** [verified] | ✅ yes, honoured [verified] | ❌ **no, async** [verified] | job ends; resumable until the parent session ends [schema] |
| 2 | fork (`Agent`, `subagent_type:"fork"`) | subagent carrying the parent's full context **incl. prior tool results** [verified] | same [schema] | same [inferred] | ❌ inherits [verified] | ❌ **ignored — always parent's** [schema] | ❌ no [verified] | same [inferred] |
| 3 | worktree subagent (`Agent`, `isolation:"worktree"`) | #1 in a fresh worktree under `.claude/worktrees/` [schema] | same [schema] | same [inferred] | ❌ inherits [schema] | ✅ [schema] | ❌ no [schema] | same; worktree auto-removed if unchanged [schema] |
| 4 | workflow (`Workflow`) | js script driving many subagents; **absent from subagent tool lists** [verified] | run id + persisted script path in the session dir [schema] | none [inferred] | ✅ **per `agent()` call**, `low\|medium\|high\|xhigh\|max` [schema] | ✅ per call [schema] | ✅ **yes, awaited** [schema] | script ends [schema] |
| 5 | background session (`claude --bg`) | a real cc session in a **detached daemon** [verified] | `ListAgents`, `claude logs/attach/stop`, claude.ai/code [verified] | ✅ **inherits `remoteControlAtStartup`** [verified] | ✅ flag exists [schema]; honoured on opus [verified] | ✅ honoured [verified] | ❌ returns immediately [verified] | `claude stop`; **survives the spawning session** [verified] |
| 6 | cloud session (`claude --cloud`) | runs on anthropic machines | claude.ai/code | ✅ | ✅ [schema] | ✅ [schema] | ❌ | user stops it |

row 6 was **not executed** — the brief forbade spawning cloud sessions. everything in it is [schema]/[docs].

## 1. where the original table was wrong

- 🚫 **RETRACTED by the coordinator — `claude --bg` WAS blocked.** this file originally claimed the
  first attempt failed only because `--bg` and `--print` conflict. that was an inference about a
  command the researcher never saw. the coordinator's actual invocation carried no `-p`, and its
  refusal was the literal string `'--bg' is disabled by the 'disableAgentView' setting`.

  **the environment changed mid-run.** `settings.json` was flipped by dima at **15:33:14**; the
  research pass started ~15:32:30. its `claude agents --json` probe hit the refusal (pre-flip) and
  its `--bg` probes succeeded (post-flip), and it reconciled the two by inventing a cause for a
  failure it had not witnessed.

  **what is true:** `disableAgentView: true` gates `claude --bg` AND `claude agents`. It does not
  gate the `ListAgents` tool. And `--bg` genuinely does conflict with `--print` — a real, separate
  error that is not the one observed here.

  📌 the general lesson, and it is the sharper one: **a probe that runs while a human is editing
  the system is not a controlled experiment.** when two of your own observations disagree, suspect
  the environment moved before you reach for a story that reconciles them.
- 🚨 **subagents do not inherit the parent's cwd.** they get the **workspace root** — the git repo root
  when the parent sits inside a repo. cclio lives at `~/dotfiles/cclio`; its subagents start at
  `~/dotfiles`. [verified]
- ❌ "dima sees it, read-only" for rows 1–3 — the completion notice states he can send another message and
  resume the same agent. [schema]
- ❌ "effort settable: YES" for row 4 was right but under-specified: it is per `agent()` call inside the
  script, not a workflow-level knob.
- ❌ rows 1–3 "model settable: no" was never in the table but is worth stating: **model is settable and
  honoured** on a plain subagent, **ignored on a fork**.
- ✅ everything else in rows 1–3 held up.

## 2. base context per spawn type

**subagent / fork — CLAUDE.md is inherited, not re-derived.** [verified]
a fresh (non-fork) `general-purpose` subagent spawned from cclio reported, from context alone, the full
cclio stack: `~/.claude/CLAUDE.md`, all 10 `rules/*.md`, `dotfiles/CLAUDE.md`, `cclio/CLAUDE.md`,
`cclio/memory/MEMORY.md` + every leaf, and the auto-memory index. it correctly named
`reminder-cron-handover`'s **2026-09-01** and roadmap step 3 without reading a file.

📌 that is proof of **inheritance**, not re-derivation: `cclio/CLAUDE.md` is a *descendant* of the
subagent's cwd (`~/dotfiles`), so a cwd-based load could never have found it.

**conversation is NOT inherited by a plain subagent** — it answered "no" to seeing prior turns. [verified]
**a fork inherits everything, including earlier tool results** — it reported four facts from this thread
with zero tool calls. [verified]

**cwd** [verified, two measurements]:

| parent cwd | subagent cwd |
|---|---|
| `~/dotfiles/cclio` (inside a git repo) | `~/dotfiles` — the **repo root** |
| a non-git scratch dir | the **same dir** — identical to parent |

so the rule is *workspace root*, and the git-root case is the one that bites cclio every time.

**can the parent choose the spawn's cwd?** ❌ **no.** the `Agent` tool takes `description`, `prompt`,
`subagent_type`, `model`, `isolation`, `name` — there is no `cwd`. [schema] `isolation:"worktree"` is the
only lever, and it picks the path for you. 📌 `EnterWorktree`'s description does refer to "agents whose
working directory was pinned at launch (subagent isolation or **explicit cwd**)", so the runtime has the
concept — it is just not exposed on this build's `Agent` schema. [schema]

**workaround, and it is the practical one:** a subagent's own `Bash` calls can `cd` anywhere, and the
brief's own note ("cwd resets between bash calls") means every command must carry an absolute path
regardless. so tell the subagent its working directory in the prompt.

## 3. background session CLAUDE.md stack

**it is the launch shell's cwd that decides, and nothing else.** [verified]

`claude --bg` launched from `~/dotfiles/cclio` produced a session whose registry entry and
transcript both record `cwd: /Users/dima/dotfiles/cclio`, and whose tui header rendered
`~/dotfiles/cclio`.

measured directly with `claude -p` in two directories:

| launched from | stack loaded |
|---|---|
| `~/dotfiles/cclio` | `~/.claude/CLAUDE.md` + 10 `rules/*` + `dotfiles/CLAUDE.md` + `cclio/CLAUDE.md` + all ~50 memory leaves + auto-memory `-Users-dima-projects-dotfiles` |
| `~` | `~/.claude/CLAUDE.md` + 10 `rules/*` + auto-memory `-Users-dima` — **nothing from dotfiles or cclio** |

📌 so `cd` before `--bg` is the entire context-selection mechanism. a bg session launched from the wrong
directory is a coordinator with no memory and no idea it is missing any.

## 4. do subagents block the parent?

**no. they are async background jobs.** [verified] the tool result says verbatim: *"the agent is working in
the background. you will be notified automatically when it completes."* the parent keeps its turn and can
keep talking to dima. completion arrives as a `<task-notification>` user-role message carrying the agent's
final text and a token/duration usage block.

**the `Workflow` tool is the exception** — `agent()` returns a promise the script awaits, so the workflow
call itself blocks until the script ends. [schema]

## 5. effort

| surface | settable | honoured |
|---|---|---|
| `claude --effort <low\|medium\|high\|xhigh\|max>` | ✅ [schema] | ✅ **[verified]** — `-p --effort low` wrote `effort: "low"` into the transcript on an opus session, against a settings default of `high` |
| `claude --bg --effort` | ✅ [schema] | [unknown] — the probe used `--model haiku` and the transcript recorded `effort: null`; haiku may not carry effort at all. **not falsified, just not proven** |
| `claude agents --effort` | ✅ default for agent-view dispatches [schema] | untestable — `claude agents` is gated here |
| `Agent` tool | ❌ no param [schema] | inherits: subagent env showed `CLAUDE_EFFORT=high` and its transcript recorded `effort: "high"` [verified] |
| `Workflow` → `agent(prompt, {effort})` | ✅ per call [schema] | [unknown] — not executed |

📌 **effort is a real, recorded field**, not a parser no-op: it appears on every `assistant` record in the
session jsonl. that is the cheap way to audit any future claim about it — `jq .effort` the transcript.

📌 model is settable and demonstrably honoured on a subagent: `model: "haiku"` produced
`claude-haiku-4-5-20251001` in the child's transcript, against an opus parent. [verified]

## 6. remote control

**`remoteControlAtStartup: true` is inherited by `claude --bg`. no flag needed.** [verified]

the bg session's tui log showed `/rc connecting…` and then a `https://claude.ai/code/session_01UVT…` link,
and its registry file gained a `bridgeSessionId`. cclio's own registry entry carries the same field, and
that value matches the `CLAUDE_CODE_BRIDGE_SESSION_ID` visible in a subagent's env.

- subagents/forks have **no rc channel of their own** — they have no session, so there is nothing to bridge.
  their output surfaces through the parent, which is itself remote-controlled. [inferred]
- `claude -p` sessions do **not** register in `~/.claude/sessions/` and get no bridge. [verified]

## 7. re-attaching to a background session

**yes, and it does not depend on the parent at all.** [verified]

the mechanism is a **detached daemon**, not a child process:

    claude daemon run --origin transient --spawned-by {"label":"claude --bg","cwd":"…/cclio","pid":14336}

the bg session's ppid points at a `bg-spare` slot under `/tmp/cc-daemon-501/`, never at the spawning
session. every live session also writes `~/.claude/sessions/<pid>.json` with `sessionId`, `cwd`, `kind`,
`name`, `jobId`, `status` and `messagingSocketPath` — a real on-disk registry any process can read.

so after a parent reset, a new session reaches an old bg job three ways:
- `ListAgents` → `SendMessage` by name [verified across unrelated sessions]
- `claude logs <jobId>` / `claude stop <jobId>` — work from a plain non-tty shell [verified]
- `claude attach <jobId>` — needs a tty, so [schema] only

## 8. driving a session the human started

**yes. verified end to end.** [verified]

a subagent of cclio sent a probe to `bytes-d3` — an `interactive` session dima started himself two days
earlier in `~/projects/bytes`. it received the message, and **replied back via `SendMessage`**. its reply
line: *"agent-spawned thread → human session works."*

📌 the message arrives in the target wrapped and clearly attributed, which is what makes this safe:

    <cross-session-message from="uds:/tmp/cc-socks/86318.sock" from-name="💻 cclio" from-mode="bypass">
    <agent-message from="general-purpose">…</agent-message>
    </cross-session-message>
    This came from another Claude session — not typed by your user

so a subagent's send is attributed to **its parent session**, with the subagent named inside. dima can
always tell an agent ping from a human one.

## 9. messaging between sessions

**there is a real two-way channel, and it is unix-domain sockets, not polling.** [verified]

- transport: `/tmp/cc-socks/<pid>.sock`, one per live session, advertised in the registry as
  `messagingSocketPath` with `peerProtocol: 1` and `peerFeatures: ["notify_idle"]`.
- discovery: **`ListAgents`** — confirmed working *even with `disableAgentView: true`*, listing all three
  live peers with name, `[ref]`, kind, busy/idle and age. [verified]
- addressing: the **name is the address**. append ` [ref]` only on ambiguity. [schema]
- delivery: enqueues and drains at the receiver's next tool round. no polling. [schema]

🚨 **a reply only comes back if the peer explicitly calls `SendMessage`.** the first probe answered in plain
text and the sender got nothing — plain output is invisible across sessions. always tell a peer *to reply
with SendMessage*, or you have written into a void.

**completion events:**
- subagents/forks → automatic `<task-notification>` user-role message. [verified]
- another session going idle → `notify_when_idle: true` on a `SendMessage`, one-shot, opt-in,
  **from the main conversation only**. [schema] — could not test from a subagent thread.

## what i could not determine, and why

- **`--effort` on `claude --bg` with an effort-capable model.** the probe combined `--effort low` with
  `--model haiku` and got `effort: null`. haiku is the likely reason, not the flag. one bg spawn with
  `--effort low` and no `--model` settles it; i did not spend a second bg session on it.
- **row 3 (worktree isolation) end to end.** running it creates `.claude/worktrees/` inside the dotfiles
  repo, which the brief forbade. everything in that row is `EnterWorktree`'s own description.
- **row 6 (cloud) entirely.** forbidden by the brief. the prior-art claim that `--cloud` refuses `--print`
  dates from 2026-08-15 and the help text has changed shape since (`--cloud` now takes
  `[description|session_id|url]`) — treat it as stale until re-run.
- **whether `Workflow`'s per-call `effort` is honoured.** the schema is explicit; no workflow was executed.
- **`notify_when_idle`.** schema says main-conversation-only and i am a subagent.
- **`claude attach`.** requires a tty; every shell here is non-tty.
- **what `disableAgentView` actually costs.** it gates `claude agents` and `claude agents --json`
  [verified] — and *not* the `ListAgents` tool [verified]. whether it also hides the in-tui agent view is
  [unknown]; the bg session's own tui still rendered `← for agents`.
- ⚠️ **a model's self-report of its own tool list is unreliable.** asked "do you have ListAgents", a session
  said yes in both configurations — but a *forced call* is what proved it. never accept a spawn's
  description of its own capabilities; make it call the thing.

## things found that were not asked about

- 🚨 **`Agent`'s `name` rejects the fleet's own title convention.** the regex is
  `^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$` — no emoji, no colons, no spaces. `🔧 code: foo` is an
  `InputValidationError`. [verified] `claude --bg` names are free-form and *do* carry emoji (a live bg
  session is named `🔧 code: next skills to project scope`), so the convention holds there and must be
  transliterated for `Agent` (`code-next-skills`).
- **`ListAgents` and `Workflow` are absent from subagent tool lists**, present at top level. [verified]
  a subagent cannot survey the fleet or run a workflow — only the coordinator can.
- **undocumented subcommands.** `claude attach`, `claude logs`, `claude stop` are printed by `--bg` but do
  not appear in `claude --help`'s command list. [verified]
- **workflow concurrency caps**: `min(16, cpus-2)` concurrent agents, 1000 total per workflow, 4096 items
  per `parallel()`/`pipeline()`. [schema]
- **dpatch runs at `--effort low`** on claude-code 2.1.237, with `Bash` in `--disallowedTools`. read off its
  live process args. [verified] — relevant to the DOT-188 a/b.

## tests i actually ran

```bash
claude --version                                    # 2.1.239
claude agents --json                                # → "disabled by the 'disableAgentView' setting"
claude agents                                       # → "requires an interactive terminal"
claude --bg -p "say ok"                             # → "--bg and --print conflict" (NOT a block)
claude --bg 'reply with exactly: BGPROBE_OK …'      # → "backgrounded · ad9c4a1f"   ✅ works
claude logs ad9c4a1f                                # → full ansi tui: "Opus 5 with high effort", /rc link
claude --bg --effort low --model haiku '…'          # → 025e4ea0; transcript model=claude-haiku-4-5
claude stop ad9c4a1f ; claude stop 025e4ea0         # → "stopped …"  (both probe sessions cleaned up)

# context stack, same prompt, two directories
cd ~/dotfiles/cclio && claude -p --effort low --output-format json \
  'list the absolute paths of every CLAUDE.md / memory instruction file whose content is in your context…'
cd ~ && claude -p --effort low --output-format json '…same…'

# subagent cwd, from a NON-git dir
cd <scratch>/cwdtest && claude -p --effort low \
  'run pwd, then spawn a subagent to run pwd, report PARENT=<x> CHILD=<y>'
# → PARENT and CHILD identical.  from inside the dotfiles repo they differ (cclio vs repo root).

# forced tool calls — the only reliable capability test
claude -p 'Call the ListAgents tool right now. Paste its raw output verbatim…'   # → 3 live peers listed
claude -p 'Call the Workflow tool right now…'                                    # → WORKFLOW_PRESENT

# process / registry inspection
lsof -a -p <parent-pid> -d cwd            # parent cwd = …/cclio, subagent bash pwd = …/dotfiles
ps -o pid,ppid,command -p <bg-pid>        # ppid → bg-spare slot, not the parent
cat ~/.claude/sessions/*.json             # live registry: sessionId, cwd, kind, jobId, bridgeSessionId
env | grep -i claude                      # CLAUDE_PID (== parent), CLAUDE_CODE_CHILD_SESSION=1,
                                          # CLAUDE_EFFORT=high, CLAUDE_CODE_MESSAGING_SOCKET/TOKEN

# transcript audit — effort/model/sessionKind are recorded fields
python3 -c "…json.loads(line)… d['effort'], d['message']['model'], d['sessionKind']" *.jsonl
```

**cross-session sends** (via the `SendMessage` tool, from this subagent):
- → the bg session i spawned: delivered, it answered in plain text → **sender received nothing**.
- → `bytes-d3`, a session dima started himself: delivered, it answered **with `SendMessage`** → round trip
  closed.

**agents spawned:** 2 `general-purpose` subagents (one `model: haiku`), 1 `fork`, 2 `claude --bg` sessions
(both stopped). one scratch dir created and removed. no repo files touched except this one. no commits.
