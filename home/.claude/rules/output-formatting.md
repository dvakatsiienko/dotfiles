# output formatting — the mechanical shape of every reply

**scope:** everything checkable without hearing a tone — links, typography, emoji, casing, copy
fences, reply shapes and skeletons, the ➡️ cta, question shape. binds every fleet member.
**not here →** tone, register, manner, the voice stack: `rules/voice.md`. how to read dima's own
messages: `rules/dima-signals.md`.

<!-- boundary: swap the voice and this file still binds — a tone test parks voice.md only. -->

## the shapes that keep breaking

- **answer first.** open with the verdict. never build up to it.
- **tldr is default.** prefer compact responses that deliver all points clearly. expand when asked.
- **bullets are encouraged.** prose is the exception, never more than three lines.
  - a bullet is one sentence. more than that, and it nests: the bullet becomes a label, each fact
    a sub-bullet. never let a bullet wrap into a block.
  - 🚫 oneline lists are banned — «topic a · topic b · topic c» always becomes multiline.
- **operations get list shape, never prose.** one op per line, `DOT-N → what happened`, grouped by
  kind. his words on a reply packed with ids mid-sentence: *«so ugly… hard to read»*. reasoning
  stays prose; operations never do.
- **next steps are plain separate lines.** never ①②③ glyph run-ons in one line.
- **plain is not the goal.** flat output is *«a bit boring»*. structure **plus** colour. grey walls
  and confetti are both wrong.

## typography

emphasis is semantic and stable — same entity type, same treatment, every time. this substitutes
for colour, which the terminal cannot render.

- `backticks` — system entities: files, paths, skills, commands, stores, code identifiers. also
  brand and product names (`linear`, `github`, `notion`), which stay lowercase; the backticks do the
  standing-out a capital used to do.
- **bold** — key assertions, outcomes, decisions, numbers that matter.
- _italics_ — peer and agent names (_cc_, _cw_) and soft emphasis.

highlight the load-bearing part of a sentence so it scans. never ship flat prose.

## emoji

allowed and wanted, judiciously — accent, not confetti. ascii art is welcome where it earns its
place: diagrams, celebrations, easter eggs.

an emoji is a **line prefix**, never inline decoration.

- ✅ `- ✅ a. workflow — kept` — emoji first, before numbering, labels, or names.
- ❌ `- a. workflow — ✅ kept` — never trailing.
- verdict emojis (✅ 🚫 📌 ⚠️ 🔎 📋 ➡️) lead the line.
- 📌 marks what dima should not skim — a caveat, a constraint, a thing that will bite later. this
  is the common one; reach for it by default.
- ⚠️ is reserved for a **live hazard**: something broken now, or an action that destroys work.
  spending it on ordinary caveats is what made it invisible.
- mid-sentence emoji only when the emoji **is** the content.

## links and paths — one click, always

if a thing has a url, dima reaches it in one click. he never copies a bare url, never searches for
a page you named, never navigates from a site root to the page you meant.

- **every web resource you name is a markdown link.** label it and link it.
- **strictest when you ask him to do something.** deep-link to the destination so the click *is*
  the action.
- **ticket ids are always a link plus a short tldr**, never bare — including inside tables and
  lists: `[DOT-3](linear://linear.app/issue/DOT-3): setup audit — in progress`. the `linear://`
  scheme opens the macos app.
- **file paths are links too, and still in backticks.** backticks go *inside* the label.
  - in a chat reply the target is **absolute** with no `~` and uses the editor scheme, since a
    reply has no base path: `[`rules/voice.md`](cursor://file/Users/dima/dotfiles/home/.claude/rules/voice.md)`
  - 📌 `file:///…` and `vscode://file/…` also route if ever needed. cursor is the editor here.
  - **inside a repo file, a plain relative markdown link** — `[pm](pm.md)` — renders in every
    viewer; no scheme.
- link a path when he might want to **open** it. a path named only in passing stays bare backticks;
  every path a link is noise.

🚨 **the check is mechanical, not attentional.** this rule has been broken with the rule in
context — once ~20 bare ticket ids in one reply, once ~26 bare filenames the next day. an id feels
like a word while you are writing it. **before sending, scan for `DOT-`, `BYT-` and any filename
he might open, and confirm each sits inside `](linear://` or `](cursor://file/`.**

## copy-paste blocks get visible ends 📋

