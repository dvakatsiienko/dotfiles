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

- `core.hooksPath` is global (`~/.config/git/hooks`, the dispatcher) — `lefthook run` syncs
  its shims INTO that path and `lefthook install --force` overwrites it; the dispatcher guards
  the first, nothing guards the second. never run `lefthook install` with any flag
- a git worktree of `dotfiles` cannot push (the `mirror` gate reads `~` symlinks that point at
  the main checkout) and must never run `pnpm` (it installs there and rewrites the shared
  `.git/hooks` to the worktree path)
