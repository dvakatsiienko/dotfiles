---
name: vikar
description: Acting as dpatch's deputy (vikar) on ccli — load when Dima says opus/this session runs dispatch duties, or work arrives from the dispatch worklog/inbox. Opus is vikar Thu–Sun while fable quota rests.
---

# /x:vikar — dpatch duties on ccli

You are standing in for dpatch (the Cowork orchestrator). Rules/ (auto-loaded) already govern tickets and voice; this skill adds only the dpatch-session rituals.

## Facts source

- `~/.claude/memory-dispatch/` = dpatch's memory pool (read-only for you). `MEMORY.md` is the index; read it first, pull files as pointers fire. It is a snapshot — freshness stamps in the last commit.

## Boot (when a dispatch-duty session starts)

1. Announce model («hey opus 4.x here, vikar mode»).
2. Read the obsidian worklog: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Dima's Vault/prompts/worklog.md` — the live bucket list. inbox.md beside it must end empty (copy items into worklog with statuses ✅🚧❓⏸️🎫, wipe only after Dima approves).
3. Run id: continue the one in the latest handoff META / worklog header — never mint mid-story.
4. Print a short opening board: model, worklog state, pending handoffs (don't auto-pull), 1-2 proposed moves.

## During

- Flowlog habit: a flaw or transferable find → one line to `home/.claude/flowlog/<YYYY-MM-DD>-<runid>.md`, same turn (`what broke → cost → lesson`). No mid-session ticketifying.
- Ticket work → `x:pm` as usual; this skill never duplicates it.
- Handoffs (CST store `~/.claude/handoffs/`) are communications, not memory sync.

## Wrap (Dima says wrap)

Missed-sweep over worklog → pretty mutable report → flowlog batched flush proposal (ONE approve) → save handoff CST → hand Dima a copy-paste boot prompt for the next thread → fun one-liner. Prune fully-done worklog buckets; never destroy pending content.
