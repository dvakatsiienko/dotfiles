# fleet-hazards — well-known pitfalls, fleet-wide

common traps any surface can hit. one section per subject; add a section only for a hazard
that bites more than one surface. this file is the source of truth; the vault section is copied by hand
into the cw leaf `/topics/obsidian.md` — the rest is cc-only, deliberately not mirrored.

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

- a gitignore pattern with a `/` in the middle is anchored to the ignore file's directory — `.impeccable/x.json` at a repo root never matches `apps/web/.impeccable/x.json`; `**/` in front makes it match at any depth (measured with `git check-ignore -v`, 2026-09-19)
- **frame's lefthook stashes unstaged changes only for PARTIALLY staged files** — a fully-unstaged wip file stays live during `pnpm test` and can fail the gate (the cw `/profile.md#fleet` size check, 2026-09-23); wrap the commit in a path-limited `git stash push -- <files>`
- a git worktree of `frame` cannot push (the `mirror` gate reads `~` symlinks that point at
  the main checkout)
- worktrees share `.git/hooks`, and any pnpm run in one rewrites the shared lefthook shims to
  the worktree's path — including pnpm's own auto-install before ANY script, so the first gated
  commit in a fresh worktree does it by itself. harmless to gating (the shim's repo-root
  fallback rescues it) but dirty. **the guard: `CI=1 pnpm install`** — lefthook's postinstall exits early on `CI` (measured
  2026-08-30). in frame it is AUTOMATED: the `EnterWorktree` hook
  (`.claude/hooks/worktree-setup.sh`) runs it in every bg coder's fresh worktree; manual
  `CI=1 pnpm install` is needed only for a hand-made `git worktree add`. inline env for that
  one command only, never global
- `rebase.updateRefs` is on since the git overhaul (2026-09-03): a safety BRANCH made before a
  rebase is dragged forward with the rewrite and stops being a recovery point — a tag or the
  reflog is the net (a coder lost its net on a reword, 2026-09-05)
- a git-crypt repo keeps its key in the main `.git`, never under `.git/worktrees/<n>/`, so a fresh worktree holds ciphertext and **even a pathspec `git add` dies on the clean filter** (the index refresh runs it over every locked file). `EnterWorktree` trees are unlocked by `shelf/hooks/worktree-seed.sh`; a hand-made `git worktree add` takes `-c filter.git-crypt.smudge=cat -c filter.git-crypt.required=false`, then `git-crypt unlock "$(git rev-parse --git-common-dir)/git-crypt/keys/default"` inside the tree — the main key file unlocks in one step, no copy (2026-09-24). a tree still locked: `git -c filter.git-crypt.clean=cat -c filter.git-crypt.required=false add|commit` is safe ONLY after `git hash-object --no-filters <locked file>` equals its `git ls-files -s` blob — same ciphertext, nothing plaintext can be staged

## the shared working tree

- **a parallel agent in a repo with a repo-wide commit gate writes to scratch until it compiles, then moves in** — per-path ownership does not hold against a per-repo typecheck hook: a coder's own subagent dropped a half-compiled `.ts` into the tree and blocked the coder's commits for two rounds (2026-09-22)

## brew casks

- `brew install --cask --adopt` is the way to bring a hand-installed app under brew, and it has
  two teeth. it **refuses a bundle missing a binary the cask links, and removes the app** before a
  plain install follows (2026-09-08). and it needs a **tty** whenever the bundle is root-owned —
  an agent shell has none, so it dies at the password prompt (keka, 2026-09-13: it bailed before
  touching anything, but the next one may not). check `ls -ld /Applications/<App>.app` first;
  `root wheel` means hand dima the command instead of running it
- a brew-installed app is uninstalled with `brew uninstall --zap --cask <name>`, never with an
  uninstaller app — the cask's hand-written zap stanza beats any heuristic scanner, and it clears
  the Caskroom entry an external uninstaller would orphan (measured on pearcleaner, 2026-09-13:
  zap found `Group Containers`, `Saved Application State` and a `bin/` symlink that mole missed)
- `--adopt` checks the bundle's short version against the cask and refuses a mismatch (nuphyio
  2.2.6 vs 2.2.7), yet wrote a `5.0` receipt over a licensed cleanshot 4.8.10 — read the cask
  version before adopting anything with a licence wall, and never `brew uninstall` an adopted app
  (it deletes the bundle; `rm -rf /opt/homebrew/Caskroom/<cask>` drops the receipt only). `pkg`
  casks cannot adopt at all. cask↔app identity is `codesign -dv` team vs the cask homepage vendor;
  casks carry no bundle id, `brew search` is a guess and `brew info --cask` the check (`sherlock`
  resolves to an iOS debugger, 2026-09-16)
