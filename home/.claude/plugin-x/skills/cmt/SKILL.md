---
name: cmt
description: Branded commit authoring — format, emoji canon, steering keywords, worktree mirroring. Load EVERY time a git commit is about to be created, in any repo, whether the user typed /cmt or just asked to commit mid-conversation.
intended-models: sonnet
argument-hint: "[y|y+] [mir] [push|push+] [correction…]"
---

# Commit

## 1 · Steering — parse $ARGUMENTS first, strict composition

Five keywords: standalone words, case-insensitive, ANY order, composable.
Strip them; ALL remaining text = correction instruction (reword, rescope, …).

| keyword | meaning |
| ------- | ------- |
| `y`     | skip the confirm, this invocation only |
| `y+`    | skip the confirm for the rest of the session (§1.1) |
| `mir`   | after committing, mirror into local main across worktrees (§4) |
| `push`  | also update the remote, this invocation only: alone → push current branch; with `mir` → push main |
| `push+` | do what `push` does, and keep doing it for the rest of the session (§1.2) |

No `y`/`y+` → draft the message, print it, wait for "y"/correction — THEN run the
full pipeline (commit + mir + push, whatever was requested).
`y` or `y+` present → run the pipeline unprompted, zero questions.

**Every keyword grants permission, never timing.** `y`, `y+`, `push`, `push+` all mean
"you may, without asking" — none of them means "right now". Pick the moment yourself:
a commit lands when the work is complete and verified, at a boundary a reader would want
to bisect on, not mid-edit because a keyword arrived. Committing broken work fast is worse
than committing good work late. When Dima wants it this instant he says so in words —
"commit now", "push it" — and that overrides your judgment of the moment, not the format.
Examples: `/cmt` ask · `/cmt y` autonomous once · `/cmt y+` autonomous from
here on · `/cmt mir` mirror with confirm · `/cmt y mir push` sync everywhere ·
`/cmt y+ push+` hands the whole session over: commit and push, never ask again.

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

`y+` grants what `y` grants, and keeps it: every later commit in this session runs
unconfirmed, whether invoked as `/cmt` or asked for in passing. It stays on until the
session ends or Dima revokes it — a `/clear` or a fresh session drops it, and it is
never carried across a handoff.

`y+` covers the confirm only. `mir` and `push` are still per-invocation — a standing
yes never reaches a remote on its own. Standing pushes need `push+`, asked for separately.

### 1.2 · `push+` — standing push

`push+` grants what `push` grants, and keeps it: every later commit in this session pushes
when it lands, whether invoked as `/cmt` or asked for in passing. It stays on until the
session ends or Dima revokes it — same lifetime as `y+`, and equally never inherited by a
successor thread. A standing remote is granted by the person in the room, not by a file.

While `push+` is on, §1.0's never-push-mid-session default is suspended — that default
exists to stop unasked-for remote writes, and `push+` is the ask. The end-of-session
"how many commits are unpushed" question also goes quiet, because the answer is always zero.

`push+` says nothing about the confirm. Without `y`/`y+` a commit is still drafted and
shown first; `push+` only decides what happens after Dima approves it.

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

Linear↔GitHub **issue sync is off** — tickets must never leak to GitHub. **Commit and PR linking
stay on**, and are the only thread tying code back to its ticket. So the words matter.

- **Non-closing** (link only): `ref` `refs` `references` `part of` `contributes to` `toward` `towards`
- **Closing** (moves the ticket on merge): `close(s|d)` `fix(es|ed)` `resolve(s|d)` `complete(s|d)` `implement(s|ed)`
- **Relation only** (no transition): `relates to` `related to`
- Placement: PR **title/description** and **commit messages** work. PR **comments do not**.
  A branch name needs the bare id, no magic word.

### Default lane — commit to `main`

This is how Dima works: no branch, no PR, commit and push. The **commit body carries everything**.

- **Reference on every commit that touches the work**: a `- ref DOT-N` line.
- **Close on the last one**: replace that line with `Closes DOT-N` when the commit finishes the
  ticket. One close per ticket, never repeated.
- **No ticket → no id.** Most commits have none. Never guess, never grep for a plausible ticket,
  never write `DOT-?`. Just omit the line. The id comes from the conversation, the branch name,
  or Dima — nowhere else.
- **Never close on Dima's behalf without saying so.** A closing keyword resolves a ticket AND
  assigns it to the commit author. Name the ticket you are about to close in the reply.
- ⚠️ **That assign is a real cost, not a footnote** — in `dotfiles` and `bytes`, where commits are
  authored by Dima, so `Closes DOT-N` silently makes him the assignee, which
  `rules/ticket-flow.md` otherwise forbids outright. Scoped to his own tracker (`DOT`/`BYT`); an
  oss repo's closing conventions belong to that project. The keyword is not banned; the choice just has to be deliberate. Ticket should stay
  unassigned? Use `- ref DOT-N` and close it by hand with
  `linear issue update DOT-N --state Done`.

### Exception lane — pull requests

Only for cloud-agent branches (`claude/…`) and anything Dima explicitly opens a PR for.

- Commits on the branch carry `- ref DOT-N`, never a closing keyword.
- **PR description carries exactly one** `Closes DOT-N`. A multi-commit branch still closes once.
- For a branch that was never checked out here, write the keyword with `gh pr edit`, never by
  rewriting remote commits.

### What actually fires

- **PR events** — `start` → In Progress, `review` → In Review, `merge` → Done, wired on both
  teams (verified 2026-08-16 via `team.gitAutomationStates`). No `draft` row, so a draft PR jumps
  straight to In Review. `Team.*WorkflowState` reads null even when automations exist; it is
  legacy, never diagnose from it.
- **Commits to `main`** fire none of those. Commit linking is a separate mechanism and needs no
  PR — verified end to end on DOT-78 and DOT-80, 2026-08-16. The commit lands on the ticket in a
  **Resources** block within ~15s; a closing keyword also moves it to Done and assigns it.
- Reading a Resources entry: a `Non-closing` badge means link-only. **No badge means it closed
  the ticket** — Linear marks the exception, not the norm.

📌 Commit linking needs a **manual push webhook per repo**; the `Link commits to issues with magic
words` toggle alone does nothing. Wired: `dotfiles`, `bytes`. A new repo needs its own — Linear
settings → integrations → GitHub → flip that toggle off and on to reopen the setup modal → copy
payload URL + secret → repo settings → webhooks → add, content type `application/json`, push event
only → back to Linear, click Done.

⚠️ All repos share **one** `githubCommit` integration. Flipping that toggle destroys it and mints
a new endpoint, silently breaking every existing webhook. If linking stops working everywhere at
once, that is why — repoint each hook at the new URL and secret.

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
