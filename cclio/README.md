# cclio

coordinator home for **cclio** (ccli orchestrator) — dima's coordinator brain running as a
plain claude code cli session. lives inside the dotfiles repo — dotfiles is the fleet repo, and
a fleet coordinator does not sit in a repo of its own.

the coder-global memfile at `~/projects/CLAUDE.md` does not exist yet ([DOT-195](https://linear.app/x-com/issue/DOT-195)
creates it). when it does, this path would start inheriting it — the fix then is relocating the
whole dotfiles repo to `~/dotfiles`, not moving cclio back out. see [DOT-202](linear://linear.app/issue/DOT-202).

## boot
```
cd ~/dotfiles/cclio && claude
/cclio:init
```

## layout
- `CLAUDE.md` — the coordinator memfile
- `memory/_MEMORY.md` — barrel index; leaves hold content
- `.claude/commands/cclio:init.md` — the `/cclio:init` boot ritual
- `.claude/x-queue.md` — `/queue`'s store · `ROLLBACK.md` — how to undo this

## reverse
`git rm -r cclio/` inside dotfiles, plus a revert of the fold commit. see `ROLLBACK.md`.
