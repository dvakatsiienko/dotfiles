---
researched: 2026-09-03
sources-current-as-of: 2026-09-03
method: this machine first — `git help -c`, `man git-log`, `--help` of every installed binary, and every recipe run in `~/dotfiles` with its real output. two web lookups, both for a claim i could not test locally (git-branchless hook install, difftastic `add -p` support). star counts ignored.
ticket: DOT-159
dies-when: verdicts folded into home/.gitconfig + aliases.zsh (DOT-159 r2/r3)
---

# git tooling — research r1

measured 2026-09-03, `git version 2.55.0`, in `~/dotfiles` (1013 commits, 46 MiB pack). canonical key
casing is camelCase (`merge.conflictStyle`, `rebase.autoSquash`) — git matches case-insensitively, so
today's lowercase spellings work, but write the canonical form.

## A — dima, the human surface

### `git lg` decoded — every token checked in `man git-log`, PRETTY FORMATS

- `--graph` the ascii rails on the left · `--abbrev-commit` short hashes · `--decorate` appends ref
  names (`HEAD -> main`) · `--all` every ref, not just the current branch — this is what makes it a
  map instead of a list
- `--exclude=refs/conductor-checkpoints/*` — drops conductor's checkpoint refs; 151 `Checkpointer`
  commits would otherwise flood the graph
- `%C(bold blue)` … `%C(reset)` colour on, colour off (`%C(dim white)` is the grey tail) · `%h` short
  hash · `%ar` author date relative · `%s` subject · `%an` author name · `%d` ref names

```
$ git --no-pager lg -3
* 051d73e - (2 hours ago) 🔧 repo: migrate engines to devEngines - Dima Vakatsiienko (HEAD -> main, origin/main)
```

**why `[alias]` and not zsh — settled, with proof.** a git alias resolves everywhere git runs: scripts,
`git -C other/repo`, another shell, an agent's non-interactive bash. a zsh alias exists only inside an
interactive zsh. this session ran `git lg` directly and could never run `lore`, the zsh alias that
*wraps* it — the dependency already points one way. **rule for the rebalance: pure git shortcuts move
to `[alias]`; the vibe words stay in zsh, where reading as speech is their whole job.**

### five siblings worth keeping — each run here, proposed alias in bold

**1. `ship` — what did i ship today**
```
$ git --no-pager log --since=midnight --format='%C(bold blue)%h%C(reset) %s' --all
051d73e 🔧 repo: migrate engines to devEngines
```

**2. `standup` — last two days, weekday and clock**
```
$ git --no-pager log --since='2 days ago' --date=format:'%a %H:%M' --format='%C(green)%ad%C(reset) %C(bold blue)%h%C(reset) %s'
Thu 13:29 051d73e 🔧 repo: migrate engines to devEngines
```

**3. `br` — branches by recency with upstream state.** replaces `gba`, and it is the squash-safe
triage signal DOT-38 asked for: `[gone]`, never `--merged`
```
$ git -c branch.sort=-committerdate branch --format='%(refname:short)  %(committerdate:relative)  %(upstream:track)'
main  2 hours ago
prototype/focus-pin  3 weeks ago  [gone]
claude/cloud-agents-dotfiles-test-6ef3hc  3 weeks ago  [gone]
iterate-on-configs  4 weeks ago  [gone]
```

**4. `vs` — this branch against main.** three dots, so it diffs the merge-base rather than whatever
main did since
```
$ git --no-pager log --oneline main..prototype/focus-pin | head -2
82d05e6 🔧 sline: show what triggers a status fetch, default to short words
$ git --no-pager diff --stat main...prototype/focus-pin | tail -1
 1 file changed, 542 insertions(+)
```

**5. `who` — agent vs human.** this is the DOT-159 attribution ask, answered by plain git
```
$ git --no-pager log --format='%(trailers:key=Co-authored-by,valueonly)' | sed 's/ <.*//' | grep . | sort | uniq -c | sort -rn | head -4
 180 Claude claude-opus-5
 147 Claude Fable 5
  91 Claude Opus 5
```

### config defaults — keep/drop, one reason each

