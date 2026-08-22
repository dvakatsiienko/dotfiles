# entity-first — the ONE naming rule

🔑 **the keyword is `entity-first`.** Dima types it with a scope and nothing else:

    entity-first the mcp tools
    entity-first plugin-x
    entity-first this file

That is the whole ask. **Do not re-explain the rule, do not restate the reasoning, do not ask
which variant he means.** Report what changed, nothing more. He got tired of writing the
explanation; the keyword exists to end it.

## the rule

**The entity name leads. The verb follows.**

    ✅ handoff_delete · handoff_delete_all · handoff_list · handoff_save
    ❌ delete_handoff · delete_handoffs   · list_handoffs · save_handoff

    ✅ authoring-memory · authoring-skill
    ❌ memory-authoring · skill-authoring

**Scope is everything with a name:** variables, methods, classes, files, directories, mcp tools,
skills, commands, tickets. Dima's own words: proven by years of practice, untested above ~500k loc.

📌 **`verb-last` is the WRONG name for it and he should be told so once if he uses it.**
`handoff_delete_all` has a qualifier after the verb, so the verb is not last. Only *entity-first*
describes every case.

## why the name matters more than usual

This rule was written three separate times under three names — **subject-first** in
`~/.claude/CLAUDE.md`, **family-first** here, **entity-first** in the mcp rename. Same rule, three
statements, guaranteed to drift. [DOT-73](linear://linear.app/issue/DOT-73) holds the fold: state
it once, delete the others. `entity-first` won because it names the half that leads.

## what it buys, and this part is agreed on both sides

- **for Dima:** a sorted listing groups by entity. The family is one block, not scattered across
  the alphabet by verb. Navigation, not aesthetics.
- **for the agent:** the first token carries the disambiguation weight. `delete_handoffs` and
  `delete_users` share a prefix, so the entity — the higher-stakes axis — is learned last. A
  contiguous `handoff_*` block is one region of attention instead of seven lookups.
  📌 reasoned, not benchmarked. Say so if it is ever load-bearing.
- **precedent:** `git remote add`, `git branch delete`, `aws s3 ls`.
- the only cost is english prose reading less like a sentence, in places nobody reads sentences.

## what still needs the pass

The `x:*` and `cclio:*` skill names, the `plugin-x` skill directories, `script/` entrypoints.
Global, pending — **do not sweep unasked**, wait for the keyword with a scope.

Related: [[pm-fold-or-drop]], [[memfile-trim-comes-last]]
