---
description: load when dima types /cclio:evergreen, asks «updates?», «what's new in deps», «anything to merge?», or when the boot finds open renovate PRs — the news layer over renovate, and the merge hand.
---

# /cclio:evergreen 🧬 — the news layer over renovate

renovate opens the PRs (`renovate.json` in `bytes` and `dotfiles`: patches daily + automerge on
green · minors monday 09:00 kyiv · majors one PR each · 3-day cooldown · 0.x never automerges).
this skill is the half a bot cannot do: **read, judge, tell dima only what he would want to
know, merge on his word.** 🌲 is her commit prefix (renovate writes it), 🧬 her voice here.

## 1. gather — one query per repo

```
gh pr list -R dvakatsiienko/<repo> --search 'author:app/renovate' --json number,title,headRefName,createdAt,statusCheckRollup,body
```

for each PR read: tier from the branch (`renovate/<pkg>-<major>.x` = major; the grouped titles
say `patch` / `minor`), age from `createdAt`, ci from `statusCheckRollup`.

## 2. read the release, not the PR body

the PR body embeds release notes but github truncates it. for every minor and major:

```
gh api repos/<owner>/<repo>/releases --jq '.[] | select(.tag_name | test("^v?<from>|^v?<to>")) | "\(.tag_name)\n\(.body)"'
```

`<owner>/<repo>` comes from the PR body's source link. read the whole range, not the head tag —
a `4.1 → 5.0` jump carries every breaking change in between.

## 3. judge — three questions per PR

- **what it brings** — features dima would use (the taste filter; until the taste interview is
  run, err short: one clause, the single most useful thing)
- **what breaks** — breaking changes that touch code we have (grep the repo for the api named)
- **what touches his machine** — `packageManager`, `engines.node`, a cli he runs by hand (pnpm,
  node, biome, vitest cli flags), a brew formula. this line is mandatory when it applies: the
  repo can be green and his shell still broken.

## 4. the report — one line per PR, nothing for the silent tier

```
🧬 evergreen · <n> majors · <n> minors · <n> patches auto-merged since <last report>
- 🟠 [<repo> #N <pkg> <from> → <to>](url) — brings: … · breaks: … · your machine: … ➡️ <merge | coder | hold>
- 🟡 [<repo> #N minors (<k> packages)](url) — notable: … ➡️ merge
- 🟢 silent: <k> patches merged, red: none
```

- 🟠 major · 🟡 minor · 🟢 patch. a red ci on any tier gets ⚠️ and a ➡️ coder.
- age ≥ 7 days on an unmerged PR → prefix the line with `⏳ 9d` — the number is the reminder.
- **never restate the changelog.** the release page is one click; the line says why he cares.
- his frequency knob: he says «too much» / «missed X» → the filter tightens or widens in
  `memory/craft-evergreen.md` (create on first steer, one line per rule).

## 5. act on his word

- **merge** → `gh pr merge <n> -R dvakatsiienko/<repo> --squash --subject '<pr title>'` — the
  title already wears `🌲 evergreen:`. a merge to bytes main costs 6 prod deploys: batch the
  day's merges into one round, never one per PR.
- **coder** → a red or major PR gets a coder on its branch through `x:coder-brief` («make this
  bump green; migrate what the release notes say changed»); renovate stops rebasing once a
  human commit lands, which is right.
- **hold** → nothing; the age prefix carries it to the next report.
- **your machine** lines → hand him the one-line upgrade in a copy fence (`corepack use pnpm@12`,
  `brew upgrade <formula>`), never run it — his tools are `granular`.

## 6. brew, weekly — the part renovate cannot see

`brew outdated --json=v2` → one line per formula only when a major moved or a formula he uses by
hand (git, gh, node via fnm, starship, nvim) is behind; the rest is a count. `brew upgrade` runs
only on his word, pinned formulae (`pinned: true` in the json) never.

## completion criterion

every open renovate PR appears in the report or is in the silent tier with a green ci; every
🟠 line carries all three answers; every ➡️ is one of merge / coder / hold; no merge ran without
his word.
