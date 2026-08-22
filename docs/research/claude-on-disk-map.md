Ticket: DOT-157

# claude on disk — the lookup guide

every place claude keeps state on this mac, what each name is for, and how the pieces find each
other. evergreen reference: look a name up, get one line back.

surveyed 2026-08-19 against the live machine, cc `2.1.235`.

there are **two homes**, and they are not variants of one thing:

| home | who writes it | what it is |
| --- | --- | --- |
| `~/.claude/` + `~/.claude.json` | the `cc` cli | config, transcripts, per-session working state |
| `~/Library/Application Support/Claude/` | claude desktop / cowork | an electron app profile, plus the cowork session tree |

the desktop app **embeds** a copy of the cli and runs it — so a desktop-launched session writes into
*both* homes at once. that is the single fact that makes this layout confusing, and everything below
follows from it.

## 1 · `~/.claude/` — the cli's home

### symlinks into the dotfiles repo

these are not real files here; the mirror rule owns them (`pnpm dotfiles-link`):
`CLAUDE.md`, `settings.json`, `keybindings.json`, `hooks/`, `rules/`, `output-styles/`, `themes/`,
`sline/`, `flowlog/`, `memory-dispatch/`, `announcements.md`, `changelog.md`.

⚠️ never edit through the link — cc refuses with *"Refusing to write through symlink"*. resolve with
`readlink -f` and edit the real file under `~/dotfiles/home/.claude/`.

### transcripts and session state

| name | what it is |
| --- | --- |
| `projects/` | **222m — the transcript store.** one directory per working directory, 23 of them |
| `projects/<slug>/<uuid>.jsonl` | one session's full transcript, appended live |
| `projects/<slug>/<uuid>/subagents/agent-*.jsonl` | one file per subagent that session spawned, plus a `.meta.json` |
| `session-env/<uuid>/` | environment snapshot per session. **557 entries** — the biggest accumulator in here |
| `sessions/` | `<pid>.json` + `.key` pairs — live session registry, keyed by process id |
| `shell-snapshots/` | `snapshot-zsh-<epoch>-<rand>.sh` — the shell environment each Bash tool call restores from |
| `file-history/<uuid>/<hash>@vN` | every version of every file a session edited. the undo store |
| `tasks/<uuid>/` | background task state (`.lock`, `.highwatermark`) |
| `jobs/<short-id>/` | `state.json` + `timeline.jsonl` — longer-running job records |
| `paste-cache/` | large pastes spilled to `<hash>.txt` instead of living in context |
| `plans/` | plan files, `<random-slug>.md` or `<ticket>-<slug>.md` |
| `history.jsonl` | **3.4m** — every prompt typed, with its project path and timestamp |
| `backups/` | rolling `.claude.json.backup.<epoch>` copies |

#### the slug rule, and how resume works

a project directory name is its absolute path with every `/` **and every `.`** replaced by `-`:

    /Users/dima/dotfiles   →  -Users-dima-projects-dotfiles
    /Users/dima/.dotfiles           →  -Users-dima--dotfiles      ← double dash from the dot

so **resume is cwd-sensitive**. `claude --resume <uuid>` only finds a session when the shell's
working directory slugifies to the directory holding that `.jsonl`. resuming from the wrong place
silently shows nothing.

    cd ~/dotfiles && claude --resume 4ce15f13-f672-420f-98c1-79562a6a2bed

📌 **the transcript is on disk before the process ends** — appended per turn, not flushed at exit.
killing the app never loses the conversation; that is what makes the quit-and-reattach move safe.

📌 the slug is derived from cwd, so a `cc` launched with an odd cwd lands somewhere odd. a real
example here: the dispatch agent's memory folder is a cwd, so it has its own project dir under
`projects/-Users-dima-Library-Application-Support-Claude-local-agent-mode-sessions-…-agent-memory`.

### ours, not the cli's

`focus/<session-id>.json` (the sline ticket pin), `handoffs/` (the shared cst store `cc`↔`cw`),
`flowlog/`.

### small operational files

`.last-cleanup` (timestamp of the last internal sweep) · `.last-update-result.json` (last
self-update, from-version → to-version) · `.update.lock` · `policy-limits.json` (server-pushed
restrictions) · `stats-cache.json` · `mcp-needs-auth-cache.json` · `.claude-mcp.json` ·
`settings.local.json` · `ide/<pid>.lock` (editor attach) · `daemon/` (attach journal, control key) ·
`chrome/chrome-native-host` · `plugins/` (**226m**, installed plugin cache) · `skills/` ·
`worktrees/` · `debug/`.

### `~/.claude.json` — why it is not inside `~/.claude/`

it is **state**, not config, and the cli hardcodes `$HOME/.claude.json`. it holds startup counts,
feature gates, cached configs, and per-project history. `~/.claude/.claude.json` is a symlink back
to it, which is why it looks duplicated.

