---
subject: what the dispatch/cowork surface injects into dpatch before Dima's first word
ticket: DOT-181
captured: 2026-08-21
model-at-capture: opus 5
refresh-when: dispatch app updates, or the surface is retired
---

# dpatch system prompt — structural map

Written from the inside, this session. Not a leak of anything secret — it is Dima's own surface
configuration plus Anthropic's standard behaviour blocks. What matters for DOT-181 is the **shape
and the ordering**, because the conflicts between blocks are where the surface misbehaves.

## the blocks, in the order they arrive

1. **Cowork mode preamble** — "Claude is powering Cowork mode… Claude is NOT Claude Code and should
   not refer to itself as such."
2. **Standard Anthropic behaviour blocks** — product info, refusal handling, legal/financial,
   tone_and_formatting, user_wellbeing, anthropic_reminders, evenhandedness, mistakes/criticism,
   search_first, knowledge_cutoff. Generic, identical across surfaces.
3. **ask_user_question_tool** — instructs using a multiple-choice picker before real work.
   ⚠️ CONFLICT: `AskUserQuestion` is in Dima's `permissions.deny`. The instruction survives; the
   tool does not.
4. **todo_list_tool** — "MUST use TaskCreate for virtually ALL requests that involve tool calls."
5. **citation_requirements**, **computer_use**, **file_handling_rules**, **producing_outputs**,
   **sharing_files**, **package_management**, **skills** ordering rules (research before format
   skills), **artifacts**.
6. **writing_style**.
7. **Dima's user preferences**, injected twice — once as a short "be concise and direct" block, once
   as the full personal profile (Kyiv, setup, topics, agent fleet, tracker, bridge, memory-dispatch,
   no destructive ops, state your model at session open).
8. **Dispatch orchestrator block**, ALSO injected twice, near-verbatim duplicated.
9. **Shell access** — the `/sessions/<name>/mnt/` path mapping table.
10. **Memory** — the memory-file contract, plus the sensitive-personal-information exclusions.
11. **Deferred tool list** (~120 names), **available_skills** (~50 with full descriptions),
    **MCP server instructions**, **CLAUDE.md contents**, **MEMORY.md contents**.

## the findings that matter for DOT-181

- **the dispatch block is duplicated.** Two near-identical copies of "you are the Dispatch
  orchestrator… you do NOT perform tasks yourself." Pure waste, and it doubles the weight of the
  instruction Dima overrides.
- **"you do NOT perform tasks yourself" is factually wrong for this setup.** Memory records that
  ~80% of text work is dpatch's own. The prompt insists on routing everything to spawned tasks.
  Every session starts by fighting this.
- **the anti-formatting block is the one Dima overrides**: "No bullet lists, no headers, no bold…
  you're texting, not writing a report." This is why `dispatch-format-unset` has to be ⭐read-first
  in memory — the unset must happen before any of his formatting asks can apply.
- **three separate blocks compete for the opening move**: ask_user_question says ask first,
  todo_list says TaskCreate first, dispatch says route first. None of the three is what Dima wants,
  which is: answer, or do the work.
- **skills arrive with full descriptions, eagerly** (~50 of them). This is the cwrk-loads-eagerly
  cost assumption from the DOT-165 thread, confirmed from the inside.
- **the deferred-tool list is names-only** until ToolSearch fetches a schema — genuinely cheap, and
  the pattern worth copying in any harness that connects many MCP servers.

## the through-line

The surface is written for a generic remote user checking in from a phone. Dima uses it as a primary
workstation. Almost every friction he has reported traces to that mismatch — the formatting bans, the
no-tasks-yourself rule, the picker that does not exist. This is the strongest argument in the
DOT-188 file: the fixes are all subtractions from a prompt that cannot be edited.

Verbatim text of any individual block is reproducible on request; the map is what was worth keeping.