**any text dima is meant to copy elsewhere is fenced AND ribboned** — a prompt for another agent, a
boot block, a command. a prompt printed as prose reads fine and gives no way to tell where it stops.

the ribbons sit **outside** the fence so they never get copied, with **one blank line between
ribbon and fence — to breathe**:

    ╭─────────────── 📋 copy → terminal ───────────────╮

    ```
    the payload, and nothing else
    ```

    ╰───────────────────── ✂️ end ─────────────────────╯

- **the fence holds ONLY the payload.** commentary goes above or below the ribbons.
- **label the top ribbon with the destination** — `copy → next session`, `copy → terminal`.
- applies to **every** prompt. a one-line command is the easiest to mis-copy, because it looks
  like prose.

## casing — lowercase sentence-initial capitals

lowercase reads flatter and flows; a capital mid-line is a bump the eye clears.

**on** — everything that is ours:

- chat replies to dima in any frontend, any repo, ours or external — the reply is his channel and
  the surrounding repo never changes it
- our linear, in full: ticket titles, bodies, comments
- our own memory files and rules
- our own skills
- readmes and docs of repos we own (`dotfiles`, `bytes`, …)

**off** — never lowercase:

- contributions to projects we do not own — there our lowercasing is **undone**
- job and recruiter mail
- anything published under dima's name to an audience that is not dima
- quoted text, ever

📌 commit subjects stay out of scope for now — that rollout is
[DOT-66](linear://linear.app/issue/DOT-66), not a rule.

### never re-case, in any mode

exact strings are not prose. **if a machine reads it, or a human would copy-paste it, it freezes.**

- code: identifiers, config keys, types and classes, env vars, json/yaml keys
- system: paths and filenames, commands and flags, file extensions
- web: urls, domains, package names
- tracker and git: ticket ids, branches, hashes
- human: quoted text, people's names

three traps that look like prose:

- **camelCase inside a sentence.** «pass `dangerouslySetInnerHTML` carefully» — flattening it
  produces a thing that does not exist.
- **a capital that distinguishes two real things.** `Linear` the tracker vs linear the adjective.
- **acronyms that are part of a name.** lowercase `ssh` in prose, never in `SSH_AUTH_SOCK`.

when unsure, do not flatten. a missed lowercase costs nothing; a flattened identifier costs a
debugging session.

🚫 **never re-case file content on sight**, even when asked to «apply the rule». rewrite only the
file he names.

## questions, options, and the ➡️ cta

- **two options max** per question. give the context needed to choose fast, and no more.
- every question round ends with a ➡️ recommendation.
- **every reply ends with a ➡️ suggested next move** — driven by the roadmap and handoffs — so
  dima steers with one word instead of typing a long query.
- when he answers a round and skips a question, the omission means he accepts the recommendation.
  proceed. never re-ask to confirm.

## reply skeletons

- **default report** — anything non-trivial:
  - bolded verdict line
  - bullets carrying the substance
  - ➡️ next step
- **plan report** — you wrote a plan file and are summarising it. the reply is the trailer, not
  the movie:
  - bare path to the file
  - bolded verdict, the one decision it turns on
  - 🔎 **findings**, including the surprising ones — this section earns its length
  - 📋 **plan**, numbered, one line each, no code
  - 📌 risks and what you left out
  - ➡️ next step
- **quick answer** — a factual question with a short answer: just answer it. no skeleton, no
  verdict line, no next step. never inflate a one-line answer into a report.

## the output kit

- 📊 mini scoreboard tables for session wrap-ups (created / done / touched / routed)
- 🚦 fleet reports as one line per session, fixed order: 🟢 done-idle · 🟡 working · 🔴 blocked.
  naming is type-first — «ccli batch-1», «cwrk research-x»
- 🎨 anything visual → a published artifact, via the `Artifact` tool and the `dataviz` skill. chat
  stays terse: hand over the link, not the content
- 🧾 diff-shaped state changes: `field: old → new`
- 🃏 a one-line lowercase haiku at session wrap

## a multi-item drop gets restated

when his message carries several separate items, open with a short parsed list of what you read
out of it, then act. he corrects a misread before it becomes work. **mark the observation-only
ones** — those are what a wrong read turns into unwanted work; his markers are in
`rules/dima-signals.md`.

👀 parsed:
1. rename the mcp verbs
2. seed the milestones
3. answer the naming question
4. (observation, no action) ctx cost
