---
name: matt-skills-mirrored
description: "mattpocock-skills mirrored into cwrk 2026-08-19 — 14 of 25, companions inlined, manual sync, source = ccli plugin cache"
metadata: 
  node_type: memory
  type: project
  originSessionId: 30861ba0-43b0-43bf-b3c2-7f62abafe4b4
  modified: 2026-08-19T13:31:32.419Z
---

Matt Pocock's skills are Dima's main engineering framework (ccli follows them heavily in dotfiles + bytes). Not on the desktop/cowork marketplace (verified 2026-08-19) — mirrored manually via save_skill from `/Users/dima/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/<version>/`.

Mirrored (14): grilling, grill-me, wait-what, to-questionnaire, writing-for-agents, teach, ask-matt (router, adapted), to-spec, to-tickets, wayfinder, domain-modeling, research, code-review-two-axis (renamed from code-review to avoid engineering-plugin trigger clash), triage. Companion .md files inlined into each SKILL body (save_skill is single-file). Tracker refs localized to Linear x-com DOT/BYT + linear CLI.

Skipped (code-execution-bound, ccli's job): tdd, implement, prototype, grill-with-docs, diagnosing-bugs, improve-codebase-architecture, codebase-design, resolving-merge-conflicts, wizard, setup-matt-pocock-skills; skipped handoff (collides with the CST [[handoff-ask-here-or-fresh]] system).

📌 DRIFT NOTE — **not cclio's obligation.** The mirror this guards is the `cwrk` copy, which only
dpatch and cwrk read. cclio reads matt's skills straight from the plugin cache, so no drift exists
on this surface. Kept so cclio can name the hazard when it comes up; the ⏰ was dropped because the
clock is not ours to watch. See [[expect-skill-sync-drift]], which already narrows drift to
`skills-cw` alone.

The hazard itself: the ccli plugin auto-updates; the mirror does NOT. It WILL drift — treat mirrored content as possibly stale, check the plugin cache version when fidelity matters. Not critical, just fyi-grade.

Opus has initted and filled ADRs for BOTH dotfiles and bytes via matt's flows (domain-modeling/grill-with-docs), and was actively working Linear with matt's skills before this mirror existed. Respect those ADRs; don't re-litigate decided things.

**Why:** skill parity across surfaces is a fleet prio; matt flows are THE framework for project + linear work, not an optional extra.
Linear conventions matt's flows lean on — maintain them like [[pm-label-proactively]]: `ready-for-agent` maps to Dima's `agent` label (docs/agents/triage-labels.md owns the mapping), wayfinder uses `wayfinder:map` + `wayfinder:<research|prototype|grilling|task>` labels — create them in Linear on first wayfinder use, don't improvise names.

**How to apply:** use these skills for any ticket/spec/planning work — and be PROACTIVE: suggest /grilling when Dima's plan has unsettled decisions, suggest domain-modeling when terms get fuzzy or overloaded, suggest wayfinder for foggy multi-session efforts, to-spec/to-tickets when a thread ripens into buildable work. Sync is MANUAL — on plugin update, re-mirror changed skills (drift is silent). Automation belongs to the skill-sync story (DOT-168/DOT-77 family).
