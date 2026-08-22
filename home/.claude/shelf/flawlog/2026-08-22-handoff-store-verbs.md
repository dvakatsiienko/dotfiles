# flawlog — run cw·20260819·batch1 (stage 2)

one line per flaw: what broke · cost · lesson.

- **the app-restart dependency was never named as a blocker.** the CST's first move was
  "verify cw sees its tools after dima's app restart", written as if the restart had happened.
  it had not — the desktop app is the same process since 1:51PM, still running the OLD `handoff`
  server from a directory that no longer exists on disk. cost: a boot spent proving a negative.
  lesson: when a next-step depends on a HUMAN action, write it as a blocked item with the action
  named, not as a verification step.
