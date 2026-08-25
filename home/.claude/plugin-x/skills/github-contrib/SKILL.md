---
name: github-contrib
description: Load BEFORE any `gh pr` / `gh issue` command, before writing a PR title or description, before filing or editing an issue, and whenever asked to watch or babysit a PR.
---

# github contributions

conventions for pull requests and issues. dima's default lane is committing straight to `main`
with no PR, so this fires rarely and carries the detail root `CLAUDE.md` cannot afford.

## pull requests

- **never open a PR unless dima explicitly asks.**
- titles follow the target repo's conventions — simple, clear; conventional-commit style where
  the repo uses it: `fix(web): new threads no longer spike CPU`.
- descriptions: the problem in a sentence or two, then how you solved it. end with a blurb
  naming the model and harness that did the work.
- **one concern per PR** — if the description says «also», split it.
- open a real PR, not a draft — drafts get no review-bot coverage.
- rebase onto latest main before opening; stale branches waste a review round.
- UI changes need before/after images; motion or timing needs a short video. upload evidence to
  GitHub — never commit PR-only screenshots or assets into the repo.
- **babysitting**: poll checks and comments newer than the last push; verify each bot finding
  against the source; fix real ones, dismiss false positives with a written reason; fix CI
  failures, distinguishing real breaks from infra flakes. nothing new → stay quiet. stop when
  the bots are green on the latest commit.
- merge only per the disposition given (merge-when-green, or stop and report). none given →
  report and ask.
- a merged PR is the implementation record — close or update the tracking item when the work
  lands; keep no second checklist in the repo.

## issues

- **before filing**: read the repo's issue templates and `CONTRIBUTING.md`, run
  `gh label list`, search open issues for a dupe. dupe found → comment there instead.
- **labels are mandatory** — pick from the repo's actual set, or say in the issue why none
  fits. never file bare.
- fill the template's fields; a bug report carries repro steps and a version/environment block.
- write it easy to read by a human and easy to resolve by an agent.

## completion criterion

done when the PR or issue is in the state the request named — labeled, templated, and you have
said which state that is. a PR left open when the request said merge-when-green is not done,
and neither is one merged when the request said report and ask.