- a gui uninstall that moves the bundle to the Trash leaves its login items alive — appcleaner's
  `SmartDelete` helper ran out of `~/.Trash` for two days and popped on every later deletion
  (2026-09-15). after any app removal: `sfltool dumpbtm | grep -i <name>` and empty the Trash

## claude desktop

- **Claude Desktop writes its in-memory config back to `claude_desktop_config.json` on quit** — an edit made while the app runs silently reverts; edit only with the app closed (two restarts lost, 2026-09-23)

## the bash sandbox

- 🎯 **in a worktree session, any command that mentions `gh`, `git`, a token script or `eval`
  goes into a scratch script first, then runs by path** — the shapes below are the reason, and
  they are unfollowable while typing (a coder hit four of them with this file in context,
  2026-09-11)
- three shapes get rewritten or refused by the sandbox guard and cost a coder ~15 min of retries
  on 2026-09-08: a `jq` filter whose text contains `git`, a heredoc piped into `gh`, and a
  `HOME=` override in front of a command. write the filter or body to a scratch file first and
  pass the path (`jq -f`, `gh --body-file`); never override `HOME`
- two more shapes (2026-09-10, ~10 min each): **any command or heredoc whose TEXT contains the
  substring `git`** — `github.repository` inside a yaml body, a jq path `.git.deploymentEnabled`
  (8 refusals across two jobs, 2026-09-11) —
  — `pnpm github:agent-token` included — and `eval` outright (an agent-browser verb). both go
  into a scratch script and run from there

## launchd + tcc

- **an ad-hoc-signed binary's tcc grant is pinned to its cdhash** — any source change moves the hash and Input Monitoring silently stops applying; a listen-only tap still «succeeds» and hears nothing (chord lines stop, app-switch lines continue — the tell). the order is edit → build → **re-grant** → restart; a tap created before the grant stays deaf. a plain off/on of the row can re-authorise the old hash — remove the row and add the binary back (2026-09-19)
- **PlistBuddy cannot `Set` array elements past index 0** in these prefs (`Cannot Perform Set On Containers`; index 0 works, which makes it look transient) — write with python `plistlib` and assert the value's type first (2026-09-19)
- **FDA on an ad-hoc-signed launchd binary does not unlock `FileManager.trashItem` on an iCloud-managed
  folder** (`~/Desktop` with Desktop & Documents in iCloud): reads and a plain `moveItem` into `~/.Trash`
  work, the trash call is brokered and refused — read + a `folder writable` line in the error path told
  it apart from a permission deny in one run (2026-09-18). a bare «trashed 0 / exit 0» on a folder with
  nothing old enough reads identical to a deny: log the scanned count
- `plutil -convert json` drops xml comments — prose in a plist is read from the raw file; `launchctl
  print` repeats `state =` in nested blocks — anchor the parse on the top-level line
- `pnpm frame:link apply` links new leaves and never prunes a dangling old symlink after a rename

## node

- `.node-version` holds the MAJOR (`24`) in frame and bytes; fnm resolves the installed one. a `Can't find an installed Node version` prompt means a pin drifted back to a patch — repin to the major, never install the patch (2026-09-17)

## raycast extensions

- `ray build` registers nothing new and skips tsc under typescript 7 (native, no compiler api): a new
  extension needs one `ray develop`; the type gate is `pnpm typecheck`; raycast caches ext titles and
  icons until a relaunch
- a `pnpm install` inside a non-workspace-member subdir climbs to the root and rewrites the root
  lockfile — a member joins `pnpm-workspace.yaml` or carries its own

## the bash tool

- a trailing `&` inside a Bash tool call is safe only when something after it keeps the shell
  alive (`wait`, a `sleep`) — the wrapper exits and kills the child, exit 0, empty log, and it
  reads as «feature broken» (twice in one day, 2026-09-14). in a `run_in_background` call the
  wrapper IS the backgrounding
- renaming a `.gitignore` path un-ignores whatever the OLD path still holds — `git add -A`
  staged a compiled binary right after a rename (2026-09-14); read the staged list before the
  commit
