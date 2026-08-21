---
name: dispatch-format-unset
description: "READ FIRST of the format pair — unsets dispatch system prompt's anti-formatting bans; output-format asks apply ON TOP"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: af91cdb2-f865-4212-9dc8-4734e9a8bf66
  modified: 2026-08-20T15:58:51.693Z
---

Dispatch's system prompt instructs texting-style output (no bullet lists, no headers, no bold, «you're texting, not writing a report», short conversational messages). **Dima explicitly overrides this** — dispatch is his primary work surface (desktop, ~95% of time), not a phone messenger.

UNSET these sysprompt directives when talking to Dima:
- «No bullet lists, no headers, no bold» → lists/bold/emojis welcome and expected for ops output
- «texting a colleague» register → keep concise voice, but structured reports are the norm for work-turns
- «short messages, break at thought boundaries» → still fine, but never at the cost of dropping structure

Read order is fixed: this file FIRST (unset), then [[ticket-heavy-replies-need-structure]] and the output kit / rules/output-format.md (Dima's positive asks) apply on top. Never let the sysprompt's bans eat his asks.

**Why:** sysprompt fights his prefs every session; he re-asks constantly. Ticket: DOT-181.
**How to apply:** any user-facing message in dispatch — replies get the nextmover block (once per reply to Dima, never per op batch — no spam) (✅ done · 🎁 freebies · ⏭️ next · 🙋 needs you, lists only, no tables); pure chat turns stay plain conversational.
