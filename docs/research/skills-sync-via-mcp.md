# Skills sync via MCP — can mcp-x-cw serve skills to all surfaces?

Ticket: DOT-165

Researched 2026-08-19 (sonnet subagent; docs.claude.com / code.claude.com + repo inspection).

## Verdict: NO as a sync mechanism — though MCP tool descriptions DO behave skill-like on cowork.

Correction (2026-08-19, Dima's counter-evidence): the handoff MCP proves cowork does NOT ignore mcp-as-skills — its tool descriptions are always-loaded context pointers that fire on the plain keyword «handoff», exactly like a model-invoked skill description (see `mcp-x-cw/src/index.ts`: rich per-tool descriptions + MCP prompts wrapping the UX contract). What kills MCP as THE sync channel is scale, not mechanism: every skill served this way = one more permanently-loaded tool description (context cost grows linearly with skill count, vs skills that page in on demand), ccli natively prefers files (autonomous skills, zero extra server), and mobile still has no MCP. Tool-description skills stay the right pattern for tool-shaped workflows (handoff); wrong as a bulk skill store.

## Mechanism check

- **Skills are filesystem-only.** ccli loads them from `~/.claude/skills/`, project `.claude/skills/`, plugin dirs, and an account-synced folder. There is no MCP-served skill type.
- **MCP prompts** surface as `/mcp__server__prompt` slash commands — user-typed only, never autonomously triggered by description matching. Reimplementing skills as MCP prompts loses autonomous invocation — a regression.
- **MCP tool descriptions** load into context but require the model to call a tool; no description-matched self-triggering.

## Per surface

- **ccli**: MCP prompts work but are manual; plugin-x skills stay superior for autonomous triggering.
- **cwrk**: Cowork sessions don't read local skill dirs — they load skills enabled on the claude.ai account (uploaded zips or `save_skill`-saved). Nothing indicates cowork consumes MCP prompts as skill-equivalents.
- **mobile**: no MCP at all — dead end regardless.

## Consequence

The solid sync path is the file/account-based one (DOT-168): plugin-x files as source of truth; cwrk side pushed via agent-run `save_skill` (proven 2026-08-19 — replaces the manual zip drag of `skills-sync-cw.ts`); a distributable shell script handles file-side distribution + drift detection. Optional garnish: expose a few genuinely-manual skills (cmt, sweep-issues) as MCP prompts for convenience — additive, not a sync mechanism.

## Sources

- https://code.claude.com/docs — skills loading locations, "Skills in Cowork and cloud sessions", MCP prompts as slash commands
- repo: home/.claude/mcp-x-cw/, home/.claude/plugin-x/, script/skills-sync-cw.ts

---

# Round 2 — 2026-08-20 (reopen verdict: original NO holds, MVP dropped)

Researched by a sonnet subagent against primary sources after Dima reopened the ticket with an
MVP-to-a/b plan. The reopen rested on one assumption — that MCP prompts give cwrk slash-command
delivery with autocomplete. **That assumption is false for the target surface.**

## Findings

**1. MCP prompts are user-controlled by spec.** `modelcontextprotocol.io/specification/2026-07-28/server/prompts`:
"Prompts are designed to be user-controlled... with the intention of the user being able to
explicitly select them." There is no description-matching auto-trigger equivalent to a skill.

**2. cwrk has no slash UI for MCP prompts.** Claude Desktop surfaces server prompts through the
«+ / Attach from MCP» flow — the prompt arrives as an attachment, not as inserted steering text.
The slash-autocomplete the MVP was designed around exists in **ccli**, which already reads skills
from disk and does not need the server.

**3. Tools-as-skills confirms the round-1 scale argument.** ~550–1400 tokens of schema+description
per tool, permanently in context (upstream modelcontextprotocol#2808). Skills page in on demand;
tools do not.

**4. MCP has no skills primitive.** Agent Skills is a separate standard (SKILL.md + YAML
frontmatter). Official cwrk delivery paths: manual zip upload, or the `save_skill` tool.

**5. The primitive comparison.** prompts = user-selected, attachment UX · resources = data framing,
same UX ceiling · tools = model-invoked but token-costly · **native skill = platform-injected
description trigger, deterministic.** Nothing MCP offers reaches skill parity on cwrk.

## Consequence

- The sync path is **DOT-168** as designed: plugin-x SKILL.md files → script → `save_skill(overwrite)`.
  Externally validated, not merely convenient.
- **The rebrand is void.** `mcp-handoff-cw` was to be renamed (candidate `mcp-skills-cw`) because it
  would grow into a skill server. It will not. It stays handoff-shaped; the only rename still owed is
  the `x-` prefix sweep already scoped in DOT-11 (→ `x:handoff`). That sweep landed 2026-08-22: the
  directory is `mcp-x-cw` and the server name is `x-cw`.
- Nuance preserved from round 1: **tool descriptions do behave skill-like** and remain the right
  choice for tool-shaped workflows such as handoff. The finding is about bulk skill storage, not
  about the mechanism being fake.

## Unverified

- Whether cwrk acts on `listChanged` notifications without a reconnect.
- Whether cwrk has ccli's progressive tool-search (context-saving) behaviour.

## Sources (round 2)

- https://modelcontextprotocol.io/specification/2026-07-28/server/prompts
- https://modelcontextprotocol.io/specification/2025-06-18/changelog
- https://modelcontextprotocol.io/docs/tools/debugging
- https://github.com/modelcontextprotocol/modelcontextprotocol/issues/2808
- https://github.com/anthropics/skills
- https://code.claude.com/docs/en/plugin-marketplaces

---

# Round 2 — CORRECTION (verdict withdrawn)

The round-2 verdict above is **wrong as stated** and is kept only as a record of the reasoning error.

**Counter-evidence that breaks it:** the handoff MCP already delivers skill-like behaviour on cwrk.
Plain keyword «handoff» in conversation fires the tool description; the agent loads and follows it.
Model-triggered, not user-selected. Proven in daily use, not theory.

**What round 2 actually evaluated:** one MCP tool or prompt *per skill*. That version does fail —
~550–1400 tokens of permanently-resident schema per tool, prompts user-selected by spec. Real
findings, wrong question.

**The design that survives:** one server, one meta-tool (`get_skill(name)`), skill index in its
description, bodies returned on demand — name+description resident, body paged in. The native skill
model reproduced, at roughly native cost.

**Cost assumption to A/B at build time:** cwrk loads all installed skills eagerly (unlike ccli,
which defers), so MCP-served skills are not a regression — same resident cost, plus automation.

## Slash commands — the two claims reconciled

Round 1: MCP prompts surface as `/mcp__server__prompt` — doable but ugly (the mangled name is the
ugliness). Round 2: cwrk has no slash UI, only attach-from-MCP. **Both can be true — they describe
different surfaces.** ccli has the slash commands; cwrk is the open question, and round 2's claim
came from secondary sources rather than spec or test.

**Decisive test:** the handoff server already exposes prompts. Type `/` in cwrk and look. Present →
round 2 wrong. Absent → confirmed by observation.

## Method lesson

When research contradicts something the user observes daily, the research is answering a different
question. Find which one before reporting. Subagent conclusions need adversarial review, not relay.
