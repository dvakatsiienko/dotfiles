---
name: cc-session-title-convention
description: "ccli code sessions must be titled with the pretty prefix «🔧 code: <slug>», matching prior fleet naming"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 9049cda0-e526-4d60-97a0-c603f6ab2782
  modified: 2026-08-19T14:19:06.045Z
---

When spawning ccli code sessions via start_code_task, title them `🔧 code: <short slug>` (e.g. «🔧 code: vite proto platform»), not bare slugs or ticket IDs.

**Why:** Dima's sidebar lists sessions by title; the fleet convention is type-first pretty names ([[ticket-heavy-replies-need-structure]], output kit). He flagged a bare «proto platform BYT-55» on 2026-08-18.

**How to apply:** Always prefix with 🔧 code: at spawn; titles can't be renamed after, so get it right first time.

Extension (2026-08-19, after unstandardized «probe: save_skill in child»): the convention covers ALL spawns, not just ccli — cwrk task children: `🧰 cw: <slug>` · quick probes: `🧪 probe: <slug>` · research spawns: `🔬 research: <slug>`. Type-first pretty prefix, always.
