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
- 📌 **A report is a candidate list, not a finding list — and reading IS the verify step.** Acting on
  an audit without opening the files it names delegates the one part that cannot be delegated. Proven
  twice in one session: a relayed audit shipped a wrong verdict, and the hand round that followed
  found six more defects it had missed, including a path to a directory that does not exist.
- 📌 **When a mechanism returns nothing, suspect your own inputs before the mechanism.** Two probes
  read as «nested imports are unsupported» when the real cause was a path resolved against the wrong
  base. «Feature missing» is a much bigger claim than «i called it wrong», so it needs much more
  evidence.
- 📌 **the sharpest case is your OWN inference, not someone else's report.** The no-assign fix was
  reasoned, plausible, and written into a binding rule — `x:cmt` §2.5 and `ticket-flow.md` — that
  every agent would follow, **before anyone pushed a single commit to test it.** One push falsified
  it. It was labelled «inferred, not documented» the whole time, and the label did not help: a rule
  reads as a rule regardless of its caveat. So an inferred mechanism must be **tested before it
  becomes a rule**, not merely marked. Writing the caveat is not the same as running the test.
- Load the `cmt` skill before the FIRST commit of a session, not the second ([[skill-edits-are-file-edits]]).
- Story size is a health metric — flag a parent at ~15 subs and propose a split.
- Run `dotfiles-link` status at boot, not only when a push hook forces it.

- 📌 **a probe run while a human edits the system is not a controlled experiment.** a research pass
  claimed a setting never gated a command, because its early probe saw the gate and its later ones
  did not — Dima had flipped it 40 seconds in. it reconciled its own contradictory observations by
  **inventing a cause for a failure it had never witnessed.** when two of your own measurements
  disagree, suspect the environment moved *before* reaching for a story that unifies them.
- 📌 **a table reads as measured whether or not it is.** a six-row capability table was published
  from a mix of tool schemas, `--help` output and inference, presented uniformly. one question
  exposed it. **tag provenance per cell, or do not print the table.**
- 📌 **a shortcut past a skill also skips its side effects.** reading a handoff with `cat` instead
  of running `handoff-pull` left it pending and re-offerable — reading is not consuming. when a
  skill owns state, invoking it IS the operation.
- 📌 **«exhausted» describes a moment, not a standing fact.** a handoff said the obsidian worklog
  was exhausted and it was — but the inbox beside it had a 28k drop written the same day. a status
  inherited from a document is always stale; the check is unconditional.

Related: [[linear-fetch-contract]], [[tell-dima-all-capabilities]].
