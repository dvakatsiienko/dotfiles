# /cclio:gazette — cclio's gazette 🗞️ the tweet and the wire

**cclio's gazette** — cclio writes it, cclio owns it, the masthead says so. the durable event
history plus its outward release. the halt calls this BEFORE the CST, so the
handoff carries only what the gazette did not already say.

## phase 1 — the tweet (always, no gate)

write the day's post: `cclio/gazette/YYYY-MM-DD-<short-slug>.md`.

- **one file per day.** a second halt the same day APPENDS under a `⸻ upd hh:mm` rule — never a
  second file. slug is minted at first write and stays.
- **source from evidence, not memory of your own turns**: `git log --since=<today>` across
  touched repos, the day's linear activity, the session context last — coders and cw leave
  traces cclio's thread never saw.
- frontmatter: `date` · `slug` · `tickets: [DOT-N, …]` · `posted: {health: no}`
- `cw: |` block in the frontmatter, 3 lines, written for cw (the desktop app) who reads it to
  tell dima's story in hr mails and any thread: line 1 what shipped, plain words, no hashes or
  paths; line 2 `live / next:`; line 3 `worth a line:` the one sentence a human would repeat.
  plain sentences with commas — no `·` chains, cw copies the block verbatim.
  an evening `⸻ upd` rewrites the block to cover the whole day. `/memory-sync gazette` on cw
  copies it into `/areas/cclio-gazette.md` every morning; a post without it is invisible there.
- header line: `# 🗞️ cclio's gazette · <slug title>` — the masthead leads every post
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
- **health update** for each project the tweet touched — titled `🗞️ cclio's gazette · <date>` — ⚠️ full markdown links (health updates
  do not auto-link ids). **the house style — settled by the 4-round live test with dima,
  2026-08-27, screenshots verified in linear:**
  - **hybrid voice**: fleet structure carries the scanning (emoji line-prefix per paragraph,
    bold verdict openers), the sentences underneath stay human — `x:writing-for-humans` flow,
    no id-stuffing, no arrow chains, rhythm varies
  - **paragraphs 2–3 rendered lines each**, one thought per paragraph — linear renders wide;
    a paragraph that wants two tickets is two paragraphs
  - **ticket badges at sentence edges**: linear renders an id link as a fat badge with the full
    title, so a badge goes at a line end after a colon — the sentence carries the meaning, the
    badge is the door. **one badge per paragraph, ~3 per update**, never inside parentheses
  - **the inverse of a commit message**: not what changed — **what got easier for dima**, each
    paragraph a gain written for him, not for an agent
- **pulse is the feed** — dima enabled linear's pulse (2026-08-30), so the reply names WHICH
  projects got a post, one line total; no per-post links, no gists.
- flip the `posted:` marks after each fanout — a re-run with marks already yes is a no-op, so
  the wire fires at most once per day's content.

## completion criterion

the day's file holds today's facts with correct `posted:` marks, and the reply names what went
out on the wire (or that it was declined).

📌 the first two runs are the shakedown — this file was written before run #1 (rule-break
approved 2026-08-26); fix what reality disagrees with the same session it disagrees.

## 👁️ ingest side (for reference)

the boot-prefetch hook serves the 2 freshest posts (body only, the `cw:` block stripped) into every cclio boot. multi-day arcs may
warrant reading further back — the boot judges, this file just notes the knob.
