# a claim carries its test, or it carries a label

Found by cclio grilling itself for its own deepest vulnerability. Dima approved both halves.

## the vulnerability, in its own words

**I trust inherited documents as if they were measurements.** Three cases from a single boot:

- a CST said [DOT-8](linear://linear.app/issue/DOT-8) «needs nothing from dima». Dima's comment had been
  sitting on the ticket for a day. The build was nearly started on a ticket he had already proposed
  cancelling.
- the same CST said a coder was idle and stoppable. It was **alive**, and Dima separately believed
  he had killed it from the desktop ui. Two documents, two wrong states, one real process.
- `x:cmt` §2.5 carried a reasoned no-assign rule that **stood for weeks while false**, because it
  was written down and never re-run.

📌 The shape is identical every time: **a claim gets written, and nothing ever re-checks it.** A
memfile has no expiry, a CST has no verify step, a rule has no last-tested date. Without one, a fact
and a fossil are indistinguishable.

## half one — rules

**When writing a rule that asserts how something behaves, state the one command that proves it.**
Not a date, not a ceremony — a command, on the line.

    ✅ background sessions survive a coordinator reset — `kill -0 <pid>` after the reset
    ❌ background sessions survive a coordinator reset

**A rule with no such command is an inference, and says so in its own text.** `fleet-identity.md` tenet 2
already requires *asking* the question; this requires *recording the answer*, so the next reader
does not have to re-derive it.

🚫 **Do not sweep existing rules for this.** Add the line when a rule is touched anyway. A sweep
would fabricate commands for claims nobody re-ran, which is the same failure with more confidence.

🎯 **and the command must exercise the thing you are claiming about.** A probe measures the path it
runs, not the concept it is named after. «read a matching file» is not one operation — `cat` through
Bash and the `Read` tool are different events to the harness, and only one of them fires a scoped
rule. Round 1 of the `paths:` probe tested `cat`, saw nothing, and was one sentence from being
written up as «the presence half does not work».

📌 So a test that returns nothing is not a finding until you have checked that it tested the right
path. **A null result is a claim about your instrument first, and about the world second.**

## half two — CSTs

**A CST's claims about live state are candidates, verified before use.** Tickets by query, sessions
by pid, files by `ls`. The rule lives in `CST-SPEC.md` so every frontend inherits it, not in any one
agent's head. Measured cost on the boot that produced this leaf: about three shell calls.

Related: [[research-vs-lived-evidence]], [[spawning]], [[silent-failures]]
