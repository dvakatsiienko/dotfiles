# open — parked items

things deliberately not-done. a park that lives only in a chat message is a strand; it lives
here instead. surfaced by `/cclio-init` step 5.

two sections, never merged: `## queue` is session-scoped work parked by `/cclio-queue` and
removed when popped. `## parks` below is long-lived — items that outlive many sessions.

## queue

- 🔥 **the obsidian `worklog.md` is 1st priority next session, ahead of new work.** dima unfroze it
  and the inbox was emptied into it. four buckets in order: the linear colocation job (fold under
  DOT-28 + trace why DOT-184 escaped it + guardrail first), project sanity (`mind` vs `fleet`,
  shelf dissolve, cloud story), four small do-and-close tickets, four questions of his awaiting
  answers. path:
  `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Dima's Vault/prompts/worklog.md`

## parks

- ~~frozen obsidian worklog.md + inbox.md~~ — **UNFROZEN by dima 2026-08-21.** inbox emptied into
  worklog the same evening; the work itself is queued above, not parked. `protected.md` in that
  folder stays read-only — it is dima's, never ours.

- **historical flowlogs stay put** — the pre-migration logs at
  `~/projects/dotfiles/home/.claude/flowlog/` are NOT being migrated. they remain an archive.
  cclio READS them when a flaw class repeats, and writes only to `~/projects/dotfiles/cclio/flowlog/`.

- **⚠️ dotfiles relocates to `~/dotfiles`, and it must happen BEFORE [DOT-195](https://linear.app/x-com/issue/DOT-195)** —
  the mvp runs from inside dotfiles at `~/projects/dotfiles/cclio`. that is safe only while
  `~/projects/CLAUDE.md` does not exist; the moment DOT-195 creates the coder-global, this path
  starts inheriting it and the coordinator is no longer isolated. the answer is moving the whole
  dotfiles repo to `~/dotfiles` with cclio aboard, NOT moving cclio back out.

  dima's reasoning for the move on its own merits: the cursor multi-root workspace view works at
  small scale but degrades as file count grows, and it will grow.

  **ordering is blocking, not preference.** relocation lands first, DOT-195 second.
