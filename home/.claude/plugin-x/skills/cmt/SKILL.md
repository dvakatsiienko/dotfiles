---
name: cmt
description: Branded commit authoring — format, emoji canon, steering keywords, worktree mirroring. Load EVERY time a git commit is about to be created, in any repo, whether the user typed /cmt or just asked to commit mid-conversation.
argument-hint: "[y|y+] [mir] [push] [correction…]"
---

# Commit

## 1 · Steering — parse $ARGUMENTS first, strict composition

Three keywords: standalone words, case-insensitive, ANY order, composable.
Strip them; ALL remaining text = correction instruction (reword, rescope, …).

| keyword | meaning |
| ------- | ------- |
| `y`     | skip the confirm, this invocation only |
| `y+`    | skip the confirm for the rest of the conversation (§1.1) |
| `mir`   | after committing, mirror into local main across worktrees (§4) |
| `push`  | also update the remote: alone → push current branch; with `mir` → push main |

No `y`/`y+` → draft the message, print it, wait for "y"/correction — THEN run the
full pipeline (commit + mir + push, whatever was requested).
`y` or `y+` present → execute everything immediately, zero questions.
Examples: `/cmt` ask · `/cmt y` autonomous once · `/cmt y+` autonomous from
here on · `/cmt mir` mirror with confirm · `/cmt y mir push` sync everywhere.

### 1.0 · Never push mid-session

Commits accumulate locally through a session; the remote is touched once, at the end.

- Without the `push` keyword: commit only. Never push, never offer to push mid-thread.
- With `push`: honour it — an explicit keyword always wins over this default.
- `y+` never implies `push`. A standing confirm is not a standing remote.
- At session end — before a handoff, a `/clear`, or when Dima says he is done — say how
  many commits are unpushed and ask once whether to push. One ask, not a nag per commit.

Reason: mid-session pushes publish half-finished thinking, and rewriting local history
afterwards stops being free the moment it is on the remote.

### 1.1 · `y+` — standing confirm skip

`y+` grants what `y` grants, and keeps it: every later commit in this conversation
runs unconfirmed, whether invoked as `/cmt` or asked for in passing. It stays on
until the conversation ends or Dima revokes it.

`y+` covers the confirm only. `mir` and `push` are still per-invocation — a standing
yes never reaches a remote on its own.

## 2 · Format — the brand

`[emoji] [scope]: [description]` — e.g. `🐞 sline: fix reset glyph rendering`

Emoji canon (stable, never random — banned glyphs listed so they never leak back):

| emoji | category |
| ----- | -------- |
| 🔧 | config, tooling, functional/feature work (the broad bucket) |
| 🐞 | bugfix |
| ✨ | refactor — behavior unchanged, shape changed (incl. renames, reformat, codemods) |
| 🗑️ | cleanup, deletion, dead-code extermination |
| 📦 | dependency bumps, lockfile refreshes (scope always `deps`) |
| 🎨 | themes, styles, visual/display formatting |
| 📡 | networking |
| 📜 | docs — README, CLAUDE.md, specs, ADRs, skill instructions |
| 🍱 | multi-scope bulk commit — post-vibecoding, several unrelated areas at once |

RETIRED — never emit: ⚙️ 🧹 ♻️ 🐛 📝 📖 🔥 🚀 🔨 🔼 ⬆️ 🌟 ✂️

- **scope**: kebab-case domain/product name (`sline`, `x-com-chat`, `themes`, `deps`).
  NEVER a conventional-commit type — `chore:`, `fix:`, `cleanup:`, `format:` are banned scopes.
- **description**: lowercase, imperative, no trailing period, concise (≲60 chars);
  `,`/`+` connectors for multi-item; `(vX.Y.Z)` parenthetical for version-stamped work;
  em-dash clarifiers allowed.
- **Batch rule**: one dominant change + small riders → dominant emoji/scope, riders as
  body bullets (`- riding along: …`). No dominant change, many scopes → 🍱 with an
  umbrella scope (`repo`, `apps`, or `misc`).

### Splitting — several commits are normal

Judge by **concerns**, not by size. A concern is one thing a reader would want to
read, revert, or bisect on its own.

