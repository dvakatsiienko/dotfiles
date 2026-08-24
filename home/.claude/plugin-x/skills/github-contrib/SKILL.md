---
name: github-contrib
description: GitHub pull requests and issues — opening, editing, reviewing, monitoring, closing, merging, labels. Load BEFORE any `gh pr` / `gh issue` command, before writing a PR title or description, before filing or editing an issue, and whenever asked to watch or babysit a PR.
---

# github contributions

conventions for pull requests and issues. dima's default lane is committing straight to `main`
with no PR, so this fires rarely and carries the detail root `CLAUDE.md` cannot afford.

## pull requests

- titles follow the target repo's conventions — simple, easy to understand. conventional-commit
  style in projects that use it: `fix(web): new threads no longer spike CPU`.
- descriptions aim for simplicity: open with a minimal, clear statement of the problem, follow
  with how you solved it.
- add a blurb at the end of the description naming the model and harness making the changes.
- open a real PR, not a draft. drafts do not get review-bot coverage.
- rebase onto latest main before opening. stale branches conflict and waste a review round.
- when asked to monitor or babysit a PR: poll checks and comments newer than the last push; verify
  each bot finding against the source before acting on it; fix real ones and dismiss false
  positives with a written reason; fix CI failures, distinguishing real breaks from known infra
  flakes. if nothing is new, stay quiet — no filler comments. stop when the repo's review bots are
  green on the latest commit.
- merge only per the disposition given in the request (merge when green, or stop and report). if
  none was given, report and ask.

## issues

- **before filing**: read the repo's issue templates and `CONTRIBUTING.md`, run `gh label list`,
  and search open issues for a dupe. a dupe found → comment there instead of filing.
- **labels are mandatory.** pick from the repo's actual label set, or say in the issue why none
  fits. never file bare.
- fill the template's fields; a bug report carries repro steps and a version/environment block.
- write it easy to read by a human and easy to resolve by an agent.

## carried in verbatim from t3 code

theo's rules, copied without rephrasing from `docs/agents/AGENTS-t3-code-ref.md`. they are his,
not dima's; where they disagree with the two sections above, dima's own rules win.

- Never make a PR unless the developer explicitly asks you to do so.
- UI changes need before/after images. Motion or timing needs a short video.
- Upload PR evidence to GitHub. Never commit PR-only screenshots or assets such as `.github/pr-assets/`.
- One concern per PR. If the description says "also", split it.
- Track active maintainer work in the GitHub issue or project item that owns it. External proposals follow `CONTRIBUTING.md` and belong in Ideas discussions.
- A merged PR is the implementation record. Close or update its tracking item when the work lands; do not preserve a second checklist in the repository.

## completion criterion

done when the PR or issue is in the state the request named — labeled, templated, and you have
said which state that is. a PR left open when the request said merge-when-green is not done, and
neither is one merged when the request said report and ask.
