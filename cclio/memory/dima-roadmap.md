# the roadmap — what we do, in order

[[dima-strategies]] holds the branches, [[dima-stories]] holds what happened, this holds the order.

📌 **This reflects the plan in Dima's head, not one an agent invented.** He said it out loud once;
keeping it true is the job. When he changes it — the way «put cclio in charge of pm» arrived in one
evening — **rewrite this file in the same session and say that you did.** A roadmap that lags his
thinking is worse than none, because it is read with confidence.

**The destination, his words:** *«i want a good harness setup with solid mem system, precise, clean
and working skills, not having trash, so everything is going.»* Everything before step 5 exists to
reach that state; everything after is the work the state was built for.

## the sequence

1. ✅ **cclio migrates** — done, [DOT-188](linear://linear.app/issue/DOT-188).
2. 🚧 **memory trashclean + the fleet package rethink** — one pass, not two. Trashclean largely
   done: root halved, leaves 52 → 18, `rules/` reconciled, one voice file. **What remains is the
   package half** — cclio and `cw` as one package, who needs mcp and who needs the cli
   ([DOT-185](linear://linear.app/issue/DOT-185)). 📌 not a blanket «cli wins»; the test is which
   machine the shell reaches.
3. **`dima's tools`** — git, zsh, nvim, dotfiles. After the fleet settles, deliberately. The git
   pass carries what is left of [DOT-159](linear://linear.app/issue/DOT-159): the push-revert hook
   works, so installing it in `bytes` is the remainder.
4. **the personal cli** — one interface over the rest.
5. **BYT prettify** — the bytes tracker. ⚠️ **freebies only until step 4 lands:** *«you can prettify
   it starting from now actually, but only if you spot a freebie — no big tasks there.»*
6. **the bytes repo prettify** — the code, not the tracker.
7. 🎯 **build apps** — numi, lab, and the rest. **This is the point of all of it.**

**Underneath all seven:** keep the pm story healthy and the `fleet` picture in view. A standing
duty, not a phase.

## standing constraints

- **Fable quota is the scarce resource.** Dima codes with opus Thu–Sun on the fable budget; opus
  deputises for fable on those days. This is why fable is never spawned.
- 🎯 **Be an expert of yourself.** Every surface knows its own tools, config and vocabulary cold at
  session start. Asking Dima what a label means is a bug, not a question.

## how to use it

- **at boot**, know where we are without being told, and name the step when reporting.
- **place proposed work on this list before agreeing.** Step-5 work while we are on step 2 is a
  freebie or a ticket, never a session.
- **the order is his; it is not a ranking.** A later step is blocked, not lesser. Never describe
  step 7 as a someday.
- **when the order changes, rewrite — do not append.** Current-state document, like a ticket body.

🚨 **The pacing check:** steps 1 and 2 are meta-work, and meta-work never finishes on its own.
Bytes went untouched for over a week while this ran. **Step 2 closing is the moment to ask whether
step 3 starts or whether another meta-branch has appeared.**

📌 Open underneath it: whether a memory leaf is the right home for this at all. Membank
([DOT-177](linear://linear.app/issue/DOT-177)) exists partly to answer that — a rule is a permanent
context tax, a membank is zero until fetched. Until it lands, this file is the mechanism.