- **`CI=1 pnpm install` is frozen-lockfile** (pnpm's own CI detection) — a dep add or removal takes `--no-frozen-lockfile` beside it, or the lockfile never moves and the commit ships half; and pnpm 12 reads `overrides` from `pnpm-workspace.yaml` only, the `package.json#pnpm` field is ignored with a warning (2026-09-21)
- **a delete names the file the grep proved, never its dir** — «TriangleSvg has no users» was true, `trash src/elements/icons` took the live `ExternalLinkSvg.tsx` with it (2026-09-21); the unit of a delete is the path the evidence named
- an `sd` replacement never carries a `$` — inside a double-quoted argument the shell expands
  `$dir` / `$line` to nothing and the line ships hollow (three sightings, 2026-09-17/18). that
  edit goes through the Edit tool or a python literal

## green statuses

- **a green status answers «did this fail», never «did this run»** — three systems in one day
  (2026-09-11): github counts a skipped job as satisfying a required check, vercel reports a
  skipped deploy as `success`, our own `review:clean` went green when the reviewer filed its
  findings in one comment and no inline thread. before trusting a green, ask what would have
  been red if the thing had not run at all
- **no run at all reads exactly like checks still pending** — the inverse case: `gh pr checks`
  prints a short calm list and nothing is red. before trusting a quiet pr, ask «was a RUN
  created for this head», never «is a check green» (bytes #84, 2026-09-12: a commit body that
  quoted the skip marker; the guard is a `commit-msg` hook in both repos)
- **a gate is read by its exit code, never by grepping its output** — `pnpm --silent --filter chords typecheck | head` printed nothing on 4 type errors and the commit hook caught them a minute later (2026-09-22); `--silent`, a pipe, or a `grep` for «error» all turn red into quiet
- **a green typecheck answers «did the configured files pass», never «are my files configured»** — `hotkeys/*.ts` sat in no tsconfig for a week and a reverted interface field left the gate green (2026-09-20). a new dir of `.ts` is proven by planting a type error and watching `pnpm typecheck` go red
- **github's `Deploy · success` is the hook trigger, never the build** — three production builds were red for 20 minutes behind a green Actions page (2026-09-21); the build state lives only in `vercel inspect <deploy url>` (`status ● Error`), and `vercel ls <project> --prod` names the newest one
- **a conflicting pr gets no `pull_request` run at all** — github creates none without a merge ref, and «no checks reported» reads calm. main moves under an open pr → merge it in within the hour (ten heads ran no ci, 2026-09-20)

## app exports

- **an app export is a secrets container until decrypted or inspected** — a raycast `.rayconfig` held the whole clipboard history and every extension's stored keys behind the passphrase typed in the export dialog; a weak passphrase is plaintext. an export never enters a repo; it lives outside git and is read by a tool (2026-09-22: two exports sat in the public dotfiles repo for a week)

## declarative tools

- **a tool that treats its config as the whole truth imports the live state before its first apply** — `gmailctl apply` deleted dima's two hand-made filters because `download` never ran first (2026-09-20). same shape: renovate's first run, `frame:link apply`, a launchd bootstrap. the first apply on a live account is preceded by the tool's own import verb

## ci runners

- a jq program is proven when ci compiles it — ubuntu runners ship jq 1.7, the mac 1.8; `a + b`
  as a bare object value parses locally and fails on the runner (bytes #79, 2026-09-12). a job
  that runs jq prints `jq --version` first
- **a lockfile change that reshapes the pnpm store needs a cache-less first vercel build** — vercel restores the previous `node_modules`, and pnpm keeps a stale hoisted link (`@types/react@19.2.18` after the override pinned 19.3.0, 2026-09-21). `vercel deploy --prod --force` from the REPO ROOT with the root `.vercel` link switched to the project; an app-dir deploy dies on «Root Directory does not exist», and `vercel link` writes an `.env.local` (oidc token) plus an `.env*` gitignore line — revert both
- `sd` / `sed` silently drop `${{ … }}` from a workflow line — a workflow file is edited with the
  Edit tool only (two expressions eaten on #79, caught only by printing the result)

## github api reads

- **a ci watcher waits for the run to exist before `gh run watch`** — github creates the run a few seconds after the push; asked at +15 s for the head sha it answered nothing and the watcher died on a 404 (2026-09-23). poll `gh run list --commit <sha>` until an id appears, then watch that id
- `gh api --paginate` emits one json array PER PAGE — `.[0]` reads the first 30 items and looks
  complete; fold with `jq -s add` (a review guard nearly read half the threads, 2026-09-11)
- a poller that seeds its window at «now» is blind to everything that made it worth starting —
  seed two hours back (greptile's findings sat unseen for a round, 2026-09-11)
