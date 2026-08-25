---
name: cmt
description: Branded commit authoring — format, emoji canon, steering keywords, Linear magic words. Load EVERY time a git commit is about to be created, in any repo, whether the user typed /cmt or just asked to commit mid-conversation.
argument-hint: "[y|y+] [push|push+] [correction…]"
---

# Commit

## 1 · Steering — parse $ARGUMENTS first

Four keywords: standalone words, case-insensitive, any order, composable. Strip them; all
remaining text = correction instruction (reword, rescope, …).

- `y` — skip the confirm, this invocation only
- `y+` — skip the confirm for the rest of the session
- `push` — also update the remote (current branch), this invocation only
- `push+` — do what `push` does, and keep doing it for the rest of the session

No `y`/`y+` → draft the message, print it, wait for "y"/correction — THEN run the full
pipeline. `y` or `y+` present → run unprompted, zero questions.

**Every keyword grants permission, never timing.** None of them means "right now" — pick the
moment yourself: a commit lands when the work is complete and verified, at a boundary a reader
would want to bisect on. Committing broken work fast is worse than committing good work late.
When Dima wants it this instant he says so in words — "commit now", "push it".

### 1.1 · Never push mid-session

Commits accumulate locally; the remote is touched once, at the end. Mid-session pushes publish
half-finished thinking, and rewriting local history stops being free once it is on the remote.

- Without `push`: commit only — never push, never offer to.
- At session end say how many commits are unpushed and ask once whether to push. One ask, not
  a nag per commit.

### 1.2 · The standing grants — `y+` and `push+`

Each keeps its one-shot grant for the rest of the session, however a later commit is invoked.
Both die at session end, a `/clear`, or Dima's revoke — never carried across a handoff.

- The grants are independent: `y+` covers only the confirm (a standing yes never reaches a
  remote); `push+` covers only the push (the draft is still shown unless `y`/`y+` is also on).
- While `push+` is on, §1.1 is suspended — it exists to stop unasked-for remote writes, and
  `push+` is the ask. The end-of-session unpushed count also goes quiet.

## 2 · Format — the brand

`[emoji] [scope]: [description]` — e.g. `🐞 sline: fix reset glyph rendering`

Emoji canon (stable, never random):

- 🔧 — config, tooling, functional/feature work (the broad bucket)
- 🐞 — bugfix
- ✨ — refactor: behavior unchanged, shape changed (incl. renames, reformat, codemods)
- 🗑️ — cleanup, deletion, dead-code extermination
- 📦 — dependency bumps, lockfile refreshes (scope always `deps`)
- 🎨 — themes, styles, visual/display formatting
- 📡 — networking
- 📜 — docs: README, CLAUDE.md, specs, ADRs, skill instructions
- 🍱 — multi-scope bulk commit: several unrelated areas at once

RETIRED — never emit: ⚙️ 🧹 ♻️ 🐛 📝 📖 🔥 🚀 🔨 🔼 ⬆️ 🌟 ✂️

- **scope**: kebab-case domain/product name (`sline`, `x-com-chat`, `themes`, `deps`).
  NEVER a conventional-commit type — `chore:`, `fix:`, `cleanup:`, `format:` are banned scopes.
- **description**: lowercase, imperative, no trailing period, concise (≲60 chars);
  `,`/`+` connectors for multi-item; `(vX.Y.Z)` parenthetical for version-stamped work;
  em-dash clarifiers allowed.
- **Batch rule**: one dominant change + small riders → dominant emoji/scope, riders as body
  bullets (`- riding along: …`). No dominant change, many scopes → 🍱 with an umbrella scope
  (`repo`, `apps`, `misc`).

### Splitting — several commits are normal

Judge by **concerns**, not by size. A concern is one thing a reader would want to read,
revert, or bisect on its own.

- Split when the tree holds more than one: unrelated areas touched in one session, separate
  standalone features, work piled up uncommitted for hours.
- Keep as one commit when the bulk is a single concern however large: a scaffolded app, a
  generated migration, a repo-wide rename. Volume alone never forces a split — 🍱 exists for
  work genuinely inseparable across scopes.
- Mechanics: `git add <paths>` per commit instead of `-A`, ordered so each commit leaves the
  tree working. Print the whole plan as subject lines before the first commit; one confirm
  covers the set.

## 3 · Author identity

🚫 **The shared fleet identity is RETIRED — never pass `-c user.name` / `-c user.email`.**
Commit under Dima's configured identity, no flags. GitHub cannot match `fleet@x-com.local` to
an account, so the verified badge dies; Dima wants verified commits. The full investigation
(and why the author field never drove the Linear assign) lives in
`~/dotfiles/docs/agents/linear-github-assign.md`.

