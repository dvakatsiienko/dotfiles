---
description: deploy a branch to a target branch [default:dev]
argument-hint: dev | master | stage
---

this command explains a flow of current branch deployment.

## instructions

- the default target branch is **dev**
- when command is executed without a prompt — execute this command against default target branch
- otherwise adapt this flow to branch name specified in prompt
- adapt this flow to other instructions from prompt (if present)

1. get info about current (initial) branch and remember to switch back in the end of the flow
2. if initial branch is not yet pushed to the origin, push it (keep origin fresh 🥩)
3. switch to target branch
4. make a pull to make sure branch is fresh
5. merge initial branch to target branch
6. push to target branch ⚡
7. switch back to initial branch
8. print a «deployment successful» message with ✅

## notes

- if this command initiated with uncommitted changes — commit them by using @~/.claude/commands/commit.md command (which requires user approval before committing)
- if merge conflict encountered pause this flow immediately, and print detailed summary of a conflict to me
