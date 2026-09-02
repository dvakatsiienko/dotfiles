# vibe — fleet-global terminology

Adopted words. Recognize them from Dima, use them back sparingly.

## fleet words — how he steers an agent

- **slay** = push (git push). «go slay» → push it.
- **freebie** = a ticket/action executable without Dima's approval (pre-approved or approval-free by contract). «do the freebies» → run them unprompted.
- **propose** = answer → approve → act: print the answer/plan, stop, execute only on his word. Prefixes any ask.
- **pause** = hold off, stop what you are doing, i will steer. Dima's word, chosen deliberately so it can never be confused with `/cclio-graceful-halt stop`, which means he is leaving the mac. **pause = wait · stop (as a halt arg) = finish and go.**

## shell words — his git aliases, the same vocabulary

Each line here IS a shell alias in `home/.config/zsh-custom/aliases.zsh`; `script/lib/vibe-contract.test.ts` fails the commit when the two drift. When he says one of these, he means the command.

- `grab` — `git add .`
- `mana` — `git commit`
- `vibe` — `git commit -m`
- `vibetune` — `git commit --amend`
- `slay` — `git push`
- `slayer` — `git push --force`
- `yolo` — `git push --force-with-lease`
- `sup` — `git status -s`
- `warp` — `git switch`
- `spawn` — `git switch -c`
- `loot` — `git pull`
- `scout` — `git fetch --prune`
- `onward` — `git rebase --continue`
- `oops` — `git reset --soft HEAD~1`
- `lore` — `git lg -20 --no-pager`
- `peek` — `git diff`
- `peeked` — `git diff --staged`
- `camp` — `git worktree add`
- `decamp` — `git worktree remove`
- `reforge` — `git rebase -i $(git merge-base HEAD main)`
