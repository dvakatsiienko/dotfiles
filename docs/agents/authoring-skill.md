# skill authoring — the full reference

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

## invocation control — the only lever that removes a description from the budget

📌 **commands and skills are the same thing now.** the docs state it plainly: *"Custom commands have
been merged into skills."* `.claude/commands/deploy.md` and `.claude/skills/deploy/SKILL.md` both
create `/deploy` and behave identically. so **a command is billed exactly like a skill** — measured
on this machine, the four `cclio-*` commands sit in the resident listing at ~30–40 tokens each.
there is no cheap tier by being "a command".

three fields, and two of them are easy to confuse:

| what you want | set this | description resident? |
| --- | --- | --- |
| **only Dima invokes it** | `disable-model-invocation: true` | ❌ **no — this is the saving** |
| only Claude invokes it | `user-invocable: false` | ✅ yes, always |
| Dima-only, without editing the file | `"user-invocable-only"` in `skillOverrides` (settings) | ❌ no |

- ⚠️ **`user-invocable: false` is the trap.** it reads like the one you want and is the opposite:
  it hides the skill from the `/` menu, keeps Claude's access, and keeps the description resident.
- **`disable-model-invocation: true` also stops** the skill being preloaded into subagents, and
  (v2.1.196+) stops it running when a scheduled task fires with it as the prompt.
- 📌 `"user-invocable-only"` in `skillOverrides` reaches skills **we do not own** — third-party
  plugin skills that would otherwise sit resident forever. that is its real use; for our own files,
  prefer the frontmatter field, because it travels with the file.

### the habit

**mark a skill user-invocable-only whenever Dima is the only one who should ever start it.** the
docs' own test is side effects and timing — `/commit`, `/deploy`, `/send-slack-message`. you do not
want Claude deciding to deploy because the code looks ready.

🚫 **but check for self-triggering FIRST, and read the skill body, not just its name.** a skill that
is *supposed* to fire on its own dies silently when flagged, and nothing reports it. real examples
from this repo:

- `cclio-graceful-halt` **must stay model-invocable** — Dima may simply say something that means
  «we are done», and starting the ritual is the agent's job, not his
- `cclio-flowlog` fires «whenever a mistake just happened»
- `cclio-report` fires on «sup» / «where are we»
- `x:cmt` loads on any commit, typed or not

the saving is ~30–40 tokens per skill. **that is never worth killing a habit for.** when in doubt,
leave it invocable.
