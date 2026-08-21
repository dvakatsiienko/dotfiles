---
subject: what the dispatch/cowork surface injects into dpatch before Dima's first word
ticket: DOT-181
researched: 2026-08-21
sources-current-as-of: 2026-08-21 (read from inside a live dpatch session)
model-at-capture: opus 5
refresh-when: the claude desktop app updates, dpatch gains or loses an mcp server, or a
  `dpatch-refresh-cclio-sysprompt` run reports a diff against this file. that skill runs on
  DISPATCH ONLY and is saved to Dima's account there — it is deliberately not in `plugin-x`,
  because no ccli session can read the dispatch prompt from the inside.
---

# dpatch system prompt — structural map

Written from the inside. Not a leak of anything secret — Dima's own surface configuration plus
Anthropic's standard behaviour blocks. What matters for DOT-181 is the **shape and the ordering**,
because the conflicts between blocks are where the surface misbehaves.

📌 This file supersedes the coarser 11-block map captured earlier the same day. One file, not two.
The 1:1 load-order scan below replaces it entirely.

## the blocks, in load order

| # | block | what it carries |
| --- | --- | --- |
| 1 | identity + `application_details` | Claude on the **Agent SDK**, powering Cowork mode. Explicitly NOT Claude Code, told not to mention the plumbing. |
| 2 | `claude_behavior` | `product_information` (model strings, docs urls, ads policy) · `refusal_handling` · `legal_and_financial` · `tone_and_formatting` (incl. the CommonMark blank-line rule) · `anthropic_reminders` · `evenhandedness` · `responding_to_mistakes_and_criticism` · `user_wellbeing` · `search_first` · `knowledge_cutoff` (2026-05-05) |
| 3 | `ask_user_question_tool` | "always clarify before multi-step work" |
| 4 | `todo_list_tool` | TaskCreate/TaskUpdate for "virtually ALL requests" |
| 5 | `citation_requirements` | a `Sources:` section for local/MCP-sourced answers |
| 6 | `computer_use` | `file_creation_advice` · `unnecessary_computer_use_avoidance` · `web_content_restrictions` · `escalate_unhelpful_web_fetch_to_chrome` · `suggesting_claude_actions` (registry-first) · `artifacts` (full React/HTML lib list, browser-storage ban) · `skills` (research-BEFORE-format ordering, four worked examples) · `high_level_computer_use_explanation` · `file_handling_rules` · `producing_outputs` · `sharing_files` · `package_management` · `examples` |
| 7 | `writing_style` | my-writing-style / setup-writing-style three-moment flow |
| 8 | user block | name + email |
| 9 | `env` | date, model, **"User selected a folder: no"** |
| 10 | `auto_thinking` | respond directly by default |
| 11 | `user_preferences` ×2 | terse-and-direct, then the full profile (kyiv, stack, fleet names, linear teams DOT/BYT, handoff rules, no-destructive-ops, state-your-model-at-open) |
| 12 | SendUserMessage contract | **only this tool renders to the user** |
| 13 | dispatch orchestrator block ×2 | routing heuristics, file access, sharing files, voice |
| 14 | computer use / desktop control | access flow, three tiers, link safety, financial-actions ban |
| 15 | `credential_autofill` | 1Password flow, ~600 words |
| 16 | shell access | `/sessions/<name>/mnt/` path mapping for the linux vm |
| 17 | memory | file-per-fact schema, four types, MEMORY.md barrel index, PII exclusion list |
| 18 | parallel-tool-calls nudge | — |
| 19 | MEMORY.md as `claudeMd` | ~3.1k, framed as "OVERRIDE any default behavior" |
| 20 | deferred tool manifest | 100+ tool **names**, no schemas. ~44.5k tokens |
| 21 | agent-type roster + mcp server instructions | chrome and computer-use each restate their loading rules |
| 22 | skills manifest | 54 skill descriptions, ~5.8k, printed **twice** — once as `<available_skills>`, once as the Skill-tool list |

The three tiers in block 14: **browsers = read only · terminals and IDEs = click only ·
everything else = full**.

`anthropic_reminders` (block 2) names six reminder types, documented nowhere else:
`image_reminder`, `cyber_warning`, `system_warning`, `ethics_reminder`, `ip_reminder`,
`long_conversation_reminder`.

## the numbers

- **~39k** system prompt, of which **8–10k is pure restatement**: orchestrator block ×2, skills
  manifest ×2, computer-use guidance ×3, chrome loading rules ×2.
- **~44.5k** more of deferred tool names carrying no schemas.
- **MEMORY.md — the actual user context — is 3.1k.** Roughly **0.3%** of the ~84k total.

## the findings that matter

- **block 3 is dead weight.** `AskUserQuestion` is in Dima's `permissions.deny` and is not
  loadable on this surface. The instruction survives; the tool does not.
- **block 4 is near-dead.** Deferred; dispatch children carry their own todo state.
- **the orchestrator block is duplicated, and the two copies contradict.** Copy one bans bullets,
  headers and bold ("you're texting, not writing a report"); copy two omits the ban. This is why
  the `dispatch-format-unset` memory has to be read first — the unset must land before any of
  Dima's formatting asks can apply.
- **"you do NOT perform tasks yourself" is factually wrong for this setup.** ~80% of text work is
  dpatch's own. Every session starts by fighting this.
- **four blocks compete for the opening move**: ask_user_question says ask, todo_list says
  TaskCreate, the orchestrator says route, `auto_thinking` says answer. Only the last is what
  Dima wants.
- **block 15 is fully inert** in normal use — ~600 words of 1Password flow that never fires.
- **the deferred-tool pattern is the one genuinely good idea here**: names only until ToolSearch
  fetches a schema. Worth copying into any harness wiring many MCP servers.

## the through-line

The surface is written for a generic remote user checking in from a phone. Dima uses it as a
primary workstation. Almost every friction he reports traces to that mismatch — the formatting
bans, the no-tasks-yourself rule, the picker that does not exist, the folder that is never
selected. This is the strongest argument in the DOT-188 file: **the fixes are all subtractions
from a prompt that cannot be edited.** `cclio` is the surface where they can be.
