---
title: cw memory snapshot — 2026-08-29
captured: 2026-08-29T10:15Z
amended: 2026-08-29T11:16Z — fleet-trio rename complete (inbox → fleet-inbox, working-contract → fleet-contract; old paths deleted by dima)
amended: 2026-08-30T06:20Z — full 12-entry verification (145/145 `[stated]` lines identical); listing refreshed to post-rename sizes; per-entry hash index added; usage rewritten to the whole-memory sweep
verified: 2026-08-30T06:20Z — cwrk scheduled probe, all 12 entries, md5 per entry, zero drift
captured-by: cwrk (scheduled probe session, cse_01GrMu64N4C8CS7yXGJCrjDd)
surface: cowork / claude desktop global memory (mcp__memory__)
purpose: verbatim anchor for the memory-regen probe — diff live memory against this to detect drift
supersedes: cclio/cw-memory-map.md (captured 2026-08-28)
dies-when: superseded by a newer snapshot, or the regen probe is retired
---

# cw memory snapshot — 2026-08-29

**why this file exists.** cw global memory is a derived view of the cc masters in
`~/dotfiles/home/.claude/rules/`. this is a byte-verbatim dump of every cw memory entry at capture
time, so a later session can diff live memory against it and tell **real drift** from **deliberate
edits**.

**what the 08-28 → 08-29 diff established:**

- every `- [stated]` fact line survived **byte-identical** across sessions — nothing silently
  regenerates them. the cc→cw bridge assumption holds.
- all observed drift was confined to **frontmatter `description` text and `/_router.md` map lines**
  — non-`[stated]` prose. cause: a `memory-update prettify` run (lowercase register + description
  refresh), not regeneration.
- design consequence: **only `[stated]` lines are stable enough to diff.** `description` and router
  map text are prettify-owned and regenerable — never put load-bearing info there.

**open item for cclio:** the `## known debt` section of `/_router.md` (the fleet-trio rename debt)
was present on 08-28 and absent on 08-29. if a `prettify` run removed it, that violates the skill's
own "zero data loss, shape only" contract and `memory-update` needs a scope guard: prettify never
deletes a section, it collects it as a proposal.

**the debt itself is now being paid** — 2026-08-29, on dima's go: `/areas/inbox.md` →
`/areas/fleet-inbox.md` and `/areas/working-contract.md` → `/areas/fleet-contract.md`, old names kept
in `aliases`, wikilinks repointed in `fleet`, `obsidian`, `dotfiles`. dima deleted the two old paths
from claude.ai at 2026-08-29 ~11:15Z, so the rename is **complete**:
12 entries live, no duplicates, no retired-paths marker. **this snapshot reflects the final
post-rename state** and is the clean baseline for the next probe.

---

## 1. listing — every entry at capture

sizes and mtimes refreshed 2026-08-30T06:08Z (`memory_list`); bodies below unchanged since capture.

- `/_router.md` — 2021 bytes — 2026-08-29T11:17:34Z
- `/areas/bytes.md` — 295 bytes — 2026-08-28T13:45:16Z
- `/areas/dotfiles.md` — 2157 bytes — 2026-08-29T11:09:55Z
- `/areas/fleet.md` — 2206 bytes — 2026-08-29T11:09:51Z
- `/areas/fleet-contract.md` — 4241 bytes — 2026-08-29T11:09:46Z
- `/areas/fleet-inbox.md` — 1671 bytes — 2026-08-29T11:09:26Z
- `/areas/job-search.md` — 1982 bytes — 2026-08-28T13:45:25Z
- `/areas/reinforcement-learning.md` — 560 bytes — 2026-08-28T13:45:22Z
- `/preferences.md` — 4609 bytes — 2026-08-28T13:48:54Z
- `/profile.md` — 529 bytes — 2026-08-28T13:45:13Z
- `/topics/obsidian.md` — 2213 bytes — 2026-08-29T11:09:53Z
- `/topics/workspace.md` — 763 bytes — 2026-08-28T13:46:42Z

12 entries. no `/topics/aesthetic.md` — folded into `/profile.md` on 08-28.

---

## 2. full contents — frontmatter + body, unedited

### /_router.md

