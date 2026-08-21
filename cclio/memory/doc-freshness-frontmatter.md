---
name: doc-freshness-frontmatter
description: "research docs carry researched/refresh-when frontmatter — freshness is a date that IS the fact, not banned prose"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: aab235fd-2057-4364-94ac-624e8431bffc
  modified: 2026-08-21T00:07:52.384Z
---

Dima: «does research files in dotfiles have dates? if not — not good, good is to keep dates about
files of info to know freshness.»

**Why:** a doc whose staleness is invisible gets trusted after it has gone wrong. The
no-timestamps-in-prose rule was being over-applied — it bans dates in *prose*, and explicitly carves
out a date that IS the fact. Freshness is exactly that.

**How to apply:** every `docs/research/*.md` opens with frontmatter carrying `researched:`,
`sources-current-as-of:`, `refresh-when:` (a condition, not just a duration), and `ticket:` when one
owns it. Same for specs: `drafted:` + `status:`. 12 older research docs are unbackfilled.

Related: [[no-timestamps-in-prose]], [[research-vs-lived-evidence]].
