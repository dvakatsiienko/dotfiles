---
dies-when: FRM-259's notification settings are applied and the options round is folded into the ticket
---
Ticket: FRM-259

# notifications — github + linear, for a solo owner of bot-heavy repos

read 2026-09-23. `[unverified]` = not confirmed on a primary page in this pass.

## 1. github — every knob

**per-repo watch level** (repo page → watch button)
- four levels: participating and @mentions, all activity, ignore, custom — https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications
- custom = pick event types: issues, pull requests, releases, discussions, security alerts; participating stays on underneath — same url
- «all activity» on a bot-heavy repo = a `subscribed` notification for every renovate/coder pr and issue; that is the 7 `subscribed` in today's sample
- api: `PUT /repos/{o}/{r}/subscription` takes only `subscribed` + `ignored` booleans — watch-all, ignore, or `DELETE` to go back to participating; **custom event types are web-only** — https://docs.github.com/en/rest/activity/watching
- per-thread: `PUT /notifications/threads/{id}/subscription` (`ignored: true`) mutes one pr/issue `[unverified this pass; known rest endpoint]` — https://docs.github.com/en/rest/activity/notifications

**global settings page** — https://github.com/settings/notifications (web-only, no api)
- «participating, @mentions and custom» and «watching»: each routes to web+mobile and/or email — https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications
- **default notification email + custom routing** (per-org email) — same url
- «automatically watch repositories» / «automatically watch teams» toggles `[unverified this pass]`
- **actions**: web+mobile / email, plus **«only notify for failed workflows»**; actions only notifies about runs **you triggered** (scheduled: whoever last edited the cron) — https://docs.github.com/en/actions/concepts/workflows-and-actions/notifications-for-workflow-runs
  - 📌 so the 7 `ci_activity` are runs *dima's pushes* triggered (and agent pushes under his identity); successes included unless «only failed» is on
- **dependabot alerts**: web/cli/email, email digest — https://docs.github.com/en/code-security/dependabot/dependabot-alerts/configuring-notifications-for-dependabot-alerts
- «customize email updates» (comments, pushes to prs, own updates, ci) `[unverified this pass]`

**inbox filters** — https://docs.github.com/en/subscriptions-and-notifications/reference/inbox-filters
- `reason:` assign, author, comment, participating, invitation, manual, mention, review-requested, security-alert, state-change, team-mention, ci-activity
- `is:` check-suite, commit, issue-or-pull-request, release, repository-vulnerability-alert, discussion, …, plus saved/done/unread/read
- `repo:`, `org:`, `author:` (thread creator; `author:app/dependabot` works)
- 📌 **no negation** (`-author:`, `NOT` unsupported) and **max 15 custom filters** — so «everything except bots» is not expressible
- the inbox is only a view: filters hide nothing from push or email

**github mobile push** — https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications
- per-type push toggles: direct mentions, assignments, review requests, deployment approval requests; plus «working hours» scheduling
- 📌 push cannot be enabled for `subscribed` or `ci_activity` by type — the mobile inbox still lists them (synced with web) but push only fires for the listed types `[inference from the doc's list; check in-app]`

**silencing bots**
- **no native mute for a bot/app actor** — open request since 2021 — https://github.com/orgs/community/discussions/5793
- workarounds: a scheduled script that marks bot threads done (`gh-ignore-bot`, targets `renovate[bot]`, `dependabot[bot]`) — https://github.com/takumi3488/gh-ignore-bot; paid filters (pullnotifier) — same discussion
- blocking a user is the only built-in actor mute, too blunt — same discussion

## 2. github — the solo-maintainer setup