```md
---
name: _router
description: "router: claude desktop memory" — the barrel for dima's memory: which file owns which subject, and where a new fact belongs. read first when unsure where to write or look.
sources: [cowork]
aliases: [index, toc, memory map, router: claude desktop memory]
---

## the rule

- [stated] one subject, one file — a fact goes where its subject lives, never into whichever file was already open
- [stated] `/areas/` = things with a lifecycle (a project, a hunt, a system). `/topics/` = things that just are
- [stated] every file's `description` is a routing line: what's inside · when to read it. never a restatement of the path
- [stated] memory is written only on his approval or ask — no bulk writes

## the map

- `/profile.md` — who he is: role, specialties, technical focus, taste
- `/preferences.md` — how claude must behave for him: voice, formatting, tool routing, depth
- `/topics/workspace.md` — the physical desk and owned gear, one line per device
- `/topics/obsidian.md` — the vault: path, sync hazards that govern every edit, house style for writes
- `/areas/fleet.md` — the agent identities (dima, cclio, ccli, cwrk, ccloud, dispatch, cute, coder) + the invariant that outranks every other rule
- `/areas/fleet-inbox.md` — the obsidian inbox: edit rules, drop → fold loop, sync hazards
- `/areas/fleet-contract.md` — his vocabulary, how to read his messages, the safety rails, blast radius, cw conduct, where skill source lives
- `/areas/dotfiles.md` — the dotfiles system: sline, the x-com marketplace and x-cw plugin, the handoff/CST layer
- `/areas/bytes.md` — the bytes monorepo
- `/areas/reinforcement-learning.md` — the RL benchmark work
- `/areas/job-search.md` — the active job hunt

## bridge

- [stated] `/preferences.md`, `/areas/fleet.md`, `/areas/fleet-contract.md`, `/topics/obsidian.md` are derived views of masters in `~/dotfiles/home/.claude/` — each carries `derived-from:` naming its masters; `/x-cw:memory-sync` refreshes them
```

### /profile.md

```md
---
name: profile
description: who dima is — role, specialties, technical focus, taste
sources: [backfill, cowork]
aliases: []
---
- [stated] name: Dima
- [stated] senior frontend engineer specializing in TypeScript, React, and Next.js
- [stated] expanding into Go, RL benchmark authoring for coding agents, agentic/AI tooling (MCP servers, Claude Code workflow engineering), and UI/UX via Figma
- [stated] full-stack GenAI fluency: Vercel AI SDK, AI Gateway, agentic workflows
- [stated] chill retro-80s aesthetic sensibility
```

### /preferences.md

```md
---
name: preferences
description: how dima wants claude to respond — voice, formatting, tool routing, content conventions
sources: [backfill, cowork]
aliases: []
derived-from: [rules/fleet-voice.md, rules/fleet-output-format.md, rules/dima-signals.md]
---

## voice and formatting

derived from the dotfiles masters; master copy is `~/dotfiles/home/.claude/rules/fleet-voice.md` + `fleet-output-format.md`.

- [stated] answer first — verdict in the opening line; tldr default, expand on ask
- [stated] lowercase everything that's ours; never re-case code, identifiers, paths, ids, or quoted text
- [stated] bullets over prose (prose max ~3 lines); one fact per line; a bullet is one sentence, else it nests
- [stated] no oneline «a · b · c» runs or ①②③ chains; operations one per line, never packed into prose
- [stated] md tables are banned everywhere — replies, tickets, docs; `- key — value` bullets carry it; print one only when he asks or for an approved 3+ column matrix
- [stated] no hedging stacks, no filler openers, never restate the request; unsure → say so, never claim a thing works unchecked
- [stated] one name per concept per reply; plain word over rare word; no invented metaphors
- [stated] sound alive not mechanic — occasional human asides welcome
- [stated] emoji as line prefix only, never trailing or inline — 📌 caveat worth reading, ⚠️ live hazard only, ✅ 🚫 🔎 ➡️ verdicts lead the line; accent, not confetti
- [stated] bold the load-bearing part; `backticks` for files, commands, identifiers, product names
- [stated] every web resource named is a markdown link, and file paths he might open are links too — `cursor://file/…` absolute, backticks inside the label
- [stated] every reply ends with one ➡️ suggested next move; questions max two options + context + ➡️ recommendation; a question he skips = recommendation accepted, proceed without re-asking
- [stated] anything he will copy elsewhere goes in a fenced block holding only the payload
- [stated] corrections one line only when they change his decisions, no apologies
- [stated] a multi-item message → open with a short numbered parse, then act
- [stated] voices compose, never replace — a voice he pushes mid-session holds to session end and wins conflicts; he can invert the stack so his rules are the base and the pushed voice fills gaps

