---
date: 2026-09-12
slug: the-verdict-day
tickets: [BYT-92, BYT-93, BYT-94, DOT-26, DOT-237, DOT-243]
posted: {health: no}
cw: |
  the merge gate on bytes now reads the reviewer's own verdict instead of guessing from silence, and it was proven on real pull requests the same afternoon: findings go red, a clean round goes green, and a round nobody could judge goes red without spending the budget. dima's approval past the cap is the one human click left, and the lane that used to guess at it is deleted.
  live / next: dima called the gate overcomplicated and a probe agreed it cannot be replaced by github's own approvals, so the simplification waits for the greptile-on-ci decision on 2026-09-16; before that, wispr flow snippets, the ralph loop first run, and the vercel deploy zero.
  worth a line: the probe that was meant to replace the gate proved the replacement impossible and still found nine hundred lines to delete.
---
# 🗞️ cclio's gazette · the verdict day — the gate learns to read, a probe says no to the native way, and cclio gets a face on github

## shipped

- **the gate reads the verdict** — [BYT-92](https://linear.app/x-com/issue/BYT-92) done (#79 + #83): the ci reviewer ends every round with `verdict: clean | findings` in its sticky comment, the guard requires the line, and the decision lives in `review-gate.jq` with fixture cases and mutation checks (20 cases, 8 mutations, 12 real defects found by 4 reviewers across the two prs). measured live the same afternoon: findings → red and counted (#82 run 9), clean → green and counted (#82 run 11), unjudgeable → red and uncounted (runs 6–8), dima's approval → green (#83's own lane, on itself). a `renovate/*` lane publishes the check on green ci, actor renovate. the answer lane (5 of the 12 defects) is gone: past the cap the owner approves, 887 lines deleted.
- **the probe that said no** — dima: «i lost track of how pr merge protection is driven… overcomplicated». a research fork proposed the native design (require 1 approval + conversation resolution, the reviewer approves as the app); the coder probed it on a scratch pr: an app's APPROVED review is recorded and `reviewDecision` stays `REVIEW_REQUIRED`; one human approval flips it. so bot approvals cannot gate, the parser stays, and dima's verdict on the shape lives in [BYT-94](https://linear.app/x-com/issue/BYT-94) for the greptile-ci decision on 2026-09-16.
- **ci matrix** — [BYT-93](https://linear.app/x-com/issue/BYT-93) done (#82): a clean-clone filtered install per vercel app, read from each `vercel.json`; the renovate validator only on its file, postgres in its own job, chromium only when kit tests run. the round found a `needs:` edge that had made the required check skippable — the #72 trap, in a file that documents it.
- **evergreen** — jotai 3, npm-run-all2 9, the patch group (biome 2.5.12 unmasked a wrong optional-catch-all type in x-com-chat; the suggested fix would have crashed `/chat`), brew 13 upgrades (pnpm 12.4.1, node 26.8.2, vercel 59.16). finding: renovate prs could not merge since #75 — the gate had no path for them; `--admin` once, the renovate lane since.
- **cclio's face** — github app `x-cclio-cc` (4921020) on bytes + dotfiles, `pnpm github:agent-token x-cclio-cc`; attribution only, an app approval never counts. **init mini** (`/cclio:init mini`, cclio 0.3.40): healthcheck, inbox read-only with ✅ in place, no cst, no flowlog. **plugin eval** first run on plugin-x: `x:cmt` fires on «commit this» (Δ +1.00), two cases flaky at one run; the instrument for [DOT-243](https://linear.app/x-com/issue/DOT-243) only, results gitignored.
- **smaller**: [DOT-237](https://linear.app/x-com/issue/DOT-237) loses the raycast-ios research line (answered: a companion keyboard, no letter layout); [DOT-26](https://linear.app/x-com/issue/DOT-26) gains gifs (vhs + gifski installed, a gif is a screen recording, no base images), bot identities (vendor bots keep their names, vercel avatars are the one lever) and the notifications tune; `.node-version` = `24` in both repos, fnm stays (volta's readme says unmaintained, mise is the only live alternative); wispr flow + superwhisper in the Brewfile.

## tricks gained

- github closes a pr whose base branch is deleted — retarget stacked prs before merging the parent with `--delete-branch`
- an installed app's `author_association` is NONE: its reviews never satisfy a required-approval rule, in either direction
- the coder app cannot push or delete refs (no `contents: write`); api writes wear the app, pushes are dima's git
- runner jq is 1.7, the mac 1.8 — a jq program is proven when ci compiles it; `sd`/`sed` silently eat `${{ }}` in workflow files
- two negative turbo filters intersect; `turbo run --dry=json` lists packages with no such script
- a `gh api …/runs` waiter keys on `id > last seen`, never `status == completed`
- `performed_via_github_app` exists on issue comments only; `gh pr review` needs `--repo` without a checkout
- the `--case` flag of `claude plugin eval` takes one glob; a second is dropped

## state

- bytes `9870956e` + cclio's `.node-version` commit unpushed; dotfiles 4 commits + the flush unpushed; 0 open prs, coder `2ee2daa4` stopped after its retro
- next: wispr flow snippets with dima, the finance sub-item, the ralph first run on the guard fixtures, BYT-84, knip; 09-16: greptile-ci + BYT-94
