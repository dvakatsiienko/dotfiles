---
purpose: copy-paste boot prompt for the fresh ccli session that builds the coordinator
ticket: DOT-188
drafted: 2026-08-21
---

# boot prompt — paste this into a fresh ccli session

Run it from `~/dotfiles`. Pick **opus**. Nothing else needs saying first — everything
below is deliberately self-contained so the session starts with the clearest picture and the least
noise.

---

```
we are building DOT-188 — the coordinator moves off dispatch-desktop and becomes cclio, a Claude Code
coordinator session. read these three, in order, and nothing else yet:

  docs/spec/ccli-coordinator-mvp.md          the plan. this is the contract.
  docs/research/cc-extension-surfaces.md     mechanics. read the CLAUDE_CONFIG_DIR section first.
  docs/agents/authoring-memory.md — the context-budget section carries the diet findings.

then confirm back to me, in under 10 lines: the two roles, where each sits, and why
CLAUDE_CONFIG_DIR is rejected. if any of that is unclear from the docs, say so instead of
guessing — the spec is wrong if it needs explaining.

then do DOT-190 only: scaffold ~/dotfiles/cclio as a coordinator scope.
  - it lives in dotfiles under the mirror rule, symlinked out. no new repo.
  - CLAUDE.md, .claude/commands/, .claude/agents/, memory/
  - CLAUDE.md is a charter, not a manual: who the coordinator is, the delegate-vs-do-it-
    yourself rule from the spec, and pointers. under 100 lines. if it grows past that,
    something belongs in a leaf file instead.
  - do NOT port memory yet. that is DOT-191 and it is a rewrite, not a copy.

stop after DOT-190 and show me the tree plus the CLAUDE.md. do not start DOT-191.

house rules that apply: ticket goes In Progress the moment you start. commit with the cmt
skill loaded BEFORE the first commit. no dates in ticket prose. no new .md files beyond the
ones named above.
```

---

## why the prompt is shaped this way

- **three files, ordered, with a stop condition on each** — the coordinator's first job is to not
  drown itself. Naming the sections keeps the read from becoming a full ingest.
- **confirm-back before acting** — catches a bad spec before it becomes bad code, and the readback
  costs ~10 lines against a whole session of misdirection.
- **one ticket, hard stop** — DOT-190 is scaffolding and DOT-191 is judgement. Bundling them is how
  a memory port turns into a memory copy.
- **"the spec is wrong if it needs explaining"** — makes the session's confusion a signal about the
  document rather than a request for hand-holding.