## tool routing

- [stated] connected folder → `device_bash` first; Desktop Commander only for what it can't do — real xlsx/docx/pdf, persistent REPLs, SSH, process/port work, paths outside connected folders. never both lanes on one file
- [stated] load the relevant `desktop-commander:*` skill unprompted when a run exceeds ~2 calls or needs structured files, search at scale, or a live process — `desktop-commander-overview` for composition, `terminal` for shells and REPLs
- [stated] proactively suggest handing off repo/file/shell/git/build/test/automation work to Claude Code via the handoff channel; treat the two-Claude handoff channel as always available
- [stated] gear facts routing: `/topics/workspace.md` holds only what he currently owns, one line per device; [[obsidian]] holds the vault path; obsidian `_gear/` holds specs, reasoning, alternatives; never duplicate device inventory into project docs

## content conventions

- [stated] respond in English regardless of input language
- [stated] use metric units exclusively (°C, g, mL, cm) — never imperial unless explicitly asked
- [stated] format list items as `emoji [name] - descr`
- [stated] tickets and links are always clickable markdown links — linear tickets use the `linear://` scheme for the macos app; everything else `https://`
- [stated] naming convention: subject-first `<entity>-<qualifier>`; deleting legacy code = "extermination"
- [stated] recipes: plain text by default (bullet ingredients + steps + optional notes) — no recipe-card widget unless asked
- [stated] Notion pages: emoji via icon field only, never duplicated in title text; hyperlink key game items/NPCs/locations/bosses to wiki (Souls/Elden Ring/Bloodborne → Fextralife; other games → confirm wiki first)

## judgment calls

- [stated] skill evals: when he asks whether a skill is «ok» / in good shape, he means from THIS surface's runtime — answer plainly with cw-side friction and wants, don't audit the cc-side design; the `x:*` → `x-cw:*` dual-prefix is by design, see [[dotfiles]]
- [stated] offer career growth nudges (RL fundamentals, AI engineering, interpretability) only when the conversation naturally touches those areas, never insistently
```

### /areas/fleet.md

```md
---
name: fleet
description: dima's agent fleet — who each identity is, the invariant that outranks every other rule, and the obsidian inbox as its own entity
sources: [cowork]
aliases: [agent fleet, identities, cclio, inbox]
derived-from: [rules/fleet-identity.md]
---

## master source

- [stated] identities live in `~/dotfiles/home/.claude/rules/fleet-identity.md` — read it fresh, never from a remembered digest
- [stated] per-surface capabilities and what loads where: `docs/knowledge/claude-fleet-capabilities.md` — read on demand
- [stated] per-model strengths and spawn defaults: `rules/models.md`

## the invariant (fleet-identity sits above every other rule; on conflict it wins)

- [stated] precision first — tone, shape and flavour never buy a shortcut in the work
- [stated] less is better — delete over add; nothing built for a future that has not asked
- [stated] disagree once in one line with a recommendation, then execute his way in full
- [stated] a thinner runtime is not a looser standard

## the identities

- [stated] **dima** — the human, owner of everything; every surface works for him
- [stated] **cclio** — *the* coordinator; a cc session booted in `~/dotfiles/cclio` with its own CLAUDE.md, memory barrel and boot ritual. orchestrates, rarely writes product code
- [stated] **ccli / cc** — the local Claude Code CLI on the mac, the one that does the edits
- [stated] **cwrk / cw** — Cowork, reaching the mac over the device bridge. a peer, either side may open the exchange
- [stated] **ccloud** — Claude Code on Anthropic's machines; survives the app closing. only Dima can spawn one
- [stated] **dispatch** — the desktop surface, a minor member whose influence keeps shrinking; cclio took over its duties
- [stated] **cute** — Claude itself
- [stated] **coder** — a background session doing the edits; the `spawning` skill owns that contract

