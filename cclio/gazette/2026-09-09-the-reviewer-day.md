---
date: 2026-09-09
slug: the-reviewer-day
tickets: []
posted: {health: no}
cw: |
  the pull request reviewer changed hands today: the coderabbit github app is gone, its command line tool moved onto brew and stays for the coder's local pre-check, and claude code now reviews any pull request in bytes when someone writes «@claude review» in a comment. it found the planted bug on the first real run, in under four minutes.
  live / next: dima's next real pull request gets one «@claude review» to prove the human-authored case, then greptile gets a timeboxed look, then stacked pull requests.
  worth a line: the reviewer bot skipped the first test because the pull request title said «throwaway», and a vercel deploy comment cancelled the second, so the two things that broke were a word and a queue key, not the model.
---
# 🗞️ cclio's gazette · the reviewer day — coderabbit steps back to the cli, claude code takes the pull request

## shipped

- **the coderabbit github app is uninstalled** — free plan reviews nothing (summaries only, 10-star gate); only linear's webhooks remain on `bytes` + `dotfiles`. the cli moved from a hand-installed 0.3.1 to brew's cask **0.7.6** (Brewfile line, authed, `doctor` 9/9, token never expires). `.coderabbit.yaml` left bytes: the cli reads config only through `-c <files>`, and `CLAUDE.md` is the intended input. the `coderabbitai/skills` package judged dead weight on all three channels (thin wrappers, one skill needs the gh bot, flags stale) — not installed.
- **claude code reviews bytes pull requests** — `.github/workflows/claude.yml` (#63): `@claude review [focus]` runs the `code-review` plugin skill with inline comments, any other `@claude …` is interactive and may push to the branch; opus-5 `--effort high`, `--max-turns 30`, `allowed_bots: x-coder-bot[bot]`, subscription oauth token as a repo secret on both repos. no `pull_request` trigger: the coder pushes freely, the review starts on the comment. labels were considered and dropped as friction (option c locked in the plan).
- **proven on a bot pr** — #64 opened and commented by `x-coder-bot`: one inline finding on the planted off-by-one, 18 turns, 198 s of claude, 3m49s job wall time. two failures on the way, both fixed the same hour: the skill skipped the pr titled «throwaway» (it skips prs it judges trivial), and a vercel deploy comment cancelled the review through the shared concurrency group (#65 keys the group on the `@claude` predicate).
- **`x:coder-brief` 0.11.47** — «final» now reads: `coderabbit review --agent --base main -c CLAUDE.md` → fix → `code-review` → fix → push → `@claude review` → fix real / «declined: why» → at most one re-request → `gh pr edit --add-reviewer dvakatsiienko` → the word. a rate-limited tool is skipped and named, never waited on.
- `cclio/docs/gh-stack-adoption.md` tracked in git: step 0 ticked, step 1 all but the human-authored exit, step 2 wired.

## tricks gained

- a github app installation token can open prs and comment but not delete branches or call `/user` — the deletion is dima's `gh`
- `issue_comment` workflows run only from the default branch — a workflow pr cannot prove itself
- the action posts nothing until the run ends (`classify_inline_comments` buffers); a quiet pr mid-run is normal
- `coderabbit review` flags on 0.7.6: `--agent`, `--uncommitted`, `--committed`, `-c` — `--prompt-only` and `-t` are gone, docs and skills still name them
- never `coderabbit update` when brew owns the binary; `brew upgrade coderabbit` is the path

## state

- dotfiles `c702663`, bytes `4ca72eaf`, both clean on origin; no coder, no worktrees
- open: the human-authored review (dima's next pr) · greptile, step 3, fresh session · the cr `--show-prompts` probe on the first coder run · three inbox questions (renovate avatar, vercel quota research, graft eval) parked in the flowlog, inbox kept on dima's word
- inherited, unverified from here: the 16:00 interview, the vercel cap reset + prod redeploy, the first evergreen digest, DOT-228 run 2, the trophy-sys redesign morning
