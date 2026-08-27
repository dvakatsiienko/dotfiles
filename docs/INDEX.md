# docs index

one line per doc in `docs/`, grouped by folder. this is the barrel over the whole doc tree.

three rules keep it honest:

- **it is an index, never content.** a line here points at a doc, it does not explain it. if you
  find yourself writing a second sentence, it belongs in the doc.
- **it is the membank seed manifest** for [DOT-177](https://linear.app/x-com/issue/DOT-177). when
  membank lands it ingests this index and follows the pointers from here, so the taxonomy is being
  built now, once, and never re-derived later.
- **adding a doc to `docs/` means adding its line here, in the same turn.** a doc missing from the
  index is, for membank, a doc that does not exist.

## agents/ — how agents work in this repo

- [claude fleet capabilities](agents/claude-fleet-capabilities.md) — what each surface can reach, what memory it keeps, who can operate whom; core coordinator knowledge behind `rules/fleet-identity.md`
- [domain docs](agents/domain.md) — how engineering skills consume `CONTEXT.md` / adrs before exploring
- [authoring — skill](agents/authoring-skill.md) — the full reference for writing a skill: frontmatter, `intended-models:`, invocation control, the listing budget
- [authoring — memory](agents/authoring-memory.md) — where a fact goes, decided BEFORE it is written: the pre-write checklist, bucket tests, silent hazards
- [dpatch system prompt](agents/system-prompt-dpatch.md) — structural map of what the cowork surface injects into dpatch, captured from inside

## research/ — investigations, subject-first, one topic per file

- [agent harness building](research/agent-harness-building.md) — building a custom orchestration harness on claude code / agent sdk
- [cc extension surfaces](research/cc-extension-surfaces.md) — every extension point of ccli, mechanics + gotchas per surface
- [claude on disk map](research/claude-on-disk-map.md) — every place claude keeps state on this mac, and how the pieces find each other
- [comms casing](research/comms-casing.md) — dima's verbatim source of intent for the lowercase rule
- [linear → github agent trigger](research/linear-github-agent-trigger.md) — the `/cc` comment trigger fires a cloud agent that opens a pr; 📌 postponed, non-prio, nothing built
- [macos filesystem map](research/macos-filesystem-map.md) — who owns which top-level directory, and therefore what is safe to delete
- [vercel cli vs mcp](research/vercel-cli-vs-mcp.md) — what `vercel api` reaches and the three things only the mcp can
- [walkthrough mode](research/walkthrough-mode.md) — field notes shaping the `/walkthrough` skill

## spec/ — designs awaiting or driving implementation

- [ccli coordinator boot prompt](spec/ccli-coordinator-boot-prompt.md) — copy-paste prompt that boots the session which builds the coordinator
- [ccli coordinator mvp](spec/ccli-coordinator-mvp.md) — dpatch becomes a claude code session on disk; dispatch degrades to a window

## adr/ — repo decisions (`ADR-nnnn`)

- [ADR-0001 sline shows server numbers only](adr/0001-sline-server-provided-numbers-only.md) — sline never computes estimates client-side
- [ADR-0002 handoff shared file store](adr/0002-handoff-shared-file-store.md) — one store, one format, every direction

## tracker/ — the linear domain (`TRK-nnnn`)

- [tracker glossary](tracker/CONTEXT.md) — one term per concept: team, project, story, ticket, label, sweep; plus the channel (linear cli, commit-linking webhook) and the mattpocock triage role bridge
- [TRK-0001 story over epic](tracker/adr/TRK-0001-story-over-epic.md) — one grouping term; «claude» split into four domain projects
- [TRK-0002 label vocabulary](tracker/adr/TRK-0002-label-vocabulary.md) — block direction, `standing`, `vet`; partly superseded by TRK-0004
- [TRK-0003 health update cadence](tracker/adr/TRK-0003-health-update-cadence.md) — weekly floor plus event-driven updates
- [TRK-0004 label system evolution](tracker/adr/TRK-0004-label-system-evolution.md) — the `needs` family closed at three, labels never name a project
