---
name: dispatch-spawn-types
description: The session types dpatch can spawn and their ui/capability differences
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4b140658-9385-4bd6-8f8c-e3aeefb5214d
  modified: 2026-08-19T15:28:40.800Z
---

Dpatch spawn types (knowledge base seed, Dima wants this grown):
- start_task → cwrk child. Appears in Home tab, Dispatch section. cwrk toolset, no git/worktrees. Feeds the bg-tasks registry → these unlock the «see background tasks» button.
- start_code_task → real ccli session. Appears in Code tab. True ccli capabilities (git, worktrees, ccli config). HAS a model param (fable/opus/sonnet/haiku + prev gens). Observed 2026-08-17/18: ccli spawns do NOT unlock the bg-tasks button — cwrk children only.
- Agent tool subagents → internal to dpatch's own session; results return to dpatch; invisible in Dima's ui. Has model param. Known bug: final report text sometimes dropped ("delivered above") — instruct agents to put findings in final message; re-run on drop.
- start_task has NO model param; children appear to inherit parent model (probe showed Fable 5) — reusable as a fable worker via send_message.

Haiku: untested in our setup — Dima wants to try it; when a fitting mechanical fan-out task appears (bulk summarization, extraction, classification), proactively suggest a haiku test run. Schedules: only model + perms are tweakable (no effort knob); "linear milestone ab review" set to sonnet 5 by Dima.

Scheduled tasks rule (Dima 2026-08-18): dpatch can't set model/effort/perms on schedules — EVERY time a schedule is created, remind Dima to tune them manually and prefill a concrete suggestion (model + effort + perms; perms usually bypass or unattended runs freeze on dialogs). ccli completions do NOT notify dpatch (only cwrk children do) — poll transcripts. Dima CAN rename sessions ui-side; dpatch cannot.

Session naming convention (Dima, 2026-08-18, durable copy in rules/dispatch.md): [emoji][activity]: topic — 🔬 research · 🔧 code · 🧪 probe · ⏰ for schedulers — format «⏰ area: topic» (dima's live examples: «⏰ linear: health audit», «⏰ linear: milestone ab review»); suggest pretty names whenever creating one (dpatch can only set description, name rename = dima ui-side). No rename of existing sessions possible from dpatch.
- scheduled tasks → fire a fresh cwrk child with the schedule prompt; model/effort knobs unknown (suspect default) — verify via "linear milestone ab review" runs before adding more schedules.

Detailed-view rule: never probe-spawn automatically; only on natural asks («open detailed view», «wanna switch model», «show knobs»). See [[dispatch-detailed-view-trick]].

## Model picking for ccli spawns (merged from model-picking-for-spawns, 2026-08-17; detail in rules/models.md)

- **haiku-4.5** — ultra-simple bulky tasks: large but stupid, easy, zero thinking.
- **sonnet-5** — pretty good general work; needs more attention, not very proactive.
- **opus-5** — the workhorse: complex under-the-hood tech (features, CI, ssh). Never PM work.
- **fable-5** — best all-rounder and best PM, but do NOT spawn it until Dima asks (his $100 plan burns quota fast; dpatch itself on fable is his deliberate choice and enough).

Why: quota economics + fit. Model per spawn is dpatch's call, from haiku/sonnet/opus only. Linear labels `fable-5`/`opus-5`/`sonnet-5` are Dima's own notation, not for agent use; future idea (his, not active): ticket labelled with a model → dpatch spawns that model. Mechanics: `model` param on start_code_task verified to force the model; effort NOT settable, appears inherited — unverified, do not build on it. Agent-tool subagents also take a model param (haiku/sonnet ok). start_task takes NONE — children inherit parent model (fable!) — never use it for "cheap delegation".
