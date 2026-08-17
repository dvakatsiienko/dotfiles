# issue tracker: linear

📌 **pointer, not truth.** the tracker domain is normative in two other places and this file
restates neither:

- **vocabulary + decisions** — `docs/tracker/CONTEXT.md` (glossary) and `docs/tracker/adr/`
  (`TRK-nnnn`), reached via `CONTEXT-MAP.md` at the repo root.
- **operating recipes** — the `x:pm` skill and its `references/workspace.md`: field contract,
  current projects, states, labels, quota ops, cli gotchas.

when this file disagrees with either, they win.

what stays here, because it is repo-level fact:

issues for this repo live in **linear** — workspace `x-com`, team `DOT` — since the 2026-08-13
migration. github issues are retired: closed history only, each with a pointer comment to its
linear successor. never create or reopen gh issues here.

all operations go through the `linear` cli (schpet/linear-cli, on PATH, keyring-authed);
`linear api '<graphql>'` covers anything without a dedicated command. the linear mcp is not used.
command mechanics: the `linear-cli` plugin skill.

## when a skill says "publish to the issue tracker"

create a linear issue in the right team and project via `linear issue create` — load `x:pm` first,
it owns the field contract.
