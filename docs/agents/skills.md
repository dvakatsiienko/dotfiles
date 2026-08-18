# skill conventions

conventions for the skills in `home/.claude/plugin-x/skills/` and their `cw` adaptations in
`home/.claude/skills-cw/`. mechanics of the sync live in `script/skills-sync-cw.ts`.

## frontmatter

`name` and `description` are the contract Claude Code reads. one optional field is ours:

```yaml
intended-models: fable, opus
```

- **meaning** — the models this skill is written for, best first. `fable, opus` reads "fable
  normally, opus when fable is unavailable".
- **enforcement is procedural, not mechanical.** nothing blocks a lower-tier model from loading
  the skill. routing is where it is honoured: dispatch picks the model with this field in view.
- **a model running a skill above its tier prints a note** saying so, then proceeds. the note is
  the signal, never a refusal.
- omit the field when the skill is model-agnostic. most are.

model strengths that decide the value: `home/.claude/rules/models.md`.
