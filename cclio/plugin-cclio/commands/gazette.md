# /cclio:gazette — the tweet and the wire 🗞️

the durable event history plus its outward release. the halt calls this BEFORE the CST, so the
handoff carries only what the gazette did not already say.

## phase 1 — the tweet (always, no gate)

write the day's post: `cclio/gazette/YYYY-MM-DD-<short-slug>.md`.

- **one file per day.** a second halt the same day APPENDS under a `⸻ upd hh:mm` rule — never a
  second file. slug is minted at first write and stays.
- **source from evidence, not memory of your own turns**: `git log --since=<today>` across
  touched repos, the day's linear activity, the session context last — coders and cw leave
  traces cclio's thread never saw.
- frontmatter: `date` · `slug` · `tickets: [DOT-N, …]` · `posted: {health: no, announcements: no}`
- skeleton, soft cap ~25 lines:
  - **shipped** — what landed, every fact linear-linked
  - **tricks gained** — fleet-useful finds, gotchas, new capabilities
  - **state** — what is open, where it parked
- fleet voice. only facts that changed something; a fact links its ticket, never restates the
  body; dates absolute, never «today».
- dedup: read the previous post before writing.

## phase 2 — the wire (gated)

the release — derived from the tweet, pushed outward.

- **gate:** bare halt → ask «🗞️ the wire? y/n» and **block until a literal answer**; stop lane →
  auto-yes, run without asking.
- **health update** for each project the tweet touched — ⚠️ full markdown links (health updates
  do not auto-link ids). the shape (dima's feedback, run #1):
  - **bullet-listed, never a text wall**; emoji line-prefixes welcome
  - **the inverse of a commit message**: not what changed — **what got easier for dima**, each
    bullet a gain written for him, not for an agent
  - roughly the current size, not much bigger
  - the wording itself upgrades when the writing-for-humans skill (DOT-223) lands — until then,
    plain fleet voice.
- **announcements.md** — only a genuinely new feature, capability, or hazard affecting the
  fleet; evaluated fresh each time; the file's existing mechanics stay.
- flip the `posted:` marks after each fanout — a re-run with marks already yes is a no-op, so
  the wire fires at most once per day's content.

## completion criterion

the day's file holds today's facts with correct `posted:` marks, and the reply names what went
out on the wire (or that it was declined).

📌 the first two runs are the shakedown — this file was written before run #1 (rule-break
approved 2026-08-26); fix what reality disagrees with the same session it disagrees.

## 👁️ ingest side (for reference)

the boot-prefetch hook serves the 2 freshest posts into every cclio boot. multi-day arcs may
warrant reading further back — the boot judges, this file just notes the knob.
