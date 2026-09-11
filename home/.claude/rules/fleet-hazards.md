# fleet-hazards — well-known pitfalls, fleet-wide

common traps any surface can hit. one section per subject; add a section only for a hazard
that bites more than one surface. this file is the source of truth; `x-cw:memory-sync` carries
the vault section into cw memory — the rest is cc-only, deliberately not mirrored.

## the obsidian vault

- the vault is **not under git** — no undo, no history, a bad overwrite is gone
- icloud sync lags: changes land a few minutes after obsidian opens, and relaunching often
  forces the pull
- **never edit before the synced version has arrived** — editing a stale copy silently drops
  whatever the other device wrote (most likely when dima just printed from a mobile device)
- reads are fine anytime; writes only when he asks — never change the vault on his behalf
  unprompted
- never move or rename a vault file by plain `mv` — 231/231 wikilinks broke on the bench; the
  `obsidian` cli (`rename` / `move`) rewrites them through the running app, and it is judged by
  the file landing with a timeout, never by the process returning (it hung twice, 2026-09-10)
- icloud sync is whole-file, last-writer-wins, no conflict copy (measured 2026-09-10): a write on
  the mac while a mobile device holds a stale copy is lost on that device's next reconnect — keep
  obsidian closed on the ipad during a session, re-read before every write
- the channel recipe for every surface: raw files for read / append / property edits, the cli
  for rename / move / backlinks / search, never the rest-api plugin or an mcp; notion through
  `ntn`, never the connector for edits. on cw both doors cost ~1 % of a 5-hour window per
  paragraph (measured 2026-09-10) — cw reads, cc edits; a batch is handed to the mac

## git hooks

- a git worktree of `dotfiles` cannot push (the `mirror` gate reads `~` symlinks that point at
  the main checkout)
- worktrees share `.git/hooks`, and any pnpm run in one rewrites the shared lefthook shims to
  the worktree's path — including pnpm's own auto-install before ANY script, so the first gated
  commit in a fresh worktree does it by itself. harmless to gating (the shim's repo-root
  fallback rescues it) but dirty. **the guard: `CI=1 pnpm install`** — lefthook's postinstall exits early on `CI` (measured
  2026-08-30). in dotfiles it is AUTOMATED: the `EnterWorktree` hook
  (`.claude/hooks/worktree-setup.sh`) runs it in every bg coder's fresh worktree; manual
  `CI=1 pnpm install` is needed only for a hand-made `git worktree add`. inline env for that
  one command only, never global
- `rebase.updateRefs` is on since the git overhaul (2026-09-03): a safety BRANCH made before a
  rebase is dragged forward with the rewrite and stops being a recovery point — a tag or the
  reflog is the net (a coder lost its net on a reword, 2026-09-05)

## the bash sandbox

- 🎯 **in a worktree session, any command that mentions `gh`, `git`, a token script or `eval`
  goes into a scratch script first, then runs by path** — the shapes below are the reason, and
  they are unfollowable while typing (a coder hit four of them with this file in context,
  2026-09-11)
- three shapes get rewritten or refused by the sandbox guard and cost a coder ~15 min of retries
  on 2026-09-08: a `jq` filter whose text contains `git`, a heredoc piped into `gh`, and a
  `HOME=` override in front of a command. write the filter or body to a scratch file first and
  pass the path (`jq -f`, `gh --body-file`); never override `HOME`
- two more shapes (2026-09-10, ~10 min each): any compound command containing the substring `git`
  — `pnpm github:agent-token` included — and `eval` outright (an agent-browser verb). both go
  into a scratch script and run from there

## github api reads

- `gh api --paginate` emits one json array PER PAGE — `.[0]` reads the first 30 items and looks
  complete; fold with `jq -s add` (a review guard nearly read half the threads, 2026-09-11)
- a poller that seeds its window at «now» is blind to everything that made it worth starting —
  seed two hours back (greptile's findings sat unseen for a round, 2026-09-11)
