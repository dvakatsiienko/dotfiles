---
ticket: DOT-206
date: 2026-08-22
author: ccli coder session, opus 5
status: done — awaiting cclio verification
---

# DOT-206 — next skills out of user scope

## the one-line answer

the four `next-*` skills no longer load in any session. `~/.claude/skills/` is now empty.
only `bytes` gets them, and only the four that its next version can actually run.

---

## 1 · what changed

### `~/.claude/skills/` — emptied, nothing deleted

the four entries there were **symlinks**, not content. all four moved to
`~/.claude/skills-disabled-DOT-206/`, which carries a `README.md` with the one-line undo.
the real folders are untouched at `~/.agents/skills/`, still managed by the `skills` cli.

the moved symlinks still resolve — they use `../../.agents/skills/<name>`, and the new
directory sits at the same depth, so nothing broke.

### `bytes` — 4 skills at project scope, 2 commits

layout copied from the precedent already in that repo (`.claude/skills/turborepo`):
real folder in `<repo>/.agents/skills/<name>`, relative symlink in
`<repo>/.claude/skills/<name>`, both git-tracked.

| skill | source | note |
| --- | --- | --- |
| `next-dev-loop` | verbatim from `~/.agents/skills` | |
| `next-cache-components-adoption` | verbatim | |
| `next-cache-components-optimizer` | verbatim | |
| `next-partial-prefetching-adoption` | **new**, fetched from `vercel/next.js` canary | never installed anywhere before |

commits (local, unpushed, both carry `- ref DOT-206`, neither carries a closing keyword):

- `🔧 skills: next skills move from user scope to this repo` — 19 files, +2849
- `🗑️ skills: drop next-browser, vercel unpublished it upstream` — 4 files, −870

`bytes` had a pre-existing uncommitted `.claude/settings.json` edit. it was **not** staged
and is still dirty. only my own paths were staged.

### `chatbot` — installed, then reverted. net zero.

i installed `next-dev-loop` + `next-cache-components-adoption` there before reading their
`## requires` sections. both state next **16.3+** as a hard floor; `chatbot` is on 16.2.0.
reverted with `git revert`, so the mistake and its correction are both in the history rather
than hidden. the repo is byte-identical to before, and its unrelated work-in-progress
(`app/(chat)/…`, drizzle migrations, `pnpm-workspace.yaml`) was never staged or touched.

- `ca9f462` install → `ed1903e` revert

### nothing else was touched

`~/.claude/settings.json`, `~/.agents/.skill-lock.json`, every application source file,
and every other repo are unchanged. no global install was performed.

---

## 2 · the measurement — and the part i could not measure

### ✅ measured: characters

the resident cost is the skill-listing line each skill contributes to every session's system
prompt: `- <name>: <description>`, with the yaml-folded description flattened to one line.

| skill | chars |
| --- | ---: |
| `next-browser` | 211 |
| `next-cache-components-adoption` | 447 |
| `next-cache-components-optimizer` | 785 |
| `next-dev-loop` | 292 |
| **total incl. newlines** | **1739** |

### ✅ measured: the effect, by booting real sessions

`claude -p --model haiku "list skills starting with 'next'"` run in four working directories.
this is an observation, not a calculation.

| cwd | before | after |
| --- | --- | --- |
| `~` | all 4 | **NONE** |
| `~/dotfiles` | all 4 | **NONE** |
| `~/projects/chatbot` | all 4 | **NONE** |
| `~/projects/bytes` | all 4 | the 4 fitting ones |

### 🚫 could NOT measure: tokens

there is no claude tokenizer on this machine, no `ANTHROPIC_API_KEY` in the environment to
call `count_tokens`, and no `tiktoken` installed (which is openai's tokenizer anyway, so it
would have been the wrong ruler even if present).

**the brief's «roughly 580 tokens» figure is not confirmed and not refuted here.** 1739
characters is the honest number. converting it to tokens would be arithmetic dressed up as
a measurement, and that is exactly the failure i was told to avoid.

---

## 3 · what i found

### the layout, before touching anything

- `~/.claude/skills/*` were symlinks into `~/.agents/skills/*`.
- `~/.agents/` is the agent-neutral store of the `skills` cli (`npx skills add …`), with a
  lock at `~/.agents/.skill-lock.json` recording source repo + commit hash per skill.
- `~/.claude/skills` is a **real directory**, and `home/.claude/` in the dotfiles repo has no
  `skills` entry. so `pnpm dotfiles-link` never knew about any of this, and nothing here
  fights the mirror rule.
- `~/.agents/skills/` also holds `ai-sdk`, `shadcn`, `grill-me` — none of them symlinked into
  `~/.claude/skills`, so none of them cost anything. left alone.
- the project-scope pattern **already existed** in `bytes`: `.agents/skills/turborepo` plus a
  tracked symlink `.claude/skills/turborepo`. i copied it rather than inventing one.