⚠️ the cli holds it **in memory and rewrites it whole**. editing it by hand while a session runs
risks being clobbered from a stale copy — write atomically (temp file + rename) and expect it may
not stick.

## 2 · `~/Library/Application Support/Claude/` — desktop + cowork

### electron profile (ordinary chromium, not claude-specific)

`Cache`, `Code Cache`, `GPUCache`, `DawnGraphiteCache`, `DawnWebGPUCache`, `Local Storage`,
`Session Storage`, `IndexedDB`, `Service Worker`, `Cookies`, `Network Persistent State`,
`TransportSecurity`, `Trust Tokens`, `DIPS`, `Partitions`, `Local State`, `Preferences`, `Crashpad`.

all rebuildable. all safe to delete **with the app quit** — never while it runs.

### claude-specific

| name | what it is |
| --- | --- |
| `claude-code/<version>/` | **296m** — the cli the desktop app embeds and launches |
| `claude-code-vm/` | 310m — vm runtime support |
| `vm_bundles/claudevm.bundle` | ⚠️ **9.6g — the live sandbox vm image.** not a cache. it is rewritten while sessions run |
| `claude-code-sessions/` | desktop↔cli session bookkeeping |
| `Claude Extensions/` | 171m — installed desktop extensions |
| `ant-device-registry.json`, `ant-did`, `buddy-tokens.json`, `bridge-state.json` | device identity and the bridge `cw` uses to reach this mac |

### `local-agent-mode-sessions/` — the cowork tree

two id levels, then everything hangs off the second:

    local-agent-mode-sessions/<account-id>/<install-id>/

inside that:

| name | what it is |
| --- | --- |
| `spaces.json` | the index of spaces: `id`, `name`, mounted `folders[].path`, `instructions`, timestamps |
| `spaces/<space-id>/memory/` | **that space's memory**, `MEMORY.md` plus one file per topic |
| `local_<uuid>/` | **one chat.** its `.json` twin holds `sessionId`, a human `processName`, the `cliSessionId`, and the `cwd` |
| `local_<uuid>/{uploads,uploads-tmp,outputs}` | what you dropped in, what came out |
| `local_<uuid>/audit.jsonl` + `.audit-key` | the tamper-evident action log |
| `local_<uuid>/.claude/` | **a private `~/.claude` for that chat** — its own `projects/`, `policy-limits.json`, caches |
| `agent/local_ditto_<install-id>/` | the persistent agent workspace, same shape as a chat |
| `agent/memory/` | **dispatch's memory** — `MEMORY.md` plus one file per fact |
| `scheduled-tasks.json`, `cowork_settings.json`, `cowork-gb-cache.json`, `remote-session-spaces.json` | schedules, settings, feature cache, remote session index |

#### the base-dir question, answered

a space **with a folder** (`spaces.json` → `folders[].path`, e.g. `/Users/dima/projects/bytes`)
works against that real directory, and any `cc` it spawns writes transcripts to the normal
`~/.claude/projects/-Users-dima-projects-bytes/`.

a chat **with no folder** — a plain cmd+n — still gets a cwd, but it is the scratch directory
`local_<uuid>/` itself. that is why such a chat can read and write files and still touch nothing of
yours: its whole world is that folder. its `cliSessionId` field is the bridge back to a `cc`
transcript if one was spawned.

## 3 · staleness — what grows and never shrinks

measured 2026-08-19:

| store | entries | oldest | note |
| --- | --- | --- | --- |
| `session-env/` | **557** | 2026-07-23 | one per session, never pruned |
| `file-history/` | 61 | 2026-07-25 | grows with every file edited |
| `projects/` | 23 dirs | 2026-04-05 | includes dirs for paths that no longer exist |
| `paste-cache/` | 12 | 2026-08-05 | |
| `focus/` | 25 | 2026-08-16 | ours — one per session, never cleaned |

📌 none of these is large today (`~/.claude` is 465m total, and 448m of that is `plugins/` +
`projects/`). they are listed because they only ever grow, so they are the right thing to check
first when this directory gets fat.

## 4 · macos context — why `Application Support` at all (DOT-158)

`~/Library/` is the per-user side of the mac's three-library layout: `/System/Library` (apple's,
read-only), `/Library` (all users, needs root), `~/Library` (yours, no password needed).

- `Application Support/<app>` — an app's **own data**: what it made, what it needs to keep. the app
  owns the layout, so it is unpredictable by design.
- `Caches/<app>` — throwaway. deleting costs a re-download, never data.
- `Containers/<bundle-id>` — a **sandboxed** app's entire private world, laid out like a fake home
  (`Data/Documents`, `Data/Library`, …). mac app store apps and hardened apps live here.
