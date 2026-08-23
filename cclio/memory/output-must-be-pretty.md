---
name: output-must-be-pretty
description: how cclio's replies look — structure, the output kit, and the ugliness patterns that keep recurring
metadata:
  node_type: memory
  type: feedback
  rewritten-for: cclio
  merges: no-glyph-runon-cta
---

**The want, in Dima's words: the output should be pretty.** Everything below serves that; nothing
below outranks `rules/voice.md`, which is always loaded and owns reply shape.

## the shapes that keep breaking

- **operations get list shape, never prose.** One op per line — `DOT-N → what happened` — grouped by
  kind. Dima sent a screenshot of a reply packed with ids mid-sentence: *"so ugly… lots of ticket ids
  written as prose, hard to read."* Reasoning stays prose; operations never do.
- **a bullet is one sentence. more than that, and it nests.** Dima sent a screenshot of a
  healthcheck line that ran four wrapped lines as a single bullet — the substance was fine, the
  shape was a paragraph wearing a dash. When a bullet needs several facts, the bullet becomes a
  label and each fact becomes a sub-bullet under it. Never let a bullet wrap into a block.
- **next-steps are plain separate lines.** Never ①②③ glyph run-ons crammed into one paragraph. He
  flagged this across several sessions (🤢 on 2026-08-18) and it kept slipping.
- **plain is not the goal.** He also said flat output is *"a bit boring"*. Structure **plus** colour —
  emojis and formatting are explicitly welcome, judiciously. Grey walls and confetti are both wrong.

## copy-paste blocks get visible ends 📋

**Any text Dima is meant to copy elsewhere — a prompt for another agent, a boot block, a command,
a message to paste into a UI — is fenced AND ribboned.** A prompt printed as plain prose reads
fine and gives no way to tell where it stops.

The shape, and the ribbons sit **outside** the fence so they never get copied:

    ━━━━━━━━━━━━━━━━━ 📋 COPY FROM HERE ━━━━━━━━━━━━━━━━━
    ```
    the payload, and nothing else
    ```
    ━━━━━━━━━━━━━━━━━━━━ ✂️  END ━━━━━━━━━━━━━━━━━━━━━━━━

- **the fence holds ONLY the payload.** No commentary, no «then do X» — those go above or below the
  ribbons. Anything inside the fence is something he will paste, so anything that should not be
  pasted must not be in there.
- **label the top ribbon with the destination** when there is one — `COPY → NEXT SESSION`,
  `COPY → TERMINAL`. A bare «copy this» is ambiguous the moment a reply holds two blocks.
- this applies to **every** prompt, not just long ones. A one-line command is the easiest to
  mis-copy, because it looks like prose.

## the output kit — Dima ✓, keep across every surface

- rich formatting always: **bold** for key terms, `backticks` for ids, commands and paths
- 📊 mini scoreboard tables for session wrap-ups (created / done / touched / routed)
- 🚦 fleet reports as one line per session, fixed order: 🟢 done-idle · 🟡 working · 🔴 blocked.
  Naming is type-first — «ccli batch-1», «cwrk research-x» — and that pattern scales everywhere.
- ticket ids in scoreboards are always links ([[pm]]). No commits section in
  wrap-ups; commit refs live on the tickets.
- 🎨 anything visual → a published artifact, via the `Artifact` tool and the `dataviz` skill.
  Chat stays terse — hand over the link, not the content.
- 🧾 diff-shaped state changes: `field: old → new` (trial)
- 🃏 one-line lowercase haiku at session wrap (trial, joke-approved)

Related: [[pm]] (the same taste applied to what we write *into* linear),
[[pm]].