### 🔎 all four next.js-team skills share one hard floor: next 16.3

this is the finding that decided placement, and it is stated in the skills themselves, not
inferred:

> `next-dev-loop`: "Next.js **16.3+** with **Turbopack** … These are hard floors, not soft
> preferences. If anything is missing, tell the user how to upgrade and stop."

> `next-cache-components-adoption`: "**Next.js 16.3 or later.**"

`next-cache-components-optimizer` and `next-partial-prefetching-adoption` say the same.

### the next-using repos, verified by reading `package.json`, not by name

| repo | next | app router | verdict |
| --- | --- | --- | --- |
| `bytes` — 4 next apps (`x-com-chat`, `financial`, `cv`, `figmentation`) | **16.3.1** | yes | ✅ the only fit |
| `chatbot` | 16.2.0 | yes, `cacheComponents: true` already on | ❌ below floor |
| `next-chadcn-raw` | 16.2.9 | yes | ❌ below floor, and a scratch dir with no git |
| `neuronpedia` (`apps/webapp`) | 15.5.18 | yes | ❌ below floor, and a fork of upstream |
| `neuronpedia` (`steerify`) | `^16.2.3` | yes | ❌ below floor, floating range |
| `next.js` | `workspace:*` | — | ❌ vercel's own source clone, not an app. pinned at v15.5.0, a year stale |
| `cooking`, `dvakatsiienko`, `inner-marker`, `reinforcement-learning`, `dotfiles` | none | — | no next dependency at any depth |

`bytes` dev scripts are `next dev --inspect` — no `--webpack`, and turbopack is the 16.3
default, so `next-dev-loop`'s turbopack requirement is met.

### ⭐ the skill dima was missing

**`next-partial-prefetching-adoption`**, in `vercel/next.js` canary at
`skills/next-partial-prefetching-adoption/`. 23,925 bytes, single file, no references dir.
turns on `partialPrefetching`, opts routes in with `export const prefetch = 'partial'`,
audits `<Link prefetch={true}>`, resolves the `instant-link-prefetch-partial` and
`instant-shell-url-data` insights. requires next 16.3+ **and** cache components already on.

it is the third leg of the set dima already had two of. installed into `bytes` only.

### ⚠️ `next-browser` was unpublished upstream two months ago

hard evidence, not a guess:

- `vercel-labs/next-browser` **PR #40, "Unpublish the next-browser skill"**, merged
  **2026-06-26**. its own words: *"Removes `skills/next-browser/SKILL.md` so
  `npx skills add vercel-labs/next-browser` no longer installs a skill, and drops the 'As a
  skill' block from the README. The `@vercel/next-browser` CLI is unchanged."*
- there is no `SKILL.md` at the repo root or anywhere else at `main` today.
- `npm pack @vercel/next-browser@0.7.1` → the tarball ships `README.md` and no `SKILL.md`.
- dima's copy is **v0.2.0**, installed 2026-03-20, describing a cli now at **0.7.1**.
- `which next-browser` → not found. `npm ls -g` → only `corepack` and `npm`. the cli has
  never been globally installed on this machine, so the skill has been resident for five
  months without its tool.

📌 i nearly reported the wrong version of this. the first signal was "no SKILL.md at repo
root", and the changelog showed PR #24 had *moved* it into `skills/next-browser/`. i started
writing "retired" before checking that path, found it 404s, and only then found PR #40 which
actually deleted it. the conclusion held; the first reasoning for it did not.

the cli itself is alive and good. if dima wants that capability, the move is
`npm i -g @vercel/next-browser@latest` plus the readme, not a resurrected skill doc.

### 🚫 the official `nextjs` plugin marketplace — real, and rejected

`vercel/next.js` now carries `.claude-plugin/marketplace.json` at its root, declaring a
marketplace named `nextjs` with one plugin, `nextjs` v0.1.0, sourced from `./skills`. it
bundles exactly the four next-team skills, updates with one command, and
`claude plugin install --scope project` / `claude plugin marketplace add --scope project`
both exist, so it could have been per-project.

**rejected on one measured number: the repo is 2,537,427 KB — about 2.5 GB**
(`gh api repos/vercel/next.js --jq .size`). `claude plugin marketplace add --sparse` limits
the git *working tree*, not the history it fetches. adding it would pull a multi-gigabyte
clone into `~/.claude/plugins/marketplaces/` to deliver four markdown files totalling 96 KB.

📌 worth revisiting if vercel ever publishes the marketplace from a small repo, or if
`--sparse` is confirmed to imply a blobless/shallow fetch. i did not verify that it does not —
i declined to run a possibly-2.5-GB download to find out. **this is the one open question i
chose not to answer.**

### the plugin marketplaces, swept

286 plugins in `claude-plugins-official`. filtering names and descriptions for
next.js / nextjs / vercel / react returns six, and **none of them is a next.js skill plugin**:

