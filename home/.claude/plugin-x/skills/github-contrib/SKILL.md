---
name: github-contrib
description: Load BEFORE any `gh pr` / `gh issue` command, before writing a PR title or description, before filing or editing an issue, and whenever asked to watch or babysit a PR.
---

# github contributions

conventions for pull requests and issues — the `gh` mechanics under the lanes in `x:cmt` and
`x:coder-brief` (a coder's assignment lands as a PR by default; dima's own lane is `main`).

## pull requests

- **never open a PR unless dima explicitly asks.**
- titles follow the target repo's conventions — simple, clear; conventional-commit style where
  the repo uses it: `fix(web): new threads no longer spike CPU`.
- descriptions: the problem in a sentence or two, then how you solved it. end with a blurb
  naming the model and harness that did the work.
- **one concern per PR** — if the description says «also», split it.
- **never a draft.** a PR opens real at the first push and stays the review surface while the
  work continues; review bots and dima read it as it grows.
- rebase onto latest main before opening; stale branches waste a review round.
- UI changes need before/after images; motion or timing needs a short video. upload evidence to
  GitHub — never commit PR-only screenshots or assets into the repo.
- **babysitting**: poll checks and comments newer than the last push; verify each bot finding
  against the source; fix real ones, dismiss false positives with a written reason; fix CI
  failures, distinguishing real breaks from infra flakes. nothing new → stay quiet. stop when
  the bots are green on the latest commit.
- **reading a reviewer, measured 2026-09-11**: the ci reviewer posts to a different endpoint per
  round — poll all three (`issues/N/comments`, `pulls/N/reviews`, `pulls/N/comments`), never
  the workflow run (an `issue_comment` workflow runs on the default branch; `gh run list
  --branch` never shows it). greptile posts once, then EDITS its summary comment in place and
  completes the `Greptile Review` check-run on the head — watch `updated_at` + the check-run.
  an inline thread is answered only through `POST /pulls/{n}/comments/{id}/replies`; a
  top-level comment does not count as a reply.
- **the bytes review lane**: `gh pr edit <n> --add-label '🤖 review:requested'` starts the ci
  reviewer on this head (the `review` check is required on main); a later push leaves it stale
  — re-review = remove + add the label, at most twice per pr, a third round on dima's word.
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

## posting under dima's account outside our repos

an issue, pr or comment on a repo we do not own, written by an agent and posted with dima's `gh`,
ends with one footer line so the maintainer knows who typed it and that dima stands behind it:

    — written by Claude Code at my request; I read it and stand behind it.

his account carries the accountability, the footer carries the honesty. never a `[bot]`
impersonation, never silent. inside our own repos the app identities (`x-coder-cc`,
`x-reviewer-cc`) do this job instead.
