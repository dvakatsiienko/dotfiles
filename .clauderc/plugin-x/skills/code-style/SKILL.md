---
name: code-style
description: Update the evergreen code style guides (react.md / typescript.md) with a new practice — from a code example, highlighted snippet, or a plain instruction. Use when the user shows code and says "add this to the style guide", "codify this", or invokes /x:code-style.
---

# Code Style — style-guide updater

The code style guides are **evergreen**: actively maintained, positive contributions encouraged.
This skill is the fast path: the user hands you an example or a rule → you fold it into the
right guide, properly.

Guides (edit the REAL paths — `~/.claude/guides/` is a symlink):

- `~/.dotfiles/.clauderc/guides/react.md`
- `~/.dotfiles/.clauderc/guides/typescript.md`

## Operation

1. **Parse the contribution.** Input is a code example, a highlighted fragment, or prose.
   Extract the *practice* being taught — the rule, its why, and (if given) the better/worse shapes.
2. **Pick the target guide** — react.md for component/JSX/file-layout concerns, typescript.md
   for types/imports/language concerns. Both when the practice genuinely spans them (rare —
   prefer one home + a cross-reference).
3. **Integrate, don't append.** Find the section the practice belongs to; merge with existing
   rules. No duplicates: if a related rule exists, enrich it. If the contribution *contradicts*
   an existing rule, stop and ask — the user decides which wins.
4. **Honor the guides' own header contract**: pretty, scannable, tight prose, working examples,
   stable emphasis. Convert user examples to house style before embedding (the guide must never
   contradict itself). Trim example code to the decision-rich part.
5. **Report** what changed in 2–3 lines: which guide, which section, the rule as codified.
   Never commit — guides live in `~/.dotfiles`, the user commits their dotfiles themselves.

## Boundaries

- This skill maintains the two style guides only — not CLAUDE.md, not project docs.
- Reality outranks aspiration: if the practice conflicts with how the canon specimens actually
  look (see react.md "Canon specimens"), surface the conflict instead of silently codifying.
