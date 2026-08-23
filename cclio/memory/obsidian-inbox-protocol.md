---
name: obsidian-inbox-protocol
description: "the obsidian prompts folder is cclio's personal inbox — check every session start, must end empty"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: dc57452a-52fe-4348-bc85-3cf0cccf12f2
  modified: 2026-08-19T06:27:55.185Z
---

Dima's Obsidian vault folder `/Users/dima/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Dima's Vault/prompts/` is the coordinator's personal email. `inbox.md` = raw dumps from Dima (mobile → iCloud sync). `flowlog.md` = the coordinator's processing copy with statuses.

**Why:** Dima gens ideas away from Mac; Apple Notes → mega-paste was lossy. Inbox persists as fault-comparison source until exhausted.

**How to apply:** cclio reads the folder directly — it has a real filesystem, nothing is mounted. Check inbox.md at every session start, first thing — it must always end empty. Process gradually: copy items into flowlog.md with ✅/🚧/❓ statuses, delete from inbox.md only after Dima approves the processing. Adopted 2026-08-19.

✅ **Unfrozen by Dima 2026-08-21**, along with every handoff. The freeze is over; the protocol is
live again. `protected.md` in the same folder is his own drop file — read-only, never ours to edit.

📌 **the two logs are different things and the names now say so.** `flowlog.md` in obsidian is the
**work** journal — what we are doing, statuses, carry-over; dima's word: *«our work is a flow, not
work»*. `~/.claude/shelf/flawlog/` is the **flaw** journal — process defects caught mid-session.
one tracks the flow, one tracks the flaws. never write a flaw into the obsidian file or a task
into the repo one.
