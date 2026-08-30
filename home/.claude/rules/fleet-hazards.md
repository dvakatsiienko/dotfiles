# fleet-hazards — well-known pitfalls, fleet-wide

common traps any surface can hit. one section per subject; add a section only for a hazard
that bites more than one surface. `cw-memory-sync` carries these into cw memory — this file is
the source of truth.

## the obsidian vault

- the vault is **not under git** — no undo, no history, a bad overwrite is gone
- icloud sync lags: changes land a few minutes after obsidian opens, and relaunching often
  forces the pull
- **never edit before the synced version has arrived** — editing a stale copy silently drops
  whatever the other device wrote (most likely when dima just printed from a mobile device)
- reads are fine anytime; writes only when he asks — never change the vault on his behalf
  unprompted
- never move or rename a vault file from outside obsidian — wikilinks break; renames happen
  in the app

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
