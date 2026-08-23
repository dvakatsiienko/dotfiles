# flawlog — dot-73 data loss, and the a/b verdict

run `cw·20260819·batch1` · session `cclio-7b` · opus 5

## 1. 🚨 a two-hour plan was folded to nothing, and the ticket still read complete

**what broke.** dima wrote the dot-73 recipe into the obsidian inbox over ~2 hours. an earlier
session read the whole drop and folded every immediately-actionable item correctly — the `/pre`
block all shipped. it skipped the block marked *«to be done after setting up you as coordinator»*.
future-dated work got summarised to nothing.

**the half that made it invisible.** dot-73's body was **not empty**. it held an agent-written
ordering, an agent-chosen prep phase, and a section folded in from someone else's prompt. it read
finished. nobody audits a complete-looking ticket.

**cost.** dima had to notice it himself, by re-dropping his own prompt and asking for a comparison.
and a later session recommended «split this story first» — a plan that contradicted the one it had
lost.

**lesson.** *a fold is scoped to what was said, never to what is actionable now.* a future-dated
block gets written down in full and marked as deferred, because deferring is a state, not a reason
to compress. and a story body that describes a method must say **whose** method it is.

## 2. an inherited opinion was served as the plan

«split dot-73 before touching it» came from the handoff CST, which got it from a prior session's own
read of the ticket. two hops from any source. it was presented to dima as the recommendation without
one check against what he had actually asked for.

**lesson.** already written as [[research-vs-lived-evidence]] and [[claims-carry-their-test]]; it
fired anyway. the specific tell to watch: **a CST claim about what to DO is weaker than a CST claim
about state.** state claims get verified on ingest by contract. plan claims have no such rule and
should.

## 3. `.get()` on a field the query never asked for — twice

reported dot-208 as having lost its milestone, and dot-188 the same, when both were fine. the
graphql query simply had not requested `projectMilestone`, and python's `.get()` returned `None`
without complaint.

**lesson.** same shape as the silent `@import`: **when a mechanism returns nothing, suspect your own
inputs before the mechanism.** for graphql specifically — never print a field's absence unless the
query selected it.

## 4. `git grep` is blind to gitignored files

dot-202's path sweep counted the 6 files **outside** the repo correctly and still missed one
**inside** it — `.claude/settings.local.json`, gitignored, carrying a dead mcp path in an allow rule.

**lesson.** a path sweep uses `grep -rl --exclude-dir=.git`, never `git grep`. cheap to say, and it
was a measured miss.

## 5. dima's own read on the verdict — kept because it is the outcome measure

*«from what i saw, you perform much, much better. the only fat problem now is ctx size. kinda
unacceptable if seriously talking.»* the a/b closed for cclio with exactly one named defect. that
sentence is the bar the next round is measured against.
