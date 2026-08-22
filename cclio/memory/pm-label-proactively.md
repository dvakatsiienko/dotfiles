---
name: pm-label-proactively
description: "as PM, proactively apply labels on every issue create/update — keep the board labeled, evergreen style"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5e1b8add-1aa9-4f59-87dd-324c3cb6b0b7
  modified: 2026-08-19T15:18:32.922Z
---

Labels are not an afterthought: pick fitting labels (tools, research, walkthrough, vet, standing, …) at creation time and add missing ones whenever touching an issue.

**Why:** Dima asked 2026-08-19 after a batch of unlabeled tickets (DOT-150…163) needed retro-labeling.
**How to apply:** every `linear issue create/update` includes a label consideration; sweeping an old ticket = label it too. Related: [[tickets-must-be-pretty]].

Extended (DOT-172 created project-less, Dima had to ask): the create-time habit is **label AND
project AND parent** — all considered on every create, not label-only.

🚨 **and MILESTONE — the fourth field, added after Dima caught it again.** A child was created with
the right label, project and parent, and no milestone. His words: *«parent is attached to a
milestone, but DOT-211 did not.»*

**The rule: when a ticket has a parent, it inherits the parent's milestone unless there is a stated
reason not to.** A ticket with no milestone is invisible on the milestone board, which is the board
that answers «where are we» at boot — so the omission does not just lose a row, it makes progress
read wrong.

📌 Proof command: `linear api 'query { issue(id: "DOT-N") { projectMilestone { name } parent { projectMilestone { name } } } }'` — the two should match, or the body should say why not.

📌 A canceled ticket counts as resolved in linear's milestone math, so attaching a *gated* ticket
that might never be built cannot strand a milestone at 99%. That removes the only real argument for
leaving one off.
