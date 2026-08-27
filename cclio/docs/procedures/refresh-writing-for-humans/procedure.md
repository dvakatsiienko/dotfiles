# refresh-writing-for-humans — procedure

Keeps the human-voice toolchain fresh: the research ref, the borrowed humanize skills, the
detector lanes. First instance of the procedure entity ([spec](../_spec.md)).

## the want (dima's, confirmed 2026-08-27)

> llm footprint on messages is a known issue — i want my outbound texts to sound like me, not
> a robot; and i don't want to re-print the same research asks every time the tech moves.

## research vectors (dima's wording — re-groom with him each run)

- best in class already existing skills for instructing you to print clever human-voiced
  messages, using clever techniques — so we not invent something from scratch
- if skill not found, hunt clever techniques to create home-baked skill
- best (ideally free) llm-has-written-this-message tools; free tiers and apis first
- (added 2026-08-27) has harshaneel/humanize moved — new levers, new tells, new references?

## ref doc

[research.md](research.md) — colocated, refreshed in place.

## run

1. re-groom the research vectors above with Dima before spawning anything
2. spawn two researchers (skills+techniques · detectors), same split as run #1; think
   alongside them too — Dima's standing note: rely on existing solutions, but add your own
   read on how the skill should work
3. clever-merge findings into `research.md` (the spec's synth semantics: useful old stays,
   useful new enters, no bloat, completeness first)
4. eval + print findings to Dima: anything new to try out? skill refresh needed? upstream
   humanize moved?
5. resolve with Dima by outcome — typical moves, only as the findings warrant:
   - re-fetch `humanize` + `ai-check` from https://github.com/harshaneel/humanize, re-apply
     the provenance headers, the `humanize-audit` rename, the multi-lane section, and the
     routing description lines (copies by decision — one update mechanism, no repo zoo)
   - fold new techniques into `x:writing-for-humans` and its `dima-voice.md` tells list
   - bump plugin-x, update marketplace, report

## cadence

~2 months, held by the ⏰ reminder in cclio's `_reminders.md` (skill-copies freshness). Also
fires early if a run of the skill produces «machinic» output Dima flags.

## last run

2026-08-27 — run #1 (the founding research): ref doc created, humanize pair borrowed at commit
`4ec7973145`, x:writing-for-humans born.
