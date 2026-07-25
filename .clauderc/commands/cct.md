---
description: commit (via /commit) then sync the result into this repo's local main branch, optionally pushing to remote main with `remote`
argument-hint: [remote] [correction instruction | confirmation]
---

## purpose

Conductor runs every session in its own git worktree. Commits made there sit in the worktree's
branch and never reach the actual checked-out `main` (e.g. `~/.dotfiles`, `~/.config/nvim`) until
someone manually merges — so tools reading the real directory (a running nvim, a shell sourcing
dotfiles) don't see the change. `/cct` = commit, then immediately fast-forward local main so the
change is live. Passing `remote` additionally fast-forwards **remote** main on GitHub the same
way — no PR, no intermediary branch push, straight to `origin main` — for fast-paced work where
review isn't needed.

## argument parsing

- Scan `$ARGUMENTS` for the standalone word `remote` (case-insensitive). If present, remove it
  from `$ARGUMENTS` before handing the rest to the commit flow in step 1 below — the remaining
  text (correction instructions, `go`, `slay`, issue IDs, etc.) is still handled exactly per
  @commit.md's own rules, independent of `remote`.
- `remote` is purely a request to also push local main to `origin main` at the end (step 3 below).
  It does not change commit message formatting or the local-sync step.

## flow

1. Run the full commit flow exactly as defined in @commit.md (using `$ARGUMENTS` with `remote`
   stripped out, per above), including staging, commit message format, and the pre-commit sanity
   check.
2. After the commit lands, sync it into this repository's local main:
   - Determine the repo's default branch name (`main`, falling back to `master` if that's what
     `git symbolic-ref refs/remotes/origin/HEAD` or the local branch list indicates).
   - Run `git worktree list --porcelain` to enumerate this repo's worktrees.
   - If the worktree you're already in is the one with the default branch checked out, there's
     nothing to locally sync — the commit already landed on main. Skip ahead to step 3 if `remote`
     was passed (a direct push may still be needed), otherwise report and stop.
   - Otherwise, find the worktree path where the default branch is checked out, and run
     `git -C <that-path> merge <current-branch>` (use `-C`, do not `cd`, so the invoking shell's
     cwd is untouched).
   - This merge should always be a fast-forward, since `/cct`'s whole purpose is advancing main to
     the worktree's latest commit. If it isn't a fast-forward (main has diverged with commits this
     branch doesn't have), **stop and report the divergence** — do not attempt automatic conflict
     resolution or force anything, and do not proceed to step 3.
   - Report the resulting local main HEAD (short hash + subject) and its path.
3. **Only if `remote` was passed** (or `$ARGUMENTS` otherwise explicitly asks for a push, e.g.
   `slay`): push local main straight to remote main with the least work possible —
   `git -C <main-worktree-path> push origin <default-branch>`. No PR, no intermediary branch push.
   - If this push would not be a fast-forward on the remote (remote main has commits local main
     lacks), **stop and report the divergence** rather than force-pushing.
   - Report the resulting remote main state (e.g. via the push command's own output).
   - Without `remote` (and without an explicit push request like `slay`), never touch any remote
     or PR — this is the default, unchanged behavior of plain `/cct`.

## important

- If this repo has only one worktree (no separate main worktree exists — e.g. you're already
  working directly in main, no Conductor involved), skip the local-merge step entirely; there's
  nothing to sync locally. `remote` still applies independently — it can push main directly even
  when there was no merge to do.
- Never resolve merge or push conflicts automatically. If a fast-forward fails at either the local
  merge or the remote push, stop and describe the situation so I can decide how to proceed.
- This command is repo-agnostic: it works the same whether invoked in this dotfiles repo, in
  `~/.config/nvim`, or any other repo using the Conductor worktree pattern — it always targets
  *that* repo's own main branch (local and, with `remote`, remote), never a different repo.