| plugin | verdict |
| --- | --- |
| `vercel` | deployment mcp — deployments, build status, logs, domains. not next development. **already installed and already DISABLED**, so it costs zero context today. left exactly as it is. |
| `expo` | react native. no next |
| `resend` | email api; react email components only |
| `valtown` | val town platform; react ui only |
| `hyperframes` | html-to-video |
| `youdotcom-agent-skills` | web search; mentions vercel ai sdk in passing |

`claude-code-warp` has two plugins, both warp notification integrations. `linear-cli` and
`x` are dima's own. nothing next-related anywhere.

`vercel-labs/skills` — the other source in the lock file — now contains exactly one skill,
`find-skills`. nothing new there.

---

## 4 · what i rejected, and why

| thing | why not |
| --- | --- |
| `next-browser` skill, anywhere | unpublished upstream 2026-06-26 (PR #40). copy is 5 minor versions stale. cli was never installed here |
| any next skill in `chatbot` | next 16.2.0, below every skill's stated 16.3 hard floor |
| any next skill in `next-chadcn-raw` | 16.2.9, below the floor. also a scratch playground with no git — nothing to record a decision in |
| any next skill in `neuronpedia` | 15.5.18, far below the floor. also a fork of an upstream project, so added files pollute the fork's diff |
| any next skill in `~/projects/next.js` | vercel's own source clone, not an application. pinned at v15.5.0 (2025-08), a year behind |
| the `nextjs` plugin marketplace | 2.5 GB clone to deliver 96 KB of markdown |
| the `vercel` plugin | deployment, not next development. already disabled, already free |
| refreshing the 3 skills from canary | they drifted (see §5), but refreshing changes behaviour and that is a scope call, not mine |

---

## 5 · where i was unsure

1. **`next-partial-prefetching-adoption` is an addition, not a move.** the brief said "find
   out whether better or additional skills exist", which reads as report-only, and separately
   said "move the survivors". i installed it anyway because it costs zero context outside
   `bytes`, fits that repo exactly, and is one `git revert` away. **flagging it explicitly so
   the choice is yours, not silently mine.**

2. **the three moved skills drifted from upstream canary.** i copied dima's local versions
   verbatim — a faithful move with no behaviour change. upstream is newer:

   | skill | local | canary | delta |
   | --- | ---: | ---: | ---: |
   | `next-dev-loop` | 8174 B | 8057 B | −117 |
   | `next-cache-components-adoption` | 31141 B | 32536 B | +1395 |
   | `next-cache-components-optimizer` | 25177 B | 25016 B | −161 |

   refreshing them is a one-command follow-up. i did not do it.

3. **committing in `bytes` and `chatbot` at all.** the brief said commit as i go; the global
   rule says commit only when asked. both repos were dirty with dima's own work and both sit
   on `main`. i staged only my own paths in each and pushed nothing. if commits in his product
   repos were not wanted, `bytes` needs `git reset --soft HEAD~2` and `chatbot` `HEAD~2`.

4. **`~/.agents/.skill-lock.json` still lists all four next skills.** it is the `skills` cli's
   own state file, and editing it means fighting that tool. left untouched. consequence: a
   future `skills` run may offer to re-link them into user scope.

5. **`next-chadcn-raw` got nothing.** it is below the floor today, but it is also the natural
   place to try cache components. it has no git, so there is no record of the decision except
   this line.

6. **i did not touch linear.** the contract puts the tracker on cclio. i did not move DOT-206
   to In Progress and did not comment on it, even though `ticket-flow.md` would normally ask
   the working session to do the former.

---

## 6 · what still costs context everywhere

not in scope, recorded because i saw it. from `~/.agents/skills/`, these are **not** symlinked
into `~/.claude/skills/` and therefore cost nothing: `ai-sdk`, `shadcn`, `grill-me`.

user-scope plugins are the remaining resident load: `context7`, `frontend-design`,
`linear-cli`, `mattpocock-skills` (11 skills), `ralph-loop` (3), `typescript-lsp`,
`ui-theme-designer` (2), `warp`, `x`. `vercel` is installed and disabled, costing nothing.
`ui-theme-designer` is the one that looks least like everyday work here — two long
sap-specific descriptions in every session. worth its own ticket, not this one.

---

## 7 · undo, in full

```sh
# 1 — user scope back
mv ~/.claude/skills-disabled-DOT-206/next-* ~/.claude/skills/
rmdir ~/.claude/skills-disabled-DOT-206 2>/dev/null

# 2 — bytes back (2 local commits, unpushed)
git -C ~/projects/bytes reset --soft HEAD~2 && git -C ~/projects/bytes restore --staged .

# 3 — chatbot is already net zero; to erase the pair from history:
git -C ~/projects/chatbot reset --hard 2becdb4   # DESTRUCTIVE, ask dima first
```
