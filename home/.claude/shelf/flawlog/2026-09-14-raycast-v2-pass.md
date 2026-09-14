# flawlog 2026-09-14 — raycast-v2-pass · run cc·20260907·raycast

- coder DOT-247 retro 1 (fleet-hazards candidate): in a `run_in_background` bash call the wrapper IS the backgrounding — a trailing `&` inside it orphans the child, which dies with the shell, exit 0, empty log · cost: one wasted keyboard-probe ask of dima
- coder DOT-247 retro 2: «he is at the keyboard» in a brief read as a guarantee; the probe launched before the ask · lesson for coder-brief: a probe needing dima's hands asks first, launches on his word
- coder DOT-247 retro 4 (mine): the brief named a hand-made `git worktree add` in dotfiles without the `CI=1 pnpm install` guard in the same line, while telling it «never pnpm install» — two lines in conflict; the hazard file already says the guard is needed for hand-made trees · fix the brief template line
- coder DOT-247 retro 5 (unverified): TCC keys an ad-hoc binary by code identity → hotkeys:build now codesigns with a stable identifier; rebuild-after-grant untested
- good find (coder): opt+esc (dima's read-aloud) fires in bursts and will dominate rankings → an ignore list in hotkeys:top, later
- coder DOT-247 job 2 retro (fleet-hazards, two lines): a trailing `&` in a Bash tool call is safe only when something after it keeps the shell alive (a `wait`, a `sleep`) — the wrapper exits and kills the child, log empty, looks like «feature broken» (twice in one day) · renaming a `.gitignore` path un-ignores whatever the OLD path still holds — `git add -A` staged a compiled binary, caught by reading the staged list
- coder retro (keep): a daemon change is verified against a scratch data dir copy, never dima's live data; a probe whose «nothing happened» equals «broken» ships its own trigger (osascript activate)
- my brief's done-criterion `grep -rn 'hotkey-stats'` could never be empty (the new name contains the old); the coder rewrote it as a lookaround. lesson: a grep criterion is run once before it is written into a brief
