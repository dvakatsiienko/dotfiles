---
dies-when: the review pair (greptile + claude action) is installed on bytes and judged after ten coder PRs; the linear auto-assign toggle is found; native stacked PRs tried once
---
# pr review tools, linear ↔ github, stacked prs — the field on 2026-09-07

Ticket: BYT-25 (the coder lane), DOT-159 (attribution)

## review bots — free tiers for a solo dev on private repos
- **greptile** — starter free since 2026-06: 1 dev, unlimited private repos, 50 reviews/mo; codebase-indexed inline comments + summary; ⚠️ may train on de-identified code unless opted out in settings. github app install. (greptile.com/pricing, /changelog, /security)
- **claude code github action** — `/install-github-app` in the repo writes a review workflow running the `code-review` plugin with `--comment`; auth via `claude setup-token` = billed to the subscription; reads CLAUDE.md. (code.claude.com/docs/en/github-actions)
- **coderabbit** — no free private tier anymore (14-day trial, essentials $24–30/dev/mo); best config knobs (`profile`, `path_filters`, `path_instructions`), lowest false-positive rate in a 146-pr bake-off, chattiest, ~9.5 min mean latency. already installed on bytes (an old app) — posted only an auto-summary on #45, zero inline. (coderabbit.ai/pricing, docs.coderabbit.ai/reference/configuration)
- **graphite agent** (ex-diamond) — hobby free with an undisclosed review quota; the product is stacked prs; owned by cursor's company. (graphite.com/pricing)
- copilot review — pro $10 + per-review credits · bugbot — pro $20 + usage · sourcery $12/seat · qodo credit packs. none free for private repos.
- no tool has typescript/react-specific evidence; every benchmark is mixed-language.
- ➡️ pair: greptile + claude action. dima also wants to look at coderabbit and graphite himself.

## linear ↔ github, what the issue shows
- **linear diffs** (2026-05-28, all plans): full pr diff, changed files, checks, comments, approve / request changes / **merge from linear**, desktop + mobile (changes tab since 2026-07-30). enabled 2026-09-06; confirmed on #45 incl. a vercel preview button. setup: github integration → grant code access (admin) + `linear.app/enable-reviews` per account. (linear.app/docs/diffs, changelog 2026-05-27)
- pr automations per team (`Settings → Team → Workflows & automations → Pull request and commit automations`): draft → In Progress, review requested → In Review (needs branch protection), merged → Done; free plan. (linear.app/docs/github)
- branch name with the id links by itself (`coder/BYT-N-slug`); `⌘⇧.` copies the branch name; magic words close/fix/resolve…, non-closing ref/refs/part of/contributes to; `skip BYT-N` prevents a link.
- ⚠️ **auto-assign measured 2026-09-06**: BYT-75 was assigned to dima the minute #45 opened (no closing keyword, actor «Dima Vakatsiienko» = the github-linked identity); the docs name no such toggle. the two documented assigners («on branch copy move to started» + self-assign-on-started) were already off. linear's agent (2026-09-07): the assignment is recorded as an action by dima's account 12 s before the PR-link comment, no status change — «integration behaviour or another client action», no toggle it can name; suggested support@linear.app with the timeline + PR link. until then the pr lane assigns dima on link; the fleet rule «never assign» is unaffected (it binds agents, this is linear acting as him).
- vercel: preview urls appear on the issue by auto-detection; the vercel integration itself is comments → issues only.
- linear coding sessions / agents: paid tiers, skipped.

## stacked prs — native on github
- public preview since 2026-07-30: each pr targets the layer below, lower merge → upper prs auto-rebase and retarget, merge stack or layer in one click; `gh extension install github/gh-stack`; same-repo branches only; merge-queue support rolling out; ga undated (roadmap #1218, #1325, #1326).
- ➡️ graphite's core feature is now native; try `gh-stack` on the first multi-layer coder assignment (reminder set).

## the coder lane as measured on #45 (trophy-sys prettify)
- cost of the pr vs main: ~4 extra steps, ~5 min, ~3k tokens; no rebase needed.
- friction fixed in the brief header: «dima has asked for a pr» (satisfies `x:github-contrib`), the `Agent:` trailer only, expected untracked files named, worktree per coder, draft pr at first push, `slay+` on the branch only, «dima's word» starts without a y/n.
- the audit script was ~40% of the run → a shared `bench/audit.js` is queued.
