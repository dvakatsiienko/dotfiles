---
name: dpatch-refresh-cclio-sysprompt
description: Re-scan the CURRENT dpatch system prompt, diff it against the last saved scan, and propose which newly-appeared entries are worth folding into ~/projects/dotfiles/cclio/CLAUDE.md. Load when Dima types /dpatch-refresh-cclio-sysprompt, or asks to re-harvest the dispatch prompt after a desktop app update.
intended-models: opus, fable
argument-hint: ""
---

# dpatch-refresh-cclio-sysprompt

anthropic updates the dpatch system prompt. some of what lands there is genuinely good and does
NOT reach `cclio`, because `cclio` runs a different harness with a prompt we author ourselves.
this skill harvests the good parts instead of re-deriving them.

**runs on dpatch only.** `cclio` cannot read the dpatch prompt; it is not in its context.

## the three files

- **the saved scan** — `~/projects/dotfiles/docs/agents/system-prompt-dpatch.md`. the last known
  shape, in load order, with per-block notes.
- **the target** — `~/projects/dotfiles/cclio/CLAUDE.md`. what we may propose changing.
- **the ticket** — DOT-181.

## run

1. **re-scan.** walk your own system prompt top to bottom, in load order. produce the same table
   shape the saved scan uses: number, block name, what it carries. do not summarise from memory —
   read what is actually there this session.
2. **diff.** compare against the saved scan. classify every difference:
   - **new** — a block that was not there before
   - **changed** — same block, different content
   - **gone** — a block that disappeared
   - **renumbered only** — ignore these, ordering churn is noise
3. **judge each new or changed block against one test**: does it carry a rule that a `cclio`
   session would otherwise get wrong, and that nothing in the four-layer `CLAUDE.md` stack
   already covers? if not, it is noop. **most blocks are noop. say so and move on.**
4. **reject on sight** — surface-bound blocks never port: artifacts, `credential_autofill`,
   computer-use tiers, the dispatch orchestrator block, `ask_user_question_tool`, the
   `/sessions/<name>/mnt/` shell mapping, `SendUserMessage`, the deferred tool manifest, the
   skills manifest.
5. **update the saved scan in place.** never write a second dated scan file — one file, current.
   refresh `researched:` and `sources-current-as-of:` in its frontmatter.
6. **propose, never apply.** print the exact diff you would make to `~/projects/dotfiles/cclio/CLAUDE.md` and stop.
   that file changes only with Dima's explicit yes.

## report shape

- **verdict line** — how many blocks changed, how many are worth porting. if zero, say
  «nothing worth porting» and stop there. no filler.
- 🔎 what changed in the dpatch prompt
- 📋 the proposed `~/projects/dotfiles/cclio/CLAUDE.md` diff, as a fenced block
- 📌 what you deliberately rejected and why, one line each
- ➡️ next step

## rules

- **noop is the expected outcome.** never propose an edit just to have proposed one.
- never invent a block that is not in the prompt this session.
- never widen scope into rewriting `~/projects/dotfiles/cclio/CLAUDE.md` — port a rule, do not restructure the file.
- the saved scan is the only durable artifact. everything else lives in the reply.
