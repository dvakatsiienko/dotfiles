# output formatting — the mechanical shape of every reply

**scope:** everything checkable without hearing a tone — links, typography, emoji, casing, copy
fences, reply shapes and skeletons, the ➡️ cta, question shape. Binds every fleet member.
**not here →** tone, register, manner, the voice stack: `rules/voice.md`.

<!-- boundary test: swap the voice and this file still binds. a tone-skill test (DOT-212) parks
     voice.md only; this file stays on. anything the test must NOT turn off lives here. -->

## the shapes that keep breaking

- **Answer first.** Open with the verdict. Never build up to it.
- **Bullets are encouraged.** Prose is the exception, never more than three lines.
- **operations get list shape, never prose.** One op per line, `DOT-N → what happened`, grouped by
  kind. His words on a reply packed with ids mid-sentence: *«so ugly… hard to read»*. Reasoning
  stays prose; operations never do.
- **tdlr is default** prefer compact responses that deliver all points clearly. expand when asked.
- **a bullet is one sentence. more than that, and it nests.** When a bullet needs several facts, the
  bullet becomes a label and each fact becomes a sub-bullet. Never let a bullet wrap into a block.
  - e.g. topic a • topic b • topic c - oneline lists are banned - always multiline
- **next steps are plain separate lines.** Never ①②③ glyph run-ons in one paragraph.
- **plain is not the goal.** Flat output is *«a bit boring»*. Structure **plus** colour. Grey walls
  and confetti are both wrong.

## Typography

Emphasis is semantic and stable — same entity type, same treatment, every time. This substitutes
for colour, which the terminal cannot render.

- `backticks` — system entities: files, paths, skills, commands, stores, code identifiers. Also
  brand and product names (`linear`, `github`, `notion`), which stay lowercase; the backticks do the
  standing-out a capital used to do.
- **bold** — key assertions, outcomes, decisions, numbers that matter.
- _italics_ — peer and agent names (_cc_, _cw_) and soft emphasis.

Highlight the load-bearing part of a sentence so it scans. Never ship flat prose.

## Emoji

Allowed and wanted, judiciously — accent, not confetti. Ascii art is welcome where it earns its
place: diagrams, celebrations, easter eggs.

An emoji is a **line prefix**, never inline decoration.

- ✅ `- ✅ a. Workflow — kept` — emoji first, before numbering, labels, or names.
- ❌ `- a. Workflow — ✅ kept` — never trailing.
- Verdict emojis (✅ 🚫 📌 ⚠️ 🔎 📋 ➡️) lead the line.
- 📌 marks what Dima should not skim — a caveat, a constraint, a thing that will bite later. This
  is the common one; reach for it by default.
- ⚠️ is reserved for a **live hazard**: something broken now, or an action that destroys work.
  Spending it on ordinary caveats is what made it invisible.
- Mid-sentence emoji only when the emoji **is** the content.

## Links and paths — one click, always

If a thing has a URL, Dima reaches it in one click. He never copies a bare URL, never searches for
a page you named, never navigates from a site root to the page you meant.

- **Every web resource you name is a markdown link.** Label it and link it.
- **Strictest when you ask him to do something.** Deep-link to the destination so the click *is*
  the action.
- **Ticket ids are always a link plus a short tldr**, never bare — including inside tables and
  lists: `[DOT-3](linear://linear.app/issue/DOT-3): setup audit — in progress`. The `linear://`
  scheme opens the macOS app.
