---
researched: 2026-08-23
status: 🧪 SUSPENDED — the reversal is off, we are observing what linear actually does
refresh-when: enough post-push observations accumulate to restore the reversal or delete this
---

# the linear assign on push — what was measured, and why the fix is suspended

Moved out of `rules/ticket-flow.md`, which every session on the machine loads. This is a
long-running investigation, not a rule, and it is currently **suspended**: `x:cmt` says read the
ticket after a ref-carrying push and report what happened, rather than correcting it.

An id comes from Dima, from the conversation, or from the branch name. **Nowhere else.** Never
guess one, never grep for a plausible match, never write `DOT-?`. Most commits have no ticket, and
omitting the line is always correct.

Commit magic words (`ref DOT-N` to link, `Closes DOT-N` to finish) are defined in the `x:cmt`
skill, which loads on every commit. One thing holds even without it: **a closing keyword resolves
the ticket and assigns it to the commit author**, so name the ticket you are about to close in
your reply rather than closing it silently.

⚠️ **and it is not only the closing keyword — plain `- ref DOT-N` assigns too.** measured
2026-08-21: two tickets took an assignee-only write one second after a push, from commits carrying
`ref` and no closing word. so the old advice here — use `ref` plus a manual state update to keep a
ticket unassigned — **did not work and has been removed.**

🚨 **the commit-author fix was TESTED AND FALSIFIED.** the theory was: commit under a shared
identity (`git -c user.name="dima's fleet" -c user.email=fleet@x-com.local commit`), that address
maps to no github account, so it maps to no linear user, so there is nobody to assign.

the experiment: one commit carrying `- ref DOT-182`, authored under that identity, pushed. result
measured on the ticket seconds later:

- ✅ the `githubCommit` attachment landed — magic words work, they are parsed from the **commit message**
- ❌ **dima was assigned anyway**

so linear does not read the commit **author**. it reads the **pusher** — the github actor of the
push event, which is dima's account and dima's ssh key. the author email was never the field in
play. do not re-propose it, and do not report it as working.

📌 **`~/.config/linear/linear.toml` is NOT this lever, though it looks like it.** it carries
`issue_create_assign_self = "never"`, which stops the **cli** self-assigning on interactive
`issue create`. that is a client-side path. the push assign happens server-side inside linear's
github integration, and no cli config can reach it. both guards are wanted; they cover different
doors.

📌 **there is no knob. three candidates were checked and ruled out:**

- the github integration panel — branch format, linkbacks, external review tool and
  `Link commits to issues with magic words`. no assignee option exists.
- `userSettings.autoAssignToSelf` — already `false`, and the assign fires anyway.
- `~/.config/linear/linear.toml` `issue_create_assign_self = "never"` — client-side, guards the
  **cli's** `issue create`. the push assign is server-side; no cli config reaches it.

✅ **the working fix is to reverse it, not prevent it.** dima wants the magic words, so keep them
and undo the side effect: after any push whose commits carried `ref` or a closing keyword,
unassign those tickets in the **same turn**, and name it in the reply so it is visible.

    linear api 'mutation { issueUpdate(id: "DOT-N", input: { assigneeId: null }) { success } }'

the one exception is a ticket dima assigned to himself on purpose — leave that alone.

## why it is suspended

Six commits carrying a link keyword for one ticket went up in a single push. Linear wrote the
assignee and then cleared it four times in the same second, and the ticket settled **unassigned**
with nobody intervening. That contradicts the rule above, and one observation cannot say whether
linear's behaviour changed or a batch of refs behaves differently from the single-ref pushes that
were measured. No hook does this — `hooks/`, `.vibemon/` and `settings.json` were grepped for
`assigneeId` and there is nothing.