- ✅ `rerere.enabled` — replays a conflict you already resolved; bg coders rebase onto a moving main over and over
- ✅ `diff.algorithm = histogram` — cleaner hunk boundaries on moved code, no cost
- ✅ `merge.conflictStyle = zdiff3` — the common ancestor goes in the marker, so you see what each side changed
- ✅ `fetch.prune` — `[gone]` is only trustworthy after a prune; today only `gprune` prunes, so every other read is stale
- ✅ `rebase.autoSquash` — `fixup!` commits fold without `-i` ceremony
- ✅ `rebase.updateRefs` — a rebase carries branches pointing into the range; without it a stacked branch is left behind
- ✅ `branch.sort = -committerdate` (+ `tag.sort = -v:refname`) — newest first is the order you actually want
- ✅ `commit.verbose = true` — diff in the editor for `mana`, invisible to `-m`, so free
- 🚫 `commit.status = false` — currently set; drop the line, since `verbose` makes that summary useful again
- ✅ `push.autoSetupRemote` — already set, already right, and it is what makes `gpu` dead
- 🚫 `column.ui` — measured at 4 branches and this terminal width: no visible change. buys nothing at our scale
- 🚫 `maintenance` / `git maintenance start` — installs a launchd job. the real finding is **23 orphaned
  `.git/objects/*/tmp_obj_*`** from interrupted writes; `git gc --prune=now` clears them in one shot
- 🚫 `[coderabbit] machineId` — machine state inside a version-controlled file; delete
- 📌 indentation is mixed: hand-written blocks 4 spaces, tool-written tabs. normalise to 4 and accept future drift

### pager — one verdict: **delta.** difftastic must never be global — measured, not preference
```
$ git -c core.pager='sed s/^/PAGER-RAN:/' diff | head -1
diff --git a/f.txt b/f.txt      # pager did NOT run: git skips it when stdout is not a tty
$ git -c diff.external='sh -c "echo EXTERNAL-RAN"' diff
EXTERNAL-RAN                    # it DID run, non-tty, and replaced the whole diff
```

`core.pager` is delta's install method, so delta stays invisible to every script and every agent.
`diff.external` is difftastic's documented method, so a global difftastic hands tree-shaped output to
anything shelling out to `git diff` — no unified diff, nothing appliable — and difftastic does not
support `git add -p` at all, by its own manual. keep it as an opt-in alias if wanted, never as config.
delta's readme recommends `merge.conflictStyle = zdiff3` (corroborating the row above) and
`interactive.diffFilter = delta --color-only`, which covers `add -p` without touching `diff.external`.

### tui — **the premise was wrong: lazygit is not installed**

not on `PATH`, not in `Brewfile`; `brew list` shows only `git`, `git-filter-repo`, `git-lfs`, `libgit2`.
no incumbent to beat, so no recommendation; the five recipes cover what a tui would have been opened for.

## B — the agent surface

dima's prior — *"plain git gives you more than needed"* — **holds.** every candidate lost, two of them
to something already installed.

- 🚫 `git-who` — dead on arrival. attribution is already in the history: **635 of 1013 commits** carry
  `Co-Authored-By: Claude`, and `%(trailers:key=Co-authored-by)` reads the model name out natively (A5).
  git-who attributes by author identity — `Dima Vakatsiienko` on every agent commit — so it reports 100% human
- 🚫 `git-absorb` — its payoff is auto-targeting `fixup!` into a stack; we squash-merge, so the stack is
  flattened on the way in. no failure prevented
- 🚫 `git-branchless` — `git branchless init` installs `post-commit` and `post-rewrite` hooks, with documented
  collisions against existing hook managers. we run lefthook, whose `pre-push` carries `script/linear-push.ts`;
  risking that chain for a `git undo` that `reflog` already covers is a bad trade
- 🚫 `jj` — colocated mode does not run git hooks the way git does, and the linear push-revert *is* a git hook
- 🚫 `difftastic` globally — the `diff.external` measurement above; it silently breaks every agent reading a diff
- 🚫 a gh extension for "fetch a cloud agent's branch by PR number" (DOT-38 wishlist) — **already builtin**:
  `gh pr checkout <n>`, `gh` 2.99.0 installed. write nothing
- ✅ `rerere.enabled` — the one genuine agent win, and a config line rather than a tool: two bg coders rebasing
  separate worktrees onto the same moving main, and the second does not re-solve the first's conflict
- ✅ `fetch.prune` — section A's line, different reason: an agent reading `git branch -vv` outside `gprune`
  gets stale `[gone]` data and mis-triages a branch

### one real bug found, and it is ours

`gprune -d` pipes the `[gone]` list through `xargs git branch -D`. `iterate-on-configs` is `[gone]` **and**
checked out in the conductor worktree at `~/conductor/workspaces/.dotfiles/auckland`; git refuses that
delete — verified in a scratch repo:

```
$ git branch -D feat
error: cannot delete branch 'feat' used by worktree at '.../wt/w'   # exit 1
```

so `gprune -d` fails partway on this repo today. fix: a `%(worktreepath)` filter, in r2 — DOT-38 called it.
