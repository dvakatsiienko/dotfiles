# refresh-writing-for-humans — procedure

Keeps the human-voice toolchain fresh: the research ref, the borrowed humanize skills, the
detector lanes. First instance of the procedure entity ([spec](../_spec.md)).

## the want (dima's, confirmed 2026-08-27)

> llm footprint on messages is a known issue — i want my outbound texts to sound like me, not
> a robot; and i don't want to re-print the same research asks every time the tech moves.

## vectors (dima's wording — re-groom with him each run)

- best in class already existing skills for instructing you to print clever human-voiced
  messages, using clever techniques — so we not invent something from scratch
- if skill not found, hunt clever techniques
- best (ideally free) llm-has-written-this-message tools; free tiers and apis first
- (added 2026-08-27) has harshaneel/humanize moved — new levers, new tells, new references?

## ref doc

[research.md](research.md) — colocated, refreshed in place.

## run

1. re-groom the vectors above with Dima before spawning anything
2. spawn two researchers (skills+techniques · detectors), same split as run #1
3. diff findings against the ref doc; update it in place
4. refresh the borrowed copies: re-fetch `humanize` + `ai-check` from
   https://github.com/harshaneel/humanize, re-apply the provenance headers and the
   `humanize-audit` rename + multi-lane section (they are copies by decision — one update
   mechanism, no repo zoo)
5. fold new techniques into `x:writing-for-humans` and its `dima-voice.md` tells list
6. bump plugin-x, update marketplace, report the diff to Dima

## cadence

~2 months, held by the ⏰ reminder in cclio's `_reminders.md` (skill-copies freshness). Also
fires early if a run of the skill produces «machinic» output Dima flags.

## last run

2026-08-27 — run #1 (the founding research): ref doc created, humanize pair borrowed at commit
`4ec7973145`, x:writing-for-humans born.
