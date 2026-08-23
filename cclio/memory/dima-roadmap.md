# the roadmap — what we do, in order

[[dima-strategies]] holds the **branches** (what the work is about). This holds the **order**
(what we do next). [[dima-stories]] holds what already happened.

📌 **This is a reflection of the plan in Dima's head, not a plan an agent invented.** He said it
out loud once; keeping it true is the job. When he invents something — the way «put cclio in
charge of pm» arrived in one evening — **adjust this file in the same session**, and say that you
did. A roadmap that lags his thinking is worse than none,
because it is read with confidence.

## the destination, in his words

> «i want a good harness setup with solid mem system, precise, clean and working skills, not
> having trash, so everything is going.»

Everything before the BYT line exists to reach that state. Everything after it is the work the
state was built for.

## the sequence

1. 🚧 **cclio migrates** — the coordinator lands on ccli and proves itself.
   Story [DOT-188](linear://linear.app/issue/DOT-188), milestones on `fleet`. Open: the proof loop, the coder-global memfile,
   the hand-test checklist.
2. **memory trashclean, and the fleet package rethink** — one pass, not two. Prune the store,
   and settle **cclio and cw as one package**: who needs mcp, who needs the cli.
   📌 the mcp-vs-cli half is [DOT-185](linear://linear.app/issue/DOT-185) in the `cli` project, and the answer is **not** a blanket
   «cli wins» — see [[mcp-earns-its-place-on-desktop]].
3. **`dima's tools`** — git, zsh, nvim, dotfiles. Deliberately after the fleet settles;
   [[strategy-dimas-tools]] holds why, and the git pass carries the auto-unassign build ([DOT-159](linear://linear.app/issue/DOT-159)).
4. **the personal cli** — the `cli` project. One interface over the rest.
5. **BYT prettify** — the bytes team and its tracker.
   ⚠️ **freebies only until step 4 lands.** His exact carve-out: «you can prettify it starting from
   now actually, but only if you spot a freebie — no big tasks there.»
6. **the bytes repo prettify** — the code, not the tracker.
7. 🎯 **build apps** — numi, lab, and the rest. This is the point of all of it.

**Running underneath all seven:** keep the pm story healthy and the whole `fleet` picture in view.
Not a phase — a standing duty. [[strategy-pm]].

## how to use it

- **at boot**, know where we are without being told. Name the current step when reporting.
- **when Dima proposes work**, place it on this list before agreeing. Work that belongs to step 5
  while we are on step 2 is a freebie or a ticket, never a session.
- **the order is his, the weighting is not a ranking.** A later step is not less important — it is
  blocked by an earlier one. Never describe step 7 as a someday.
- **when the order changes, rewrite this file**, do not append a correction. It is a current-state
  document like a ticket body, not a log.

## the open question underneath it

Whether memory leaves are the right home for this at all. [DOT-177](linear://linear.app/issue/DOT-177) (membank) exists partly to
answer it: rules are a permanent context tax, a membank is zero context until fetched. Until that
lands, this file **is** the mechanism — cheap, resident, and honest about being hand-maintained.
