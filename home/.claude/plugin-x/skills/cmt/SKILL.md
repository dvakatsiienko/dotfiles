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

## 2.5 · Author identity, and the assign that survives it

🚫 **The shared fleet identity is RETIRED. Never pass `-c user.name` / `-c user.email` on a
commit.** Commit under Dima's configured identity like any other commit — no flags, no
`git config`, nothing per-commit.

**Why it was dropped, measured on github's api:**

| commit | author | github says |
| --- | --- | --- |
| `5170da6` | `dima's fleet <fleet@x-com.local>` | `verified: false`, reason `no_user`, no author link |
| `f12b64b` | Dima | `verified: true` |

The 1Password ssh signature is still good locally (`%G?` = `G`) either way — but github cannot
match `fleet@x-com.local` to an account, so the badge dies and the commit shows no author. Dima's
call, and it is explicit: **he wants verified commits.**

**The agent fingerprint is the trailer, not the author field.** Every agent commit already carries

```
Co-Authored-By: Claude <model> <noreply@anthropic.com>
```

and Dima's hand-typed commits do not. So `git log --grep='Co-Authored-By: Claude'` is the filter —
it costs nothing, it is written automatically, and it keeps the badge. 📌 the author field never
worked as that filter anyway: agent commits landed under **both** identities for weeks.

📌 This has nothing to do with the linear assign below. The fleet identity was only ever a
*candidate* fix for that, and it was falsified — see next.

🚨 **but it does NOT stop the linear assign. that was tested and falsified.**

The theory was that `fleet@x-com.local` maps to no github account, therefore to no linear user,
therefore nobody to assign. The experiment: one commit carrying `- ref DOT-182`, authored under
that identity, pushed. Measured on the ticket seconds later:

- ✅ the `githubCommit` attachment landed — magic words work, parsed from the **commit message**
- ❌ **Dima was assigned anyway**, and the history records the actor as Dima himself

So linear resolves the actor from the **pusher** — the github account that pushed — not from the
commit author. The author field was never in play.

**Three candidate knobs were checked and none of them is the lever:**

- the github integration panel — branch format, linkbacks, external review tool, and
  `Link commits to issues with magic words`. No assignee option exists.
- `userSettings.autoAssignToSelf` — already `false`, and the assign fires regardless.
- `~/.config/linear/linear.toml` `issue_create_assign_self = "never"` — a **client-side** guard on
  the cli's `issue create`. The push assign happens server-side; no cli config reaches it.

### the working fix: reverse it, do not prevent it

Dima wants the magic words. So keep them and undo the side effect.

**After any push whose commits carried `- ref DOT-N` or a closing keyword, unassign those
tickets** — unless Dima assigned himself deliberately, in which case leave it alone.

```sh
linear api 'mutation { issueUpdate(id: "DOT-N", input: { assigneeId: null }) { success } }'
```

- do it in the same turn as the push, never "later"
- name it in the reply, so the unassign is visible rather than silent
- 📌 a closing keyword (`Closes DOT-N`) assigns too. The unassign applies there as well; a Done
  ticket assigned to Dima is the same false signal as an open one.

🚨 **the reversal has TWO jobs, not one — the second was missed until it was measured.** A plain
`- ref DOT-N` also moves the ticket `Todo → In Progress` on push (§3.1). So after the unassign:

- **did this commit actually start that work?** yes → leave In Progress, it is now true. no → put
  the state back. Referencing a ticket while answering one question that belongs to it is the
  common case, and it is not the same as starting it.
- ⚠️ **never revert a state Dima set himself.** Read the issue history before assuming the
  integration did it: the push writes state and assignee in one instant under one actor, so a
  matching timestamp is the tell.

📌 Two reversals per push is why this wants to be a hook rather than a habit — [DOT-159](https://linear.app/x-com/issue/DOT-159) carries the
build. Until it exists this is manual, and Dima has said plainly that he dislikes it. Do it anyway,
and do not let it go silent.

⚠️ **inferred, not documented.** Linear documents the magic words and the status moves; it
documents the assign nowhere. The pusher-not-author conclusion is measured behaviour, not a
vendor-stated contract.

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
- ⚠️ **The assign is not limited to closing keywords — plain `- ref DOT-N` fires it too.** Measured
  2026-08-21: two tickets took an assignee-only write **one second after a push**, from commits
  carrying `ref` and no closing word. So swapping `Closes` for `ref` was never an escape hatch,
  and any advice that said otherwise was wrong.
- 🚨 **§2.5's fleet author identity does NOT stop it — tested and falsified.** Linear reads the
  pusher, not the commit author. The working fix is to **unassign after the push**, in the same
  turn, and say so in the reply. See §2.5 for the mutation and the three knobs already ruled out.
- So the keyword choice is about the ticket's **state** and nothing else: `Closes DOT-N` to finish
  it, `- ref DOT-N` to link only. Scoped to Dima's tracker (`DOT`/`BYT`); an oss repo's closing
  conventions belong to that project.

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
- **Commits to `main`** need no PR — commit linking is a separate mechanism, verified end to end on
  DOT-78 and DOT-80. The commit lands on the ticket in a **Resources** block within ~15s.
- 🚨 **but a pushed commit is NOT link-only, and this was wrong here for weeks.** An earlier version
  of this bullet said commits to `main` "fire none of those". Measured on DOT-159: one push carrying
  a plain `- ref DOT-159` produced **two writes in the same instant** — `Todo → In Progress` **and**
  `assignee: none → Dima`. Same actor, same timestamp, read out of the issue history.
  So a non-closing `ref` moves the state as well as the assignee. A closing keyword moves it to Done.
  **The reversal in §2.5 therefore has two jobs, not one: unassign, and put the state back** where
  the commit did not actually start the work. 📌 the old claim came from a PR-vs-commit test that
  compared linking behaviour and never looked at the state field — the check was narrower than the
  conclusion drawn from it.
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
