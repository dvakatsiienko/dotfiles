---
name: comms-casing
description: DRAFT — casing rule for all communication Dima owns. lowercase for casual channels (chat replies, our own docs, prompts, notes, commit bodies); standard casing for outgoing formal writing (job letters, recruiter/client mail) and for contributions to projects we do not own. Load EVERY time you write prose for Dima in any channel.
---

# comms-casing

(claude-important) draft — while using this skill, watch for casing issues and suggest tunings. (claude-important)

## scope

pet projects only — anything under `~/projects`, plus chat replies to dima anywhere.
outside that tree this skill does not apply and ideally does not load. external repos
keep their own casing, always.

## why

lowercase text reads flatter and flows. a capital letter mid-line is a bump the eye
has to clear. this is a perception-level preference of dima's, on by default, and he
can toggle it off in one sentence.

## rollout — phase 1 is the only live phase

adoption is gradual. each phase opens only after the previous one runs clean for a while
and its flaws are fixed.

- **phase 1 — LIVE.** chat replies to dima. nothing else. lowest blast radius: a bad call
  costs one awkward sentence, never a broken file.
- **phase 2 — not started.** `README.md` and other prose docs in `~/projects`, rewritten
  in place, one file per commit.
- **phase 3 — not started.** skills, prompts, linear issues, commit bodies.

while in phase 1: do not lowercase file content, even when asked to "apply the rule",
unless dima names the file.

## on — lowercase these

- chat replies to dima, in any frontend. **(phase 1, live)**
- docs, adrs, notes, plans in repos dima owns. **(phase 2)**
- prompts and skill bodies. **(phase 3)**
- commit subjects and bodies — the emoji + type prefix keeps its own shape. **(phase 3)**
- linear issue titles, bodies, comments. **(phase 3)**

## off — standard casing here

- job application letters, accompany messages, recruiter / hr / client mail.
- anything published under dima's name to an audience that is not dima.
- contributions to projects we do not own — match that project's choice.
- quoted text. never re-case someone else's words.

## never re-case, in any mode

these are exact strings, not prose. casing is meaning — flatten one and it stops
working, silently. the test: **if a machine reads it, or a human would copy-paste it,
it freezes.**

| kind | examples |
| --- | --- |
| code identifiers | `dangerouslySetInnerHTML`, `useState`, `getServerSideProps` |
| config keys | `disableClaudeAiConnectors`, `runtimeExecutable`, `cacheComponents` |
| types + classes | `TypeScript`, `ReactNode`, `HTMLElement` |
| env vars, constants | `GITHUB_TOKEN`, `SSH_AUTH_SOCK`, `NODE_ENV` |
| json / yaml keys | `"allowed_bots"`, `"permissions.allow"` |
| paths + filenames | `~/projects/dotfiles`, `CLAUDE.md`, `SKILL.md`, `Brewfile` |
| commands + flags | `pnpm dotfiles-link apply`, `--no-verify`, `git -C` |
| urls, domains, package names | `@anthropic-ai/sdk`, `help.sap.com` |
| ticket ids, branches, hashes | `DOT-66`, `iterate-on-configs`, `eb35d6a` |
| file extensions in context | `.tsx`, `.aiff`, `.zshrc` |
| quoted text | anything dima or anyone else wrote, reproduced |
| people's names | always |

three traps worth naming, because they look like prose:

- **camelCase inside a sentence.** "pass `dangerouslySetInnerHTML` carefully" — the word
  sits in prose but is not prose. flattening it produces a thing that does not exist.
- **a capital that distinguishes two real things.** `Linear` the tracker vs. linear the
  adjective. `Desktop Commander` the mcp server vs. desktop the surface.
- **acronyms that are part of a name.** lowercase `ssh` in prose, never in `.ssh/config`,
  `SSH_AUTH_SOCK`, or `CST-SPEC.md`.

when unsure, do not flatten. a missed lowercase costs nothing; a flattened identifier
costs a debugging session.

## inbound

dima may send uppercased text. ios capitalises the first word of each sentence, and
fighting it is bad ux. his casing is never a signal to change yours.

## OPEN QUESTIONS — resolve with dima before this leaves draft

1. proper nouns and brand names in casual prose — lowercase them too (`linear`,
   `github`), or keep them? full flatness vs. not misspelling other people's names.
2. acronyms — `ssh`, `api`, `adr` lowercased, or kept upper?
3. sentence-initial capitals only, or all capitals? i.e. is the rule "no capitals" or
   "no bumps"?
4. existing files — rewrite in place on sight, or only what we touch?
