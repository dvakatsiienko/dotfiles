---
name: ticket-heavy-replies-need-structure
description: Dima flagged dense prose packed with inline ticket ids as ugly/hard to read — use short structured lines for ops reports
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 6d63369b-1cd3-4a25-a9ff-fc4506066344
  modified: 2026-08-18T15:50:50.399Z
---

Replies reporting many ticket operations must not be run-on prose with ids embedded mid-sentence.

**Why:** 2026-08-19 Dima sent a screenshot of a dpatch reply calling it "so ugly... lots of ticket ids written as prose, hard to read."

**How to apply:** one op per line (`DOT-N → what happened`), group by kind, links per [[no-glyph-runon-cta]] rules — plain separate lines. Prose stays for reasoning/answers; operations get list shape. Related: [[tickets-must-be-pretty]].

Addendum 2026-08-19: Dima also said plain outputs are "a bit boring" — prettier formatting and emojis are explicitly welcome. Structure + a little color, not walls of grey prose.

Adopted output kit (Dima ✓ 2026-08-19, keep even across dpatch rollouts):
- rich formatting always: **bold** for key terms, `backticks` for ids/commands/paths
- 📊 mini scoreboard tables for session wrap-ups (created/done/touched/routed)
- 🚦 fleet reports as one line per session, fixed order: 🟢 done/idle · 🟡 working · 🔴 blocked; naming type-first: «ccli batch-1», «cwrk research-x» (scale the type-first pattern everywhere)
- scoreboard ticket ids always as links; no commits section in wrap-ups (commit refs live in tickets)
- 🎨 anything visual → proto board; chat stays terse ("board updated")
- 🧾 diff-shaped state changes: `field: old → new` (trial)
- 🃏 one-line lowercase haiku at session wrap (trial, joke-approved)
