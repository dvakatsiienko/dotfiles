# cw-memory-map

reporter: cwrk (cowork thread, claude-opus-5) · captured 2026-08-28 · read-only run, no memory
was written or edited.
purpose: give cclio the full picture of cw global memory so it can design `memory-sync`
(the refresh contract from `cw-memory-bridge.md`).

⚠️ this is a point-in-time dump. `/_router.md` was last written 11:06Z today, after the
02:30Z handoff — treat timestamps below as the source of truth for freshness.

---

## 1. listing — every entry, path + description verbatim

```
/_router.md  (1934 bytes, updated 2026-08-28T11:06:16.980805+00:00)
  "router: claude desktop memory" — Barrel/TOC for Dima's memory — which file owns…
/areas/bytes.md  (286 bytes, updated 2026-08-22T19:23:27.505150+00:00)
  ~/projects/bytes — hi-tech playground monorepo
/areas/dotfiles.md  (2452 bytes, updated 2026-08-27T19:50:12.140247+00:00)
  ~/.dotfiles — sline Go statusline for Claude Code plus cross-app CST/handoff lay…
/areas/fleet.md  (1394 bytes, updated 2026-08-27T23:27:07.157586+00:00)
  Dima's agent fleet — who each identity is, plus the obsidian inbox as its own en…
/areas/inbox.md  (1652 bytes, updated 2026-08-27T23:29:27.071420+00:00)
  Dima's obsidian inbox — the fleet's shared capture note; who may edit it, how it…
/areas/job-search.md  (1768 bytes, updated 2026-08-27T17:01:45.316011+00:00)
  Dima's active frontend/AI-eng job hunt — pipelines, recruiter context, positioni…
/areas/reinforcement-learning.md  (551 bytes, updated 2026-08-25T09:32:05.254914+00:00)
  ~/projects/reinforcement-learning — authoring RL benchmark tasks for coding agen…
/areas/working-contract.md  (2611 bytes, updated 2026-08-27T23:11:10.091015+00:00)
  How Dima works with his agents — what his words mean, what may act without askin…
/preferences.md  (3675 bytes, updated 2026-08-27T19:50:19.600719+00:00)
  How Dima wants Claude to respond
/profile.md  (464 bytes, updated 2026-08-25T09:35:53.484168+00:00)
  Who Dima is — role, specialties, technical focus
/topics/aesthetic.md  (146 bytes, updated 2026-08-22T19:23:27.655988+00:00)
  Dima's aesthetic sensibility
/topics/obsidian.md  (1933 bytes, updated 2026-08-27T23:35:16.568151+00:00)
  Dima's obsidian vault — where it lives, how it syncs, and the hazards that gover…
/topics/workspace.md  (943 bytes, updated 2026-08-26T18:35:48.232318+00:00)
  Dima's physical workspace — gear data source (obsidian vault) first, then owned …
```

📌 the listing truncates descriptions with `…` at ~70 chars. full descriptions are in the
frontmatter dumps below — a sync skill must read the entry, never trust the listing preview.

total: **13 entries · 20 026 bytes**.

---

## 2. full contents — frontmatter + body, unedited

each block is exactly what `memory_read` returns, minus the `[updated:] [version:]` header line
(version tokens rotate on every write — see §5).

### /_router.md

