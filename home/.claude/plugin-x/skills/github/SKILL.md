---
name: github
description: GitHub pull requests and issues — opening, editing, reviewing, monitoring, closing, merging. Load BEFORE any `gh pr` / `gh issue` command, before writing a PR title or description, before filing or editing an issue, and whenever asked to watch or babysit a PR.
---

# GitHub

Conventions for pull requests and issues. Moved out of root `CLAUDE.md`, where they sat resident
in every session for a workflow that only runs occasionally. Dima's default lane is committing
straight to `main` with no PR, so this fires rarely and should carry the detail root cannot afford.

## Pull requests

- Make sure titles follow conventions from the repo. They should be simple and easy to understand. Conventional commit styles in projects that use them, i.e. "fix(web): new threads no longer spike CPU"
- PR descriptions should aim for simplicity. Open with a minimal, clear description of the problem. Follow up with how you solved it.
- Add a blurb to the end of the PR description about what model and harness is making the changes.
- Open a real PR, not a draft. Drafts do not get review-bot coverage.
- Rebase onto latest main before opening. Stale branches conflict and waste a review round.
- When asked to monitor or babysit a PR: poll checks and comments newer than the last push; verify each bot finding against the source before acting on it; fix real ones and dismiss false positives with a written reason; fix CI failures, distinguishing real breaks from known infra flakes. If nothing is new, stay quiet — do not post filler comments. Stop when the repo's review bots are green on the latest commit.
- Merge only per the disposition given in the request (merge when green, or stop and report). If none was given, report and ask.

## Issues

- When filing an issue, follow conventions from the repo. Make it easy to read by a human and easy to resolve by an agent. Don't forget labels.

## Completion criterion

Done when the PR or issue is in the state the request named, and you have said which state that is.
A PR left open when the request said merge-when-green is not done, and neither is one merged when
the request said report and ask.
