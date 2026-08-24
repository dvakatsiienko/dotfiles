---
spec: ccli coordinator mvp
ticket: DOT-188
status: draft — awaiting Dima's go
written-by: dpatch (opus 5)
drafted: 2026-08-21
---

# ccli coordinator — mvp spec

## the change in one line

dpatch stops being a dispatch-desktop brain. the coordinator becomes **cclio**, a Claude Code
session sitting in `~/dotfiles/cclio`. dispatch-desktop degrades to a remote window with no memory of its own.

## why (evidence, not taste)

- dispatch has **no model knob**. `start_task` inherits whatever the app decides. the kebab→ghost
  workaround is undocumented UI that can vanish in any release — and if it does, model selection
  is gone entirely.
- dispatch has **no auto-load layer**. `dpatch-init` exists almost only to hand-simulate one:
  re-mount dirs (grants never persist), re-read rules, re-read announcements. on ccli that is the
  session merely starting.
- dispatch is the **only surface holding a second memory store**. deleting it deletes the whole
  divergence problem — DOT-28's story, and 165 / 168 / 186 with it.
- measured symptom: ccli boot context grew ~50k to ~67k tokens in a week, unopened. a coordinator
  must not carry a coder's context.

## the two roles

| | **ccli-coord** (this agent) | **ccli-code** (spawned) |
|---|---|---|
| sits in | `~/dotfiles/cclio` | the target project dir |
| model | opus (or fable when quota allows) | opus, chosen per task |
| loads | global CLAUDE.md + cclio project scope | global CLAUDE.md + that project's scope |
| memory | coordinator memory: routing, tracker conventions, fleet facts | none of the coordinator's |
| owns | linear, planning, spec, review, memory | edits, tests, commits |
| context budget | small and flat, must survive a long day | large and disposable |

## config layout — the mechanism

**`CLAUDE_CONFIG_DIR` is rejected.** Undocumented, and it leaks: CLAUDE.md loads from both the
custom dir and real `~/.claude/` simultaneously; plugin state stays pinned to `~/.claude/plugins/`;
a `.claude/` at-or-above cwd overrides the selected profile; credential paths are inconsistent.
Refs: anthropics/claude-code issues 30230, 15071, 80791, 37570. Detail in
`docs/research/cc-extension-surfaces.md`.

**Project scope instead** — documented, already in use, zero bleed:

```
~/.claude/CLAUDE.md          shared-by-both only. shrinks hard.
~/.claude/rules/*.md         shared always-loaded layers. audited for coder-only content.

~/dotfiles/cclio/            ccli-coord's home. git-tracked in dotfiles.
  CLAUDE.md                  coordinator charter. auto-loads ONLY here.
  .claude/
    commands/                coordinator rituals as slash commands
    agents/                  research and review subagent definitions
  memory/                    coordinator memory: MEMORY.md index + leaf files
```

ccli-code never cds into `~/dotfiles/cclio`, so it never sees any of it. No env var, no bleed.

## the delegate-vs-do-it-yourself rule

Dima's take, adopted: the coordinator **may edit**, and should, because editing forces a peek into
the project — the same peek that lets it review what ccli-code is doing. Codified:

- **do it yourself** when: single file, no test run needed, under ~30 lines changed, or it is
  config / docs / tracker. Also: any edit inside a project ccli-code is currently working, *because
  the peek is the point* — read the diff while you are in there.
- **spawn ccli-code** when: multi-file, needs a test or build loop, needs a long read of unfamiliar
  code, or would burn more than ~15k of coordinator context.
- **never** spawn for something one pass finishes (existing rule: match ceremony to the task).
- while ccli-code runs, the coordinator pair-programs rather than waits: read its diffs, flag drift
  from this spec, keep the tracker honest. Never block the foreground on a wait.

## mvp scope — what "done" means

1. `~/dotfiles/cclio/` exists with CLAUDE.md + memory/ + commands/, git-tracked under dotfiles.
2. coordinator memory written fresh — **not copied** from dispatch memory. Ported by hand, one
   pass, with the context-budget guidance from `docs/agents/authoring-memory.md` applied.
3. global `~/.claude/CLAUDE.md` trimmed to shared-only; coder-specific content pushed down.
4. five rituals exist as slash commands in cclio scope: `/init`, `/graceful-halt`, `/report`,
   `/queue`, `/remind`.
5. one real spawn proven: coordinator dispatches an opus ccli-code session, watches it, reads the
   result, comments on the ticket.
6. dispatch-desktop still boots and reads the same tracker — as a window, holding nothing.

## explicitly out of mvp

- the custom harness (below)
- skill sync machinery between surfaces — **deleted by this change, not built**
- memory-dispatch submodule swap (DOT-115)
- the visibility layer — after mvp

## harness — deferred, not refused

Dima wants one and it is interesting. Research says the minimum viable version is ~12 lines of bash
(`claude -p --output-format json --resume`) or ~55 lines of TypeScript against the Agent SDK with a
`spawn_coder` in-process MCP tool. Detail in `docs/research/agent-harness-building.md`.

Position: build it **after two weeks** of running the plain two-session setup, so it encodes what is
actually missing rather than what we assume is missing. If the only gap left is remote access, the
harness is a shim, not a project.

## open questions for Dima

1. do `inbox.md` / `worklog.md` stay in obsidian, or move into `~/dotfiles/cclio/`? obsidian gives
   phone access; the repo gives git history and one-mount simplicity.
2. ~~new repo, or a directory inside dotfiles?~~ **decided 2026-08-21: a plain directory in
   dotfiles at `cclio/`.** dotfiles is the fleet repo; a fleet coordinator does not get its own.
   the standalone `~/cclio` repo (3 commits, last `e4274cb`) is retired.
3. does dispatch-desktop keep any memory at all, or hard-zero?

## verification

- boot ccli-coord cold, measure resident context. target **under 25k**. record the number.
- boot ccli-code in `~/projects/bytes` cold, confirm zero coordinator content leaked.
- run one full loop: ticket, spec, spawn, review, close.

## amendment — the four-layer memfile stack (DOT-195)

The coordinator was specced to live outside `~/projects/`. Reason: the layer stack is

```
~/.claude/CLAUDE.md          shared by both roles. tiny.
~/projects/CLAUDE.md         ccli-code global — the layer that was missing
~/projects/<proj>/CLAUDE.md  project specific
~/dotfiles/cclio/CLAUDE.md           coordinator only
```

A coordinator sitting under `~/projects/` would inherit the coder-global, defeating the split.

UNVERIFIED and blocking: that ccli walks up to an arbitrary ancestor such as `~/projects/`. Test
with a marker line before building on it. Fallback: a symlinked stub per project, or `@import`.

📌 **amended 2026-08-21 (verified).** `~/projects/CLAUDE.md` does not exist — the coder-global
layer in the stack above is planned, not real. So `~/projects/` contaminates nothing today, and
the isolation argument rests on a layer that has yet to be written. Note also that
`~/.claude/CLAUDE.md` is user-scope and loads in **every** session regardless of cwd, so cclio
already inherits it; location cannot buy isolation from that one.

📌 **superseded 2026-08-21.** the coordinator now sits at `~/dotfiles/cclio` — inside
`~/projects/`. safe only while the coder-global does not exist. **before DOT-195 creates it, the
dotfiles repo relocates to `~/dotfiles` with cclio aboard.** blocking ordering constraint, not a
preference; recorded on [DOT-202](linear://linear.app/issue/DOT-202).
