---
date: 2026-09-07
slug: the-diet-and-the-seed
tickets: [BYT-25, BYT-56, DOT-184]
posted: {health: yes}
cw: |
  cclio's boot memory went on a diet, the coder got a written contract that travels as a slash command, a fresh git worktree now seeds itself with env files and its own dev ports, and merged coder branches clean themselves up on the next fetch.
  live / next: wednesday is dima's g2i technical interview with a one-word steer ready for it, the trophy-sys redesign waits on his hands, and the vercel defect turned out fixed the night before.
  worth a line: the cw memory bridge is a byte-exact mirror of the rule files now, so nothing drifts on the way over.
---
# 🗞️ cclio's gazette · the diet and the seed — memory slims, the coder gets a contract, worktrees seed themselves

## shipped

- **the memory diet** — boot context was 93k, the gazette import alone ~10k: window 7 → 5 posts (cw too), `craft-spawning` trimmed of its back-and-forth, four `prompt-audit` hunks (the bundled `claude-api` skill, run over root `CLAUDE.md` + `rules/`: «clean by the guide's own standard»), three reminders retired, `.walk/` gone, `docs/INDEX.md` back in sync with the tree (6 dead links, 9 unlisted docs).
- **the cw memory mirror, reviewed and fixed** — cw's overnight build (render on the mac, sha-stamped entries, cw byte-compares) kept: the compact `/preferences.md` fragment lost the copy ribbon and is fixed; a `sections:` allowlist keeps root `CLAUDE.md` to 6 cw-reachable sections and `fleet-hazards` to the vault; `fleet-hazards` line 4 is true again.
- **scripts on `family:name`** — `skill:handoff-store`, `skill:cclio-mode-snapshot`, `skill:memory-sync-mirror`, `linear:push`, `dotfiles:link`, …; the file is the key with `:`→`-`. `conventions/package-json.md` is the one shape for every manifest: root order (identity → scripts → deps → devDeps → peer → tech), scripts order, `family:name`, exact pins. `plugin:release` now sees uncommitted plugin edits (three false negatives in one day).
- **`x:coder-brief`** — the coder contract as a user-invoked skill, zero resident cost: step-0 skill set, «nobody is watching», the PR lane (real PR at first push, never a draft — dima's word), the linear «coder» identity, ≤12-line done comment. measured: a `--bg` prompt expands the slash command, a `SendMessage` never does (flag or no flag), and `$1` renders the **second** word on 2.1.263 — the skill reads `$ARGUMENTS`. the five `cclio:*` commands moved to `skills/<name>/SKILL.md` — commands and skills are one object.
- **the `Claude-Session` trailer stripped** — a `commit-msg` hook in dotfiles and bytes; `x:cmt` bans it; `attribution.commit: ""` never covered it.
- **worktrees seed themselves** — bytes `pnpm worktree:seed` (gitignored `.env*`, `.claude/settings.local.json`, trophy-sys caches, `CI=1` install, `.worktree-offset`); every dev script runs through `script/with-port.ts` so a second tree's ports move by 10 × index (vite, next, node apis alike; `turbo.jsonc` passes `PORT`/`PORT_OFFSET`/`API_PORT`). a user-scope `EnterWorktree` hook runs it in any repo. `camp … && pnpm worktree:seed` is the human move.
- **merged branches clean themselves** — `scout` = `gprune -d`: a `[gone]` branch in a clean worktree takes the worktree with it (github auto-deletes the remote on merge). bytes pre-push typechecks what moved since `origin/main`. starship's git tail always ends in a cap (a zero-line staged change hid both `git_metrics` and the cap).
- **[BYT-25](https://linear.app/x-com/issue/BYT-25) vercel defect** — a coder verified it fixed the night before (`09dcab99`), prod on the new ui, and measured the open question: no local check can catch the missing-install type error, the `installCommand` is the only guard. [BYT-56](https://linear.app/x-com/issue/BYT-56) retitled «monorepo sanitisation, top to bottom» with the package-json shape test as a must-pass; [DOT-184](https://linear.app/x-com/issue/DOT-184) folds the `guide-conventions` mis-shape.
- **the interview** — thea confirmed the annodater test passed in july; `/cclio:interview` (throwaway) carries the wednesday steer; `x:github-contrib` aligned with the lane.

## tricks gained

- `disable-model-invocation: true` is the only thing that hides a skill's resident cost — a `commands/*.md` file pays like a skill · `--remote-control` still eats the next arg (a 1.5 kB brief became its label, 400) — prompt first, flag last · a deleted CST survives in the jsonl of the session that wrote it · `plugin:release` before the commit saw nothing — fixed · `starship config` opens an editor and hangs a non-tty shell · `sd` needs `--` before a replacement that starts with `-`.

## state

- dotfiles + bytes clean on origin · no sessions alive · halt8 CST restored and upmerged into today's · flowlog carry-over 3 (all dima's hands) · vets unchanged · wednesday 2026-09-09: the interview, `/cclio:interview` one word.
