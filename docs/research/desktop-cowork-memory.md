# Desktop app (Cowork/Dispatch) memory — scopes, API surface, durability

Ticket: DOT-115

Researched 2026-08-19 (sonnet subagent, primary sources: support.claude.com, docs.claude.com).

## Findings

- **No official scope taxonomy.** Anthropic documents Cowork/Dispatch memory only at the product level ("Claude remembers what you've worked on… you can view, edit, and delete your memory"). No official doc describes account vs project vs per-session memory scopes for the desktop app.
- **The filesystem layout is reverse-engineered.** The per-session dir `~/Library/Application Support/Claude/local-agent-mode-sessions/<ids>/agent/memory/` with a `MEMORY.md` index is an observed implementation detail, not a documented interface. It can change without notice on any app update.
- **No external API.** There is no endpoint, CLI, or supported workaround to read/write Cowork/Dispatch memory from outside a session. The file dir is the only interface, and it is unofficial.
- **Chat memory is a separate system** from Cowork memory (different product surface; no sharing confirmed by official docs).
- Claude Code's memory system (`CLAUDE.md`/`MEMORY.md` at project/user level) is a different, well-documented product — similar naming, do not conflate.

## Consequence for our system

The dpatch memory pool's durable home must be the **repo** (`memory-dpatch`, symlinked at `~/.claude/memory-dispatch`), with the app path treated as a fragile cache. This is the direction DOT-115 takes: repo as source of durability, symlinked INTO the app path — not the app path snapshot-copied out. Until the swap lands, the manual snapshot-sync at wrap is the mitigation.

## Sources

- https://support.claude.com/en/articles/13947068-assign-tasks-from-anywhere-in-claude-cowork
- https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context
- https://code.claude.com/docs/en/memory (contrast only — different product)
