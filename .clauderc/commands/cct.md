---
description: commit (via /commit) then sync the result into this repo's local main branch — no remote/push
argument-hint: [correction instruction | confirmation]
---

## purpose

Conductor runs every session in its own git worktree. Commits made there sit in the worktree's
branch and never reach the actual checked-out `main` (e.g. `~/.dotfiles`, `~/.config/nvim`) until
someone manually merges — so tools reading the real directory (a running nvim, a shell sourcing
dotfiles) don't see the change. `/cct` = commit, then immediately fast-forward local main so the
change is live, without touching any remote.

## flow

1. Run the full commit flow exactly as defined in @commit.md, including staging, commit message
   format, and the correction/confirmation argument handling for `$ARGUMENTS`. Do not skip the
   pre-commit sanity check.
2. After the commit lands, sync it into this repository's local main:
   - Determine the repo's default branch name (`main`, falling back to `master` if that's what
     `git symbolic-ref refs/remotes/origin/HEAD` or the local branch list indicates).
   - Run `git worktree list --porcelain` to enumerate this repo's worktrees.
   - If the worktree you're already in is the one with the default branch checked out, there's
     nothing to sync — the commit already landed on main. Report and stop.
   - Otherwise, find the worktree path where the default branch is checked out, and run
     `git -C <that-path> merge <current-branch>` (use `-C`, do not `cd`, so the invoking shell's
     cwd is untouched).
   - This merge should always be a fast-forward, since `/cct`'s whole purpose is advancing main to
     the worktree's latest commit. If it isn't a fast-forward (main has diverged with commits this
     branch doesn't have), **stop and report the divergence** — do not attempt automatic conflict
     resolution or force anything.
   - Report the resulting main branch HEAD (short hash + subject) and its path.
3. Never push to a remote, open a PR, or otherwise touch remote state as part of this command —
   regardless of `commit.md`'s own `slay` push semantics. The one exception: if `$ARGUMENTS`
   explicitly asks for a push (e.g. passing `slay`, or literal instructions to push), honor that
   as an explicit request and push local main after the merge.

## important

- If this repo has only one worktree (no separate main worktree exists — e.g. you're already
  working directly in main, no Conductor involved), skip the merge step entirely; there's nothing
  to sync.
- Never resolve merge conflicts automatically. If the fast-forward fails, stop and describe the
  situation so I can decide how to proceed.
- This command is repo-agnostic: it works the same whether invoked in this dotfiles repo, in
  `~/.config/nvim`, or any other repo using the Conductor worktree pattern — it always targets
  *that* repo's own main worktree, never a different repo.
