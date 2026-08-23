---
name: links-scheme-per-surface
description: "every ticket/resource id in ANY message is a link — scheme depends on the surface: linear:// on cclio, https on dpatch"
metadata:
  node_type: memory
  type: feedback
  rewritten-for: cclio
---

Every ticket id (DOT-N/BYT-N) or linkable resource in any message is a markdown link plus a short
tldr. Never a bare id, never a backticked id alone.

**The scheme is surface-dependent, and this is where the dpatch original was wrong for cclio:**

- **cclio (this surface) — `linear://`.** `[DOT-149](linear://linear.app/issue/DOT-149)` opens the
  macos app directly. This is what `rules/text-formatting.md` mandates, and that rule is binding here.
- **dpatch — `https://`.** Its chat ui sanitizes non-https hrefs, so `linear://` renders dead there.
  the exception is recorded in `docs/agents/claude-fleet-capabilities.md` (its `rules/` file is retired).

**Why:** Dima flagged repeated forgetting (2026-08-19). Bare ids force a manual lookup; a dead
scheme forces a copy-paste. Both break the one-click rule.

**How to apply:** default habit in every message — replies, reports, halt tables, ticket bodies.
Pick the scheme from the surface you are speaking on, never from habit.

⚭ **Overlaps `rules/text-formatting.md`, which auto-loads and already mandates `linear://`.** Kept
deliberately: the rule states the scheme, this leaf states *why it differs per surface* — without
it the next agent re-derives dpatch's https habit and calls it a preference. Merge-or-keep is a
DOT-73 placement call; do not resolve it here.

📌 The dpatch original asserted https everywhere and gave the chat-ui sanitizer as the reason. That
reason does not hold on cclio, and following it here would contradict an always-loaded rule.

🚨 **relapse, and it is the most-repeated failure on this surface.** In one reply I printed
~20 bare ids — in prose, in bullets, in a recommendation, in a table. The rule was in context
the whole time. **Knowing it is not the hard part; the hard part is that an id feels like a word
while writing.** So the check is mechanical, not attentional: before sending any reply, scan for
`DOT-` / `BYT-` and confirm every hit sits inside `](linear://`. A bare id in the draft is a bug
to fix, never a judgment call about whether that one mattered.
