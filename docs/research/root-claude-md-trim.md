# root CLAUDE.md trim — RFC round 1 (parked)

Ticket: DOT-73

Status: PARKED 2026-08-19 by Dima — resume when the mem revamp story actually executes.
Caveat: content below reflects the file as of 2026-08-19; re-verify sections before acting,
the file will have drifted.

Experiment design (Dima's): opus RFC + fable RFC + dpatch RFC → fable ccli critiques opus's,
dpatch reviews, fable defends + final word → agreement → commit.
Round 1 result: fable RFC landed (below). Opus spawn died on 529, never produced. dpatch
version not written. Resume from: produce opus + dpatch versions, then the critique rounds.

---

## fable RFC (subagent, 2026-08-19)

### philosophy — what earns a line at root
Root is for rules that are (a) needed in every session regardless of task, (b) not enforceable
by config, and (c) not already carried by an auto-loaded rules/ file. Task-scoped → skill.
Repo-scoped → project CLAUDE.md. Facts about the past (audit dates, incident narratives) →
docs/ or delete. Crucially: moving root → rules/ saves zero tokens (both always load) — the
only wins are tightening and deleting. Pointers to files that auto-load anyway are pure waste.

### section verdicts

| section | verdict | why |
|---|---|---|
| config layout / symlink-write rule | keep, tighten to 3 lines | load-bearing everywhere |
| codenames tombstone | delete | signpost inside the destination (identity.md auto-loads) |
| dormant tools | tighten ~34 → ~12 | registry stays; chrome saga + audit dates → docs/; plan-mode workaround stays |
| global defaults | delete | precedence is CC built-in; AGENTS.md plan → ticket |
| aliases tombstone | delete | same as codenames |
| information lookup | keep | 4 lines, global; do_not_touch TODO → ticket |
| mcp spec shift | move → docs/research + pointer, or delete | fires only when MCP shopping |
| claude.md maintenance | keep | the anti-bloat immune system |
| core principles | keep, trim naming examples to 2 lines | every bullet global |
| background work | tighten ~30 → ~14 | keep the sound table, cut the essays |
| artifacts + dataviz | tighten to 2 lines | one nudge, not three |
| token thrift + handoff | tighten ~11 → ~5 | numbers stay; ROUTE/PUSH/REQUEST → handoff skill |
| conversational behaviour map | mostly delete ~35 → ~6 | mapped files auto-load and self-describe; keep voice-in-output-styles + budgets |
| tooling | keep, compress version rant to 2 lines | global and cheap |

### projected size
~176 → ~75–80 lines; resident ~2.4k → ~1.1k tokens. rules/ grows by zero.

### riskiest deletions
1. the rules/ map — only place stating the whole layer stack + rationale (why text-formatting
   stopped being a skill, why styles can't import). mitigate with one ADR.
2. chrome "global disable NOT config-enforced" warning — documents live drift; delete only
   AFTER setting disabledMcpServers (1-line ticket).
3. mcp spec shift — the one deletion removing a behavior (proactive old-spec flagging), not
   words; 2 lines could stay if the nudge is valued.
