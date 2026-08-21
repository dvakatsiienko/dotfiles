---
name: no-destructive-ops-under-bypass
description: Dima runs agents with approvals bypassed — never delete or overwrite anything on his filesystem.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8ea12526-5405-4c3b-8de4-519b32e3e1d8
  modified: 2026-08-17T01:58:17.424Z
---

Dima has turned approvals off in places (Dispatch `Code permissions`, per-agent skip-all-approvals).
His words, 2026-08-17: *"you must not delete important files on my fs"*.

With approvals bypassed there is **no second gate** — the dialog that would have caught a mistake
is gone, so judgment is the only guardrail left.

**Never, without an explicit request naming the specific target:** `rm` of any kind, `git reset
--hard`, `git checkout` over uncommitted work, force-push, truncating or overwriting a file whose
contents were not read first, moving files out of a directory he uses, or cleaning/pruning
anything.

**Why:** he removed the approval prompts to remove friction, not to grant destructive authority.
Bypass makes his trust cheaper to violate, not broader. A deletion he did not ask for is
unrecoverable in a way a bad edit is not.

**How to apply:** prefer additive changes. Read before overwriting. When a task seems to require
removing something, ask first even though nothing will stop you — the absence of a prompt is not
consent. See [[no-perm-ops-on-mobile]] for the mirror rule when he is on mobile.