Split when the working tree holds more than one:
- unrelated areas touched in one session (a restructure *and* a bugfix found on the way)
- separate features, each standing alone
- work that piled up because nobody committed for hours

Keep as one commit when the bulk is a single concern however large it is: a scaffolded
app, a generated migration, a lockfile refresh, a repo-wide rename. Volume alone never
forces a split — `🍱` exists for work genuinely inseparable across scopes.

Splitting: `git add <paths>` per commit instead of `-A` (§5), ordered so each commit
leaves the tree working — foundation first, then what builds on it. Print the whole
plan as subject lines before the first commit; one confirm covers the set.

## 3 · Body

- Hyphen bullets, one change per line, `subject: what changed`; `→` for before/after
  (`- model: sonnet → fable-5`). Prose paragraphs instead of bullets only for
  single-concern commits that need a why.
- 📦 bodies: `pkg old → new` lines + `- regenerate pnpm-lock.yaml`.
- End: blank line + `Co-Authored-By: Claude <current runtime model> <noreply@anthropic.com>`.

## 3.1 · Linear magic words

Linear↔GitHub **issue sync is off** — tickets must never leak to GitHub. **PR/commit linking
stays on**, and is now the only thread tying a PR back to its ticket. So the words matter.

- **Non-closing** (link only): `ref` `refs` `references` `part of` `contributes to` `toward` `towards`
- **Closing** (moves the ticket on merge): `close(s|d)` `fix(es|ed)` `resolve(s|d)` `complete(s|d)` `implement(s|ed)`
- **Relation only** (no transition): `relates to` `related to`
- Placement: PR **title/description** and **commit messages** work. PR **comments do not**.
  A branch name needs the bare id, no magic word.

Rules:

- **Commit body: reference, never close.** Add a `- ref DOT-N` line. Every commit on the branch
  may carry it.
- **PR description: exactly one closing keyword** — `Closes DOT-N`. One close per PR, never
  repeated per commit; a multi-commit branch still closes the ticket once.
- **No ticket → no id.** Most commits have none. Never guess, never grep for a plausible ticket,
  never write `DOT-?`. Just omit the line.
- The id must come from the conversation, the branch name, or Dima. Nowhere else.
- **Cloud-agent branches**: an agent may push a `claude/…` branch that was never checked out
  here. The PR description is still the place for the closing keyword — write it when opening
  or editing the PR (`gh pr edit`), not by rewriting the remote commits.

Status transitions **are** wired (verified 2026-08-16 via `team.gitAutomationStates`): both teams
carry `start` → In Progress, `review` → In Review, `merge` → Done. No `draft` row — a draft PR
jumps straight to In Review. The `Team.*WorkflowState` fields read null even when automations
exist; they are legacy. Never diagnose from them.

Those five events are all PR events. **Committing straight to `main` fires none of them** — the
commit still links to the ticket, but nothing moves unless the commit itself carries a closing
keyword.

## 4 · Worktree mirroring (`mir`)

Agentic tools (Conductor, t3code, Cursor agent view, …) run sessions in git worktrees;
commits strand on the worktree branch and the real checkout never sees them — and
vice versa. `mir` = after committing, local main holds the commit no matter where you stand:

1. Default branch via `git symbolic-ref refs/remotes/origin/HEAD` (fallback `master`).
2. `git worktree list --porcelain` → find the checkout holding the default branch.
3. Already on it → nothing to mirror. Else `git -C <main-checkout> merge <branch>` —
   `-C`, never `cd`.
4. Fast-forward only. Diverged → STOP and report; never auto-resolve, never force.
5. `push` alongside `mir` → `git -C <main-checkout> push origin <default-branch>`,
   ff-only, stop on divergence. Without `push`, never touch a remote.
6. Single-worktree repo → skip mirroring silently; `push` still applies.
   Repo-agnostic: always the invoking repo's own main.

## 5 · Guardrails

- Sanity check before every commit: leftover debug/test code, accidentally
  commented-out code, stray debuggers → pause, report, resume when resolved.
- Pre-commit hook failure → never self-fix; summarize and stop.
- `git add -A` unless told otherwise, or when splitting into several commits (§2).