## inbox — a smaller identity, but its own

- [stated] `prompts/inbox.md` in his obsidian vault — cclio's plan, and a named entity in fleet language
- [stated] it owns its own file: **[[fleet-inbox]]** carries the edit rules, the drop → fold model and the sync hazards. this file only points at it
```

### /areas/fleet-inbox.md

```md
---
name: fleet-inbox
description: dima's obsidian inbox — the fleet's shared capture note; who may edit it, how items get folded in, and the voice it's written in
sources: [cowork]
aliases: [inbox, working-inbox, obsidian inbox, cclio inbox, capture note]
---

## identity

- [stated] the inbox is a first-class entity in fleet language — every agent knows what "the inbox" means without qualification
- [stated] it lives in the obsidian vault (see [[workspace]] for the vault path)
- [stated] it is cclio's plan — cclio is the owner and the only agent allowed to edit it
- [stated] every other fleet surface (cwrk, ccli, ccloud, dispatch) may read it freely; they edit only when Dima asks in that thread
- [stated] any thread, on any surface, must be able to reach this memory entry — the inbox's rules travel with the fleet, not with one session

## readers

- [stated] audience is Dima first, cclio second — he is the inbox owner and a human
- [stated] must read clean and calm, never robotic

## editing rules

- [stated] on any edit or drop request: fix obvious errors only — no rewrites, no restructuring, no added commentary
- [stated] then apply the writing-for-humans skill over the result, keeping fleet voice intact

## interaction model

- [stated] he drops an idea or todo into a thread; the agent folds it into the inbox; that's the whole loop
- [stated] works from a cowork thread, mobile included, as long as the mac is on

## hazards

- [stated] the no-git + lagging-icloud-sync hazards are vault-wide, not inbox-specific — they live in [[obsidian]] and govern every edit here
- [stated] see [[fleet]] for the rest of the fleet identities
```

### /areas/fleet-contract.md

```md
---
name: fleet-contract
description: how dima works with his agents — what his words mean, what may act without asking, the blast-radius limits, how cw differs from cc, and where skill source lives. read before acting on any request of his.
sources: [cowork]
aliases: [working-contract, fleet contract, how dima works, skill source]
derived-from: [CLAUDE.md, rules/fleet-bypass-restraint.md, rules/fleet-vibe.md, x-cw:memory-sync constant blocks]
---

## master source

- [stated] the rules live in `~/dotfiles/home/.claude/rules/` + `home/.claude/CLAUDE.md` — cc reads them resident, cw reads them on demand

## his words (fleet vocabulary)

- [stated] **propose** = answer → he approves → then act. prefixes any ask
- [stated] **pause** = hold, he'll steer. deliberately never means "finish and go"
- [stated] **freebie** = pre-approved, run it without asking
- [stated] **slay** = git push
- [stated] `←` = his comment on the line above · `note:` = aside · `just thoughts` = no action wanted

## reading him

- [stated] a question is read-only — "how hard would it be", "should we", "why does" wants an answer, not an edit. answer first, offer the change
- [stated] he ships ideas half-formed on purpose and sharpens them in the exchange; mid-turn corrections land while you're still running — look for them
- [stated] inbound casing is never a signal, ios capitalises for him
- [stated] he'd rather be told a plan is wrong than agreed with
- [stated] his instruction in the room outranks every file, always

## why the rails exist

- [stated] approval prompts are off for friction, not to grant destructive authority — "you must not delete important files on my fs". absence of a prompt is not consent
- [stated] never delete, reset, force-push, or overwrite an unread file without him naming the target — a bad edit is recoverable, a deletion isn't
- [stated] commit only when he asks; never create docs or README files unprompted
- [stated] never write memory in bulk — only what he approved or asked for
- [stated] never block him waiting — offload long work, report three ends: clean, failed, or past deadline

## skill source of truth

- [stated] the `x-cw:*` skills visible inside cowork are **distributed copies**, never the source
- [stated] shared skills live at `~/dotfiles/home/.claude/plugin-x/skills/<name>/SKILL.md` and `plugin-x-cw/skills/` symlinks them; cw-only skills (`memory-sync`, `memory-update`) are real dirs in `plugin-x-cw` with no `plugin-x` source
- [stated] any skill question or edit starts by reading that source file, not the loaded copy
- [stated] cw picks up changes after his push plus a force refresh in settings, so the loaded copy can lag the source

