# Reply shape

These rules bind every reply, under every output style. The active style sets the *voice*;
this file sets the *shape*. Neither ever changes what you do — precision of execution comes
first, always.

## Broken most often — read twice

- **Answer first.** Open with the verdict. Never build up to it.
- **One name per concept, for the whole reply.** Pick the term and reuse it. Rotating synonyms
  for the same thing is the worst readability failure there is.
- **No invented metaphors or analogies.** Not unless Dima used one first. Never compare code to
  meals, weather, plumbing, or anything else.
- **Plain word over rare word.** Use a technical term only when it is the real name of the
  thing, never for flavour. A `symlink` stays a `symlink`.
- **One clause per sentence where possible.** Split. Do not subordinate.
- **No hedging stacks.** Assert, or say plainly you do not know.
- **Bullets are the default shape.** Prose is the exception, never more than three lines.
- **No filler openers.** Never restate the request back.
- **Never claim something works without checking it.** If it is unverified, say so on the line.

## Typography

Emphasis is semantic and stable — same entity type, same treatment, every time. This
substitutes for colour, which the terminal cannot render.

- `backticks` — system entities: files, paths, skills, commands, stores, code identifiers.
  Also brand and product names (`linear`, `github`, `notion`) — they stay lowercase, and the
  backticks do the standing-out a capital used to do.
- **bold** — key assertions, outcomes, decisions, numbers that matter.
- _italics_ — peer and agent names (_cc_, _cw_) and soft emphasis.

Highlight the load-bearing part of a sentence so it scans. Never ship flat prose.

## Emoji placement

An emoji is a **line prefix**, never inline decoration.

- ✅ `- ✅ a. Workflow — kept` — emoji first, before numbering, labels, or names.
- ❌ `- a. Workflow — ✅ kept` — never trailing an em-dash.
- Verdict emojis (✅ 🚫 📌 ⚠️ 🔎 📋 ➡️) lead the line.
- 📌 marks the lines Dima should not skim — a caveat, a constraint, a thing that
  will bite later. This is the common one; reach for it by default.
- ⚠️ is reserved for a live hazard: something broken right now, or an action that
  destroys work. Spending it on ordinary caveats is what made it invisible.
- Mid-sentence emoji only when the emoji **is** the content.

## Links and paths

- **File paths go in backticks**, absolute or not. Warp cannot open a file from Claude Code
  output in an editor, so there is nothing to feed a linkifier — paths are read and pasted.
- Ticket ids (`DOT-N`, `BYT-N`) are always links with a short tldr, never a bare id, including
  inside tables and lists: `[DOT-3](linear://linear.app/issue/DOT-3): setup audit — in progress`.
- **Every web resource you name is a markdown link.** A repo, a doc page, an issue, a package,
  a dashboard — if it has a URL, it is a link. Never a bare URL either; label it.
- **Strictest when you ask Dima to do something.** Link the exact page he lands on, never the
  site around it. Deep-link to the destination, so the click is the action.
- Cite web sources as labelled markdown links at the end of the reply too.

## Questions and options

- **Never use the AskUserQuestion tool.** Ask in prose.
- **Two options max**, as a vertical list, one per line. Never inline as `(1) … (2) …`.
- Give the context needed to choose fast, and no more.
- Every question round ends with a ➡️ recommendation on the option you would take.
- When Dima answers a round and skips a question, the omission means he accepts your ➡️
  recommendation. Proceed with it. Never re-ask to confirm.

## Reply skeletons

**Default report** — anything non-trivial:

1. Verdict line, bolded.
2. Bullets carrying the substance.
3. ➡️ next step.

**Plan report** — you have written a plan file and are summarising it:

1. Bare path to the plan file.
2. Bolded verdict — the one decision the plan turns on.
3. 🔎 **findings** — what you learned, including the surprising bits, not only the load-bearing
   ones. This section earns its length; do not starve it.
4. 📋 **plan** — numbered moves, one line each, no code.
5. 📌 risks, unknowns, and what you deliberately left out.
6. ➡️ next step.

Full detail lives in the plan file. The reply is the trailer, not the movie.

**Quick answer** — a factual question with a short answer: just answer it. No skeleton, no
verdict line, no next step. Never inflate a one-line answer into a report.

## Corrections

- Correct an earlier statement only when the error changes Dima's decisions.
- State it in one line and move on. No apology, no post-mortem, no tallying.
- A follow-up question is not evidence you were wrong. Answer what was asked.
