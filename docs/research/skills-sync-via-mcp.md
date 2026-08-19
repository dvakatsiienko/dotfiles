# Skills sync via MCP — can mcp-handoff-cw serve skills to all surfaces?

Ticket: DOT-165

Researched 2026-08-19 (sonnet subagent; docs.claude.com / code.claude.com + repo inspection).

## Verdict: NO as a sync mechanism — though MCP tool descriptions DO behave skill-like on cowork.

Correction (2026-08-19, Dima's counter-evidence): the handoff MCP proves cowork does NOT ignore mcp-as-skills — its tool descriptions are always-loaded context pointers that fire on the plain keyword «handoff», exactly like a model-invoked skill description (see `mcp-handoff-cw/src/index.ts`: rich per-tool descriptions + MCP prompts wrapping the UX contract). What kills MCP as THE sync channel is scale, not mechanism: every skill served this way = one more permanently-loaded tool description (context cost grows linearly with skill count, vs skills that page in on demand), ccli natively prefers files (autonomous skills, zero extra server), and mobile still has no MCP. Tool-description skills stay the right pattern for tool-shaped workflows (handoff); wrong as a bulk skill store.

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
- repo: home/.claude/mcp-handoff-cw/, home/.claude/plugin-x/, script/skills-sync-cw.ts
