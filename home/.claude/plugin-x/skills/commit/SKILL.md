---
name: commit
description: Branded commit authoring — format, emoji canon, steering keywords, worktree mirroring. Load EVERY time a git commit is about to be created, in any repo, whether the user typed /commit or just asked to commit mid-conversation.
argument-hint: "[y] [mir] [push] [correction…]"
---

# Commit

## 1 · Steering — parse $ARGUMENTS first, strict composition

Three keywords: standalone words, case-insensitive, ANY order, composable.
Strip them; ALL remaining text = correction instruction (reword, rescope, …).

| keyword | meaning |
| ------- | ------- |
| `y`     | skip the confirm — the ONLY thing that ever skips it, no exceptions |
| `mir`   | after committing, mirror into local main across worktrees (§4) |
| `push`  | also update the remote: alone → push current branch; with `mir` → push main |

No `y` → draft the message, print it, wait for "y"/correction — THEN run the
full pipeline (commit + mir + push, whatever was requested).
`y` present → execute everything immediately, zero questions.
Examples: `/commit` ask · `/commit y` autonomous · `/commit mir` mirror with confirm ·
`/commit y mir push` sync everywhere, no questions.

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