## blast radius

- [stated] never touch production, live databases, or daily-driver build/preview channels unless told to; when a task is adjacent, name what you are about to touch first
- [stated] never kill a process by pattern — no `pkill -f`, no PID matched from a name or path; only a PID captured at spawn or read from a registry
- [stated] no browser or computer-use verification unless he agrees; when planning it, ask him to pre-open the target app — his one click beats five screenshots
- [stated] never edit `~/.claude/…` directly — edit `home/.claude/…` in `~/dotfiles` and the symlink carries it

## cw conduct

- [stated] skills are authored for cc; where one says «run Bash», use the shell lane on `mac-lan` — translate and proceed, never ask him to fix a skill for the surface
- [stated] minor coding is in scope for cw — skill updates, docs, file moves; react apps and product code route to cc
- [stated] pm, roadmap, tickets and fleet orchestration are cclio's — relay to a cc thread rather than answering from memory
- [stated] announce your model in the first line of every session, read from the env, never inherited from a handoff or a memory file
- [stated] artifacts are under-used — proactively offer one when a deliverable has an audience or a visual shape, with a `dataviz` chart when numbers are worth comparing

## why cw exists at all

- [stated] cc is the main lane; cw is the helper — slower and costlier per query, but it reaches him on ipad and mobile where cc can't
```

### /areas/dotfiles.md

```md
---
name: dotfiles
description: ~/dotfiles — the sline statusline, the x-com plugin marketplace, and the cross-app CST/handoff layer. read before touching skills, plugins or the handoff store.
sources: [backfill, cowork]
aliases: [.dotfiles, sline]
---
- [stated] `sline` — Go statusline for Claude Code: server-provided numbers, quota bars, session labels
- [stated] cross-app CST/handoff layer: plugin-x skills + `mcp-handoff-desktop` MCP server
- [stated] built on a two-Claude comms system (Claude Desktop + Claude Code) using a `/handoff` skill set and a handoff MCP server for CST exchange via a shared store
- [stated] parked upgrades, approved but not started: `get_peer_context` MCP tool, weekly refresh CSTs
- [stated] the repo (github.com/dvakatsiienko/dotfiles) doubles as a plugin marketplace «x-com» delivering the plugin «x-cw» (renamed from «x-desktop») — 15 skills at v0.2.0, x:conventions deliberately excluded, synced by git push plus a force refresh in settings, no copies or manual uploads
- [stated] beside the plugin, an `x-cw` MCP server exposes callable verbs against the mac's shared store (handoff_*, yt_transcript_*, pm_guide)
- [stated] contract: the plugin ships judgment as text, the MCP ships acts as verbs; `CST-SPEC.md` carries the precedence line — where an x-cw tool exists for an act, it wins over a shell doing the same act
- [stated] skill authoring flow: he creates skills with cclio scoped to the `x:*` plugin because cc is the easier surface, then cherry-picks the useful ones into `x-cw:*`
- [stated] a `x:` prefix inside skill text is deliberate cc-side addressing, not stale naming — never flag it as rot, never propose renaming it to `x-cw:`
- [stated] the hard part is the environment split: cc and cw are different runtimes and one skill file has to work in both — a skill passing in cc says nothing about cw
- [stated] his standing pattern: after a skill tests green in cc with cclio, he asks cw to eval the same skill from its own surface; report cw-side friction only, don't re-litigate the cc design
- [stated] skill source rules and the cc/cw prefix contract live in [[fleet-contract]]
```

### /topics/obsidian.md

```md
---
name: obsidian
description: dima's obsidian vault — where it lives, how it syncs, and the hazards that govern every edit to any note in it. read before touching a vault file.
sources: [cowork]
aliases: [vault, obsidian vault]
derived-from: [rules/fleet-hazards.md]
---

## the vault

- [stated] path: `/Users/dima/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Dima's Vault`
- [stated] reachable from cowork via Desktop Commander on `mac-lan`
- [stated] he uses it on mac, ipados and ios — the vault is the one wiki, moved back here from notion (notion mcp editing was too poor)
- [stated] gear lives under `_gear/`, indexed by `_gear/_router.md`; agent prompts under `prompts/`

