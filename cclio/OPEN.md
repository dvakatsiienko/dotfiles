# open — parked items

things deliberately not-done. a park that lives only in a chat message is a strand; it lives
here instead. surfaced by `/cclio-init` step 5.

two sections, never merged: `## queue

- 🎫 **DOT-197 — the cclio post-checklist.** `needs human`: hand-test what the surface actually does.
- ⚠️ **DOT-202 — relocate dotfiles to `~/dotfiles`.** blocks DOT-195, so it is on the clock.

- 🎫 **DOT-194 — the proof loop.** dima's call: next session. one full coordinator→coder run with a
  leak check. it is the `the proof loop closes` milestone and the first real visibility primitive.

- 🔬 **evaluate `basic-memory` properly, then decide DOT-177's shape.** dima's ask: learn
  [basic-memory](https://github.com/basicmachines-co/basic-memory) rather than home-bake a half-working membank.
  📌 dpatch already reported it «won't work» and that verdict was folded into
  [DOT-177](linear://linear.app/issue/DOT-177) — **treat that as a relayed claim, not a finding**
  ([[research-vs-lived-evidence]]). DOT-177's body already carries requirements extracted from a
  basic-memory trial, so read the ticket BEFORE the repo. the real question underneath: does the
  roadmap live in memory leaves, or in a membank?

## parks` below is long-lived — items that outlive many sessions.

## queue

- 🧩 **shelf colocation — the story remix, quick.** the `shelf` PROJECT is dissolved (archived, 8
  issues moved into `fleet`). what is NOT done is the colocation dima wants: those 8 sit loose in
  `fleet` instead of under one story. read them, remix into ONE story, parent them to it.
  [DOT-145](linear://linear.app/issue/DOT-145) is a candidate to join. the 8:
  DOT-161 · DOT-10 · DOT-9 · DOT-8 · DOT-7 · DOT-6 · DOT-5 · DOT-4

- 🔥 **the obsidian `worklog.md` is 1st priority next session, ahead of new work.** dima unfroze it
  and the inbox was emptied into it. four buckets in order: the linear colocation job (fold under
  DOT-28 + trace why DOT-184 escaped it + guardrail first), project sanity (`mind` vs `fleet`,
  shelf dissolve, cloud story), four small do-and-close tickets, four questions of his awaiting
  answers. path:
  `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Dima's Vault/prompts/worklog.md`

## parks

- 📊 **sline lags on «what were we doing at this time».** dima's observation, parked by him for
  later. the pin and status cache work — `DOT-182 done` rendered correctly the moment it closed.
  what is weak is the *temporal* read: reconstructing what was in flight at a given moment. likely
  wants the flowlog or session history as a source, not the focus file, which only ever holds
  current state. not scoped, not ticketed yet — deliberately.

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
