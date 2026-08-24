# authoring-memory-and-skills — maintenance tactics for our own memory and skills

internal rule picks for editing memory files, rules, and skills. emphases live here when a
mechanism (a skill trigger, a hook) proves too weak on its own — the entry names the tool AND the
moment to reach for it.

## load `writing-for-agents` BEFORE the edit

editing any skill, rule, `CLAUDE.md`, or memory file → invoke `mattpocock-skills:writing-for-agents`
first, then open the target. its own description says exactly this and still fails to fire —
measured: a dozen edits in one session, zero loads. marketplace skill, so the fix lives here, never
as an edit to the skill itself (update drift).

## tips-and-tricks — the section contract

every `CLAUDE.md` may end with `## 💡 tips and tricks`: genuinely useful or unexpected findings,
shaped **issue → resolution** — what was hit, then what resolved it.

- project-specific gotchas outrank broad-topic tips
- **cap 7 lines, freshest first, oldest out**
- each file maintains only its own scope
- no forced entries — empty is healthy
- line shape: `- <emoji> <yyyy-mm-dd> — <issue hit> → <what resolved it>`
