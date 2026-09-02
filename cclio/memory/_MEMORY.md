# cclio memory index

One line per leaf, pointing into this dir. Content lives in the leaf, never here.

📌 `@slug.md` is an **import**, not a link — it is what loads the leaf. Paths resolve relative to
**this file**, never the cwd, and a wrong one loads nothing silently. See [[method-silent-failures]].

A leaf is one decision, not a topic dump. A stale pointer means delete both the line and the file.
**Every leaf carries a type prefix — `dima-` `craft-` `habit-` `method-` `sys-` — and joins that
barrel section.** A new leaf picks its type at create time; a leaf fitting no type is a signal to
rethink, not a license for a bare name. (`_`-prefixed files are infrastructure, not leaves.)
The emoji prefix is a salience marker (❗ 📌 ⭐ 🧭), never decoration; ❗ marks a silent failure.

## direction — read before any pm decision
- 🧭 @dima-roadmap.md — the ORDER: what we do next, his sequence, kept evergreen. master lives in the obsidian vault; the repo path is a SYMLINK to it (a direct vault-path import loads nothing; the symlink loads — verified 2026-08-30). «resident upd» from dima → re-read it
- 🧭 @dima-strategy.md — the branch map. six branches, equally weighted, none is the main one
- 🗞️ @../gazette/_recent.md — the 7 freshest gazette posts, regenerated at boot and at every post; the event history behind the rules
- 📖 @dima-stories.md — what actually happened, so the rules keep their reasons. append, never rewrite

## running the work
- ⭐ @craft-pm.md — fold or drop, the four fields every ticket carries, how to read and write linear, and the link rule that keeps breaking
- ⭐ @craft-spawning.md — every door, what each measured to do, the preflight, and how a coder is briefed, watched and stopped
- ⭐ @habit-halt.md — a session ends with the halt ritual; run it on his signal, never open it mid-task
- ⏰ @_reminders.md — dima's standing reminders; ⏰📌 stuck ones raised every boot
- ✍️ @habit-memory-edits.md — every memory edit announced in-thread same turn; deletions, his words, and rules/ need approval first
- 📬 @habit-shared-files.md — inbox.md must end empty; flowlog pruned at halt; scratch dies same turn
- ⭐ @habit-pacing.md — a fat drop gets labeled sub-batches with checkpoints; every ask handled, a missed one is the worst outcome

## method — how a claim earns belief
- ⭐ @method-rule-proof.md — a rule states the ONE command that proves it, or is labelled an inference
- ⭐ @method-report-verify.md — his daily observation outranks a report; a relayed claim needs its source OPENED
- ❗ @method-silent-failures.md — the ways a memory file breaks silently: dead imports, truncate-before-read, a quote that looked cut off

## the system itself
- @sys-skills.md — `x:*` runs anywhere, `cclio:*` is coordinator-only; the test is WHERE it runs
- @sys-boundaries.md — what stays separate: own memory only, no sync mechanisms, domains never merge
- @sys-settings-drift.md — CC writes it at runtime; a real file where the symlink belongs is silent divergence
- 📌 `dispatch-init.md` + `sys-dispatch.md` sit here NOT imported (no `@`) on purpose — dispatch's boot reads them, cclio never loads or reads them unless Dima asks. dispatch expands no imports, so: injected stub (`dispatch-init.md` as its MEMORY.md) → `/cclio:init-dispatch` command owns the boot → leaves on demand

- 📐 procedures (repeatable maintenance flows) live in `docs/procedures/` here — `_spec.md` is the contract: want = dima's, research vectors = his wording, artifacts pointed-at never housed. read it before creating or running one. (plain pointer, not an import)

## habits
- ⭐ @habit-capability-tips.md — tell him what you can do, filtered to what you are both doing now; a grant is not a limit
