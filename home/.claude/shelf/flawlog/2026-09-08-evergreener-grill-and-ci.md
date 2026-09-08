# flawlog · 2026-09-08 · evergreener grill and ci research · run cclio-memory-bridge

- fleet-hazards says a dotfiles worktree cannot push (mirror gate), yet the coder's branch reached origin from `~/projects/.worktrees/dotfiles-renovate` (PR #33) · cost: none · lesson: re-measure the gate; the rule may be stale since the hook rewrite — ask the coder how it pushed
- read `grep -c packageManager` = 1 as «the freebie landed»; it matched `devEngines.packageManager`, the freebie was NOT on main — the coder corrected me · cost: one wrong line to dima · lesson: a count is not a match; grep the exact shape
- coder «babysits its PR» per x:coder-brief, but an idle session cannot see a new PR comment — dima's 13:54 question on #53 sat unanswered until cclio woke it · cost: his babysitting test failed · lesson: the brief must say HOW — a persistent Monitor on PR comments armed right after the PR opens; needs a skill edit (x:coder-brief), dima's word
- two merges raced the coder's tail pushes (dotfiles #33, bytes #53) and gprune removed a worktree under a live push · cost: a follow-up PR each time · lesson: the merge monitor should skip gprune while the owning coder is busy, or cclio says «merging» to the coder first — process, needs dima's call
- EnterWorktree hook placed a bytes worktree INSIDE the repo (`.claude/worktrees/`), bytes CLAUDE.md says `~/projects/.worktrees/` · cost: convention drift · lesson: check the user-scope EnterWorktree hook path setting
- good find (coder, DOT-241, not shipped): a job whose `runs-on` label has no registered runner QUEUES forever, never fails — with renovate `prCreation: not-pending` that silently stops every renovate PR from opening. gate any runner probe behind `if: vars.X == true` · cost: none · lesson: keep for the day bytes lives under an org
- coder watcher seeded by PRESENCE at every re-arm → a blind spot per reconfiguration; dima's #59 comment landed in one · cost: second failed babysit test · lesson (coder's own): a poll watcher anchors on TIME set once, never on what exists at arm time — belongs in x:coder-brief, one line
- two dated «as of» lines in docs went stale within a day and cost a false finding each (ci.yml TURBO_TEAM caveat; trophy-sys CLAUDE.md 403 line) · lesson (coder's): a memory file states what does not expire; a dated observation is a measurement and belongs in the commit, not the doc — this is already craft-pm's «no timestamps» for tickets; extend to CLAUDE.md/docs at the flush

## coder retro (test, dima's ask) — ranked by the coder, 2026-09-08
1. merges raced unpushed commits ×3 (#33, #53, #54) → 3 of 8 PRs existed only for that · fix: a «final» handshake before any merge
2. reporting budget inverted: ticket comment capped at 12, peer messages unlimited → durable facts landed in commit/PR bodies, not the ticket · fix: repo facts → the app's CLAUDE.md (where steam's landed), peer messages capped
3. cclio ordered a checkout -- on a false premise (the change was committed) · fix: brief line — verify state before any coordinator-ordered deletion, always
4. «one push per step» vs ci-only-on-push: 8 pushes chasing 4 reds, 47 deploys · fix: the gate (#60) before the lane; say so in the brief
5. a worktree pruned under a live session, twice · fix landed (monitor waits for idle); add an in-use check
6. sandbox guard: ~15 min of rewrites (jq filter containing «git», heredoc to gh, HOME= override)
7. step 0 loads every guide up front; narrow tasks need 4 of 8 · fix: load per file type touched
8. bot identity after 5 PRs opened as dima · sequencing: identity first next time
9. dated doc lines went stale twice · rule: measurements in commits, standing facts in docs
unbriefed it would have built #60 first.
- printed `·` chains in the halt plan minutes after writing the rule banning them · cost: dima asked what instruction makes me do it — none; my own memory files (gazette, craft-spawning, x-queue) feed the habit at every boot · fix: `·` joins the mechanical pre-send scan; memory writes from now on are bullets
