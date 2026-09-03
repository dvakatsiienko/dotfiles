# 2026-09-03 — the git and browser day

run: cclio-memory-bridge · model: fable 5.1 · boot after halt4 ingest. file opened at the halt, not at boot — the boot skipped phase 8.

## catches

- alias prune ran on one word («take care of git») while dima was still reading; a coder's replies were read as advancement. → pending block + propose-only sweeps + «a coder reply is never an advancement» landed in craft-pm and fleet-output-format; `granular` label born. memory, done.
- «DOT-159 remainder: bytes has no push hook» — false; grep looked for `lefthook.yml`, bytes has `lefthook.yaml`. → a null grep is the weakest evidence (method-report-verify already says so). drop; the ext is now `.yaml` everywhere.
- python heredoc terminated early by an inner `EOF` inside a `cat <<EOF` in the script. → outer delimiter must differ from any inner one (`PYEOF`). drop (one-off, caught same call).
- dotfiles vitest counted the coder worktree's test copies: 166 = 2 × 83. → worktree removal fixed it; a vitest `exclude` for `.claude/worktrees/**` is the durable fix. ticket-sized freebie, parked in x-queue.
- two coders refused a prod merge relayed through cclio, correctly; cclio merged on dima's word each time. → not a flaw; the split is right (coder holds, cclio merges). drop.
- flawlog not opened at boot. → this file. drop.
