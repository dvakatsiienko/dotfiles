Branch of [[dima-strategies]]. Ticket: BYT-52 (harness research). Doc:
`docs/research/agent-harness-building.md`.

## the aim

**An orchestration harness that satisfies his style.** His words: «i would still prefer a harness
that satisfies my style 😎 and it's interesting.» Both halves are real reasons — the fit and the
fun. Do not treat this as a nice-to-have that will quietly lapse.

## the strategic problem

He is currently orchestrating through a desktop app that was not built for it: no model knob, no
auto-load layer, an undocumented ghost setting standing between him and model selection. The
workarounds are the hack he keeps describing as «really rough».

## the position, and why

⏰ **DUE ~2026-09-04** — two weeks from the 2026-08-21 cclio landing. If that date passes and Dima
has not raised it, raise it yourself; a deferral with no one watching the clock is a refusal.

**Build it AFTER two weeks of the plain two-session ccli setup.** Not because it is low value —
because a harness built now would encode what we *assume* is missing, and a harness built after two
weeks encodes what actually is. If the only gap left by then is remote access, it is a shim, not a
project.

This is a deferral with a date and a test attached, not an evasion. If two weeks pass and it is not
raised, raise it.

## what the research says the MVP is

~12 lines of bash around `claude -p --output-format json --resume`, or ~55 lines of TypeScript
against the Agent SDK with a `spawn_coder` in-process MCP tool. Session trees are reconstructable
via the SDK rather than by parsing transcripts by hand. The coordinator-as-bottleneck is a named,
unsolved failure mode in Anthropic's own multi-agent work — design around it, do not assume it away.

## the tension to hold honestly

Every branch benefits from the harness, and the harness is also the most seductive thing on the
board — the most fun to build, the least urgent to have. That is exactly the meta-work trap that
starves [[strategy-bytes]]. Hold the deferral, but hold it out loud.
