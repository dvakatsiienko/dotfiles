---
name: tickets-must-be-pretty
description: Linear tickets must be pretty — titles and bodies both; build proven examples before writing guidelines
metadata: 
  node_type: memory
  type: feedback
  originSessionId: b475afdf-7a57-4bba-9261-ddfc9b284f60
  modified: 2026-08-19T12:24:22.223Z
---

Every ticket a coordinator writes or touches must be pretty: clear subject-first title, body with only key data — no fluff, no walls, no "descriptions for the user" (DOT-73 effect). Lowercase register. Emojis and ascii art allowed (see cult file in dotfiles).

**Why:** tracker was a dump of roughly-shaped tickets; DOT-72 revamp starts by creating proven examples of pretty before codifying guidelines.

**How to apply:** when prettifying, keep all data, cut only fluff; merge over-broken-down tickets; batch drafts for Dima's approval before flushing to linear — never edit ping-pong. Related: [[ticket-refs-on-dispatched-work]].

**Assertive titles (2026-08-19):** titles read like commit messages — verb-led, decisive: «prune brew of unused formulae», not «brew pruning considerations». Descriptive titles allowed only where the ticket's nature is descriptive (a map, an eval). If Dima's ask is blurry, object and propose a sharp title rather than filing mush.

**Tracked surfaces contract (2026-08-17):** tracked = taken care of properly, everywhere — tickets AND unobvious places: project descriptions + overviews (`content` field), health updates, label names/colors/descriptions, team descriptions. New project ⇒ auto: dima as lead, correct status, emoji-prefixed lowercase description, short overview. Not tracked: dependencies (disabled, overkill). Milestones: A/B trial, biweekly scheduled review. Labels: create at workspace level only. ⚠️ project updates (health) do NOT auto-link ticket ids — always md links `[DOT-N](https://linear.app/x-com/issue/DOT-N)` there; ticket bodies auto-link fine even lowercased.
