# linear ↔ github commit linking

Ticket: DOT-63

researched 2026-08-16, primary sources only: `linear.app/docs/github` and `linear.app/changelog`.

## verdict

**yes, it works without pull requests — but only after a step we have not done.** commit linking is
not carried by the linear github app. it rides a **separate push webhook you must add by hand in
github**, pointing at a payload url + secret that linear shows next to the toggle. the toggle being
ON is only half the setup. that is why the `DOT-78` test commits produced nothing.

source: <https://linear.app/docs/github> — section "enable commit linking":

> turn on the toggle for **link commits to issues with magic words** at the bottom of the github
> settings page. go to settings → webhooks in your github organization or repository. click add
> webhook button. input the payload url and secret provided in linear, and select
> `application/json` content type. leave "push events" selected. click add webhook. go back to
> linear and click done.

once that webhook exists, the documented behaviour is exactly dima's workflow:

> use a magic word before the issue ID in commit message to link issues. we'll move the issue to
> in progress when the commit is pushed and done when the commit reaches the default branch.
> — <https://linear.app/docs/github>

no pr anywhere in that sentence. the 2022 launch changelog says the same:

> simply add magic words (e.g. *closes ENG-123*) to your commit messages and we'll move the issue
> to `In Progress` when the branch is pushed and `Done` when the commit is merged to the default
> branch. — <https://linear.app/changelog/2022-02-03-github-commit-linking>

## per-question findings

### 1. magic word list for commits

the docs publish **one list**, in the "magic words" section, introduced as covering "the PR or
commit" throughout. there is no separate, narrower commit list anywhere on the page.
source: <https://linear.app/docs/github>

- closing: `close, closes, closed, closing, fix, fixes, fixed, fixing, resolve, resolves, resolved, resolving, complete, completes, completed, completing, implement, implements, implemented, implementing, linear issue`
- non-closing: `ref, refs, references, part of, contributes to, toward, towards`
- relation (pr only in the wording — "linear simply marks the PR as related"): `relates to, related to`
- suppression: `skip` / `ignore` + issue id, e.g. `Ignore ENG-123`

📌 our hypothesis that bare `ref` is unsupported for commits is **not supported by the docs** — `ref`
is on the published non-closing list, and the list is not scoped to prs. the failure is better
explained by the missing webhook. **unverified:** whether the runtime commit parser really accepts
every word on that list; linear does not publish a commit-specific grammar.

### 2. exact syntax

**mostly unverified.** the docs state only "use a magic word **before** the issue ID in commit
message" and show examples in the form `closes ENG-123` / `Fixes ENG-123` / `Ignore ENG-123`.
source: <https://linear.app/docs/github>, <https://linear.app/changelog/2022-02-03-github-commit-linking>

not documented anywhere primary: case sensitivity of the id, whether the keyword must start a line
or the message, subject-vs-body placement, punctuation rules. every published example capitalises
the team key (`ENG-123`) and puts the phrase at the start of its own line, so mirroring that is the
safe bet — but it is inference, not documentation.

one adjacent documented fact: for prs, "magic words in PR comments won't create links" — placement
does matter to linear's parser in at least one place.

### 3. does it work without a pr

**yes, documented.** see the verdict quotes: push → in progress, reaching the default branch → done.
a closing magic word on a commit is explicitly covered — "the status configured for **on PR or
commit merge** when the PR **or commit** is merged". source: <https://linear.app/docs/github>

platform caveat: commit linking is github.com and github enterprise cloud only, **not** enterprise
server (feature comparison table, same page). also: "you will only be able to use commit linking
with a single github organization."

### 4. where a linked commit surfaces

documented: linkbacks fire for commits —

> when an issue is linked with a pull request, **commit** or github issue, linear posts a linkback
> message as a comment with the issue title and description. — <https://linear.app/docs/github>

so the visible surface is a **comment on the github side** plus issue status movement. the same
paragraph says "all the **pull requests** are also listed in the issue details in linear" — it names
prs only, not commits.

📌 **unverified and load-bearing for our test methodology:** whether a linked commit lands in the
`attachments` graphql connection on `Issue`. linear's developer docs do not document a commit
attachment `sourceType`. an empty `attachments` connection is therefore **not proof** that linking
failed. better probe: the issue's activity/history and its status, not `attachments`.

### 5. does the "public repositories" linkback toggle gate commit linking

**unverified.** the docs describe linkbacks purely as the comment linear posts back to github, and
never tie the public/private scope toggles to whether linking itself fires. nothing found that says
commit *detection* is gated by it. best reading: the toggle governs the outbound comment only — but
that is inference, and it was off during the first failed test, so it is not cleanly excluded.

### 6. repo-level opt-in we were missing

**yes — this is the finding.** the push webhook of question 1's setup block is exactly that opt-in,
and it is added "in your github organization **or repository** settings", i.e. it can be scoped per
repo. the github app's "all repositories" access does not substitute for it.
source: <https://linear.app/docs/github>

github issues sync is a separate, independent connection (github issues section, `+` icon, repo ↔
team, one-way/two-way) — leaving it unconfigured keeps tickets out of github issues and does **not**
affect commit linking.

### 7. do gitAutomationStates events fire outside prs

partly. the settings are literally named "**pull request and commit** automations"
(settings → team → workflows & automations), and the docs enumerate the configurable events as
"when PRs are drafted, opened, have a review requested, are ready for merge, and merged" — all five
phrased as pr events. source: <https://linear.app/docs/github>

what commits get is the two documented endpoints only: **in progress on push**, **done on reaching
the default branch**. mapping to the `GitAutomationStates` enum, that is `start` and `merge`;
`draft`, `review` and `mergeable` have no commit analogue. **unverified:** whether linear internally
reuses the `start`/`merge` rows for commits or hardcodes in progress / done — the docs describe the
outcome, never the mechanism. note also that `mergeable` needs a review or a check to exist at all,
which a prless flow never produces.

## what to do

1. in linear github settings, open the commit-linking toggle and copy the payload url + secret.
2. add the webhook on `dvakatsiienko/dotfiles` (repo-scoped is enough): content type
   `application/json`, push events only.
3. retest with `Fixes DOT-78` on its own line in the commit body, then read the **issue status and
   activity feed**, not `attachments`.
