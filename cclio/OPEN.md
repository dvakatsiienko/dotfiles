# open — parked items

things deliberately not-done. a park that lives only in a chat message is a strand; it lives
here instead. surfaced by `/cclio-init` step 5.

- **frozen obsidian worklog.md + inbox.md** — frozen by dima during run `cw·20260819·batch1`,
  not yet unfrozen or processed. still needs resolving. path:
  `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Dima's Vault/prompts`

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