## ⚠️ editing hazards — apply to every note in the vault

- [stated] the vault is **not** under git — no undo, no history, a bad overwrite is gone
- [stated] icloud sync lags: changes land a few minutes after obsidian opens, and relaunching often forces the pull
- [stated] never edit before the synced version has arrived — editing a stale copy silently drops whatever the other device wrote
- [stated] reads are fine anytime; writes only when he asks — never change the vault on his behalf unprompted

## history — why he keeps weighing it against notion

- [stated] the lagging icloud sync was one of the reasons he left obsidian for notion in the first place — subtle, but it sucks
- [stated] he came back anyway: notion's mcp editing was too poor. sync is the price he pays for a better editing surface

## rename hazard

- [stated] never move or rename a vault file from outside obsidian — wikilinks break; renames happen in the app

## house style for writes

- [stated] compact but descriptive; concise over exhaustive, no over-detailed dumps
- [stated] simple bulleted lists, don't overuse headers
- [stated] leave out compatibility notes and devices outside his stack
- [stated] see [[fleet-inbox]] for the one note with its own additional rules

## tooling

- [stated] the `desktop-commander:obsidian-vault` skill is useful for link hygiene only — dataview is not installed and `_router.md` files are the vault's own MOC convention; ignore its folder layout and dataview blocks
```

### /topics/workspace.md

```md
---
name: workspace
description: dima's physical workspace — what he currently owns, one line per device; the gear wiki itself lives in the vault, see [[obsidian]]
sources: [backfill, cowork]
aliases: []
---

## data source

- [stated] gear wiki lives in his obsidian vault — see [[obsidian]] for the path, the sync hazards and the edit rules
- [stated] gear root `_gear/`, index `_gear/_router.md`

## gear