📌 **The agent fingerprint is the trailer, not the author field.** Every agent commit carries
the Co-Authored-By line (§4) and Dima's hand-typed commits do not, so
`git log --grep='Co-Authored-By: Claude'` is the filter that tells the two apart.

## 4 · Body

- Hyphen bullets, one change per line, `subject: what changed`; `→` for before/after
  (`- model: sonnet → fable-5`). Prose paragraphs only for single-concern commits needing a why.
- 📦 bodies: `pkg old → new` lines + `- regenerate pnpm-lock.yaml`.
- End: blank line + `Co-Authored-By: Claude <current runtime model> <noreply@anthropic.com>`.

## 5 · Linear magic words

Linear↔GitHub **issue sync is off** — tickets must never leak to GitHub. **Commit and PR
linking stay on**, and are the only thread tying code back to its ticket. So the words matter:

- **Non-closing** (link only): `ref` `refs` `references` `part of` `contributes to` `toward` `towards`
- **Closing** (moves the ticket): `close(s|d)` `fix(es|ed)` `resolve(s|d)` `complete(s|d)` `implement(s|ed)`
- **Relation only**: `relates to` `related to`
- Placement: PR **title/description** and **commit messages** work. PR **comments do not**.
  A branch name needs the bare id, no magic word.

### Default lane — commit to `main`

Dima's lane: no branch, no PR, commit and push. The **commit body carries everything**.

- **Every commit touching the work**: a `- ref DOT-N` line.
- **Close on the last one**: replace it with `Closes DOT-N` when the commit finishes the
  ticket. One close per ticket, never repeated.
- **No ticket → no id.** Most commits have none. The id comes from the conversation, the
  branch name, or Dima — nowhere else. Never guess, never grep for a plausible match, never
  write `DOT-?`. Omitting the line is always correct.
- **Never close on Dima's behalf without saying so.** A closing keyword resolves the ticket
  AND assigns it. Name the ticket you are about to close in the reply.
- 🎯 **A commit body is PARSED, not read — writing *about* a magic word IS using one.** Linear
  cannot tell a quotation from an intent (measured: a quoted example assigned Dima and moved
  the ticket five seconds after push). **Before pushing, grep the body for the id pattern and
  count the hits** — the count is what fires, never the intent. Reword any mention not meant
  to link: say "a `ref` line naming the ticket", never the literal pair.
- Scoped to Dima's tracker (`DOT`/`BYT`); an oss repo's conventions belong to that project.

### What a push actually does to the ticket

- A `ref`-carrying push links the commit onto the ticket (Resources block, ~15s) — and has
  been measured to also move state and write the assignee. 🧪 **The auto-assign story is
  suspended, under observation**: after any ref-carrying push, read the ticket's assignee and
  state and say in the reply what Linear did. Do not correct it silently; if a ticket ends up
  assigned to Dima wrongly, tell him. Full history and falsified fixes:
  `~/dotfiles/docs/agents/linear-github-assign.md`.
- **PR events** (exception lane): `start` → In Progress, `review` → In Review, `merge` → Done,
  wired on both teams. No `draft` row — a draft PR jumps straight to In Review.
- Reading a Resources entry: a `Non-closing` badge means link-only; **no badge means it closed
  the ticket** — Linear marks the exception, not the norm.

### Exception lane — pull requests

Only for cloud-agent branches (`claude/…`) and anything Dima explicitly opens a PR for.
Branch commits carry `- ref DOT-N`, never a closing keyword; the **PR description carries
exactly one** `Closes DOT-N`. For a branch never checked out here, write the keyword with
`gh pr edit`, never by rewriting remote commits.

### Wiring a new repo

Commit linking needs a **manual push webhook per repo**; the `Link commits to issues with
magic words` toggle alone does nothing. Wired: `dotfiles`, `bytes`. New repo: Linear settings
→ integrations → GitHub → flip that toggle off/on to reopen the setup modal → copy payload
URL + secret → repo webhooks → add (json, push event only) → Done.
⚠️ All repos share **one** `githubCommit` integration — flipping the toggle mints a new
endpoint and silently breaks every existing webhook. Linking dead everywhere at once → repoint
each hook at the new URL/secret.

## 6 · Completion criterion

Done when `git log -1` shows the new hash (a silent no-op and a silent sweep are both observed
failures), the tree holds nothing staged the plan did not name, and — before any push — the
body's ticket-id-pattern hits are counted and each one is intended. Say the hash.

## 7 · Guardrails

- Sanity check before every commit: leftover debug/test code, commented-out code, stray
  debuggers → pause, report, resume when resolved.
- Pre-commit hook failure → never self-fix; summarize and stop.
- `git add -A` unless told otherwise, or when splitting (§2).