```md
---
name: _router
description: "router: claude desktop memory" — Barrel/TOC for Dima's memory — which file owns which subject, and where a new fact belongs. Read first when unsure where to write or look.
sources: [cowork]
aliases: [index, toc, memory map, router: claude desktop memory]
---

## the rule

- [stated] one subject, one file — a fact goes where its subject lives, never into whichever file was already open
- [stated] `/areas/` = things with a lifecycle (a project, a hunt, a system). `/topics/` = things that just are
- [stated] every file's `description` is a routing line: what's inside · when to read it. never a restatement of the path
- [stated] memory is written only on his approval or ask — no bulk writes

## the map

- `/profile.md` — who he is: role, specialties, technical focus
- `/preferences.md` — how Claude must behave for him. voice, format, depth
- `/topics/workspace.md` — the physical desk + owned gear, and the obsidian vault as the gear data source
- `/topics/obsidian.md` — the vault: path, sync hazards that govern every edit, house style for writes
- `/topics/aesthetic.md` — his taste
- `/areas/fleet.md` — the agent identities: dima · cclio · ccli · cwrk · ccloud · dpatch
- `/areas/inbox.md` — the obsidian inbox: edit rules, drop → fold loop, sync hazards
- `/areas/working-contract.md` — his vocabulary, how to read his messages, the safety rails, where skill source lives
- `/areas/dotfiles.md` — the dotfiles system: sline, handoff/CST layer
- `/areas/bytes.md` — the bytes monorepo
- `/areas/reinforcement-learning.md` — the RL benchmark work
- `/areas/job-search.md` — the active job hunt

## known debt

- [stated] the fleet trio would sort better as `fleet.md` · `fleet-inbox.md` · `fleet-contract.md`, but a cowork thread cannot delete a memory file — the rename needs him to delete the old paths from claude.ai, so it waits for his hand
```

### /profile.md

```md
---
name: profile
description: Who Dima is — role, specialties, technical focus
sources: [backfill]
aliases: []
---
- [stated] Name: Dima
- [stated] Senior frontend engineer specializing in TypeScript, React, and Next.js
- [stated] Expanding into Go, RL benchmark authoring for coding agents, agentic/AI tooling (MCP servers, Claude Code workflow engineering), and UI/UX via Figma
- [stated] Full-stack GenAI fluency: Vercel AI SDK, AI Gateway, agentic workflows
```

### /preferences.md

```md
---
name: preferences
description: How Dima wants Claude to respond
sources: [backfill]
aliases: []
---
- [stated] Respond in English regardless of input language
- [stated] Use metric units exclusively (°C, g, mL, cm) — never imperial unless explicitly asked
- [stated] Format list items as `emoji [name] - descr`
- [stated] Notion pages: emoji via icon field only, never duplicated in title text; hyperlink key game items/NPCs/locations/bosses to wiki (Souls/Elden Ring/Bloodborne → Fextralife; other games → confirm wiki first)
- [stated] Recipes: plain text by default (bullet ingredients + steps + optional notes) — no recipe-card widget unless asked
- [stated] Tickets/links: always clickable markdown links — Linear tickets use `linear://` scheme for macOS app; all other resources use `https://`
- [stated] Naming convention: subject-first `<entity>-<qualifier>`; deleting legacy code = "extermination"
- [stated] Offer career growth nudges (RL fundamentals, AI engineering, interpretability) only when the conversation naturally touches those areas, never insistently
- [stated] Proactively suggest handing off repo/file/shell/git/build/test/automation work to Claude Code via the handoff channel; treat the two-Claude handoff channel as always available
- [stated] fleet voice (from dotfiles rules): answer first — verdict in the opening line; tldr default, expand on ask
- [stated] fleet voice (from dotfiles rules): lowercase everything that's ours; never re-case code, identifiers, paths, ids, or quoted text
- [stated] fleet voice (from dotfiles rules): bullets over prose (prose max ~3 lines); one fact per line; a bullet is one sentence, else it nests; no oneline «a · b · c» runs or ①②③ chains; operations one per line, never packed into prose
- [stated] fleet voice (from dotfiles rules): no hedging stacks, no filler openers, never restate the request; unsure → say so, never claim a thing works unchecked
- [stated] fleet voice (from dotfiles rules): one name per concept per reply; plain word over rare word; no invented metaphors; sound alive not mechanic — occasional human asides welcome
- [stated] fleet voice (from dotfiles rules): emoji as line prefix only, never trailing/inline — 📌 caveat worth reading, ⚠️ live hazard only, ✅ 🚫 🔎 ➡️ verdicts lead the line; accent, not confetti
- [stated] fleet voice (from dotfiles rules): bold the load-bearing part; `backticks` for files, commands, identifiers, product names
- [stated] fleet voice (from dotfiles rules): every reply ends with one ➡️ suggested next move; questions max two options + context + ➡️ recommendation; a question dima skips = recommendation accepted, proceed without re-asking
- [stated] fleet voice (from dotfiles rules): anything dima will copy elsewhere goes in a fenced block holding only the payload
- [stated] fleet voice (from dotfiles rules): corrections one line only when they change his decisions, no apologies; a multi-item message → open with a short numbered parse, then act
- [stated] fleet voice master copy: `~/dotfiles/home/.claude/rules/fleet-voice.md` + `fleet-output-format.md`
- [stated] Skill evals: when Dima asks whether a skill is «ok» / in good shape, he means from THIS surface's runtime — answer plainly with cw-side friction and wants, don't audit the cc-side design; the `x:*` → `x-cw:*` dual-prefix is by design, see [[dotfiles]]
- [stated] gear facts routing: global memory `/topics/workspace.md` holds only what he currently owns (one line per device) plus the vault location; obsidian `_gear/` holds specs, reasoning, alternatives; never duplicate device inventory into project docs
```

### /areas/fleet.md

```md
---
name: fleet
description: Dima's agent fleet — who each identity is, plus the obsidian inbox as its own entity and its handling rules
sources: [cowork]
aliases: [agent fleet, identities, cclio, inbox]
---

