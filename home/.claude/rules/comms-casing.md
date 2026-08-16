# Casing

Always loaded, sibling to `voice-formatting.md`. That file sets reply *shape*; this one sets
*casing*. Neither ever changes what you do — precision of execution comes first, always.

Source of intent (Dima's verbatim words): `docs/research/comms-casing.md` in the dotfiles repo.
When this file and that one disagree, that one is right.

## The core rule — settled 2026-08-16

**Lowercase sentence-initial capitals.** That is the rule. It is obvious, it has no exceptions
worth arguing about, and nothing downstream depends on it.

Why: lowercase text reads flatter and flows. A capital mid-line is a bump the eye has to clear.
This is a perception-level preference of Dima's, on by default, togglable in one sentence.

## Where it applies

**On — lowercase these:**

- Chat replies to Dima, in any frontend, any repo, ours or external. The reply is Dima's
  channel; the surrounding repo never changes how we talk to him. **(phase 1, live)**
- Our own Linear titles, bodies, comments — 100% lowercased. **(phase 1b, live 🧪)**
- Docs, ADRs, notes, plans in repos Dima owns. **(phase 2, not started)**
- Prompts and skill bodies. **(phase 3, not started)**
- Commit subjects and bodies — the emoji + type prefix keeps its own shape. **(phase 3, not started)**

**Off — standard casing here:**

- Job application letters, accompany messages, recruiter / HR / client mail.
- Anything published under Dima's name to an audience that is not Dima.
- Contributions to projects we do not own — match that project's choice.
- Quoted text. Never re-case someone else's words.

## Never re-case, in any mode

These are exact strings, not prose. Casing is meaning — flatten one and it stops working,
silently. The test: **if a machine reads it, or a human would copy-paste it, it freezes.**

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
| quoted text | anything Dima or anyone else wrote, reproduced |
| people's names | always |

Three traps worth naming, because they look like prose:

- **camelCase inside a sentence.** "pass `dangerouslySetInnerHTML` carefully" — the word sits in
  prose but is not prose. Flattening it produces a thing that does not exist.
- **A capital that distinguishes two real things.** `Linear` the tracker vs. linear the
  adjective. `Desktop Commander` the MCP server vs. desktop the surface.
- **Acronyms that are part of a name.** Lowercase `ssh` in prose, never in `.ssh/config`,
  `SSH_AUTH_SOCK`, or `CST-SPEC.md`.

When unsure, do not flatten. A missed lowercase costs nothing; a flattened identifier costs a
debugging session.

## Inbound

Dima may send uppercased text. iOS capitalises the first word of each sentence, and fighting it
is bad UX. His casing is never a signal to change yours.

## Files — rewrite only when asked

Phases 2 and 3 are not started. Do not re-case file content on sight, ever, at this stage —
even when asked to "apply the rule". Rewrite only the file Dima names. When phases 2–3 open,
they open for `~/projects` only; external repos keep their own casing, always.

📌 **Reminder to raise, not to act on:** when the lab layers settle and the flaw list goes quiet,
propose turning on rewrite-on-sight. Raise it — do not switch it on. A sweep done under unsettled
rules bakes bad decisions into every file at once.

---

# LAB — under test, not settled

(claude-important) These layers are live so we can feel them, not because they are decided. Watch
every reply and every ticket you write for casing damage, flag what you see, and suggest tunings.
When a layer settles, promote it into the rules above and delete its lab row; when it is rejected,
delete the row. This section is meant to shrink. (claude-important)

| layer | status | the tension |
| --- | --- | --- |
| brand + proper nouns flat (`linear`, `github`) | 🧪 on | flatness reads better in bulk, but a capital is sometimes the only thing separating `Linear` the tracker from linear the adjective |
| acronyms flat (`ssh`, `api`, `adr`) | 🧪 on | fine from a distance; specific cases may bite |
| phase 1b — Linear text lowercased | 🧪 on, opened 2026-08-16 | internal, ours alone, rewritable in one click — the cheapest place to find flaws before touching real files |

📌 The honest risk with all of these: every exception we carve out builds a layer of rules, and
layers contradict the core idea — that flat text reads better *because* it is uniform. Start
simple, add an exception only when a real collision forces it, never preemptively.
