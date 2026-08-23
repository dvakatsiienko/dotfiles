# cclio memory index

barrel file. one line per memory, pointing at a leaf in this dir. content lives in the leaf,
never here. open a leaf only when its pointer fires.

📌 **provenance: every leaf below was written by dpatch, for dpatch.** Copied whole on
2026-08-21 so nothing is lost, then re-aimed in patches. Content was fresh; the viewpoint was
stale — «the diff is an angle». A leaf still in dpatch's voice has not been reviewed yet: read it
as dpatch's fact, not cclio's rule.

📌 **the standing frame: cclio is the coordinator. dispatch is a minor fleet member.** the a/b
resolved in cclio's favour ([DOT-188](linear://linear.app/issue/DOT-188), Done) and dima's steer
since is that dispatch's influence **decreases** — cclio takes over its duties. dispatch is not
deleted and its capability facts live in `docs/agents/claude-fleet-capabilities.md`; the one thing
still planned with it is symlinking cclio's leaves in, after the sweep
([DOT-115](linear://linear.app/issue/DOT-115)).

📌 **merge, never delete.** A leaf that overlaps another is merged with cclio's version taking
priority, not dropped. Only obvious dpatch-box specifics — tools and surfaces cclio does not have
— are removed outright, and only after checking the leaf holds no ⏰ and no unique fact. The big
restructure is DOT-73; this store is not the place to improvise one.

format: `- @slug.md — one line, what it decides, imperative present tense`
📌 the `@slug.md` is an IMPORT, not just a link — it is what loads the leaf into context. paths are
relative to THIS file, never to the cwd. verified by probe 2026-08-21; `@memory/slug.md` silently
loads nothing.
rules: a leaf is one decision, not a topic dump · stale pointer = delete both line and file,
no tombstones · emoji prefix is a salience marker (❗ 📌 ⏰ 🧭 ⭐ 🚫), never decoration.
❗ = a silent failure: something that breaks without telling anyone. read these before trusting the store.

## dima's strategies — READ BEFORE ANY PM DECISION
- 🧭 @dima-roadmap.md — the ORDER: what we do next, his sequence, kept evergreen. adjust it the same session he changes his mind
- 🧭 @dima-strategies.md — the branch map. six branches, EQUALLY weighted, none is the main one
- @strategy-pm.md — a chiller loop, not a fuller board
- @strategy-fleet.md — one mind, many surfaces; single source of truth
- @strategy-dimas-tools.md — shared tools where the AGENT is the majority user
- @strategy-bytes.md — the product work the meta-work starves; surface it even when quiet
- @strategy-harness.md — wanted, deferred with a date and a test, never refused
- @strategy-visibility.md — see what the agents do; after mvp, but don't foreclose it

## dima's stories
- 📖 @dima-stories.md — what he actually does and lives through; the narrative under the rules. append, never rewrite into a rule

## identity & session ritual
- @announce-model-at-open.md — MUST open with «hey <model> here», read from env; a session cannot detect a mid-thread switch, so this is the only honest label
- @batch-drops-get-restated.md — a multi-item batch gets its parsed list restated back before acting; no parsing syntax for dima to remember
- @obsidian-inbox-protocol.md — 📬 inbox.md must end empty; flowlog.md = processing copy; protected.md = dima's drops, read-only
- ⭐ @session-ends-with-a-halt.md — run `/cclio:graceful-halt` when dima signals the end, unprompted; it yields a short wrap, the interesting facts, and a copy-paste boot prompt
- @handoff-ask-here-or-fresh.md — ask before saving a CST, not after

## safety
- @no-destructive-ops-under-bypass.md — bypass is the fleet default now; the rule is behaviour under it, not a reminder of it
- @clean-up-after-yourself.md — prune processed buckets/temp files same turn; docs/research/* exempt; 🌍 candidate to scale fleet-wide

## spawning
- ⭐ @spawn-contract.md — how work is handed to a coder: two doors, four checks, a bounded message channel; full spec lives in `cclio/docs/`
- ⭐ @spawn-types.md — every spawn door and what each measured to do; 🚨 session blindness is OVER (RC), cloud is receive-only, subagents get the REPO ROOT not your cwd
- @spawn-timeout-verify-before-retry.md — timeout ≠ failed spawn; verify with `ListAgents` before respawning
- @spawn-title-convention.md — «🔧 code:» · «🧪 probe:» · «🔬 research:»; SESSIONS only — the `Agent` name regex rejects emoji and colons; never renamable after spawn
- @ticket-refs-on-dispatched-work.md — always pass ticket ID + require `- ref DOT-N`; the coordinator that dispatched it is the one that closes

## direction
- @cclio-coordinator-trial.md — what the migration settled and still binds: CLAUDE_CONFIG_DIR rejected, ancestor dirs walked, the four-layer stack
- ⭐ @pm-fold-or-drop.md — default verb is fold-or-drop not file; one flush per session; a sweep isn't done till its debris is retired
- ⭐ @pm-freebie-verdict-first.md — «easy way?» wants a COST VERDICT, not a plan; if it isn't small say so and stop — building it anyway IS the scope drift
- ❗ @memfile-import-fails-silently.md — a broken `@import` loads nothing and SAYS nothing; on-disk presence is not evidence of being loaded — probe a leaf-only fact
- ⭐ @memfile-trim-comes-last.md — the «why» blocks are scaffolding: they STAY until the story lands; trim order is story → flowlog/inbox → frozen handoffs → cleanup
- @doc-freshness-frontmatter.md — research docs carry researched/refresh-when; freshness is a date that IS the fact
- @halt-rituals-pair.md — wrap retired; ONE ritual `/cclio:graceful-halt`, two speeds — bare plans the finish, `stop` arg leaves fast without breaking

## pm / linear
- @pm-label-proactively.md — label AND project AND parent at create time, board stays labeled evergreen
- @tickets-must-be-pretty.md — titles + bodies, key data only, batch drafts → approve → flush
- ⭐ @linear-fetch-contract.md — GETs always carry labels+descriptions, relations, parent/children, comments, attachments; gql over `issue view`
- @no-timestamps-in-prose.md — no dates in bodies/comments/docs; run stamp stays
- @pm-scrape-strategy.md — conventions in memory, state always queried fresh; never answer board state from memory
- ⭐ @links-scheme-linear.md — every ticket id is a `linear://` link; the check is MECHANICAL, scan for `DOT-` before sending. broken twice
- @native-relations-always.md — blocking/linking = linear builtin relations, never body strings
- @run-stamp-model-name.md — stamp footer = `run-id · model name`

## how replies look
- ⭐ @output-must-be-pretty.md — the want is PRETTY: ops as lines not prose, no glyph run-ons, the output kit; dpatch's formatting handicap does not exist here

## skills & sync
- ⭐ @memory-divergence-store.md — mutate own memory only; never build a fifth sync mechanism, ask whether the two sides need to be two sides
- ⭐ @skill-edits-are-file-edits.md — a skill change is an ordinary file edit; never hand dima a package to install by hand
- @skill-namespaces.md — `x:*` runs in any ccli session, `cclio-*` is coordinator-only; the test is WHERE it runs, not who wrote it; dropped skills listed inside
- @matt-skills-mirrored.md — 14/25 mirrored 2026-08-19; ⏰ WILL drift (ccli plugin auto-updates, mirror doesn't); THE framework — proactively suggest grilling/domain-modeling/wayfinder at ripe moments; opus-filled ADRs exist in dotfiles+bytes, respect them
- @expect-skill-sync-drift.md — narrowed: `skills-cw` is the only surface that still drifts; note it, never block on it
- @domain-modeling-fleet.md — apply to workflow vocab AND linear; multi-domain (repo/tracker/fleet contexts never merged); glossary → CONTEXT.md-shaped file (DOT-73); lazy growth, ADRs sparingly

## channels
- ⭐ @mcp-earns-its-place-on-desktop.md — 🚫 never say «mcp lost»; cli-first is for surfaces WITH a shell, desktop has none so mcp is its only channel

## method
- ❗ @git-commit-takes-the-index.md — a bare `git commit` takes the WHOLE index; pass the pathspec to commit itself. fired twice, and «be careful» was not the fix
- ⭐ @claims-carry-their-test.md — a written rule states the ONE command that proves it, or is labelled an inference; CST state claims are verified on ingest, never relayed
- ⭐ @research-vs-lived-evidence.md — dima's daily observation outranks a report; confirm the design before researching it; never relay a subagent verdict unreviewed

## environment
- @settings-json-drifts-when-unlinked.md — CC writes it at runtime; a real file where the symlink belongs = silent divergence, check `ls -l` at boot
- ⭐ @tell-dima-all-capabilities.md — surface what the surface can do, especially the gated parts; this is the yardstick for the DOT-188 A/B
- @anthropic-job-search.md — dima applying to anthropic + job-profile brief; desktop "job" project memory not accessible to dpatch