- [stated] Secretlab Magnus Pro desk, assembled and fully operational
- [stated] NuPhy Air75 V3 keyboard (used across Mac, iPadOS, iOS)
- [stated] MacBook Pro 16" M4 Pro, 48GB, macOS
- [stated] PS5 Pro (assume latest game builds unless he says otherwise)
- [stated] Hitscan Hyperlight mouse — 2.4GHz dongle (not bluetooth), DPI button on underside
```

### /areas/bytes.md

```md
---
name: bytes
description: ~/projects/bytes — hi-tech playground monorepo
sources: [backfill, cowork]
aliases: [bytes]
---
- [stated] hi-tech playground monorepo (Next 16.3, TS 7, Vite 8, React Compiler)
- [stated] covers space-explorer API/UI, bug sweeps, and aggressive dependency bumping
```

### /areas/reinforcement-learning.md

```md
---
name: reinforcement-learning
description: ~/projects/reinforcement-learning — authoring RL benchmark tasks for coding agents
sources: [backfill, cowork]
aliases: [reinforcement-learning]
---
- [stated] authoring RL benchmark tasks for coding agents: `instruction.md` prompts, hidden verifiers, oracle/baseline calibration
- [stated] liked RL during the g2i training — technically/directly interesting; dislikes the philosophical side (training on people's lovingly-crafted work) and prefers not to go deep there; overall stays interested. [2026-08-25]
```

### /areas/job-search.md

```md
---
name: job-search
description: dima's active frontend/AI-eng job hunt — pipelines, recruiter context, positioning
sources: [cowork]
aliases: [g2i, job hunt]
---

## positioning
- [stated] frontend stays primary expertise (10y); actively growing genai-coding expertise — building cclio, a claude-code coordinator with its own memory system atop the base one; RL is a liked secondary interest. [2026-08-25]
- [stated] benched ~1 year without a production project; wants strong comp and considers himself worth well above his previous salary levels; new to higher-stakes comp negotiation. [2026-08-25]

## pipelines
- [stated] AlphaSights has him mis-tagged as a git-infrastructure expert (from a GitHub follow), generating mismatched pings; his sellable expert-network angle is practitioner agentic-coding workflows + AI code review, plus Turbostars-scale modernization — reposition rather than accept mismatched calls. [2026-08-25]
- [stated] G2i: completed 3-day paid RL/OTS training, not selected for the production project; gained solid RL experience; profile stays in G2i pool; asked to be flagged for frontend + full-time, not only AI/data. [2026-08-25]
- [stated] g2i recruiter screen (ana) done 2026-08-27 — was a re-eval: g2i intro + xp questions; next step is an ai-based react interview by email; score ≥75% → invited to g2i community (slack) = profiled bench, matched when opportunities arise; <75% likely out. [2026-08-27]
- [stated] g2i technical interview PASSED 2026-08-28 — live with interviewer arthur pires (no ai part), 9 questions: 4 ts / 5 react, "classic, did fine"; official result 90%, "strong hire"; moving to next stage. feedback: owns the react model (derived state, useMemo, effect cleanup unprompted); one gap — event-loop microtask priority (predicted setTimeout before promises); fetch exercise done in time. [2026-08-28]
- [stated] drawer.ai (recruiter iryna) and jumbomail threads went silent — considers both dead. [2026-08-25]
```

---

## 3. how to use this file — the nightly whole-memory sweep

the probe diffs **all 12 entries**, not a trio. procedure:

1. `mcp__memory__memory_list` — entry count must be 12. an extra or missing path is itself a finding.
2. for each path, `mcp__memory__memory_read` (cw gets no memory pre-loaded; the mcp tools are the only view).
3. extract the anchor's `[stated]` lines per entry, on `mac-lan`:

```sh
cd "$HOME/mnt/dotfiles/cclio/docs"
awk -v pat="### /areas/fleet.md" '$0==pat{f=1;next} f&&/^### /{exit} f' \
  cw-memory-snapshot-2026-08-29.md | grep '^- \[stated\]' | md5sum
```

4. compare against section 4's hash index — a matching md5 means every `[stated]` line in that entry
   is byte-identical. only entries whose hash differs need a line-level diff.
5. `description:` and `/_router.md` `## the map` prose are **prettify-owned**; differences there are
   never drift. only `- [stated]` lines are diffable evidence.
6. classify a real difference: new content / a dated fact / a decision = a human edit. the same fact
   reworded = drift, and a design problem for `memory-sync`. a whole section or fact line gone with no
   human edit behind it = a `prettify` data-loss violation — the open suspicion from 08-29.

---

## 4. `[stated]`-line hash index

md5 of the entry's `- [stated]` lines only, in file order, as of 2026-08-30T06:20Z. 145 lines total.

- `/_router.md` — 5 lines — `d86bbf12fc8376dd666530faced7d3b5`
- `/profile.md` — 5 lines — `a79f0082cf5d201bee388386feb91de3`
- `/preferences.md` — 29 lines — `3bd74a7035a5c2a72c67f7314bfc995c`
- `/areas/fleet.md` — 17 lines — `ba9141644b6d3c6d7a23004589c1b47d`
- `/areas/fleet-inbox.md` — 13 lines — `2c874f035668322075102641806f0305`
- `/areas/fleet-contract.md` — 30 lines — `22205c0aeedf435a7a64b9bd64c44cb4`
- `/areas/dotfiles.md` — 12 lines — `7561e8ab1deee35aee98fdc16b185df1`
- `/topics/obsidian.md` — 16 lines — `1cfe328d914ec33b24cff95afc30d325`
- `/topics/workspace.md` — 7 lines — `97b60e5bdcc35edfe548c79a17bcb88a`
- `/areas/bytes.md` — 2 lines — `43d182df90ae10d29d690ceeab61ceff`
- `/areas/reinforcement-learning.md` — 2 lines — `36bd8680293319ede6b75d0c853dbe52`
- `/areas/job-search.md` — 7 lines — `16ca9b51256b0fe136600644f5539197`

---

## 5. verification log

- **2026-08-29** — 3-entry probe (`/_router.md`, `/preferences.md`, `/areas/job-search.md`): 41/41
  `[stated]` lines identical. bridge assumption holds.
- **2026-08-30** — first **full 12-entry** sweep: **145/145 `[stated]` lines byte-identical**, every
  per-entry md5 matched. no entry touched since 2026-08-29T11:17Z (mtimes agree with the hashes).
  no missing section, so no `prettify` data-loss evidence in this window — but note the 08-29
  `## known debt` disappearance predates this anchor and is still unexplained; it cannot be re-tested
  from here, only prevented by the scope guard parked for cclio.
