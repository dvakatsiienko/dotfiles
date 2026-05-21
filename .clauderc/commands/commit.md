---
description: create a comprehensive commit
argument-hint: [correction instruction | confirmation]
---

## flow

- stage all files and prepare a commit name and description.
- important: when done, print the proposed commit message and body and ask a confirmation to apply a commit message
- I may make a correction, or prompt you with «y» to proceed with commit.

## correction argument handling

When a `correction` argument is provided:

- **real correction with instructions**: if correction contains actual instructions or feedback →
  follow this instruction to modify the commit
- **issue tracking ID**: if $ARGUMENTS contains an issue ID or issue tracking URL → extract the
  issue ID and append it to the commit message title with format: [ISSUE-ID]
  - Examples:
    - `ABC-1234` → append `[ABC-1234]`
    - `https://issue-tracker.com/ABC-1234` → extract `ABC-1234` and append `[ABC-1234]`
    - `https://issue-tracker.com/browse/PROJ-123` → extract `PROJ-123` and append `[PROJ-123]`
  - Pattern matching: extract issue IDs using format `[A-Z]+-\d+` from URLs or direct input
  - Final commit message format: `🐞 checkout: fix currency input validation [ABC-1234]`
- **cleanup operations**: if $ARGUMENTS contains "cleanup" → add `- maintenance: code-cleanup` to
  commit body for easier searching and reverting of cleanup commits in the future
- **branch name parsing**: in all cases, check current branch name:
  - if branch is formatted like `ISSUE-ID/branch-name` → extract the issue ID and add reference in
    commit body: `relates to: #ISSUE-ID`
  - example: branch `PROJ-123/fix-login` → add `relates to: #PROJ-123` to commit body

## confirmation argument handling

A confirmation argument «go» — means that you do not have to ask me for commit approval (y). If you receive /commit go command — commit right away, without presenting a commit message and asking for approval to commit.

A confirmation argument «slay» — means the same as «go», but also asks you to push right after commit.

## format

🐞 checkout: fix currency input validation [ABC-1234] → [emoji] [scope]: [description] [ISSUE-ID]

Note: [ISSUE-ID] is optional and only added when issue ID is provided as argument

[emoji]:

- use 🐞 for bug fixes
- use ⚙️ for functional changes/features including styles
- use 🎨 for tweaking tailwind theme system or app's theme system — variables etc
- use 📡 when networking-related changes are made
- use 🧹 when cleaning is performed/deleted legacy code etc
- use 📦 when package.json packages were updated
- use 📜 when README.md or other docs were updated

[scope]:

- always kebab-case
- do not follow semver, pick dynamic scope for each commit based on committed content
- to decide the scope fully analyze changes and pick scope name that best describes changes in a
  commit
- example 1: search functionality changed to remove opening search with a hotkey, but along with
  that few styles tweaked. emoji = ⚙️, scope = search
- example 2: a legacy modal component is replaced with radix-ui dialog. emoji = ⚙️, scope = my-bets
- example 3: package.json dependencies updated and lock file regenerated. emoji = 📦, scope = deps
- example 4: a legacy component deleted, settings deleted, dead code deleted. emoji = 🧹, scope =
  cleanup
- example 5: tweaks to sockets. emoji = 📡, scope = socket
- example 6: merge conflict resolved. emoji = 🐞, scope = git
- to identify the scope aim for most overall context for example:
  - EventPage has EventTile component
  - a padding on EventTitle was broken on mobile devices
  - a commit contains a fixed padding for EventTitle
  - resulting commit: 🐞 event-page: fix EventTitle padding for mobile devices

[description]:

- short, concise but descriptive
  - rarely longer than 7 words
- if relevant, put details into commit body
- be calm when picking words for commit message, do not use words «exterminate» or «legacy» except
  not asked to use them directly

[commit body]:

- use your own language to shape it concisely
- always check current branch name and if formatted like ISSUE-ID/branch-name → add reference:
  `relates to: #ISSUE-ID`
- **important**: commit body is separate from commit message title - issue IDs go in
  the message title [ISSUE-ID], branch references go in commit body
- **always append the Co-Authored-By trailer at the end of the body**, separated by a blank line.
  Use whichever Claude model name you (the agent) are currently running as — do NOT hardcode a
  version. Format:

  ```
  Co-Authored-By: Claude <model-name> <noreply@anthropic.com>
  ```

  Examples: `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`,
  `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`,
  `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` — match your actual runtime model.

## important corrections

- !important before actual commit make mini-code-sanity-check to identify:
  - obviously dangerous testing code that I could to delete
  - commented out potentially important code that I've commented out for testing purposes but
    forgot to uncomment again
  - other common mistakes, debuggers etc
  - if you encounter situations like this, immediately pause commit process and notify me
  - when an issue is resolved, resume previously paused committing flow
- you must strictly follow commit format
  - wrong format: ⚙️ migrate Flash Games components to mobx-react-lite
    - emoji — OK
    - message description — Ok
    - missing scope — NOT OK
    - correct format: ⚙️ flash-games: migrate components to mobx-react-lite
- if pre-commit hook fails discarding commit attempt — do not try to fix it by yourself, but print
  summary of a problem for me
