---
description: use jira-mcp to extract info from jira
model: sonnet
---

if command executed without instructions, list jira bug-type (omit task-type) issues assigned to me.

## instructions

- only in-progress, todo, grooming
- only in current sprint
- list order: in-progress, todo, grooming.
- translate to english, do not include russian

- if specified, use jira #$ARGUMENTS ID to get detailed info about one issue
- if $ARGMENTS is not specified, get only issue names and print as a list
