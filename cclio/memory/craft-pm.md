**Judgment lives here; mechanics live in the `x:pm` skill — load it on every ticket-shaped turn,
coordinator included.** The floor is `rules/linear-flow.md`. Three homes, complementary, no
duplicates.

Conventions live here; **state is always queried, never remembered.** Board state mutates hourly, so
a cached picture read with confidence is worse than a two-second query. `/cclio:init` step 4.5 pulls
the skeleton — teams, projects, descriptions, open counts — every boot, so a session knows the shape
of the board from turn one without storing it. Sline's status cache is render-only.

## the default verb is FOLD OR DROP, not file

Dima: *«you currently create a lot of additional work for you and me. you are intended to optimize
flow not make it hotter. you do sweeps (good), and leave a spread of pieces of work from where
swept.»*

Capture is cheap for an agent and retirement is expensive for him, so the queue grows monotonically
and the heat never comes down.

- a ticket must **earn existence**. If it dies when its parent dies, it was a body line.
- **a sweep is not done until its own output is folded or dropped.** Closing the sweep and leaving
  the findings loose is the actual failure.
- **one flush per session**, not per finding. Batch drafts, one approval, execute.
- search before every create — for the dupe, and for the right parent and relations up front.
- act proactively but sit chill, even in the most stressful scenario.

## the freebie rule — verdict before plan

Dima: *«if i ask for a freebie but it appears to be not — better tell me than try to solve, because
i often ask some "small things" without knowing the details. and if it appears not a freebie, then
it is large scope blur and drift.»*

«easy way?» / «can we just» / «freebie?» ⇒ **answer the cost question first, in one line.** Easy, do
it. Not easy, name what makes it hard and stop.

- **research is allowed; briefing a coder is not.** Finding out what it would take is the work.
  Handing that to a coder is where it becomes a build he never approved.
- a freebie that grows mid-flight gets **pulled back**, not finished.
- the tell is his own discomfort, voiced early: *«starts to sound more complicated than a freebie»*.
  The answer to that is never a defence of the plan.

## every create is fully fielded — the contract is x:pm's

The field list (role, kind, priority, estimate, project, parent, milestone) lives in the `x:pm`
field contract — ONE list, never restated. The coordinator's extras:

- labels are steering, not decoration — Dima writes instructions into their descriptions
- 📌 a canceled ticket counts as resolved in linear's milestone math, so attaching a gated ticket
  that may never be built cannot strand a milestone at 99%

## tickets must be pretty

Subject-first title, body with only key data. No fluff, no walls, no descriptions written for a
reader. Lowercase register; emojis and ascii art welcome.

- **titles are assertive**, verb-led, like commit messages: «prune brew of unused formulae», not
  «brew pruning considerations». Descriptive titles only where the ticket's nature is descriptive.
  If the ask is blurry, object and propose a sharp title rather than filing mush.
- when prettifying: keep all data, cut only fluff, merge over-broken-down tickets. **Batch drafts
  for approval, never edit ping-pong.**
- **tracked means everywhere**, not just tickets: project descriptions and overviews, health
  updates, label names and colors, team descriptions. A new project gets Dima as lead, correct
  status, emoji-prefixed lowercase description, short overview.
- ⚠️ project health updates do **not** auto-link ticket ids — use full markdown links there. Ticket
  bodies auto-link fine.

## reading relations — one hop, titles first, bodies on merit

The fetch contract (GraphQL reads, relations + inverse, pageInfo caps, edge hunting) moved to
`x:pm` — this section is the coordinator's reading-depth judgment on top of it.

Hop-1 relations cost ~20 tokens each, so pull them always. **Read a hop-1 body when its title says
it decides something about the task in hand.** Hop 2 is a consideration, not a ban: having read hop
1, ask whether any of its edges would change the work. What it must never become is automatic — the
graph has cycles and the cost is unbounded.

**The test is the closing word, not the state** — read any closed ticket whose body has one, Done
or Canceled alike; a deliberately dropped ticket carries the reasoning that stops someone
re-proposing it. Skip only the genuinely empty ones.

## writing — no timestamps, no lineage

**Drop dates** — «adopted DATE», «verified DATE», dated headings. Linear stores those natively.
**Drop provenance** — «split out of DOT-73», «migrated from GH #4». The relation carries it; set a
native edge instead of narrating lineage.

**Keep** a date that IS the fact: an expiry, a deadline, a scheduled review.
**Keep** the run stamp, which Dima called useful:
`⸻ 🪪 <run-id> · <model name> · agent run stamp — please keep 🙏`

🚨 every id is a link — the rule and its mechanical pre-send scan live in
`rules/fleet-output-format.md`; the most-repeated failure on this surface, so run the scan, always.

Related: [[dima-strategy]], [[dima-roadmap]]
