---
name: comms-casing
description: DRAFT — casing rule for all communication Dima owns. lowercase for casual channels (chat replies, our own docs, prompts, notes, commit bodies); standard casing for outgoing formal writing (job letters, recruiter/client mail) and for contributions to projects we do not own. Load EVERY time you write a chat reply to Dima, in any repo, ours or external. File and doc rewriting is HALTED while the skill is draft — replies only.
---

# comms-casing

(claude-important) draft — while using this skill, watch for casing issues and suggest tunings. (claude-important)

## scope

**chat replies to dima always, in any repo, ours or external.** the reply is dima's channel;
the surrounding repo never changes how we talk to him.

**files are a different question, and they are halted.** while this skill is draft, do not
re-case file content anywhere — see the rollout below. when phases 2–3 open, they open for
`~/projects` only; external repos keep their own casing, always.

## why

lowercase text reads flatter and flows. a capital letter mid-line is a bump the eye
has to clear. this is a perception-level preference of dima's, on by default, and he
can toggle it off in one sentence.

## rollout — phase 1 is the only live phase

adoption is gradual. each phase opens only after the previous one runs clean for a while
and its flaws are fixed.

- **phase 1 — LIVE.** chat replies to dima. nothing else. lowest blast radius: a bad call
  costs one awkward sentence, never a broken file.
- **phase 1b — LIVE 🧪 (added 2026-08-16).** our own linear text: issue titles, bodies,
  comments. 100% lowercased. it is internal, ours alone, and rewritable in one click, so
  it is the cheapest place to find flaws. **watch every ticket you write for casing
  damage and report what you see.**
- **phase 2 — not started.** `README.md` and other prose docs in `~/projects`, rewritten
  in place, one file per commit.
- **phase 3 — not started.** skills, prompts, commit bodies.

while in phase 1: do not lowercase file content, even when asked to "apply the rule",
unless dima names the file.

## on — lowercase these

- chat replies to dima, in any frontend. **(phase 1, live)**
- our own linear titles, bodies, comments. **(phase 1b, live 🧪)**
- docs, adrs, notes, plans in repos dima owns. **(phase 2)**
- prompts and skill bodies. **(phase 3)**
- commit subjects and bodies — the emoji + type prefix keeps its own shape. **(phase 3)**

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

## the core rule — settled 2026-08-16

**lowercase sentence-initial capitals.** that is the rule. it is obvious, it has no
exceptions worth arguing about, and nothing downstream depends on it. everything else
below is a layer on top, and every layer is an experiment.

## LAB — layers under a/b test, not settled

these are live so we can feel them, not because they are decided. each one may be kept,
refined, or dropped. **flag anything that reads worse.**

| layer | status | the tension |
| --- | --- | --- |
| brand + proper nouns flat (`linear`, `github`) | 🧪 lab, on | flatness reads better in bulk, but a capital is sometimes the only thing separating `Linear` the tracker from linear the adjective |
| acronyms flat (`ssh`, `api`, `adr`) | 🧪 lab, on | fine from a distance; specific cases may bite |

📌 the honest risk with both: every exception we carve out builds a layer of rules, and
layers contradict the core idea — that flat text reads better *because* it is uniform.
start simple, add an exception only when a real collision forces it, never preemptively.

## files — rewrite only when asked

do not re-case a file on sight, ever, at this stage. rewrite only the file dima names.

📌 **reminder to raise, not to act on:** when the lab layers settle and the flaw list goes
quiet, propose turning on rewrite-on-sight. raise it — do not switch it on. the reason for
waiting is that a sweep done under unsettled rules bakes bad decisions into every file at
once.
