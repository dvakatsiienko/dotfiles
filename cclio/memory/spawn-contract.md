The binding rules for handing work to a coder. **Full spec:** `cclio/docs/coordinator-coder-contract.md`
— read it when actually spawning, never at boot. Both stay evergreen; this leaf is the compression,
that file is the source. When they disagree, the file is right and this leaf is stale.

**The shape:** one coder by default, two allowed, never three without a stated reason. cclio owns
the plan, the tracker and the review; the coder owns the edits and reports precise data. The coder
does not decide scope.

**Two doors, never interchangeable.** A subagent runs inside cclio, dies with it, cannot be opened
by Dima, and takes no effort. A **background session** (`claude --bg`) is real, survives a
coordinator reset, and takes model AND effort — **that is the door for all coding.** The split is
not research-vs-code, it is **disposable-vs-watchable**.

**Four preflight checks:** reuse before spawn · tier (repo work ⇒ session) · pretty name (sessions
only — the `Agent` tool's regex rejects emoji and colons) · ticket id + `- ref DOT-N`, never a
closing keyword.

**The messaging model — write freely, read on a leash.** cclio messages the coder whenever. The
coder answers **once** per assignment, only when blocked or done. `git diff` in its cwd beats any
message. Doneness is a **written marker** — a final commit plus a report file — never transcript
archaeology. Subscribe with `notify_when_idle`, never poll. Budget: three round trips; exceeding it
means the brief was wrong.

⚠️ **Shared working tree.** A coder in the same repo stages into the same tree. **Never `git add -A`
while a coder is live** — state file ownership up front, stage explicit paths, and leave anything
modified that is not yours.

**cclio closes the ticket, the coder never does.** And a coder's report is a candidate, not a
finding: check its claims before relaying them.

Related: [[spawn-types]], [[spawn-title-convention]], [[ticket-refs-on-dispatched-work]],
[[research-vs-lived-evidence]]
