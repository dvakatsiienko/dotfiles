# open — parked items

things deliberately not-done. a park that lives only in a chat message is a strand; it lives
here instead. surfaced by `/cclio-init` step 5.

two sections, never merged. `## queue` = work parked by `/queue` in an earlier session, offered
at the next boot. `- 🧪 **survivability probe `46cc8bac` — «🧪 probe: survives a coordinator restart».** deliberately
  left running. at next boot, check whether `ListAgents` / `claude agents --json` still shows it.
  it answers the last open assumption in the coordinator→coder contract §7: does a background
  session survive a **coordinator** restart, not just its own idleness. stop it once answered.

## parks` = long-lived items that outlive many sessions.

## queue

- ⏰📌 **verify `/cclio:*` in a FRESH session, then delete the four originals.** the plugin is
  registered at project scope (`cclio/.claude/settings.json`), but a plugin only binds at session
  start, so it could not be tested by the session that built it. the originals in
  `cclio/.claude/commands/` are deliberately still there and still work. once `/cclio:report`
  resolves, delete them. **a stuck reminder carries this, and it doubles as the live test of
  `/remind stick` — if it does not greet you at boot, that feature does not work.**

- 🎫 **[DOT-73](linear://linear.app/issue/DOT-73) is the next real session** — memory and skills,
  in one hot pass. it was fed heavily today and not started. its body now carries the ordering
  contract, the bucket tests, and the external asks folded in. the authoring pair
  (`docs/agents/skill-authoring.md`, `docs/agents/memory-authoring.md`) is the platform it runs on.

- 🧩 **shelf colocation — the story remix, quick.** 8 tickets sit loose in `fleet` instead of under
  one story: DOT-161 · DOT-10 · DOT-9 · DOT-8 · DOT-7 · DOT-6 · DOT-5 · DOT-4.
  [DOT-145](linear://linear.app/issue/DOT-145) is a candidate to join.

- 🔬 **evaluate `basic-memory` properly, then decide [DOT-177](linear://linear.app/issue/DOT-177)'s
  shape.** 📌 the rejection on record is a **relayed claim, not a finding**, and it rested on
  «23 tools ≈ 8k resident tokens» — measured here, 25 deferred mcp tools cost **~177 tokens**.
  the arithmetic may invert entirely. read the ticket before the repo.

## parks

- ⚠️ **dotfiles relocates to `~/dotfiles`, and it must happen BEFORE
  [DOT-195](linear://linear.app/issue/DOT-195)** — [DOT-202](linear://linear.app/issue/DOT-202).
  cclio runs from inside dotfiles at `~/projects/dotfiles/cclio`, which is safe **only while
  `~/projects/CLAUDE.md` does not exist**. the moment DOT-195 creates the coder-global, this path
  inherits it and the coordinator stops being isolated. **ordering is blocking, not preference.**
  dima's own reason stands alone: the cursor multi-root view degrades as file count grows.

- 📊 **sline lags on «what were we doing at this time».** the pin and status cache work; the
  *temporal* read is weak. likely wants the flowlog or session history as a source, not the focus
  file, which only holds current state. not scoped, not ticketed — deliberately.

- **historical flowlogs stay put** — the pre-migration logs at
  `~/projects/dotfiles/home/.claude/flowlog/` are an archive. cclio READS them when a flaw class
  repeats, and writes only to `~/projects/dotfiles/cclio/flowlog/`.

- 🚨 **cli → cloud messaging is UNVERIFIED and may be broken.** a send returned success while the
  cloud session reported nothing arrived. cloud → cli genuinely fails by design. treat cloud as a
  one-way pipe plus a shared store (linear, a commit, a PR), never a handshake. parked on
  [DOT-208](linear://linear.app/issue/DOT-208); cloud is the least-needed thing on the board.
