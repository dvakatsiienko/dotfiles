---
name: native-relations-always
description: "perm habit — linking/blocking between tickets = linear native relations, never body strings"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 30861ba0-43b0-43bf-b3c2-7f62abafe4b4
  modified: 2026-08-19T16:14:38.248Z
---

When a ticket blocks, relates to, or depends on another — use Linear's builtin relation (`linear issue relation add <id> blocks <id>`), never a «⛔ BLOCKS DOT-N» string in the body. Body text may still gist the why, but the edge itself is native.

**Why:** Dima corrected DOT-167 on 2026-08-19 — native relations render in the UI/frontier views and survive body rewrites; strings do neither.
**How to apply:** any create/update that mentions a blocking/related ticket → set the relation in the same batch. Matt's to-tickets/wayfinder already assume native edges ([[matt-skills-mirrored]]).

Not just «know the feature» — actively HUNT edges (Dima 2026-08-19): whenever touching a ticket, evaluate possible blockers/relations and set them on match. Full vocab to consider every time: parent of · sub-issue of · related to · blocked by · blocks · duplicate of. Loop: find/identify → eval → link on match. Example of the habit: noticing DOT-138 may be resolved-by/related-to DOT-165 → link related immediately, don't wait to be told. Correct edges = streamlined frontier workflows.
