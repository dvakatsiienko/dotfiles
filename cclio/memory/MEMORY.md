# cclio memory index

barrel file. one line per memory, pointing at a leaf in this dir. content lives in the leaf,
never here. open a leaf only when its pointer fires.

📌 **provenance: every leaf below was written by dpatch, for dpatch.** Copied whole on
2026-08-21 so nothing is lost, then refactored in small patches as each one is touched. A leaf
still in dpatch's voice has not been reviewed yet — read it as dpatch's fact, not cclio's rule.
The obsolete ones are marked 🚫 below.

format: `- [slug](slug.md) — one line, what it decides, imperative present tense`
rules: a leaf is one decision, not a topic dump · stale pointer = delete both line and file,
no tombstones · emoji prefix is a salience marker (📌 ⏰ 🧭 ⭐ 🚫), never decoration.

## dima's strategies — READ BEFORE ANY PM DECISION
- 🧭 [dima's strategies](dima-strategies.md) — the branch map. six branches, EQUALLY weighted, none is the main one
- [pm](strategy-pm.md) — a chiller loop, not a fuller board
- [fleet](strategy-fleet.md) — one mind, many surfaces; single source of truth
- [dima's tools](strategy-dimas-tools.md) — shared tools where the AGENT is the majority user
- [bytes](strategy-bytes.md) — the product work the meta-work starves; surface it even when quiet
- [harness](strategy-harness.md) — wanted, deferred with a date and a test, never refused
- [visibility](strategy-visibility.md) — see what the agents do; after mvp, but don't foreclose it

## dima's stories
- 📖 [dima's stories](dima-stories.md) — what he actually does and lives through; the narrative under the rules. append, never rewrite into a rule

## identity & session ritual
- [announce model at open](announce-model-at-open.md) — MUST open with «hey <model> here», read from env; a session cannot detect a mid-thread switch, so this is the only honest label
- [obsidian inbox protocol](obsidian-inbox-protocol.md) — 📬 inbox.md must end empty; worklog.md = processing copy; protected.md = dima's drops, read-only
- [handoff ask here-or-fresh](handoff-ask-here-or-fresh.md) — ask before saving a CST, not after

## safety
- [no perm ops on mobile](no-perm-ops-on-mobile.md) — dima on phone/ipad = nothing that can throw a permission dialog
- [no destructive ops under bypass](no-destructive-ops-under-bypass.md) — never delete or overwrite without being asked
- [clean up after yourself](clean-up-after-yourself.md) — prune processed buckets/temp files same turn; docs/research/* exempt (dima-only deletes); never destroy pending content
- ⏰ [reminder: explain bypass concern](reminder-explain-bypass-concern.md) — ACTIVE until dima says "remove reminder"
- ⏰ [reminder: vet trial verdict](reminder-vet-trial-verdict.md) — after ~2026-09-18 ask verdict: keep vet / rename trial / mutate investigate

## spawning
- ⭐ [spawn types](spawn-types.md) — the `Agent` tool, fork vs fresh, model/effort/worktree knobs; the four-check preflight; session blindness is bidirectional; cron is ours and beats dispatch's
- [spawn timeout verify before retry](spawn-timeout-verify-before-retry.md) — timeout ≠ failed spawn; list_sessions first
- [cc session title convention](cc-session-title-convention.md) — «🔧 code:» ccli · «🧰 cw:» cwrk children · «🧪 probe:» · «🔬 research:»; titles can't be renamed post-spawn
- [ticket refs when dispatching ccli](ticket-refs-when-dispatching-cc.md) — always pass ticket ID + require `- ref DOT-N`; closing stays with dpatch

## direction
- ⭐ [ccli coordinator migration](ccli-coordinator-migration.md) — dpatch moves onto ccli; four-layer memfile stack; CLAUDE_CONFIG_DIR REJECTED; deletes the surface-sync problem
- ⭐ [pm fold or drop](pm-fold-or-drop.md) — default verb is fold-or-drop not file; one flush per session; a sweep isn't done till its debris is retired
- [doc freshness frontmatter](doc-freshness-frontmatter.md) — research docs carry researched/refresh-when; freshness is a date that IS the fact
- ⭐ [no memfile bridge ccli↔dispatch](no-memfile-bridge-ccli-dispatch.md) — 📌 RESOLVED by collapsing the surfaces, kept as the lesson: a sync symptom means ask whether they need to be two sides, never build a fifth copy
- [halt rituals pair](halt-rituals-pair.md) — wrap retired; graceful-halt plans the finish, halt-now leaves fast without breaking

## pm / linear
- [pm label proactively](pm-label-proactively.md) — label AND project AND parent at create time, board stays labeled evergreen
- [tickets must be pretty](tickets-must-be-pretty.md) — titles + bodies, key data only, batch drafts → approve → flush
- ⭐ [linear fetch contract](linear-fetch-contract.md) — GETs always carry labels+descriptions, relations, parent/children, comments, attachments; gql over `issue view`
- [no timestamps in prose](no-timestamps-in-prose.md) — no dates in bodies/comments/docs; run stamp stays
- [pm scrape strategy](pm-scrape-strategy.md) — conventions in memory, state always queried fresh; never answer board state from memory
- [ticket-heavy replies need structure](ticket-heavy-replies-need-structure.md) — ops as short lines, never id-packed prose; nextmover block for work-turns
- [links always https](links-always-https.md) — every ticket id in every message = https link, never bare
- [no glyph runon cta](no-glyph-runon-cta.md) — next-steps as plain separate lines, never ①②③ run-ons
- [native relations always](native-relations-always.md) — blocking/linking = linear builtin relations, never body strings
- [run stamp model name](run-stamp-model-name.md) — stamp footer = `run-id · model name`, adopted 2026-08-20

## skills & sync
- ⭐ [memory divergence store](memory-divergence-store.md) — mutate own memory only; the adoption was a hand-over, not a sync; guards the open colocation question (DOT-73 step 3)
- ⭐ [skill edits are file edits](skill-edits-are-file-edits.md) — a skill change is an ordinary file edit; never hand dima a package to install by hand
- [skill namespaces](skill-namespaces.md) — `x:*` runs in any ccli session, `cclio-*` is coordinator-only; the test is WHERE it runs, not who wrote it; dropped skills listed inside
- [matt skills mirrored](matt-skills-mirrored.md) — 14/25 mirrored 2026-08-19; ⏰ WILL drift (ccli plugin auto-updates, mirror doesn't); THE framework — proactively suggest grilling/domain-modeling/wayfinder at ripe moments; opus-filled ADRs exist in dotfiles+bytes, respect them
- [expect skill-sync drift](expect-skill-sync-drift.md) — narrowed: `skills-cw` is the only surface that still drifts; note it, never block on it
- [domain modeling fleet](domain-modeling-fleet.md) — apply to workflow vocab AND linear; multi-domain (repo/tracker/fleet contexts never merged); glossary → CONTEXT.md-shaped file (DOT-73); lazy growth, ADRs sparingly

## method
- ⭐ [research vs lived evidence](research-vs-lived-evidence.md) — dima's daily observation outranks a report; confirm the design before researching it; never relay a subagent verdict unreviewed

## environment
- [settings.json drifts when unlinked](settings-json-drifts-when-unlinked.md) — CC writes it at runtime; a real file where the symlink belongs = silent divergence, check `ls -l` at boot
- [browser mcp per project](browser-mcp-per-project.md) — global is off on purpose; add to project-local `.claude` config instead
- [tell dima all capabilities](tell-dima-all-capabilities.md) — surface what the surface can do, especially the gated parts
- [anthropic job search](anthropic-job-search.md) — dima applying to anthropic + job-profile brief; desktop "job" project memory not accessible to dpatch
