# 2026-09-18 · the perf mini-session · run cc·20260907·raycast

- `sd` with `$dir` / `$line` in a double-quoted replacement ate the variable twice in one session (trail script, leaf config) — the CST's own E-section warned about it · cost: two broken lines caught by reading the output · lesson: third sighting → a fleet-hazards line under «the bash tool»: `sd` replacements never carry `$`; the Edit tool or a python literal does that edit
- a `grep -rln … --include=*.md` inside a `&&` chain aborted the whole chain under zsh (`no matches found: --include=*.md`) — the trail script never ran, and the next command read a missing file · cost: one round · lesson: zsh globs an unquoted `*` in an option value too; quote it (`--include='*.md'`) — same class as the `=word` line in method-silent-failures
- the verifier researcher did not use `neuroarxiv` and dima had to name it; the arxiv lane then changed the spec in three places (tamper pr, stakes out of the prompt, symptom-not-fix) · cost: none, caught the same session · lesson: a research brief for an architecture question names `neuroarxiv` as a lane — craft-spawning's research-brief line
- `/init` fired on «minit» (a typo) and offered to write a CLAUDE.md — ignored on sight, no cost; noted so the next «minit» is read as `/cclio:init mini`
- GOOD: three questions about the verifier («what's the role», «tamper pr wtf», «eli5 fields») each got a two-line answer before the next build step — the shape held
- GOOD: DOT-215 proven red first (a wrong `gh --jq --arg` shape printed two FAILs, exit 1) then green
