---
name: voice-sync
description: Load when Dima asks to sync or refresh the fleet voice — into his desktop profile (cc lane) or the desktop global memory (cw lane).
disable-model-invocation: true
---

# voice-sync

deliver the fleet voice + formatting rules from their master files to a claude desktop surface.

**master files — read them fresh every run, never work from a remembered digest:**

- `rules/fleet-voice.md` — tone, manner, corrections
- `rules/fleet-output-format.md` — the mechanical shape: answer-first, casing, bullets, emoji, fences
- `rules/dima-signals.md` — how to read dima's inbound messages
- `rules/fleet-identity.md` — who each fleet member is, plus `inbox` and its hazards

(cc reads them at `~/dotfiles/home/.claude/rules/`; a desktop thread reads the same absolute
paths via Desktop Commander.)

**translation rule:** drop terminal-only mechanics — the md-table ban, `cursor://` link schemes,
copy-fence ribbons. keep everything that is voice, behavior, or reply shape.

## lane pick — by surface, no asking

- **claude code session** (a shell, the dotfiles repo on disk) → PROFILE lane
- **desktop thread** (chat or cowork, files reachable only via Desktop Commander) → MEMORY lane

## PROFILE lane (cc)

dima pastes his current profile text — expect it, ask for it if missing. produce the complete
new profile block, fenced for paste:

- every non-voice section of his paste stays verbatim
- «How to answer» + «Formatting» sections regenerate from the master files
- version-stamp the voice: `fleet voice vN · <date> · master: dotfiles rules/…` — bump N
- flag (outside the fence) anything in his paste that looks stale against current fleet reality

## MEMORY lane (desktop)

1. read the four master files via Desktop Commander.
   `fleet-identity.md` lands in its own memory entry (`fleet`), not in the voice digest — refresh
   it in the same run so cw always knows who is who and how `inbox` is handled.
2. condense to ~10–14 lines, each prefixed `fleet voice (from dotfiles rules):`.
3. merge into the existing global **«Preferences»** entry (the You section): replace ONLY the
   previous `fleet voice…` lines — every other line stays. no new entry, never a full overwrite.
4. dedupe pass: list the entry back after writing; a duplicated or contradicting voice line
   gets cleaned.
5. report: files read · write succeeded · the final stored text · surface (global vs
   project-scoped).

## 👁️ the live watch — first sync 2026-08-26

the memory lane's durability is unproven. what we watch, until a verdict:

- do the `fleet voice…` lines survive the **nightly memory regeneration** verbatim — not
  compressed, merged, or dropped? (dima keeps a saved copy of the pre-watch preferences text
  for diffing.)
- does a fresh desktop thread actually **follow** the voice unprompted?
- verdict: survives + followed → memory lane is the refresh path. mangled → memory lane
  demotes to nice-to-have, the profile carries alone. write the verdict here, dated.

## completion criterion

the target surface holds exactly ONE current voice digest, shown in the reply. a write that
could not be verified is reported as unverified, never as done.
