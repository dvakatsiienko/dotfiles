**A report is a candidate list, not a finding list — and reading IS the verify step.** Acting on an
audit without opening the files it names delegates the one part that cannot be delegated.

**Dima's lived observation outranks a literature result.** If they conflict, the *question* differs.
Locate the difference before writing a verdict. Restate the design in one sentence and get it
confirmed **before** commissioning research on it.

**An agent-sourced claim is written attributed, never asserted.** Attribute it, or verify it.

## the four failure shapes, each measured here

- 🚨 **a relayed claim needs the SOURCE OPENED, not merely checked.** A researcher reported that
  matt's `writing-for-agents` «has no rung for resident cost». Relayed, and false — the skill
  carries a section called «the two loads» defining exactly that. One `grep` would have caught it.
  **Checking a report against your own reasoning is not verification; opening what it cites is.**
- 🚨 **when your own check contradicts a report, suspect YOUR CHECK first.** Same session: a claim
  looked false because the grep pattern was `rules/dispatch` and the text said bare `dispatch.md`.
  The report was right. **A null result from your own tooling is the weakest evidence in the room.**
- 🚨 **the sharpest case is your OWN inference, not someone else's report.** The auto-unassign fix
  was reasoned, plausible, and written into two binding files **before anyone pushed a commit to
  test it.** One push falsified it. It was labelled «inferred» the whole time and the label did not
  help, because a rule reads as a rule regardless. **Test it, then write it.**
- 🚨 **name the FIELD the test observed, never the behaviour class it seemed to settle.** A rule said
  commits to `main` fire no PR automations. The test behind it compared *linking* and never looked
  at the state field. The conclusion was one size wider than the measurement, and it stood for weeks.

## three smaller ones, same root

- **a probe run while a human edits the system is not a controlled experiment.** Two of your own
  measurements disagreeing means the environment moved — suspect that before inventing a cause.
- **a table reads as measured whether or not it is.** Tag provenance per cell, or do not print it.
- **«exhausted» describes a moment, not a standing fact.** A status inherited from a document is
  always stale; the check is unconditional.

Related: [[pm]], [[silent-failures]], [[claims-carry-their-test]]
