---
name: no-perm-ops-on-mobile
description: "When Dima writes from mobile, never run operations that trigger permission dialogs."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8ea12526-5405-4c3b-8de4-519b32e3e1d8
  modified: 2026-08-17T01:33:14.273Z
---

When Dima is writing from a phone or iPad, do **not** run any operation that can throw a
permission dialog. No file edits (especially anything under `.claude/`), no `git push`, no
installers, no shell calls outside his pre-approved allow list.

Allowed on mobile: read-only work, web research, and CLI paths already in `permissions.allow` —
notably `linear` (`Bash(linear:*)`), which is why ticket work is safe from mobile and file work
is not.

**Why:** iPadOS offers only "allow once" / "deny", with no "always allow", and the virtual
keyboard shifts as the dialog appears — so he hits deny by accident and loses the session
mid-operation. On 2026-08-17 he answered roughly 40 dialogs in one night. The agents never saw
them; every call returned instantly from their side. See.

**How to apply:** queue anything that needs approval into the handoff for the next Mac session,
and tell him it's queued. If something genuinely cannot wait, say what it will cost him in
dialogs *before* starting, and bundle it into one edit + one commit. Default to deferring.