## master source

- [stated] identities live in `~/dotfiles/home/.claude/rules/fleet-identity.md` — read it fresh, never from a remembered digest

## the identities

- [stated] **dima** — the human, owner of everything; every surface works for him
- [stated] **cclio** — *the* coordinator; a cc session booted in `~/dotfiles/cclio` with its own CLAUDE.md, memory barrel and boot ritual. orchestrates, rarely writes product code
- [stated] **ccli / cc** — the local Claude Code CLI on the mac, the one that does the edits
- [stated] **cwrk / cw** — Cowork, reaching the mac over the device bridge. a peer, either side may open the exchange
- [stated] **ccloud** — Claude Code on Anthropic's machines; survives the app closing. only Dima can spawn one
- [stated] **dpatch** — the desktop surface, a minor member whose influence keeps shrinking; cclio took over its duties

## inbox — a smaller identity, but its own

- [stated] `prompts/inbox.md` in his obsidian vault — cclio's plan, and a named entity in fleet language
- [stated] it owns its own file: **[[inbox]]** carries the edit rules, the drop → fold model and the sync hazards. this file only points at it
```

### /areas/inbox.md

```md
---
name: inbox
description: Dima's obsidian inbox — the fleet's shared capture note; who may edit it, how items get folded in, and the voice it's written in
sources: [cowork]
aliases: [obsidian inbox, cclio inbox, capture note]
---

## identity

- [stated] the inbox is a first-class entity in fleet language — every agent knows what "the inbox" means without qualification
- [stated] it lives in the obsidian vault (see [[workspace]] for the vault path)
- [stated] it is cclio's plan — cclio is the owner and the only agent allowed to edit it
- [stated] every other fleet surface (cwrk, ccli, cchrome, ccloud, dispatch) may read it freely; they edit only when Dima asks in that thread
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

### /areas/working-contract.md