- **the root spam is «all activity» on your own repos**: as owner you already get `author` (you opened it), `review_requested`, `mention`, `assign`, `ci_activity` for your runs — watching adds every bot pr on top. participating is enough — https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications
- keep custom → **releases + security alerts** only if you want those; on own repos security alerts reach owners anyway `[unverified]`
- actions → **only failed workflows**, web only (no email) — https://docs.github.com/en/actions/concepts/workflows-and-actions/notifications-for-workflow-runs
- 📌 mistake: agents pushing under dima's identity make every ci run «yours»; a github app token (x-coder-cc[bot]) makes the run the app's and drops it from his inbox `[inference from the triggered-by rule]`
- 📌 mistake: x-coder-cc prs that request dima's review → `review_requested` push each time; that one is real signal, keep it
- email off for everything: the web + mobile inbox is the single queue; email duplicates it (ben balter's classic setup routes email by filter instead — https://ben.balter.com/2020/08/25/how-i-manage-github-notifications/)
- saved inbox filters for triage: `reason:review-requested`, `reason:mention`, `reason:ci-activity`, `author:app/renovate` `[author:app/renovate unverified, only dependabot is documented]`

## 3. linear — every knob

**settings page** — https://linear.app/settings/account/notifications (settings → account → notifications) — https://linear.app/docs/notifications
- **channels**: desktop app, mobile app, slack (real-time), email (digest); each enabled per channel with its own category set — https://linear.app/docs/notifications
- **categories are grouped, not per-event**: e.g. «status changes» bundles completions, cancelations, urgent-priority changes, blocking changes; «you cannot select only status changes» — same url
- the category list (assigned, mentions, comments/replies on subscribed issues, status changes, new issues in a team, project/initiative updates, reminders, SLA, document changes …) is shown per channel in-app `[exact list unverified — docs page shows only examples]`
- **email**: digest by default (urgency-based delay), or immediate; sent only if the notification is still unread in the inbox — same url
- **auto-subscribe**: you create it, are assigned, are @mentioned (a mention inside a thread subscribes to that thread only) — same url
- unsubscribe: `Shift S` / `Cmd Shift S` per issue; list at my issues → subscribed — same url; team-level «subscribe to new issues» lives in team settings `[unverified]`

**inbox** — https://linear.app/docs/inbox
- **every notification lands in the inbox — you cannot choose which** — the channel toggles only gate push/email
- **priority tab** (2026-09-03): linear picks by default; customise by notification source or a filter — https://linear.app/changelog/2026-09-03-priority-inbox
  - whether push can be limited to priority: **not stated** — same url
- **filter by notification actor** — narrow or clear notifications from a specific agent or user (2026-03-12) — https://linear.app/changelog/2026-03-12-ui-refresh
- snooze (`H`), reminders, 2,000-notification cap — https://linear.app/docs/inbox

## 4. linear — the agent-heavy setup

- **do agent/app actions notify you?** yes: an app user (oauth `actor=app`) acts like a workspace member — a comment on your subscribed issue or a status change it makes fires your subscription notifications like a human's would `[inference; linear documents the reverse direction — notifications *to* the app — at https://linear.app/developers/agents]`
- 📌 **you are auto-subscribed to every ticket you create** — dima creates most FRM/BYT tickets, so every cclio/coder comment on them is a notification — https://linear.app/docs/notifications
- **filterable, but only in the inbox**: the actor filter clears/narrows by agent (cclio, coder, github) — https://linear.app/changelog/2026-03-12-ui-refresh; no documented rule that stops an actor's events from pushing to mobile `[unverified that none exists in-app]`
- so the lever is the **category**, not the actor:
  - mobile push: assigned to me + mentions only; off for comments on subscribed, status changes, new issues, project updates
  - desktop: same plus reminders; the inbox (with actor filter + priority tab) holds the rest
  - email: off, or digest only
  - slack: off (no slack in this setup)
- 📌 cclio already never assigns dima (`linear-flow.md`), so «assigned» stays a pure human signal; a `@dima` mention from an agent is the one deliberate ping channel — keep agents from mentioning him casually

## 5. cross-tool duplicates

- **github ↔ linear**: linear's github integration links prs and moves issues on pr events; those show up in linear as the github app's activity (status changes) while github notifies the pr itself — https://linear.app/docs/github `[integration's notification behaviour unverified]` → turn off linear «status changes» push and keep github for pr signal
- one queue per tool: github web+mobile inbox, linear inbox; **email off in both** (linear email only sends unread items, but still repeats a push) — https://linear.app/docs/notifications
- desktop + phone both get push from github mobile and a browser/desktop inbox — github mobile «working hours» keeps the phone quiet off-hours — https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications
- review-request pings: pick one tool — the github `review_requested` push; don't also mention dima on the linear ticket

## recommended setup

**github — desktop (web inbox)**
- [ ] all four repos: watch → **participating and @mentions** (or custom → releases) — scriptable: `gh api -X DELETE repos/dvakatsiienko/<repo>/subscription`
- [ ] https://github.com/settings/notifications: participating → web+mobile ✅, email ❌
- [ ] watching → web ✅, email ❌
- [ ] actions → web ✅, email ❌, **only notify for failed workflows** ✅
- [ ] dependabot alerts → web ✅, email ❌
- [ ] saved filters: `reason:review-requested`, `reason:mention`, `reason:ci-activity`

**github — mobile**
- [ ] push: direct mentions ✅, review requests ✅, assigned ✅, deployment approvals ✅ (if used)
- [ ] working hours on

**linear — desktop**
- [ ] https://linear.app/settings/account/notifications → desktop: assigned, mentions, reminders ✅; comments on subscribed, status changes, new issues, project updates ❌
- [ ] inbox: priority tab customised; actor filter to sweep cclio/coder batches

**linear — mobile**
- [ ] push: **assigned + mentions only**
- [ ] email: off (or digest); slack: off

**agents' side (cheap, ours)**
- [ ] agents mention dima only when they need him; ci pushes go through the app token, not his identity
