# Writing `instruction.md`

The prompt is the only explanation the model ever receives. It reads this, then edits
the codebase. Nobody clarifies anything.

**Written by hand by the task author.** Near-zero AI authorship — it reads as AI slop
otherwise and biases the task. Assist with grammar and with *proposing* wording, never
by editing the file unprompted.

## Style target

A short, direct **Linear/Jira ticket from a tech lead to a senior engineer**. Not a spec
sheet, not a vibe-coded one-liner. If a senior engineer would feel insulted by the level
of hand-holding, it is too prescriptive.

Measured across merged tasks:
- Half sit between **190 and 470 words**. Shortest merged: 112. Longest: 2,287.
- Most are **~5 short prose paragraphs**. Only 4 of 39 use headings.
- **72%** quote real identifiers in backticks.
- **36%** carry a concrete number that came from measuring something.
- **13%** say outright what is NOT part of the job — *"worth doing more than 13% of the
  time."*

Length follows the work. A big feature earns more words; nothing else does.

## Getting the first draft out

1. **Open the repo, not a doc.** Find the thing that is actually broken or missing, and
   read the surrounding code first. The prompt should sound like it came from someone who
   has been in there.
2. **Write the problem in one line.** Present tense, concrete, no preamble. If you cannot
   say what is wrong in one sentence, you do not understand the task well enough to set it
   yet.
3. **Say what should be true after.** Outcomes, not steps — the reader decides how. Name
   the things your checks will touch, and nothing else.
4. **Read it back as the engineer.** Would you know what to build? Would you have to guess
   anything? Is there a paragraph telling you something you already knew? Delete that
   paragraph.

## The specify / don't-specify boundary

This is the hardest judgment in the whole practice. `examples/instruction-annotated.md`
shows a real shipped prompt with every one of these calls annotated — read it alongside
this section.

Markers below follow the prompt guide's colour code: 🔴 don't, 🟢 do, 🟣 the one
synthesizing check.

### 🔴 Leave it out — a senior already knows

- Do not break the existing tests
- This is a repo of XYZ
- Follow the conventions already in this codebase
- Put the code where similar code already lives
- Handle errors the way this project handles errors
- Keep the public API working
- "Return 409 on duplicate" and similar obvious status choices
- Requests to add tests or documentation

### 🟢 Write it down — nobody can guess

- **Exact names the checks will call**: endpoints, options, flags, methods
- Specific values: status codes, error types, defaults
- Where a boundary sits and what happens on each side
- **Anything two good engineers would disagree about**
- Anything unusual for this codebase
- What is explicitly *not* part of the job

The mechanical reason for the naming rule: verifiers may never assert an internal name,
so **any name a test must call has to be in the prompt.** Internal structure stays
unspecified.

### The heuristic that settles most cases

A reviewer:
> *"If it's stuff you think someone competent would have thought of, you don't need to go
> back to your prompt and add them. If it's something you think about when you're going
> through the repository… you probably haven't been working in the repo you chose for
> long. And so you thought about it this quickly. **Probably the agent should get that
> part too.**"*

So: *was this worked out quickly, from the repo, without deep prior knowledge?* If yes,
the agent can get there too — test it, do not prompt it.

### 🟣 The settling test

Hand the prompt to someone who has not seen the checks. Ask what they would build.

- Anything on the check list missing from theirs = a requirement kept in the author's
  head.
- Anything on their list never asked for = over-specification; their solution was
  written for them.

## Good prompt / bad prompt

**Good** opens with the problem in present tense, states the behaviour wanted rather
than the design, quotes the real names the checks will call, gives numbers where numbers
matter, says briefly what is out of scope, trusts the reader on everything a senior does
anyway, and **stops when finished** — no summary, no restatement.

**Bad** opens with preamble ("This task involves implementing a robust and comprehensive
solution for…"), describes the author's implementation instead of the behaviour,
enumerates every edge case in a tidy list so the model transcribes instead of thinking,
hedges ("should ideally", "may want to consider"), explains what any senior knows, leaves
out the one option name the checks require, and ends with a summary of itself.

## Scope-limiting language

Explicitly encouraged. It saves a reviewer an argument and saves the model a wasted hour,
and it doubles as a difficulty lever — removing a constraint later widens scope, informed
by real run data.

Keep scope lines **precise**. A too-broad exclusion can suppress work that is actually
needed and tested elsewhere.

## Reviewing a prompt

The rules are here; the **review procedure** is the `x:rl-prompt-review` skill — the
blind synthesizing test, the bidirectional name-coupling check against the verifiers, the
gate checklist, and a measured corpus of five accepted prompts to calibrate against. Use
it before posting to the review gate, and on any prompt handed over for validation.

## Iterating the prompt

- Iterating the prompt and golden patch **in parallel is explicitly fine**. The only
  thing to guard is implementation details leaking into the verifiers.
- **Work backwards from the finished solution**: re-read the prompt and ask whether it
  still matches what was built. It is fine for the solution to contain *more* than the
  prompt asks, as long as the extra is reasonable.
- An approved prompt can be tuned without re-approval. Do not wholesale rewrite it, and
  notify the team when switching to a different feature, repo, or approach.
- **Keep prompt history traceable.** Reply in the original prompt thread rather than
  editing the message; strike through removed text. The original stays as the approved
  baseline and each reply is a dated diff. The PR gives a second trace via git history.

## When models consistently fail

If every model fails for *structural* reasons — cannot build, cannot run tests, fighting
the environment — adding specific instructions is acceptable to let the suite proceed.
That is not the same as making a genuinely hard task easier.

Light clarification is appropriate when every run is blocked by the same nonessential
gating issue. After the clarification the substantive task must remain difficult. If
clarification makes every run pass, it exposed too much.

## Worked reviewer feedback

Real pushback from a prompt review, showing the two questions in action:

> *"'existing resolution behavior' points towards existing patterns in the repository, so
> I would expect the agent or the senior engineer to get that without having to say it."*
> → cut it

> *"'Follow imported files recursively and report circular dependencies.' How do you test
> for this? What does 'report' mean? Try to be slightly more specific here so that you
> give yourself something to test for, maybe a specific error to raise."*
> → make it gradable

> *"Is this reasonable to expect without saying? Could it be removed?"*
> → the default question for every line

And the escape hatch when behaviour proves hard to assert:

> *"They need to be behavioral, but it's not easy to write behavioral tests. We don't want
> to go back and change the entire prompt to restrict scope or force implementation
> details, but **you could give yourself an out in some places by being a tiny bit more
> precise on certain things (especially public interfaces)**."*