```md
---
name: working-contract
description: How Dima works with his agents — what his words mean, what may act without asking, why the rails exist, and where skill source lives. Read before acting on any request of his.
sources: [cowork]
aliases: [fleet contract, how dima works, skill source]
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
- [stated] the source is `~/dotfiles/home/.claude/plugin-x/skills/<name>/SKILL.md`; `plugin-x-cw/skills/*` are symlinks to it
- [stated] any skill question or edit starts by reading that source file, not the loaded copy
- [stated] cw picks up changes after his push plus a force refresh in settings, so the loaded copy can lag the source

## why cw exists at all

- [stated] cc is the main lane; cw is the helper — slower and costlier per query, but it reaches him on ipad and mobile where cc can't
```

### /areas/dotfiles.md

```md
---
name: dotfiles
description: ~/.dotfiles — sline Go statusline for Claude Code plus cross-app CST/handoff layer
sources: [backfill]
aliases: [.dotfiles, sline]
---
- [stated] "sline" Go statusline for Claude Code: server-provided numbers, quota bars, session labels
- [stated] Cross-app CST/handoff layer: plugin-x skills + `mcp-handoff-desktop` MCP server
- [stated] Built on a two-Claude comms system (Claude Desktop + Claude Code) using a `/handoff` skill set and a handoff MCP server for CST exchange via shared store
- [stated] Parked upgrades (approved, not yet implementing): `get_peer_context` MCP tool, weekly refresh CSTs
- [stated] dotfiles repo (github.com/dvakatsiienko/dotfiles) doubles as a plugin marketplace «x-com» delivering the plugin «x-cw» (renamed from «x-desktop») — ~14 skills symlinked from canonical plugin-x, x:conventions deliberately excluded, synced by git push, no copies or manual uploads
- [stated] Beside the plugin, an `x-cw` MCP server exposes callable verbs against the mac's shared store (handoff_*, yt_transcript_*, pm_guide)
- [stated] Contract: the plugin ships judgment as text, the MCP ships acts as verbs; CST-SPEC.md carries the precedence line — where an x-cw tool exists for an act, it wins over a shell doing the same act
- [stated] Fleet name «dpatch» is retired — the mac-proximity relay is now called «dispatch»
- [stated] Skill authoring flow: Dima creates skills with cclio scoped to the `x:*` plugin (Claude Code) because that's the easier surface for them; then cherry-picks the ones useful for desktop into `x-cw:*`
- [stated] `x-cw` is not a fork or a copy — the useful skills are symlinked from `plugin-x`, so `x:foo` and `x-cw:foo` are the same file; only the invocation prefix differs by surface
- [stated] So a `x:` prefix inside skill text is deliberate cc-side addressing, NOT stale naming — never flag it as rot, never propose renaming it to `x-cw:`
- [stated] The hard part is the environment split: cc and cw are different runtimes, and one skill file has to work in both — a skill passing in cc says nothing about cw
- [stated] Hence Dima's standing pattern: after a skill tests green in cc with cclio, he asks cw/desktop to eval the same skill from its own surface; report cw-side friction only, don't re-litigate the cc design
- [stated] Goal: one source of truth for skills across surfaces (cw + cc), avoiding per-surface forks or duplicate skill copies
```

### /topics/obsidian.md

```md
---
name: obsidian
description: Dima's obsidian vault — where it lives, how it syncs, and the hazards that govern every edit to any note in it. Read before touching a vault file.
sources: [cowork]
aliases: [vault, obsidian vault]
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
- [stated] see [[inbox]] for the one note with its own additional rules
```

### /topics/workspace.md

```md
---
name: workspace
description: Dima's physical workspace — gear data source (obsidian vault) first, then owned gear
sources: [backfill, cowork]
aliases: []
---

## data source

- [stated] gear wiki: obsidian vault at `/Users/dima/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Dima's Vault`
- [stated] gear root `_gear/`, index `_gear/_router.md`; reachable via Desktop Commander on `mac-lan`
- [stated] reads allowed anytime to confirm/validate; edits only when he asks
- [stated] moved his main wiki back to obsidian from notion — notion mcp editing too poor

## gear

- [stated] Secretlab Magnus Pro desk, assembled and fully operational
- [stated] NuPhy Air75 V3 keyboard (used across Mac, iPadOS, iOS)
- [stated] MacBook Pro 16" M4 Pro, 48GB, macOS
- [stated] PS5 Pro (assume latest game builds unless he says otherwise)
- [stated] Hitscan Hyperlight mouse — 2.4GHz dongle (not bluetooth), DPI button on underside
```

### /topics/aesthetic.md

```md
---
name: aesthetic
description: Dima's aesthetic sensibility
sources: [backfill]
aliases: []
---
- [stated] Chill retro-80s aesthetic sensibility
```

### /areas/bytes.md

```md
---
name: bytes
description: ~/projects/bytes — hi-tech playground monorepo
sources: [backfill]
aliases: [bytes]
---
- [stated] Hi-tech playground monorepo (Next 16.3, TS 7, Vite 8, React Compiler)
- [stated] Covers space-explorer API/UI, bug sweeps, and aggressive dependency bumping
```

### /areas/reinforcement-learning.md

```md
---
name: reinforcement-learning
description: ~/projects/reinforcement-learning — authoring RL benchmark tasks for coding agents
sources: [backfill]
aliases: [reinforcement-learning]
---
- [stated] Authoring RL benchmark tasks for coding agents: `instruction.md` prompts, hidden verifiers, oracle/baseline calibration
- [stated] liked RL during the g2i training — technically/directly interesting; dislikes the philosophical side (training on people's lovingly-crafted work) and prefers not to go deep there; overall stays interested. [2026-08-25]
```

### /areas/job-search.md

```md
---
name: job-search
description: Dima's active frontend/AI-eng job hunt — pipelines, recruiter context, positioning
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
- [stated] g2i technical interview booked fri 2026-08-28 13:00–14:00 kyiv, google meet, interviewer arthur pires — mixed format: human interviewer + ai-based react assessment; pass bar ~75%. [2026-08-27]
- [stated] drawer.ai (recruiter iryna) and jumbomail threads went silent — considers both dead. [2026-08-25]
```

---

## 3. limits — observed vs documented vs unknown

verified from this run:

- **13 entries, 20 026 bytes total.** largest single entry `/preferences.md` at 3 675 bytes —
  no cap was hit, so nothing here proves where the ceiling is.
- **listing is one flat call**, sorted by path, returning `path (bytes, updated-ISO)`. it
  showed all 13 with no pagination — cursor paging exists as a parameter but did not trigger.
- **description preview truncates at ~70 chars** with `…` when `include_preview=true`.
  ? the exact cut point is eyeballed, not measured.

documented in the tool contract but not exercised here:

- **per-file size cap exists** — writes over it are rejected with the byte limit stated in the
  error. the number is not published up front; ⚠️ a sync skill learns it only by hitting it.
- **listing cap exists** — results are capped and `cursor` + `path_prefix` page through.
  `path_prefix` is directory-aligned (`/topics` == `/topics/`); a file path matches nothing.
- guidance says condense rather than append forever, which implies the cap bites well below
  anything in this store today.

unknown, and worth cclio designing around rather than assuming:

- ? total-store cap, if any (only per-file is documented)
- ? whether frontmatter counts toward the file cap (almost certainly yes — it is file bytes)
- ? entry-count ceiling

---

## 4. provenance — which entries came from which surface

`sources:` frontmatter is the only machine-readable signal, and it is a coarse one.

| entry | sources | reading |
|---|---|---|
| `/_router.md` | `[cowork]` | cw-authored, the bridge work |
| `/areas/fleet.md` | `[cowork]` | cw, 2026-08-27 bridge night |
| `/areas/inbox.md` | `[cowork]` | cw, same night |
| `/areas/working-contract.md` | `[cowork]` | cw, same night |
| `/topics/obsidian.md` | `[cowork]` | cw, same night |
| `/areas/job-search.md` | `[cowork]` | cw, dated lines 08-25 → 08-27 |
| `/topics/workspace.md` | `[backfill, cowork]` | started as backfill, cw appended gear |
| `/profile.md` | `[backfill]` | pre-bridge |
| `/preferences.md` | `[backfill]` | pre-bridge, but heavily extended 08-27 19:50 |
| `/topics/aesthetic.md` | `[backfill]` | pre-bridge |
| `/areas/bytes.md` | `[backfill]` | pre-bridge |
| `/areas/dotfiles.md` | `[backfill]` | pre-bridge, extended 08-27 19:50 |
| `/areas/reinforcement-learning.md` | `[backfill]` | pre-bridge |

📌 what this actually tells you:

- **`backfill` ≠ claude.ai chat.** it is the tag an earlier bulk import used. it marks
  *pre-bridge origin*, not a surface. `/preferences.md` and `/areas/dotfiles.md` both carry
  `[backfill]` while holding lines written by a cw thread on 2026-08-27 — the tag was never
  refreshed on edit.
- ⚠️ **so `sources:` cannot be trusted to answer "who last wrote this".** the only reliable
  freshness signal is the `updated` timestamp, and it has no author attached.
- the split that IS visible: everything touched on 2026-08-27 evening (19:50 → 23:35) is the
  bridge session; everything stamped 08-22 / 08-25 predates it. no entry is attributable to
  a claude.ai chat thread specifically.
- ➡️ design implication: if `memory-sync` needs provenance, it has to write it — the proposed
  `derived-from:` key, plus a `sources:` append discipline on every write. today's data
  cannot be reconstructed after the fact.

---

## 5. the `memory_*` tool contract — what cclio needs to design a refresh skill

### the five verbs cw has

- `memory_list` — `path_prefix`, `cursor`, `include_preview`. returns path + bytes + updated.
  **no version tokens in the listing** — this is the single most important constraint.
- `memory_read` — returns `[updated: …] [version: <12 hex>]` then the raw file.
- `memory_write` — full replace. requires `if_version`.
- `memory_str_replace` — one exact match, `old_str` must be unique. requires `if_version`.
- `memory_append` — adds text on a new line at the end. requires `if_version`.
- 🚫 `memory_delete` exists as a tool name but is **not usable from this surface** — cw cannot
  delete a memory file. that is the whole reason the `fleet.md` rename debt is parked.

### version tokens — the mechanic that shapes the skill

- every write takes `if_version`: the 12-char token from your most recent `read` or `write`
  **of that path**. tokens are per-file and rotate on every successful write.
- the token is only obtainable by reading the file. the listing does not carry it.
  ➡️ **read-before-write is not a style choice, it is mechanically forced.** a refresh pass
  over N entries is N reads minimum, whatever the diff turns out to be.
- `if_version: "new"` is only legal for a path absent from the listing. using it against an
  existing path is rejected, and the rejection hands back the current content.
- after your own write, the result carries the next token — chained edits to one file need no
  re-read.

### conflict behavior

- a version conflict returns **the current full content** in the error, not just a failure.
  so the recovery is: merge and retry in the same turn. no second read needed.
- a failed `str_replace` match behaves the same way — current content comes back, fix `old_str`
  from it and retry.
- other surfaces write to this same store during a session, so conflicts are routine, not
  exceptional. ⚠️ `if_version` never merges for you — `memory_write` replaces the entire file,
  and any line omitted is deleted.
- content-level refusal is a different animal: if a write is refused over what it contains
  (privacy filter), do not rewrite it to slip past — that is a hard stop, not a retry.

### write modes, and which to use

- **replace** (`memory_write`) — create, or restructure. sends the whole file.
- **patch** (`memory_str_replace`) — one region. cheapest for a single line; `old_str` must be
  unique, widen with neighbouring text until it is. empty `new_str` deletes the matched text —
  this is also the only way to remove a line.
- **append** (`memory_append`) — end-of-file only, no positioning. fine for a genuinely new
  fact, wrong for anything that belongs in an existing section.
- ➡️ for a refresh contract, `str_replace` is the primary verb and `write` is the fallback for
  restructures. append is a trap for an entry with sections — it lands outside them.

### descriptions

- ❗ **not separately editable.** `description` is a frontmatter line inside the file body.
  changing it means a `str_replace` on that line (or a full `write`).
- consequence: the routing line and the content are one atomic unit. a refresh that rewrites
  a body and forgets the description leaves a stale routing line, and nothing flags it.

### other contract facts worth designing against

- **no diff, no history, no revert.** a write is final; there is no prior version to fetch.
  the pre-write `read` is the only backup that exists — hold it in context before writing.
- **no bulk verb.** every entry is its own read + its own write. an N-entry refresh is 2N calls
  minimum, and there is no transaction across them — a pass can end half-applied.
- **no rename and no move.** a path change = write-new + delete-old, and cw cannot delete.
  ⚠️ so any rename designed in `memory-sync` needs Dima's hand in claude.ai to finish.
- **frontmatter shape is a convention, not a schema.** `name` / `description` / `sources` /
  `aliases` are enforced by guidance only — nothing validates them, so a new key like
  `derived-from:` can be added freely, and nothing will complain if it drifts either.
- the listing is the only cheap operation. everything else costs a full file in context.

---

## 6. open questions this dump does not settle

- ❓ **does written text survive verbatim overnight?** still unverified. the whole bridge rests
  on it. `/_router.md` shows a write at 2026-08-28T11:06Z that no cw thread in this lineage
  made — that is either another surface or a regeneration pass, and it is exactly the test
  case. ➡️ diff its current body against the version below on the next pass.
- ❓ per-file byte cap — the number, not the fact.
- ❓ whether `sources:` is ever machine-updated, or purely author discipline.
