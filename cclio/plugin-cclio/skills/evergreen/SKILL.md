---
name: evergreen
description: load when dima types /cclio:evergreen, asks «updates?», «what's new in deps», «anything to merge?», says «approve evergreen», or when the boot finds open renovate PRs — the news layer over renovate + brew, and the merge hand.
---

# /cclio:evergreen 🧬 — the news layer over renovate and brew

renovate opens the PRs (`renovate.json` in `bytes` and `dotfiles`: patches daily + automerge on
green, minors monday 09:00 kyiv, majors one PR each with no schedule so they land as found after
the 3-day cooldown, 0.x never automerges). this skill is the half a bot cannot do: **read, judge,
tell dima only what he would want to know, act on his word.** 🌲 is her commit prefix (renovate
writes it), 🧬 her voice here. cadence: **daily, at boot, whenever PRs exist** (dima 2026-09-09:
«try daily first, refine, then loosen»). the digest itself runs in a fork — the boot path stays
light.

## 1. gather

```
gh pr list -R dvakatsiienko/<repo> --search 'author:app/renovate' --json number,title,headRefName,createdAt,statusCheckRollup,body
brew outdated --json=v2 --greedy   # the brew lane, same digest
brew list --pinned
```

tier from the branch (`renovate/<pkg>-<major>.x` = major; grouped titles say `patch` / `minor`),
age from `createdAt`, ci from `statusCheckRollup`.

## 2. read the release, not the PR body

the PR body embeds release notes but github truncates it. for every major (and any minor that
gets a card):

```
gh api repos/<owner>/<repo>/releases --jq '.[] | select(.tag_name | test("^v?<from>|^v?<to>")) | "\(.tag_name)\n\(.body)"'
```

read the whole range, not the head tag — a `4.1 → 5.0` jump carries every breaking change in
between. a release post on the project's blog beats the github release body when both exist.

## 3. judge — four answers per card

- **brings** — the 1–2 facts he would use, numbers where the release gives them
- **breaks** — two halves, both mandatory: (a) **peer ranges of every dependant** —
  `pnpm why <pkg>` in the repo, then `npm view <dependant> peerDependencies` for each; a range
  that excludes the new major is a hold, whatever the src says (graphql 17 vs `@apollo/server`
  `^16.11.0`, missed by a src-only grep on 2026-09-09); (b) grep the repo for the apis the notes
  name as removed or changed
- **machine** — `packageManager`, `engines.node`, a cli he runs by hand, a brew formula. the
  repo can be green and his shell still broken
- **🌟 or 🟠** — his taste (interview 2026-09-09): a **rewrite** (zig → rust, a new bundler
  core), a **perf claim with numbers**, a **new capability** he could use → 🌟 with a `🔬 deep`
  block: 2–4 lines of researched facts with the numbers, one source link. a perf claim
  **without** numbers → one line, flagged unmeasured, he asks to detail if he wants. **ci-only
  majors are interesting too** (postgres container, actions) — a card, never silent.
- **silent** — patches, minors without a notable api, brew patch bumps, libs nobody drives by
  hand. minors fold into one monday line: `k minors, notable: …`.

## 4. the report — cards, plain reply, never a fence

```
🧬 evergreen — <weekday dd-mm>, <n> majors open, <n> minors, <n> patches merged since <last>

🌟 <pkg> <from> → <to> — [repo #N](url) (+ [repo #M](url) when one release hits both), ci ✅
- **brings** — …
- **breaks** — nothing we use | <what>, <where>
- 🔬 **deep** — 2–4 sentences with numbers. [source](url)
- ➡️ merge | coder | hold

🟠 <pkg> <from> → <to> — [repo #N](url), ci ✅
- **brings** — …
- **breaks** — …
- ➡️ merge

🍺 brew — <n> formulae + <m> casks outdated, <pinned or none pinned>, <k> worth a look
- 🟠 <formula> a → b — one line why (a major, or a tool he drives by hand with a notable change) [notes](url)
- 🟡 <formula> a → b — same, for a notable minor
- 🟢 silent — <the rest, names only, libs as a count>

📋 copy → terminal 📋   ```brew upgrade```   ✂️ end ✂️   ← kept for the day he wants his own hands on it

⏳ waiting on your word: (the ⏳ fence) 1. merge round: <pkgs> ➡️ yes  2. brew upgrade ➡️ yes
```

- the four labels are fixed words in a fixed order so his eye lands on the same spot per card.
- a red ci on any tier → ⚠️ on the card and ➡️ coder. age ≥ 7 days unmerged → `⏳ 9d` before
  the name; the number is the reminder.
- **never restate the changelog.** the release page is one click; the card says why he cares.
- a big week (≥5 cards, or a 🌟 with a real story) → the same cards as an **artifact** with a
  chart where a perf claim has numbers; the chat keeps the ⏳ fence only.
- his knob: «too much» / «missed X» → tighten or widen in `memory/craft-evergreen.md` (create on
  first steer, one line per rule).

## 5. act on his word — «approve evergreen» is the whole round

a plain «approve evergreen» (or «ok» on the ⏳ fence) means: **every ➡️ merge in the report AND
`brew upgrade` (all outdated, pinned never) run now, by cclio, no second ask.** steers inside the
same message («hold #61») subtract from the round.

- **merge** → `gh pr merge <n> -R dvakatsiienko/<repo> --squash --delete-branch` — the title
  already wears `🌲 evergreen:`. one back-to-back round per day: each bytes merge costs 6 prod
  deploys, so never one per PR across the day.
- a PR that answers «merge conflicts» after a sibling merged (lockfile) → tick renovate's
  `<!-- rebase-check -->` box in the PR body via `gh pr edit --body-file`; renovate rebases
  within its next scan (~hourly); report it as pending, never rebase by hand.
- **coder** → a red or held-for-migration PR gets a coder on its branch through
  `x:coder-brief` («make this bump green; migrate what the release notes say changed»).
  renovate stops rebasing once a human commit lands, which is right.
- **hold** → a peer-range hold gets `gh pr close --comment` with the range named; renovate
  reopens it on the next release of the package. any other hold: nothing, the age prefix
  carries it.
- **brew** → `brew upgrade` in the background (a long run), the result line in the next reply.
- after the round: `git pull` both mains; a merged bytes round redeploys prod, say so.

## completion criterion

every open renovate PR is a card or in the silent line with a green ci; every card carries all
four answers, the breaks answer names the peer-range check; every ➡️ is one of merge / coder /
hold; on «approve evergreen» every merge and the brew upgrade ran and the reply names what
landed, what waits on a rebase, and the new prod deploy count.
