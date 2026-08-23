# cclio memory index

One line per leaf, pointing into this dir. Content lives in the leaf, never here.

📌 `@slug.md` is an **import**, not a link — it is what loads the leaf. Paths resolve relative to
**this file**, never the cwd, and a wrong one loads nothing silently. See [[memory-hazards]].

A leaf is one decision, not a topic dump. A stale pointer means delete both the line and the file.
The emoji prefix is a salience marker (❗ 📌 ⭐ 🧭), never decoration; ❗ marks a silent failure.

## direction — read before any pm decision
- 🧭 @dima-roadmap.md — the ORDER: what we do next, his sequence, kept evergreen
- 🧭 @dima-strategies.md — the branch map. six branches, equally weighted, none is the main one
- 📖 @dima-stories.md — what actually happened, so the rules keep their reasons. append, never rewrite
- @strategy-pm.md — a chiller loop, not a fuller board
- @strategy-fleet.md — one mind, many surfaces; single source of truth
- @strategy-dimas-tools.md — shared tools where the AGENT is the majority user
- @strategy-bytes.md — the product work the meta-work starves; surface it even when quiet
- @strategy-harness.md — wanted, deferred with a date and a test, never refused
- @strategy-visibility.md — see what the agents do; after mvp, but don't foreclose it

## running the work
- ⭐ @pm.md — fold or drop, the four fields every ticket carries, how to read and write linear, and the link rule that keeps breaking
- ⭐ @spawning.md — every door, what each measured to do, the preflight, and how a coder is briefed, watched and stopped
- ⭐ @halt.md — a session ends with the halt ritual; run it on his signal, never open it mid-task
- @handoff-ask-here-or-fresh.md — ask here-or-fresh BEFORE composing a CST, not after
- @batch-drops-get-restated.md — restate a multi-item drop as a parsed list before acting on it
- @obsidian-inbox-protocol.md — 📬 inbox.md must end empty; flowlog.md is the work journal
- @clean-up-after-yourself.md — prune processed buckets and temp files the same turn

## safety
- @no-destructive-ops-under-bypass.md — bypass removed the gate, not the restraint

## method — how a claim earns belief
- ⭐ @claims-carry-their-test.md — a rule states the ONE command that proves it, or is labelled an inference
- ⭐ @research-vs-lived-evidence.md — his daily observation outranks a report; a relayed claim needs its source OPENED
- ❗ @memory-hazards.md — the ways a memory file breaks silently: dead imports, truncate-before-read, a quote that looked cut off
- ❗ @git-commit-takes-the-index.md — a bare commit takes the WHOLE index; pass the pathspec to commit itself

## the system itself
- ⭐ @skill-edits-are-file-edits.md — a skill change is an ordinary file edit; never hand him a package to install
- @skill-namespaces.md — `x:*` runs anywhere, `cclio:*` is coordinator-only; the test is WHERE it runs
- @memory-divergence-store.md — mutate own memory only; never build another sync mechanism
- @expect-skill-sync-drift.md — `skills-cw` is the only surface that still drifts; note it, never block
- @domain-modeling-fleet.md — multi-domain by design; repo, tracker and fleet contexts never merge

## how replies look
- ⭐ @output-must-be-pretty.md — ops as lines not prose, copy blocks get visible ends, the output kit

## environment
- ⭐ @tell-dima-all-capabilities.md — surface what this surface can do, especially the gated parts, and what a loaded capability costs
- ⭐ @mcp-earns-its-place-on-desktop.md — 🚫 never say «mcp lost»; ask WHICH MACHINE the shell reaches before answering
- @settings-json-drifts-when-unlinked.md — CC writes it at runtime; a real file where the symlink belongs is silent divergence