- `Application Scripts/<bundle-id>` — app extension entry points.
- `Preferences/<bundle-id>.plist` — settings.

claude desktop is **not** sandboxed — it sits in `Application Support`, not `Containers`. that is
why it can reach `~/projects` at all, and why the cowork tree can hold real working directories.

⚠️ the practical rule this whole map serves: **`Caches` is disposable, `Application Support` is
not.** the 2026-08-19 sweep freed 131 gib without touching a single thing an app could not rebuild —
by only ever deleting from the first column, and asking before the second.

## 5 · walkthrough answers — dima's questions, 2026-08-19

things asked while walking the tree. kept here so they are not re-derived.

| name | what it is | act on it? |
| --- | --- | --- |
| `config/` | **not claude's** — `claude-monitor`'s cost-alert state | keep |
| `daemon/` | attach machinery. `roster.json` = live sessions, `control.key` authorises attach, `dispatch` = socket. **this is what makes reattaching from a terminal work** | keep, live |
| `ide/<pid>.lock` | editor integration, one per attached cursor/vscode | keep, self-cleans |
| `focus/` | **ours.** sline's ticket pin. written by `hooks/focus.sh`, cached by `hooks/status-fetch.sh`, read by four sline files | keep, live |
| `plans/` | plan-mode output. **unversioned** — decided 2026-08-19 not to track it | keep |
| `plugins/` | 226m, installed plugin cache | keep, rebuildable |
| `history.jsonl` | 3.4m — every prompt ever typed, with project and timestamp | keep |
| `.claude/.claude.json` | symlink to `~/.claude.json`. **state, not settings** | keep |
| `.anthropic`, `vercel-plugin-*` | empty husks / disabled plugin leftovers | 🗑️ removed |

📌 **"is it worth a sweep?" — for almost all of these, no.** everything in `~/.claude` except
`plugins/` and `projects/` totals ~12 mib. sweeping buys nothing and can break a live thing like
`daemon/`.

📌 **`projects/` is safe to delete but permanent.** removing a `.jsonl` removes that conversation
forever and `--resume` can never find it. nothing else breaks.

### why `~/.claude` is cherry-picked, not linked whole

the mirror engine sees `~/.claude` is a real directory, descends into it, and links only the leaves
that exist in the repo. that is deliberate and must stay: the same directory holds `projects/`
(223m of transcripts), `history.jsonl`, and — until 2026-08-19 — a plaintext credential. linking it
whole would put all of that in git.

### 🚨 security finding, 2026-08-19

`~/.claude-mcp.json` held a **github personal access token in plaintext**, world-readable
(`-rw-r--r--`), in a stray `mcpServers` block for a dockerised `github-mcp` no longer in use.

verified **not** present in git, any branch, any history. token reported dead by dima; file deleted.

📌 the lesson is the file mode, not the token. anything under `~/.claude` written by a tool can be
world-readable. `grep -rn "ghp_\|sk-\|AKIA" ~/.claude` is worth running occasionally.

### permissions, as configured

- `permissions.defaultMode` is **`bypassPermissions`** — running without re-asking is already on.
  to go manual for one session: **shift+tab** cycles modes, or `claude --permission-mode default`.
- `permissions.additionalDirectories` set to `["/Users/dima"]` on 2026-08-19, which ends the
  per-session `--add-dir` spam. ⚠️ deliberately **not** `"/"` — that would put keychains, ssh keys
  and all of `Library` in every session's default reach.

## 6 · `com.apple.*` folders — not your problem (DOT-158)

22 of them in `Caches`, 20 in `Application Support`. they are **background services** shipped with
macos, not apps. the trailing `d` means daemon — a program with no window.

**they self-clean.** measured proof from one day: on 2026-08-19 morning
`Caches/com.apple.callintelligenced` was 301m and `com.apple.textunderstandingd` was 301m. by the
afternoon **both had been removed by macos**, with no action from us.

all 22 apple cache folders together total **37 mib**, out of ~1.5 gib of `Caches`.

⚠️ two look like junk and are not:

- `Application Support/com.apple.TCC` (42m) — **privacy permissions**. delete it and every app
  re-asks for camera, mic and disk access from scratch.
- `Application Support/com.apple.wallpaper` (440m) — absurd for wallpapers, but it holds the actual
  desktop pictures including the animated ones.

what the common names do: `helpd` help index (30m, the biggest) · `mediaanalysisd` photo face and
object scanning · `duetexpertd` app and shortcut prediction · `callintelligenced` call screening ·
`textunderstandingd` the on-device text model behind writing tools · `geod` maps data.

📌 **rule: a `com.apple.*` folder is the system's business.** the disposable-`Caches` habit still
holds, but with apple's own folders you almost never need to act, because the system already does.
