---
name: research-vs-lived-evidence
description: "when research contradicts what Dima observes daily, the research is answering a different question — find which one before reporting"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: af91cdb2-f865-4212-9dc8-4734e9a8bf66
  modified: 2026-08-20T18:39:49.556Z
---

Shipped a subagent's verdict as settled without testing it against what Dima observes every day. Cost: a wrong verdict on DOT-165, a rebrand declared void that wasn't, a committed research doc, and Dima having to catch it.

**Why:** the research had evaluated «one MCP tool per skill» while Dima's design was «one meta-tool, index in the description, body on demand». Both were called «skills over MCP». The report was internally sound and answered nobody's question.

**How to apply:**
- Dima's lived observation outranks a literature result. If they conflict, the question differs — locate the difference before writing a verdict.
- Restate the design in one sentence and get it confirmed BEFORE commissioning research on it.
- Subagent conclusions get adversarial review, never relay. Ask «what would make this wrong» before reporting it.
- Load the `cmt` skill before the FIRST commit of a session, not the second ([[skill-edits-are-file-edits]]).
- Story size is a health metric — flag a parent at ~15 subs and propose a split.
- Run `dotfiles-link` status at boot, not only when a push hook forces it.

Related: [[linear-fetch-contract]], [[tell-dima-all-capabilities]].
