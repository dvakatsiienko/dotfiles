# flawlog — run cw·20260819·batch1 (stage 2)

one line per flaw: what broke · cost · lesson.

- **the app-restart dependency was never named as a blocker.** the CST's first move was
  "verify cw sees its tools after dima's app restart", written as if the restart had happened.
  it had not — the desktop app is the same process since 1:51PM, still running the OLD `handoff`
  server from a directory that no longer exists on disk. cost: a boot spent proving a negative.
  lesson: when a next-step depends on a HUMAN action, write it as a blocked item with the action
  named, not as a verification step.

- **a binding rule carried a claim its test never checked.** `x:cmt` §3.1 said commits to `main`
  fire none of the PR automations. the test behind it compared **linking** on a PR versus a commit,
  and never looked at the state field — so the conclusion was wider than the measurement. it stood
  for weeks and was only caught when a push moved a ticket in front of me. cost: one wrong revert
  decision avoided by luck, not by process. lesson: when writing a fact into a rule, name the field
  the test actually observed, not the behaviour class it seemed to settle.
- **i referenced a ticket i had not started, and the tracker believed me.** `- ref DOT-159` moved it
  `Todo → In Progress`. the ref was correct; the state was a lie for ten minutes. lesson: a magic
  word is a write, not a citation.
- **i answered a question by growing the build.** dima asked «could this be global, easy way?» —
  a question about cost. i researched it, found the real mechanism, and briefed a machine-wide
  hook dispatcher with a stdin-replay trap in it. he caught it: «starts to sound more complicated
  than a freebie». cost: three brief rewrites to one coder, and a near-miss on a change that can
  silently kill every git hook on his machine. lesson: when the question is «is there an easy
  way», the answer is a **verdict on cost**, not a plan. if the honest answer is «not easy», say
  that and stop — do not hand the hard version to a coder and call it steering.
- 🎯 **writing ABOUT a magic word IS using one.** commit `7b096a9` documented the auto-assign bug,
  and its body prose contained the phrase «one push carrying a plain [ref] DOT-159» as a QUOTATION.
  linear's parser cannot tell a quote from an intent: it assigned dima and moved the ticket
  `Todo -> In Progress` five seconds after the push. i did not reverse it, because i had checked my
  own draft's intent instead of the parser's view — so the assignment sat stale for fourteen
  minutes and was later mistaken for a hook failure. cost: nearly reported a working hook as broken.
  lesson: a commit body is PARSED, not read. before pushing, grep the body for the id pattern and
  count the hits — the count, not the intent, is what fires. escape or reword any mention that is
  not meant to link.
