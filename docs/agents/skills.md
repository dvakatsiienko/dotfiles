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

## the skill listing budget (cc only)

skills are **half-lazy**. resident from boot = `name` + `description` (~80–100 tokens per skill).
the `SKILL.md` body enters context on invoke, as one message, and persists for the rest of the
session. files bundled next to a skill load only when actually read — near-zero resident cost, so
that is where bulk content belongs.

on `cc` the whole listing shares a **character budget, ~1% of context**. on overflow descriptions
truncate, then drop entirely, least-invoked first, down to name-only. that is the mechanical cause
of «the skill exists but never fires» — nothing errors, the skill just goes quiet.

⚠️ **known bug**: the budget is computed against a 200k baseline even on 1m-context models, so a
large window does not buy listing room.

two unofficial knobs, `settings.json`:

| key | default | ours |
| --- | --- | --- |
| `skillListingBudgetFraction` | `0.01` | `0.025` (2026-08-19, DOT-64 — sized for the current library) |
| `skillListingMaxDescChars` | `1536` | unset |

📌 the file is strict json and carries no comments, so this table is the only record of why that
number is what it is. change one, change the other.

consequences for how skills are written:

- **descriptions are the precious bytes.** keyword-rich, but every word competes with every other
  skill's description for the same budget.
- **prefer one umbrella skill over many narrow ones.** `conventions` is the pattern: one
  description resident, N rule files read on demand.
- unlike mcp tools, skills have **no `ToolSearch` equivalent** — mcp overflow degrades to lazy
  retrieval, skill overflow degrades to silent truncation. there is no `SkillSearch`.
