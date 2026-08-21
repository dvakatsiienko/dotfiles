---
name: no-timestamps-in-prose
description: "no dates AND no provenance lines in ticket bodies, comments, or doc prose — only the run stamp survives"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: af91cdb2-f865-4212-9dc8-4734e9a8bf66
  modified: 2026-08-20T18:32:28.930Z
---

Dima: drop timestamping AND provenance from written content entirely.

**Drop — dates:** «(2026-08-20)», «adopted DATE», «verified DATE», «shipped DATE», dated headings in research docs. Linear stores created/updated/commented times natively; repeating them is ceremony.

**Drop — provenance:** «split out of DOT-73», «carried from DOT-93», «migrated from GH #4», «per research 2026-08-17». The relation or the link carries this; the prose repeating it is noise. Set a native relation instead of narrating the lineage.

**Keep — the run stamp only:** `⸻ 🪪 <run-id> · <model> · agent run stamp — please keep 🙏`. It is machine provenance for undo/dedup and Dima explicitly called it useful ([[run-stamp-model-name]]).

**Keep — a date that IS the fact:** an expiry condition, a deadline, a scheduled review.

Applies to ticket bodies, comments, `docs/research/*`, rules and memory files alike.

Queued for fleet scale on DOT-186 ([[memory-divergence-store]]).