- **File paths are links too, and still in backticks.** Backticks go *inside* the label, and the
  target is **absolute** with no `~`, since no scheme expands it. One scheme covers files and
  directories alike:

      [`rules/voice.md`](cursor://file/Users/dima/dotfiles/home/.claude/rules/voice.md)

  📌 `file:///…` and `vscode://file/…` also route if ever needed. Cursor is the editor here.
- Link a path when he might want to **open** it. A path named only in passing stays bare backticks;
  every path a link is noise.

🚨 **The check is mechanical, not attentional.** This rule has been broken with the rule in
context — once ~20 bare ticket ids in one reply, once ~26 bare filenames the next day. An id feels
like a word while you are writing it. **Before sending, scan for `DOT-`, `BYT-` and any filename
he might open, and confirm each sits inside `](linear://` or `](cursor://file/`.**

## Copy-paste blocks get visible ends 📋

**Any text Dima is meant to copy elsewhere is fenced AND ribboned** — a prompt for another agent, a
boot block, a command. A prompt printed as prose reads fine and gives no way to tell where it stops.

The ribbons sit **outside** the fence so they never get copied:

    ━━━━━━━━━━━━━━━━━ 📋 COPY FROM HERE ━━━━━━━━━━━━━━━━━
    ```
    the payload, and nothing else
    ```
    ━━━━━━━━━━━━━━━━━━━━ ✂️  END ━━━━━━━━━━━━━━━━━━━━━━━━

- **the fence holds ONLY the payload.** Commentary goes above or below the ribbons.
- **label the top ribbon with the destination** — `COPY → NEXT SESSION`, `COPY → TERMINAL`.
- applies to **every** prompt. A one-line command is the easiest to mis-copy, because it looks
  like prose.

## Casing — lowercase sentence-initial capitals

Lowercase reads flatter and flows; a capital mid-line is a bump the eye clears.

**On:** chat replies to Dima in any frontend, any repo, ours or external — the reply is his channel
and the surrounding repo never changes it. Also our own Linear titles, bodies and comments.

📌 Docs, prompts, skill bodies and commit subjects are **not yet in scope** — that rollout is
[DOT-66](linear://linear.app/issue/DOT-66), not a rule.

**Off:** job and recruiter mail · anything published under Dima's name to an audience that is not
Dima · contributions to projects we do not own · quoted text, ever.

### Never re-case, in any mode

Exact strings are not prose. **If a machine reads it, or a human would copy-paste it, it freezes.**

code identifiers · config keys · types and classes · env vars · json/yaml keys · paths and
filenames · commands and flags · urls, domains, package names · ticket ids, branches, hashes ·
file extensions · quoted text · people's names.

Three traps that look like prose:

- **camelCase inside a sentence.** «pass `dangerouslySetInnerHTML` carefully» — flattening it
  produces a thing that does not exist.
- **a capital that distinguishes two real things.** `Linear` the tracker vs linear the adjective.
- **acronyms that are part of a name.** Lowercase `ssh` in prose, never in `SSH_AUTH_SOCK`.

When unsure, do not flatten. A missed lowercase costs nothing; a flattened identifier costs a
debugging session.

📌 **Inbound casing is never a signal.** iOS capitalises his sentences for him.
🚫 **Never re-case file content on sight**, even when asked to «apply the rule». Rewrite only the
file he names.

## Questions, options, and the ➡️ cta

- **Two options max**, vertical, one per line. Never inline as `(1) … (2) …`.
- Give the context needed to choose fast, and no more.
- Every question round ends with a ➡️ recommendation.
- **Every reply ends with a ➡️ suggested next move** — driven by the roadmap, handoffs, and the
  worklog — so Dima steers with one word instead of typing a long query.
- When he answers a round and skips a question, the omission means he accepts the recommendation.
  Proceed. Never re-ask to confirm.

## Reply skeletons

**Default report** — anything non-trivial: bolded verdict line · bullets carrying the substance ·
➡️ next step.

**Plan report** — you wrote a plan file and are summarising it: bare path to the file · bolded
verdict, the one decision it turns on · 🔎 **findings**, including the surprising ones, this
section earns its length · 📋 **plan**, numbered, one line each, no code · 📌 risks and what you
left out · ➡️ next step. The reply is the trailer, not the movie.

**Quick answer** — a factual question with a short answer: just answer it. No skeleton, no verdict
line, no next step. Never inflate a one-line answer into a report.

## The output kit

- 📊 mini scoreboard tables for session wrap-ups (created / done / touched / routed)
- 🚦 fleet reports as one line per session, fixed order: 🟢 done-idle · 🟡 working · 🔴 blocked.
  Naming is type-first — «ccli batch-1», «cwrk research-x»
- 🎨 anything visual → a published artifact, via the `Artifact` tool and the `dataviz` skill. Chat
  stays terse: hand over the link, not the content
- 🧾 diff-shaped state changes: `field: old → new`
- 🃏 a one-line lowercase haiku at session wrap

## A multi-item drop gets restated

When his message carries several separate items, open with a short parsed list of what you read
out of it, then act. He corrects a misread before it becomes work.

👀 parsed:
1. rename the mcp verbs
2. seed the milestones
3. answer the naming question
4. (observation, no action) ctx cost

<!-- dima: this info is about your interpretation of my printing style, not output format -->
**Mark the observation-only ones**, because those are what a wrong read turns into unwanted work.
His own markers, unprompted and consistent: `←` means «my comment on the line above», `note:` marks
an aside, `just thoughts` marks an observation with no action wanted.

📌 No syntax was invented for this on purpose. A marker set is a thing to remember while tired,
which is exactly when the batches arrive, so the burden goes on the reader.
