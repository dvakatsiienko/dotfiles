---
name: obsidian-inbox-protocol
description: "Obsidian prompts folder is dpatch's personal inbox — check every session start, must end empty"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: dc57452a-52fe-4348-bc85-3cf0cccf12f2
  modified: 2026-08-19T06:27:55.185Z
---

Dima's Obsidian vault folder `/Users/dima/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Dima's Vault/prompts/` is the coordinator's personal email. `inbox.md` = raw dumps from Dima (mobile → iCloud sync). `worklog.md` = the coordinator's processing copy with statuses.

**Why:** Dima gens ideas away from Mac; Apple Notes → mega-paste was lossy. Inbox persists as fault-comparison source until exhausted.

**How to apply:** cclio reads the folder directly — it has a real filesystem, nothing is mounted. Check inbox.md at every session start, first thing — it must always end empty. Process gradually: copy items into worklog.md with ✅/🚧/❓ statuses, delete from inbox.md only after Dima approves the processing. Adopted 2026-08-19.

⚠️ **Both files are currently FROZEN by Dima** — do not touch them until he unfreezes. Frozen state
is reported at boot and then left alone.

📌 The dpatch original said to *mount* the folder each session. That step does not exist on cclio.
